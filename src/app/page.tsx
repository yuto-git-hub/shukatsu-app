'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation/Header';
import InstallPrompt from '@/components/PWA/InstallPrompt';
import { ApplicationProgress, Reminder, Schedule } from '@/types';
import { KEYS, storage } from '@/lib/storage';
import {
  addDays,
  applicationStatusLabel,
  formatDate,
  formatWeekdayShort,
  getDaysUntil,
  isSameDay,
  scheduleTypeLabel,
  startOfWeek,
  statusColor,
} from '@/lib/utils';

type HomeIconName = 'spark' | 'calendar' | 'company' | 'mail' | 'profile' | 'tasks' | 'progress' | 'focus';

function HomeIcon({ name }: { name: HomeIconName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect {...common} x="4" y="6" width="16" height="14" rx="3" />
          <path {...common} d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      );
    case 'company':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M5 20V8a1 1 0 0 1 1-1h5v13H5Z" />
          <path {...common} d="M11 20V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16H11Z" />
          <path {...common} d="M8 10h.01M8 13h.01M15 8h.01M15 11h.01" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect {...common} x="3.5" y="5.5" width="17" height="13" rx="3" />
          <path {...common} d="m5.5 8 6.5 5 6.5-5" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle {...common} cx="12" cy="8" r="3.5" />
          <path {...common} d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case 'tasks':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M9 6h10M9 12h10M9 18h10" />
          <path {...common} d="m4.5 6.5 1.5 1.5 2.5-3M4.5 12.5 6 14l2.5-3M4.5 18.5 6 20l2.5-3" />
        </svg>
      );
    case 'progress':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M5 18 10 13l3 3 6-7" />
          <path {...common} d="M5 6v12h14" />
        </svg>
      );
    case 'focus':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="3.5" />
          <path {...common} d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
        </svg>
      );
  }
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [applications, setApplications] = useState<ApplicationProgress[]>([]);
  const [userName, setUserName] = useState('ユーザー');
  const [companyCount, setCompanyCount] = useState(0);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const currentHour = new Date().getHours();

  useEffect(() => {
    const savedSchedules = storage.get(KEYS.SCHEDULES) || [];
    const savedReminders = storage.get(KEYS.REMINDERS) || [];
    const savedProfile = storage.get(KEYS.PROFILE);
    const savedCompanies = storage.get(KEYS.COMPANIES) || [];
    const savedEmails = storage.get(KEYS.EMAILS) || [];
    const savedApplications = storage.get(KEYS.APPLICATIONS) || [];

    setSchedules(savedSchedules);
    setReminders(savedReminders);
    setApplications(savedApplications);
    setCompanyCount(savedCompanies.length);
    setUnreadEmailCount(savedEmails.filter((email: { isRead: boolean }) => !email.isRead).length);

    if (savedProfile?.name) {
      setUserName(savedProfile.name);
    }
  }, []);

  const activeApplications = applications.filter(
    (application) => !['accepted', 'rejected'].includes(application.status)
  );

  const upcomingSchedules = schedules
    .filter((schedule) => schedule.status === 'scheduled' && getDaysUntil(schedule.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const focusReminders = reminders
    .filter((reminder) => !reminder.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const weekScheduleCounts = weekDays.map((day) => ({
    day,
    count: schedules.filter((schedule) => isSameDay(schedule.date, day)).length,
  }));

  const statCards = [
    {
      title: 'Open Tasks',
      value: reminders.filter((reminder) => !reminder.completed).length,
      description: '未完了のやること',
      style: 'bg-[#0f172a] text-white',
    },
    {
      title: 'Companies',
      value: companyCount,
      description: '登録済み企業',
      style: 'bg-white text-slate-950',
    },
    {
      title: 'Unread',
      value: unreadEmailCount,
      description: '確認待ちメール',
      style: 'bg-[#ff6b2c] text-white',
    },
    {
      title: 'Pipeline',
      value: activeApplications.length,
      description: '進行中の選考',
      style: 'bg-[#dbeafe] text-slate-950',
    },
  ];

  const shortcuts = [
    { href: '/schedules', title: 'カレンダー', body: '週次カレンダーを開く', icon: 'calendar' as const },
    { href: '/companies', title: '企業管理', body: '会社ごとの詳細を整理', icon: 'company' as const },
    { href: '/emails', title: 'メール', body: '連絡の確認と記録', icon: 'mail' as const },
    { href: '/mypage', title: 'マイページ', body: '応募プロフィールを更新', icon: 'profile' as const },
  ];

  const quickPulse = [
    {
      title: '今週の予定',
      value: upcomingSchedules.length,
      note: upcomingSchedules.length > 0 ? '次の予定へすぐ移動' : '予定追加で準備開始',
      tone: 'from-sky-500 via-cyan-400 to-teal-300',
      icon: 'calendar' as const,
    },
    {
      title: '未読メール',
      value: unreadEmailCount,
      note: unreadEmailCount > 0 ? '連絡の見逃しを防止' : '受信箱は整理済み',
      tone: 'from-emerald-500 via-teal-400 to-cyan-300',
      icon: 'mail' as const,
    },
    {
      title: '進行中選考',
      value: activeApplications.length,
      note: activeApplications.length > 0 ? '面接・選考を追跡中' : '新しい応募を追加',
      tone: 'from-violet-500 via-fuchsia-400 to-rose-300',
      icon: 'progress' as const,
    },
  ];

  const dayScene =
    currentHour < 5
      ? {
          label: 'Late Night',
          greeting: '静かな時間に整える',
          heroTone: 'from-[#0b1220] via-[#1e3a8a] to-[#4f46e5]',
          accentTone: 'from-[#8b5cf6] via-[#6366f1] to-[#38bdf8]',
          badgeTone: 'bg-white/10 text-cyan-100',
        }
      : currentHour < 11
        ? {
            label: 'Morning',
            greeting: '朝のうちに先手を打つ',
            heroTone: 'from-[#0f172a] via-[#1d4ed8] to-[#38bdf8]',
            accentTone: 'from-[#22c55e] via-[#06b6d4] to-[#60a5fa]',
            badgeTone: 'bg-emerald-200/18 text-emerald-50',
          }
        : currentHour < 18
          ? {
              label: 'Daylight',
              greeting: '今日の進み具合を見渡す',
              heroTone: 'from-[#0f172a] via-[#2563eb] to-[#7c3aed]',
              accentTone: 'from-[#fb7185] via-[#f59e0b] to-[#facc15]',
              badgeTone: 'bg-white/12 text-white',
            }
          : {
              label: 'Evening',
              greeting: '夜に次の一手を整える',
              heroTone: 'from-[#111827] via-[#312e81] to-[#7c3aed]',
              accentTone: 'from-[#f97316] via-[#ec4899] to-[#8b5cf6]',
              badgeTone: 'bg-white/10 text-violet-100',
            };

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-3 py-4 sm:px-4 sm:py-5">
        <InstallPrompt />

        <section className="grid gap-4 xl:grid-cols-[1.25fr,0.9fr]">
          <div className="grid gap-4">
            <article className={`home-hero relative overflow-hidden rounded-[36px] bg-gradient-to-br ${dayScene.heroTone} p-5 text-white shadow-[0_30px_90px_rgba(37,99,235,0.28)] sm:p-6`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(103,232,249,0.24),transparent_26%)]" />
              <div className={`absolute -left-12 top-24 h-44 w-44 rounded-full bg-gradient-to-br ${dayScene.accentTone} opacity-25 blur-3xl`} />
              <div className="absolute bottom-[-46px] right-[-14px] h-52 w-52 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Launch Pad</p>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${dayScene.badgeTone}`}>{dayScene.label}</span>
                    </div>
                    <h2 className="mt-3 text-[2rem] font-semibold tracking-tight sm:text-[3.2rem]">
                      {userName}さんの
                      <br />
                      就活アプリ
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
                      {dayScene.greeting}。今日やること、次の面接、企業ごとの動きまで、今いちばん気にしたい情報を先に出すホーム画面です。
                    </p>
                  </div>

                  <div className="grid min-w-[170px] gap-3 self-stretch">
                    <div className="home-float rounded-[26px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">This week</p>
                      <p className="mt-2 text-4xl font-semibold">{upcomingSchedules.length}</p>
                      <p className="mt-1 text-xs text-white/70">直近の予定</p>
                    </div>
                    <div className="home-float home-float-delay rounded-[26px] border border-white/15 bg-black/18 px-4 py-4 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Unread</p>
                      <p className="mt-2 text-3xl font-semibold">{unreadEmailCount}</p>
                      <p className="mt-1 text-xs text-white/70">確認待ちメール</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {quickPulse.map((item) => (
                    <article
                      key={item.title}
                      className={`home-pulse-card rounded-[26px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)] p-4 shadow-sm backdrop-blur`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={`inline-flex rounded-full bg-gradient-to-r ${item.tone} px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white`}>
                          {item.title}
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/12 text-white">
                          <HomeIcon name={item.icon} />
                        </div>
                      </div>
                      <p className="mt-4 text-4xl font-semibold">{item.value}</p>
                      <p className="mt-2 text-sm text-white/75">{item.note}</p>
                    </article>
                  ))}
                </div>
              </div>
            </article>

            <section className="grid gap-4 md:grid-cols-4">
              {shortcuts.map((item, index) => {
                const tones = [
                  'from-[#eff6ff] to-[#dbeafe]',
                  'from-[#eef2ff] to-[#e9d5ff]',
                  'from-[#ecfeff] to-[#ccfbf1]',
                  'from-[#fff7ed] to-[#ffedd5]',
                ];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`home-shortcut rounded-[28px] border border-white/80 bg-gradient-to-br ${tones[index % tones.length]} p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-700 shadow-sm">
                      <HomeIcon name={item.icon} />
                    </div>
                    <p className="mt-5 text-xl font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                  </Link>
                );
              })}
            </section>
          </div>

          <div className="grid gap-4">
            <article className="home-float rounded-[36px] bg-[linear-gradient(145deg,#111111_0%,#1f2937_58%,#0f172a_100%)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-white/45">
                    <HomeIcon name="progress" />
                    <p className="text-xs uppercase tracking-[0.24em]">Progress</p>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">選考の流れ</h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  {activeApplications.length} active
                </span>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3">
                {['not-started', 'applied', 'screening', 'interview'].map((status, index) => {
                  const counts = applications.filter((application) => application.status === status).length;
                  const heights = ['h-16', 'h-10', 'h-20', 'h-12'];
                  const colors = ['bg-[#c4b5fd]', 'bg-white', 'bg-[#ff6b2c]', 'bg-slate-400'];
                  return (
                    <div key={status} className="rounded-[22px] bg-white/4 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                        {applicationStatusLabel(status as ApplicationProgress['status'])}
                      </p>
                      <div className="mt-5 flex items-end gap-2">
                        <div className={`w-full rounded-2xl ${heights[index]} ${colors[index]}`} />
                      </div>
                      <p className="mt-4 text-sm text-white/75">{counts}件</p>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="home-float home-float-delay rounded-[36px] bg-[linear-gradient(135deg,#ff6b2c_0%,#fb7185_48%,#f59e0b_100%)] p-5 text-white shadow-[0_24px_80px_rgba(249,115,22,0.24)] sm:p-6">
              <div className="flex items-center gap-2 text-white/60">
                <HomeIcon name="calendar" />
                <p className="text-xs uppercase tracking-[0.24em]">Calendar Sync</p>
              </div>
              <h3 className="mt-3 text-3xl font-semibold leading-tight">予定は Google / Apple にすぐ連携</h3>
              <p className="mt-4 text-sm leading-7 text-white/80">
                スケジュール画面からそのまま Google Calendar と iPhone カレンダーへ反映できます。
              </p>
              <Link
                href="/schedules"
                className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#ff6b2c]"
              >
                カレンダーを開く
              </Link>
            </article>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.35fr,0.95fr,0.95fr]">
          <article className="app-card home-lift rounded-[36px] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400">
                  <HomeIcon name="spark" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]">Week strip</p>
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">今週の密度</h3>
              </div>
              <Link href="/schedules" className="text-sm font-semibold text-sky-600">
                カレンダーへ
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-3">
              {weekScheduleCounts.map(({ day, count }) => (
                <div key={day.toISOString()} className="rounded-[20px] bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] p-2.5 text-center shadow-sm sm:rounded-[24px] sm:p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:text-[11px] sm:tracking-[0.22em]">{formatWeekdayShort(day)}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">{day.getDate()}</p>
                  <div className="mt-3 h-20 rounded-[18px] bg-white p-2 sm:mt-4 sm:h-24 sm:rounded-[20px]">
                    <div
                      className="w-full rounded-[14px] bg-[linear-gradient(180deg,#0f172a_0%,#2563eb_100%)]"
                      style={{ height: `${Math.max(count * 18, 12)}px` }}
                    />
                    <p className="mt-3 text-xs text-slate-500">{count}件</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="home-lift rounded-[36px] border border-white/80 bg-[linear-gradient(135deg,#f4f3ff_0%,#eef4ff_100%)] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="flex items-center gap-2 text-violet-500">
              <HomeIcon name="calendar" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Next Up</p>
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">次の予定</h3>
            <div className="mt-5 space-y-3">
              {upcomingSchedules.length > 0 ? upcomingSchedules.map((schedule) => (
                <article key={schedule.id} className="rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{schedule.companyName}</p>
                      <p className="mt-1 text-xs text-slate-500">{scheduleTypeLabel(schedule.type)}</p>
                    </div>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {getDaysUntil(schedule.date) === 0 ? '今日' : `${getDaysUntil(schedule.date)}日後`}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{formatDate(schedule.date)}</p>
                </article>
              )) : (
                <div className="rounded-[24px] bg-white p-5 text-sm text-slate-500">近日の予定はまだありません。</div>
              )}
            </div>
          </article>

          <article className="app-card home-lift rounded-[36px] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400">
                  <HomeIcon name="focus" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]">Focus</p>
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">集中タスク</h3>
              </div>
              <Link href="/reminders" className="text-sm font-semibold text-sky-600">
                タスクへ
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {focusReminders.length > 0 ? focusReminders.map((reminder) => (
                <article key={reminder.id} className="rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{reminder.title}</p>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      reminder.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : reminder.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {reminder.priority === 'high' ? '高' : reminder.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{formatDate(reminder.dueDate)}</p>
                </article>
              )) : (
                <div className="rounded-[24px] bg-slate-50 p-5 text-sm text-slate-500">今すぐ対応が必要なタスクはありません。</div>
              )}
            </div>
          </article>
        </section>

        {activeApplications.length > 0 && (
          <section className="app-card home-lift rounded-[36px] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400">
                  <HomeIcon name="company" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]">Pipeline board</p>
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">企業ごとの進行状況</h3>
              </div>
              <Link href="/companies" className="text-sm font-semibold text-sky-600">
                企業一覧へ
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {activeApplications.slice(0, 4).map((application) => (
                <article key={application.id} className="rounded-[28px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{application.companyName}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {application.lastUpdate ? formatDate(application.lastUpdate) : '更新待ち'}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(application.status)}`}>
                      {applicationStatusLabel(application.status)}
                    </span>
                  </div>
                  {application.notes && (
                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{application.notes}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
