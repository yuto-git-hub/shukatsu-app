'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation/Header';
import { ApplicationProgress, Company, Email, Reminder, Schedule } from '@/types';
import { KEYS, storage, subscribeStorageUpdates } from '@/lib/storage';
import { loadCompaniesSnapshot, subscribeRemoteCompanies } from '@/lib/companyStore';
import { resolveCompanyTestProfile } from '@/lib/testProfiles';
import {
  applicationStatusLabel,
  formatDate,
  formatDateTime,
  scheduleTypeLabel,
  statusColor,
} from '@/lib/utils';

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [company, setCompany] = useState<Company | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [applications, setApplications] = useState<ApplicationProgress[]>([]);
  const [applicationForm, setApplicationForm] = useState({
    status: 'not-started' as ApplicationProgress['status'],
    appliedDate: '',
    notes: '',
  });

  useEffect(() => {
    const refresh = async () => {
      const companies = await loadCompaniesSnapshot();
      const foundCompany = companies.find((item: Company) => item.id === companyId) || null;
      const savedSchedules = storage.get(KEYS.SCHEDULES) || [];
      const savedEmails = storage.get(KEYS.EMAILS) || [];
      const savedReminders = storage.get(KEYS.REMINDERS) || [];
      const savedApplications = storage.get(KEYS.APPLICATIONS) || [];

      setCompany(foundCompany);
      setSchedules(savedSchedules);
      setEmails(savedEmails);
      setReminders(savedReminders);
      setApplications(savedApplications);

      const currentProgress = savedApplications.find(
        (item: ApplicationProgress) => item.companyId === companyId
      );

      if (currentProgress) {
        setApplicationForm({
          status: currentProgress.status,
          appliedDate: currentProgress.appliedDate
            ? new Date(currentProgress.appliedDate).toISOString().split('T')[0]
            : '',
          notes: currentProgress.notes || '',
        });
      }
    };

    void refresh();
    let unsubscribeRemote = () => {};

    void subscribeRemoteCompanies(async () => {
      await refresh();
    }).then((unsubscribe) => {
      unsubscribeRemote = unsubscribe;
    });

    const unsubscribeLocal = subscribeStorageUpdates((key) => {
      if ([KEYS.COMPANIES, KEYS.SCHEDULES, KEYS.EMAILS, KEYS.REMINDERS, KEYS.APPLICATIONS].includes(key as typeof KEYS[keyof typeof KEYS])) {
        void refresh();
      }
    });

    return () => {
      unsubscribeLocal();
      unsubscribeRemote();
    };
  }, [companyId]);

  const relatedSchedules = useMemo(
    () => schedules.filter((item) => item.companyId === companyId),
    [companyId, schedules]
  );
  const relatedEmails = useMemo(
    () => emails.filter((item) => item.companyId === companyId || item.companyName === company?.name),
    [company?.name, companyId, emails]
  );
  const relatedReminders = useMemo(
    () =>
      reminders.filter(
        (item) => item.relatedCompany === companyId || item.description?.includes(company?.name || '')
      ),
    [company?.name, companyId, reminders]
  );
  const progress = applications.find((item) => item.companyId === companyId) || null;

  const saveApplicationProgress = (event: React.FormEvent) => {
    event.preventDefault();
    if (!company) {
      return;
    }

    const now = new Date();
    const nextItem: ApplicationProgress = {
      id: progress?.id || `${company.id}-progress`,
      companyId: company.id,
      companyName: company.name,
      status: applicationForm.status,
      appliedDate: applicationForm.appliedDate ? new Date(applicationForm.appliedDate) : undefined,
      lastUpdate: now,
      notes: applicationForm.notes,
      createdAt: progress?.createdAt || now,
      updatedAt: now,
    };

    const updated = progress
      ? applications.map((item) => (item.companyId === company.id ? nextItem : item))
      : [...applications, nextItem];

    setApplications(updated);
    storage.set(KEYS.APPLICATIONS, updated);
  };

  if (!company) {
    return (
      <div className="min-h-screen pb-28">
        <Navigation />
        <main className="mx-auto max-w-3xl px-4 py-5">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-8 text-center text-slate-500 shadow-sm">
            企業情報が見つかりませんでした。
          </div>
        </main>
      </div>
    );
  }

  const myPageUrl = company.myPageUrl || '';
  const corporateWebsite = company.website || '';
  const testProfile = resolveCompanyTestProfile(company.name, company.testType);

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-5">
        <section className="rounded-[32px] bg-[linear-gradient(145deg,#1e1b4b_0%,#4338ca_45%,#60a5fa_100%)] p-6 text-white shadow-[0_24px_80px_rgba(67,56,202,0.25)]">
          <Link href="/companies" className="text-sm text-white/75">
            ← 企業一覧へ戻る
          </Link>
          <p className="mt-4 text-sm text-white/70">企業ごとの管理ページ</p>
          <h2 className="mt-2 text-3xl font-semibold">{company.name}</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            連絡先、選考ステータス、関連メール、面接予定をこの画面でまとめて見られます。
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {testProfile && <span className="rounded-full bg-white/15 px-3 py-1">推定受験形式: {testProfile.label}</span>}
            {company.industry && <span className="rounded-full bg-white/15 px-3 py-1">{company.industry}</span>}
            {company.desiredJobType && <span className="rounded-full bg-white/15 px-3 py-1">希望: {company.desiredJobType}</span>}
            {company.salaryInfo && <span className="rounded-full bg-white/15 px-3 py-1">{company.salaryInfo}</span>}
            {company.contactPerson && <span className="rounded-full bg-white/15 px-3 py-1">{company.contactPerson}</span>}
            {company.email && <span className="rounded-full bg-white/15 px-3 py-1">{company.email}</span>}
            {company.phone && <span className="rounded-full bg-white/15 px-3 py-1">{company.phone}</span>}
            {myPageUrl && <span className="rounded-full bg-white/15 px-3 py-1">企業マイページあり</span>}
            {corporateWebsite && <span className="rounded-full bg-white/15 px-3 py-1">企業HPあり</span>}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.05fr,1.4fr]">
          <form onSubmit={saveApplicationProgress} className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">応募進捗</h3>
              {progress && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(progress.status)}`}>
                  {applicationStatusLabel(progress.status)}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">選考ステータス</label>
                <select
                  value={applicationForm.status}
                  onChange={(event) =>
                    setApplicationForm({ ...applicationForm, status: event.target.value as ApplicationProgress['status'] })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="not-started">未対応</option>
                  <option value="applied">応募済み</option>
                  <option value="screening">選考中</option>
                  <option value="interview">面接中</option>
                  <option value="accepted">内定</option>
                  <option value="rejected">見送り</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">応募日</label>
                <input
                  type="date"
                  value={applicationForm.appliedDate}
                  onChange={(event) => setApplicationForm({ ...applicationForm, appliedDate: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">進捗メモ</label>
                <textarea
                  value={applicationForm.notes}
                  onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="ES提出済み、次回面接の準備内容、担当者からの連絡など"
                />
              </div>

              <button className="w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">
                進捗を保存
              </button>
            </div>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
              <p className="text-sm text-slate-500">関連予定</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{relatedSchedules.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
              <p className="text-sm text-slate-500">関連メール</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{relatedEmails.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
              <p className="text-sm text-slate-500">関連タスク</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{relatedReminders.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
              <p className="text-sm text-slate-500">リンク</p>
              <div className="mt-3 space-y-2">
                {testProfile ? (
                  <>
                    <Link
                      href={`/prep?company=${encodeURIComponent(company.name)}&type=${encodeURIComponent(testProfile.type)}`}
                      className="inline-flex text-sm font-semibold text-fuchsia-600"
                    >
                      {testProfile.label}対策を見る
                    </Link>
                    {testProfile.sourceUrl ? (
                      <a href={testProfile.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-medium text-slate-500">
                        根拠を見る: {testProfile.sourceLabel}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500">根拠: {testProfile.sourceLabel}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">受験形式の推定データはまだありません</p>
                )}

                {myPageUrl ? (
                  <a href={myPageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-indigo-600">
                    企業マイページを開く
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">企業マイページ未登録</p>
                )}

                {corporateWebsite ? (
                  <a href={corporateWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-sky-600">
                    企業ホームページを開く
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">企業ホームページ未登録</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">予定</h3>
            <div className="mt-4 space-y-3">
              {relatedSchedules.length > 0 ? relatedSchedules.map((item) => (
                <article key={item.id} className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{scheduleTypeLabel(item.type)}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDate(item.date)} {item.time || ''}</p>
                  {item.location && <p className="mt-2 text-sm text-slate-600">{item.location}</p>}
                </article>
              )) : (
                <div className="rounded-[22px] bg-slate-50 px-4 py-6 text-sm text-slate-500">関連予定はまだありません。</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">メール</h3>
            <div className="mt-4 space-y-3">
              {relatedEmails.length > 0 ? relatedEmails.map((item) => (
                <article key={item.id} className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.date)}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.body}</p>
                </article>
              )) : (
                <div className="rounded-[22px] bg-slate-50 px-4 py-6 text-sm text-slate-500">関連メールはまだありません。</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">メモ / タスク</h3>
            <div className="mt-4 space-y-3">
              {company.notes && (
                <article className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">企業メモ</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{company.notes}</p>
                </article>
              )}

              {relatedReminders.length > 0 ? relatedReminders.map((item) => (
                <article key={item.id} className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDate(item.dueDate)}</p>
                  {item.description && <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>}
                </article>
              )) : (
                <div className="rounded-[22px] bg-slate-50 px-4 py-6 text-sm text-slate-500">関連タスクはまだありません。</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
