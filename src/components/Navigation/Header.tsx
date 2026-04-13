'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type IconName = 'home' | 'calendar' | 'company' | 'mail' | 'task' | 'prep' | 'sync' | 'profile' | 'settings';

function AppIcon({ name, active = false }: { name: IconName; active?: boolean }) {
  const stroke = active ? 'currentColor' : '#64748b';
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M4 10.5 12 4l8 6.5" />
          <path {...common} d="M6.5 9.5V20h11V9.5" />
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
          <path {...common} d="M5 20V7.5A1.5 1.5 0 0 1 6.5 6H11v14H5Z" />
          <path {...common} d="M11 20V4.5A1.5 1.5 0 0 1 12.5 3H18a1 1 0 0 1 1 1V20H11Z" />
          <path {...common} d="M8 10h.01M8 13.5h.01M14.5 8h.01M14.5 11.5h.01" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect {...common} x="3.5" y="5.5" width="17" height="13" rx="3" />
          <path {...common} d="m5.5 8 6.5 5 6.5-5" />
        </svg>
      );
    case 'task':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M9 6h10M9 12h10M9 18h10" />
          <path {...common} d="m4.5 6.5 1.5 1.5 2.5-3M4.5 12.5 6 14l2.5-3M4.5 18.5 6 20l2.5-3" />
        </svg>
      );
    case 'prep':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M12 3l1.6 4.3L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.7L12 3Z" />
          <path {...common} d="M5 19h14" />
        </svg>
      );
    case 'sync':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path {...common} d="M6.5 9A6 6 0 0 1 17 7l1.5 1.5" />
          <path {...common} d="M17.5 15A6 6 0 0 1 7 17l-1.5-1.5" />
          <path {...common} d="M18.5 5.5V8.5h-3M5.5 18.5V15.5h3" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle {...common} cx="12" cy="8" r="3.5" />
          <path {...common} d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="3" />
          <path
            {...common}
            d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z"
          />
        </svg>
      );
  }
}

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'ホーム', icon: 'home' as const },
    { href: '/schedules', label: '予定', icon: 'calendar' as const },
    { href: '/companies', label: '企業', icon: 'company' as const },
    { href: '/emails', label: 'メール', icon: 'mail' as const },
    { href: '/prep', label: '対策', icon: 'prep' as const },
    { href: '/reminders', label: 'タスク', icon: 'task' as const },
  ];

  const quickActions = [
    { href: '/auth', label: '同期', icon: 'sync' as const },
    { href: '/mypage', label: 'マイページ', icon: 'profile' as const },
    { href: '/settings', label: '設定', icon: 'settings' as const },
  ];

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/': { title: '就活ホーム', subtitle: '今日の予定と応募状況をひと目で確認' },
    '/schedules': { title: 'スケジュール', subtitle: '面接や説明会を時系列で管理' },
    '/companies': { title: '企業情報', subtitle: '応募先の連絡先やメモを整理' },
    '/emails': { title: 'メール', subtitle: '企業とのやり取りをまとめて確認' },
    '/prep': { title: '就活対策', subtitle: 'ES・Webテスト・自己分析を一か所で整理' },
    '/reminders': { title: 'リマインダー', subtitle: '締切ややることを見逃さない' },
    '/profile': { title: 'マイページ', subtitle: '応募に使う基本情報を管理' },
    '/mypage': { title: 'マイページ', subtitle: '応募に使う基本情報を管理' },
    '/auth': { title: '同期設定', subtitle: '端末間のクラウド同期を管理' },
    '/settings': { title: '設定', subtitle: 'バックアップやデータ管理' },
  };

  const currentPage =
    pageTitles[pathname] ||
    (pathname.startsWith('/companies/') ? { title: '企業詳細', subtitle: '企業ごとの進捗や連絡を確認' } : null) ||
    pageTitles['/'];

  return (
    <>
      <header className="z-40 px-2 pb-1 pt-[max(6px,env(safe-area-inset-top))] sm:px-3">
        <div className="app-width app-topbar mx-auto rounded-[28px] px-3 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_0_6px_rgba(14,165,233,0.12)]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">Job Hunt Hub</p>
              </div>
              <h1 className="mt-2.5 text-[24px] font-semibold tracking-tight text-slate-950 sm:text-[30px]">
                {currentPage.title}
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm sm:leading-6">{currentPage.subtitle}</p>
            </div>

            <div className="hidden flex-wrap items-center justify-end gap-2 sm:flex">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                    pathname === item.href
                      ? 'app-primary-button'
                      : 'app-secondary-button'
                  }`}
                >
                  <AppIcon name={item.icon} active={pathname === item.href} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[16px] px-2 py-2.5 text-[11px] font-semibold ${
                  pathname === item.href ? 'app-primary-button' : 'app-secondary-button'
                }`}
              >
                <AppIcon name={item.icon} active={pathname === item.href} />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 sm:px-3">
        <div className="mx-auto grid w-full max-w-[430px] grid-cols-6 gap-1 rounded-[28px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,245,249,0.92)_100%)] p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:max-w-[500px] sm:gap-1.5 sm:rounded-[32px] sm:p-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-col items-center rounded-[20px] px-1.5 py-2 text-[10px] font-semibold transition sm:rounded-[24px] sm:px-2 sm:py-2.5 sm:text-[11px] ${
                  active
                    ? 'bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)]'
                    : 'text-slate-500 hover:bg-white/90 hover:text-slate-900'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9 ${
                    active ? 'bg-white/12' : 'bg-slate-100/80'
                  }`}
                >
                  <AppIcon name={item.icon} active={active} />
                </span>
                <span className="mt-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
