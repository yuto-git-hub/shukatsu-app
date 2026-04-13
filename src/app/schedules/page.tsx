'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation/Header';
import CalendarSyncCard from '@/components/Schedules/CalendarSyncCard';
import ScheduleForm from '@/components/Forms/ScheduleForm';
import MonthlyCalendar from '@/components/Schedules/MonthlyCalendar';
import AppSheet from '@/components/UI/AppSheet';
import { Company, Schedule } from '@/types';
import { KEYS, storage } from '@/lib/storage';
import { formatDate, formatScheduleTimeRange, generateId, getDaysUntil, scheduleTypeLabel } from '@/lib/utils';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setSchedules(storage.get(KEYS.SCHEDULES) || []);
    setCompanies(storage.get(KEYS.COMPANIES) || []);
  }, []);

  const handleSubmit = (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();

    if (editingId) {
      const updated = schedules.map((schedule) =>
        schedule.id === editingId ? { ...schedule, ...data, updatedAt: now } : schedule
      );
      setSchedules(updated);
      storage.set(KEYS.SCHEDULES, updated);
      setEditingId(null);
    } else {
      const newSchedule: Schedule = {
        id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newSchedule, ...schedules];
      setSchedules(updated);
      storage.set(KEYS.SCHEDULES, updated);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = schedules.filter((schedule) => schedule.id !== id);
    setSchedules(updated);
    storage.set(KEYS.SCHEDULES, updated);
  };

  const editingSchedule = editingId ? schedules.find((schedule) => schedule.id === editingId) : undefined;
  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((schedule) => schedule.status === 'scheduled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [schedules]
  );

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5">
        <section className="grid gap-5 xl:grid-cols-[320px,1fr]">
          <aside className="space-y-5">
            <article className="app-hero-card rounded-[30px] p-4 text-white sm:rounded-[36px] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/90">Schedule board</p>
                  <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">予定と連携</h2>
                </div>
                <div className="rounded-[20px] border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur sm:rounded-[24px] sm:px-4 sm:py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">Upcoming</p>
                  <p className="mt-1 text-xl font-semibold sm:text-2xl">{upcomingSchedules.length}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75 sm:leading-7">
                月次カレンダーで1か月の予定を見渡しつつ、Google Calendar や Apple カレンダーにも反映できます。
              </p>

              <button
                onClick={() => {
                  setEditingId(null);
                  setShowForm((current) => !current);
                }}
                className="mt-5 w-full rounded-[20px] bg-white/96 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.12)] sm:mt-6 sm:rounded-[24px]"
              >
                {showForm || editingId ? 'フォームを閉じる' : '+ 予定を追加'}
              </button>
            </article>

            <article className="app-card rounded-[28px] p-4 sm:rounded-[34px] sm:p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sync options</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">カレンダー連携</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div className="rounded-[18px] bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] p-3 shadow-sm sm:rounded-[22px]">1. 購読URLを Google Calendar の「URLで追加」に貼る</div>
                <div className="rounded-[18px] bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_100%)] p-3 shadow-sm sm:rounded-[22px]">2. `webcal` リンクで iPhone / Apple カレンダーに購読</div>
                <div className="rounded-[18px] bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] p-3 shadow-sm sm:rounded-[22px]">3. 予定を更新すると購読カレンダーにも反映</div>
              </div>
            </article>

          </aside>

          <div className="space-y-5">
            <CalendarSyncCard schedules={schedules} />
            <MonthlyCalendar schedules={schedules} />

            <section className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
              <article className="app-card rounded-[34px] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Timeline</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">今後の予定</h3>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    {upcomingSchedules.length}件
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {upcomingSchedules.length > 0 ? upcomingSchedules.map((schedule) => (
                    <article key={schedule.id} className="rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{schedule.companyName}</p>
                          <p className="mt-1 text-xs text-slate-500">{scheduleTypeLabel(schedule.type)}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {getDaysUntil(schedule.date) === 0 ? '今日' : `${getDaysUntil(schedule.date)}日後`}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1">{formatDate(schedule.date)}</span>
                        {schedule.time && (
                          <span className="rounded-full bg-white px-3 py-1">
                            {formatScheduleTimeRange(schedule.time, schedule.endTime)}
                          </span>
                        )}
                        {schedule.location && <span className="rounded-full bg-white px-3 py-1">{schedule.location}</span>}
                      </div>

                      {schedule.details && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{schedule.details}</p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setShowForm(false);
                            setEditingId(schedule.id);
                          }}
                          className="rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm"
                        >
                          削除
                        </button>
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 text-sm text-slate-500 shadow-sm">予定はまだありません。</div>
                  )}
                </div>
              </article>

              <article className="rounded-[34px] bg-[linear-gradient(135deg,#f8fbff_0%,#e0f2fe_55%,#dbeafe_100%)] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Workflow</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">おすすめの使い方</h3>
                <div className="mt-5 space-y-4">
                  {[
                    '企業を登録して企業別ページを作る',
                    '予定を追加して月次カレンダーに並べる',
                    '面接予定を Google / Apple に連携する',
                    'メールとタスクを会社単位で整理する',
                  ].map((step, index) => (
                    <div key={step} className="flex items-start gap-3 rounded-[24px] border border-white/80 bg-white/78 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </section>
      </main>

      <AppSheet
        open={showForm || Boolean(editingId)}
        title={editingId ? '予定を編集' : '予定を追加'}
        description="面接や説明会を、アプリのシートUIで素早く登録できます。"
        onClose={() => {
          setShowForm(false);
          setEditingId(null);
        }}
      >
        <ScheduleForm
          onSubmit={handleSubmit}
          initialData={editingSchedule}
          companies={companies.map((company) => ({ id: company.id, name: company.name }))}
        />
      </AppSheet>
    </div>
  );
}
