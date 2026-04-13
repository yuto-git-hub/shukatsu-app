'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation/Header';
import CompanyForm from '@/components/Forms/CompanyForm';
import AppSheet from '@/components/UI/AppSheet';
import { ApplicationProgress, Company, Schedule } from '@/types';
import { KEYS, storage, subscribeStorageUpdates } from '@/lib/storage';
import {
  deleteRemoteCompany,
  fetchRemoteCompanyById,
  loadCompaniesSnapshot,
  subscribeRemoteCompanies,
  upsertRemoteCompany,
} from '@/lib/companyStore';
import { setSyncStatus } from '@/lib/syncStatus';
import { resolveCompanyTestProfile } from '@/lib/testProfiles';
import { applicationStatusLabel, formatDate, formatScheduleTimeRange, generateId, getDaysUntil, statusColor } from '@/lib/utils';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(() => storage.get(KEYS.COMPANIES) || []);
  const [applications, setApplications] = useState<ApplicationProgress[]>(() => storage.get(KEYS.APPLICATIONS) || []);
  const [schedules, setSchedules] = useState<Schedule[]>(() => storage.get(KEYS.SCHEDULES) || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const refresh = async () => {
      const snapshot = await loadCompaniesSnapshot();
      setCompanies((current) => {
        if (snapshot.length === 0 && current.length > 0) {
          return current;
        }
        return snapshot;
      });
      setApplications(storage.get(KEYS.APPLICATIONS) || []);
      setSchedules(storage.get(KEYS.SCHEDULES) || []);
    };

    void refresh();
    let unsubscribeRemote = () => {};

    void subscribeRemoteCompanies(async () => {
      await refresh();
    }).then((unsubscribe) => {
      unsubscribeRemote = unsubscribe;
    });

    const unsubscribeLocal = subscribeStorageUpdates((key) => {
      if ([KEYS.COMPANIES, KEYS.APPLICATIONS, KEYS.SCHEDULES].includes(key as typeof KEYS[keyof typeof KEYS])) {
        void refresh();
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    const handleFocus = () => {
      void refresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribeLocal();
      unsubscribeRemote();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSubmit = async (
    data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
    changedFields: (keyof Omit<Company, 'id' | 'createdAt' | 'updatedAt'>)[]
  ) => {
    const now = new Date();

    if (editingId) {
      const updatedCompany = companies.find((company) => company.id === editingId);
      if (!updatedCompany) {
        return;
      }

      const patch = changedFields.reduce<Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>>((acc, field) => {
        acc[field] = data[field];
        return acc;
      }, {});

      const nextCompany = {
        ...updatedCompany,
        ...patch,
        updatedAt: now,
      };
      const updated = companies.map((company) => (company.id === editingId ? nextCompany : company));
      setCompanies(updated);
      storage.set(KEYS.COMPANIES, updated);
      setEditingId(null);
      setShowForm(false);
      setSyncStatus('syncing', '企業情報を保存中...');
      void (async () => {
        try {
          const latestCompany = await fetchRemoteCompanyById(editingId);
          const remoteBaseCompany = latestCompany || nextCompany;
          const remoteNextCompany = {
            ...remoteBaseCompany,
            ...patch,
            updatedAt: now,
          };
          await upsertRemoteCompany(remoteNextCompany);
          const snapshot = await loadCompaniesSnapshot();
          setCompanies(snapshot);
          setSyncStatus('synced', '企業情報を更新しました');
        } catch (error) {
          console.error('Company update sync error:', error);
          setSyncStatus('error', '企業情報の同期に失敗しました');
        }
      })();
    } else {
      const newCompany: Company = {
        id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newCompany, ...companies];
      setCompanies(updated);
      storage.set(KEYS.COMPANIES, updated);
      setShowForm(false);
      setSyncStatus('syncing', '企業情報を保存中...');
      void (async () => {
        try {
          await upsertRemoteCompany(newCompany);
          const snapshot = await loadCompaniesSnapshot();
          setCompanies(snapshot);
          setSyncStatus('synced', '企業情報を追加しました');
        } catch (error) {
          console.error('Company create sync error:', error);
          setSyncStatus('error', '企業追加の同期に失敗しました');
        }
      })();
    }
  };

  const handleDelete = async (id: string) => {
    const updated = companies.filter((company) => company.id !== id);
    setCompanies(updated);
    storage.set(KEYS.COMPANIES, updated);
    setSyncStatus('syncing', '企業情報を削除中...');
    void (async () => {
      try {
        await deleteRemoteCompany(id);
        const snapshot = await loadCompaniesSnapshot();
        setCompanies(snapshot);
        setSyncStatus('synced', '企業情報を削除しました');
      } catch (error) {
        console.error('Company delete sync error:', error);
        setSyncStatus('error', '企業削除の同期に失敗しました');
      }
    })();
  };

  const editingCompany = editingId ? companies.find((company) => company.id === editingId) : undefined;
  const filteredCompanies = companies.filter((company) => {
    const keyword = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(keyword) ||
      company.industry.toLowerCase().includes(keyword) ||
      (company.contactPerson || '').toLowerCase().includes(keyword)
    );
  });

  const companyMeta = useMemo(() => {
    return filteredCompanies.reduce<Record<string, { progress?: ApplicationProgress; nextSchedule?: Schedule }>>((acc, company) => {
      const progress = applications.find((item) => item.companyId === company.id);
      const nextSchedule = schedules
        .filter((item) => item.companyId === company.id && item.status === 'scheduled' && getDaysUntil(item.date) >= 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      acc[company.id] = { progress, nextSchedule };
      return acc;
    }, {});
  }, [applications, filteredCompanies, schedules]);

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto grid max-w-6xl gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5 lg:grid-cols-[290px,1fr]">
        <section className="space-y-4">
          <div className="rounded-[28px] bg-[linear-gradient(140deg,#0f172a_0%,#1d4ed8_38%,#7c3aed_74%,#c084fc_100%)] p-4 text-white shadow-[0_24px_70px_rgba(79,70,229,0.28)] sm:rounded-[32px] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">Company board</p>
                <p className="mt-3 text-xl font-semibold sm:text-2xl">{companies.length}社を管理中</p>
              </div>
              <div className="rounded-[22px] border border-white/15 bg-white/10 px-3 py-2.5 text-right backdrop-blur sm:rounded-[24px] sm:px-4 sm:py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">Visible</p>
                <p className="mt-1 text-xl font-semibold sm:text-2xl">{filteredCompanies.length}</p>
              </div>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-white/80 sm:text-sm sm:leading-6">
              連絡先やメモを1か所にまとめて、次のアクションを取りやすくします。
            </p>
            <button
              onClick={() => {
                setEditingId(null);
                setShowForm((current) => !current);
              }}
              className="mt-4 w-full rounded-[22px] bg-white/96 px-4 py-3 text-sm font-semibold text-indigo-800 shadow-[0_14px_30px_rgba(15,23,42,0.12)] sm:mt-5 sm:rounded-[24px]"
            >
              {showForm || editingId ? 'フォームを閉じる' : '+ 企業を追加'}
            </button>
          </div>

        </section>

        <section className="space-y-4">
          <div className="app-card rounded-[26px] p-3.5 sm:rounded-[30px] sm:p-4">
            <input
              type="text"
              placeholder="企業名・業界・担当者で検索"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-[20px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:rounded-[24px]"
            />
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="rounded-[28px] border border-white/80 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-sm">
              {companies.length === 0 ? 'まだ企業が登録されていません。' : '検索条件に合う企業がありません。'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredCompanies.map((company) => (
                <article key={company.id} className="app-card min-w-0 rounded-[24px] p-3 sm:rounded-[30px] sm:p-5">
                  {(() => {
                    const meta = companyMeta[company.id];
                    const myPageUrl = company.myPageUrl || '';
                    const corporateWebsite = company.website || '';
                    const testProfile = resolveCompanyTestProfile(company.name, company.testType);

                    return (
                      <>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{company.name}</h2>
                      {company.industry && <p className="mt-1 text-xs font-medium text-sky-700 sm:text-sm">{company.industry}</p>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <Link
                        href={`/companies/${company.id}`}
                        className="rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)] sm:px-3.5 sm:py-2 sm:text-xs"
                      >
                        詳細
                      </Link>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(company.id);
                        }}
                        className="rounded-full bg-indigo-100 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-sm sm:px-4 sm:py-2 sm:text-xs"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="rounded-full bg-rose-100 px-3 py-1.5 text-[11px] font-semibold text-rose-700 shadow-sm sm:px-4 sm:py-2 sm:text-xs"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-slate-600 sm:mt-4 sm:gap-2 sm:text-xs">
                    {testProfile && (
                      <span className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-2.5 py-1 text-fuchsia-700 sm:px-3">
                        推定: {testProfile.label}
                      </span>
                    )}
                    {company.desiredJobType && <span className="app-chip max-w-full truncate rounded-full px-2.5 py-1 sm:px-3">希望: {company.desiredJobType}</span>}
                    {company.salaryInfo && <span className="app-chip max-w-full truncate rounded-full px-2.5 py-1 sm:px-3">{company.salaryInfo}</span>}
                    {company.contactPerson && <span className="app-chip max-w-full truncate rounded-full px-2.5 py-1 sm:px-3">{company.contactPerson}</span>}
                    {company.phone && <span className="app-chip max-w-full truncate rounded-full px-2.5 py-1 sm:px-3">{company.phone}</span>}
                    {company.email && <span className="app-chip max-w-full truncate rounded-full px-2.5 py-1 sm:px-3">Mail: {company.email}</span>}
                    {myPageUrl && <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-indigo-700 sm:px-3">マイページあり</span>}
                    {corporateWebsite && <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-cyan-700 sm:px-3">企業HPあり</span>}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                    <div className="rounded-[20px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-3 shadow-sm sm:rounded-[24px] sm:p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">選考ステータス</p>
                      {meta?.progress ? (
                        <div className="mt-2.5 sm:mt-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${statusColor(meta.progress.status)}`}>
                            {applicationStatusLabel(meta.progress.status)}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2.5 text-xs text-slate-500 sm:mt-3 sm:text-sm">未登録</p>
                      )}
                    </div>

                    <div className="rounded-[20px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f6f3ff_100%)] p-3 shadow-sm sm:rounded-[24px] sm:p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">次の予定</p>
                      {meta?.nextSchedule ? (
                        <>
                          <p className="mt-2.5 text-xs font-semibold text-slate-900 sm:mt-3 sm:text-sm">{formatDate(meta.nextSchedule.date)}</p>
                          <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                            {formatScheduleTimeRange(meta.nextSchedule.time, meta.nextSchedule.endTime) || '時刻未設定'} / {getDaysUntil(meta.nextSchedule.date) === 0 ? '今日' : `${getDaysUntil(meta.nextSchedule.date)}日後`}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2.5 text-xs text-slate-500 sm:mt-3 sm:text-sm">予定なし</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs sm:mt-4 sm:gap-3 sm:text-sm">
                    {testProfile && (
                      <Link href={`/prep?company=${encodeURIComponent(company.name)}&type=${encodeURIComponent(testProfile.type)}`} className="inline-flex font-medium text-fuchsia-600">
                        {testProfile.label}対策を見る
                      </Link>
                    )}
                    {myPageUrl && (
                      <a
                        href={myPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex font-medium text-indigo-600"
                      >
                        企業マイページを開く
                      </a>
                    )}
                    {corporateWebsite && (
                      <a
                        href={corporateWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex font-medium text-sky-600"
                      >
                        企業ホームページを開く
                      </a>
                    )}
                  </div>

                  {company.notes && (
                    <p className="mt-3 rounded-[20px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3 text-xs leading-5 text-slate-600 shadow-sm sm:mt-4 sm:rounded-[24px] sm:p-4 sm:text-sm sm:leading-6">
                      {company.notes}
                    </p>
                  )}
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <AppSheet
        open={showForm || Boolean(editingId)}
        title={editingId ? '企業情報を編集' : '企業を追加'}
        description="会社名、担当者、マイページURLなどをまとめて更新できます。"
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
      >
        <CompanyForm onSubmit={handleSubmit} initialData={editingCompany} />
      </AppSheet>
    </div>
  );
}
