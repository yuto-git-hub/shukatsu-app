import { Company } from '@/types';
import { KEYS, storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const COMPANIES_TABLE = 'companies';
const COMPANIES_PENDING_KEY = 'companies_remote_pending';
const COMPANIES_PENDING_TTL_MS = 15000;

interface CompanyRow {
  user_id: string;
  id: string;
  name: string;
  industry: string;
  test_type: string | null;
  desired_job_type: string | null;
  salary_info: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  my_page_url: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

async function getCurrentUserId() {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function readPendingCompaniesTimestamp() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(COMPANIES_PENDING_KEY);
}

export function hasPendingCompaniesSync() {
  const pendingAt = readPendingCompaniesTimestamp();
  if (!pendingAt) {
    return false;
  }

  const pendingTimestamp = Number(pendingAt);
  if (!Number.isFinite(pendingTimestamp)) {
    localStorage.removeItem(COMPANIES_PENDING_KEY);
    return false;
  }

  if (Date.now() - pendingTimestamp > COMPANIES_PENDING_TTL_MS) {
    localStorage.removeItem(COMPANIES_PENDING_KEY);
    return false;
  }

  return true;
}

export function setPendingCompaniesSync(pending: boolean) {
  if (!isBrowser()) {
    return;
  }

  if (pending) {
    localStorage.setItem(COMPANIES_PENDING_KEY, String(Date.now()));
  } else {
    localStorage.removeItem(COMPANIES_PENDING_KEY);
  }
}

async function fetchRemoteCompaniesResult() {
  if (!supabase) {
    return { ok: false, companies: [] as Company[] };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, companies: [] as Company[] };
  }

  const { data, error } = await supabase
    .from(COMPANIES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Fetch companies error:', error);
    return { ok: false, companies: [] as Company[] };
  }

  return { ok: true, companies: (data as CompanyRow[]).map(toCompany) };
}

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry || '',
    testType: row.test_type || '',
    desiredJobType: row.desired_job_type || '',
    salaryInfo: row.salary_info || '',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    myPageUrl: row.my_page_url || '',
    website: row.website || '',
    notes: row.notes || '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(userId: string, company: Company): CompanyRow {
  return {
    user_id: userId,
    id: company.id,
    name: company.name,
    industry: company.industry || '',
    test_type: company.testType || null,
    desired_job_type: company.desiredJobType || null,
    salary_info: company.salaryInfo || null,
    contact_person: company.contactPerson || null,
    phone: company.phone || null,
    email: company.email || null,
    my_page_url: company.myPageUrl || null,
    website: company.website || null,
    notes: company.notes || null,
    created_at: new Date(company.createdAt).toISOString(),
    updated_at: new Date(company.updatedAt).toISOString(),
  };
}

export async function fetchRemoteCompanies() {
  const result = await fetchRemoteCompaniesResult();
  return result.companies;
}

export async function fetchRemoteCompanyById(companyId: string) {
  if (!supabase) {
    return null;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from(COMPANIES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('id', companyId)
    .maybeSingle();

  if (error) {
    console.error('Fetch company error:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return toCompany(data as CompanyRow);
}

export async function loadCompaniesSnapshot() {
  const localCompanies = (storage.get(KEYS.COMPANIES) || []) as Company[];

  if (!supabase) {
    return localCompanies;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return localCompanies;
  }

  const { ok, companies: remoteCompanies } = await fetchRemoteCompaniesResult();

  if (!ok) {
    return localCompanies;
  }

  if (remoteCompanies.length === 0 && localCompanies.length > 0) {
    await pushCompaniesToRemote(localCompanies);
    return localCompanies;
  }

  storage.set(KEYS.COMPANIES, remoteCompanies);
  return remoteCompanies;
}

export async function hydrateCompaniesFromRemote() {
  const localCompanies = (storage.get(KEYS.COMPANIES) || []) as Company[];

  if (hasPendingCompaniesSync()) {
    return localCompanies;
  }

  return loadCompaniesSnapshot();
}

export async function pushCompaniesToRemote(companies: Company[]) {
  if (!supabase) {
    return false;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const rows = companies.map((company) => toRow(userId, company));
  setPendingCompaniesSync(true);
  const { error } = await supabase.from(COMPANIES_TABLE).upsert(rows, { onConflict: 'user_id,id' });

  if (error) {
    console.error('Push companies error:', error);
    setPendingCompaniesSync(false);
    return false;
  }

  setPendingCompaniesSync(false);
  return true;
}

export async function upsertRemoteCompany(company: Company) {
  if (!supabase) {
    return false;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  setPendingCompaniesSync(true);
  const { error } = await supabase
    .from(COMPANIES_TABLE)
    .upsert(toRow(userId, company), { onConflict: 'user_id,id' });

  if (error) {
    console.error('Upsert company error:', error);
    setPendingCompaniesSync(false);
    return false;
  }

  setPendingCompaniesSync(false);
  return true;
}

export async function deleteRemoteCompany(companyId: string) {
  if (!supabase) {
    return false;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  setPendingCompaniesSync(true);
  const { error } = await supabase
    .from(COMPANIES_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('id', companyId);

  if (error) {
    console.error('Delete company error:', error);
    setPendingCompaniesSync(false);
    return false;
  }

  setPendingCompaniesSync(false);
  return true;
}

export async function subscribeRemoteCompanies(onChange: () => void) {
  if (!supabase) {
    return () => {};
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return () => {};
  }

  const channel = supabase
    .channel(`companies-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COMPANIES_TABLE,
        filter: `user_id=eq.${userId}`,
      },
      () => onChange()
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
