'use client';

import React from 'react';
import Navigation from '@/components/Navigation/Header';
import Link from 'next/link';
import { KEYS, isCloudSyncEnabled, storage } from '@/lib/storage';

export default function SettingsPage() {
  const handleExportData = () => {
    const data = {
      companies: storage.get(KEYS.COMPANIES) || [],
      schedules: storage.get(KEYS.SCHEDULES) || [],
      emails: storage.get(KEYS.EMAILS) || [],
      reminders: storage.get(KEYS.REMINDERS) || [],
      prepHub: storage.get(KEYS.PREP_HUB) || {},
      profile: storage.get(KEYS.PROFILE) || {},
      applications: storage.get(KEYS.APPLICATIONS) || [],
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-search-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
      storage.clear();
      window.alert('すべてのデータが削除されました。');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto max-w-5xl space-y-5 px-3 py-4 sm:px-4 sm:py-5">
        <section className="rounded-[32px] bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_52%,#94a3b8_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
          <p className="text-sm text-white/70">バックアップとデータ管理</p>
          <h2 className="mt-2 text-3xl font-semibold">設定</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">
            このアプリのデータはブラウザ内に保存されています。大事な情報は定期的に書き出せます。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="app-metric-card rounded-[28px] p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Storage</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {isCloudSyncEnabled() ? 'クラウド同期ON' : 'ローカル保存'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isCloudSyncEnabled() ? 'Supabase と端末キャッシュの両方を使っています。' : '現在はブラウザ内の保存がメインです。'}
            </p>
          </article>
          <article className="app-metric-card rounded-[28px] p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Privacy</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">本人データのみ同期</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              同じメールアドレスでログインした端末だけが、同じ就活データを見られます。
            </p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <article className="app-card rounded-[30px] p-5">
            <h3 className="text-lg font-semibold text-slate-900">データをエクスポート</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              企業情報、予定、メール、リマインダー、プロフィールをJSON形式で保存します。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="app-tint-panel app-tint-emerald rounded-[22px] p-4 text-sm text-slate-700">ローカルの保険としてバックアップを残せます。</div>
              <div className="app-tint-panel app-tint-blue rounded-[22px] p-4 text-sm text-slate-700">機種変更や整理前にもおすすめです。</div>
            </div>
            <button
              onClick={handleExportData}
              className="app-primary-button mt-5 rounded-[24px] px-5 py-3 text-sm font-semibold"
            >
              バックアップを保存
            </button>
          </article>

          <div className="space-y-4">
            <section className="app-card rounded-[30px] p-5">
              <h3 className="text-lg font-semibold text-slate-900">アプリ情報</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>アプリ名: 就活管理</p>
                <p>バージョン: 0.1.0</p>
                <p>ストレージ: {isCloudSyncEnabled() ? 'Supabase + LocalStorageキャッシュ' : 'ブラウザのLocalStorage'}</p>
                <p>プライバシー: ログイン後は本人データのみをSupabaseへ同期</p>
                <Link href="/auth" className="inline-flex pt-2 text-sm font-semibold text-sky-600">
                  同期設定を開く
                </Link>
              </div>
            </section>

            <section className="app-card rounded-[30px] border border-rose-100 p-5">
              <h3 className="text-lg font-semibold text-slate-900">すべてのデータを削除</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                LocalStorage 内のデータをすべて消去します。取り消しできないため、先にバックアップ推奨です。
              </p>
              <button
                onClick={handleClearData}
                className="mt-5 rounded-[24px] bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
              >
                すべて削除
              </button>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
