'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation/Header';
import { isCloudSyncEnabled, syncLocalStoreToRemote } from '@/lib/storage';
import { getSyncStatus, subscribeSyncStatus, SyncStatusSnapshot } from '@/lib/syncStatus';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [syncStatus, setSyncStatusState] = useState<SyncStatusSnapshot>(getSyncStatus());

  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const normalizedEmail = email.trim().toLowerCase();
  const loginCooldownSeconds = lastSentAt
    ? Math.max(0, 60 - Math.floor((now - lastSentAt) / 1000))
    : 0;
  const canSendLoginMail = isSupabaseConfigured && !loading && loginCooldownSeconds === 0;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => subscribeSyncStatus(setSyncStatusState), []);

  useEffect(() => {
    if (!lastSentAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lastSentAt]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    if (!canSendLoginMail) {
      setMessage(`ログインメールは連続送信できません。${loginCooldownSeconds}秒後にもう一度試してください。`);
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${appUrl}/auth`,
      },
    });

    setLoading(false);
    if (error) {
      setMessage(`ログインメールの送信に失敗しました: ${error.message}`);
      return;
    }

    const sentAt = Date.now();
    setLastSentAt(sentAt);
    setNow(sentAt);
    setMessage(`確認メールを ${normalizedEmail} に送信しました。メール内のリンクを開くと同期が有効になります。`);
  };

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setUserEmail(null);
    setMessage('ログアウトしました。');
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      await syncLocalStoreToRemote();
      setMessage('ローカルデータを Supabase に同期しました。');
    } finally {
      setLoading(false);
    }
  };

  const syncTone =
    syncStatus.state === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : syncStatus.state === 'syncing'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto max-w-5xl space-y-5 px-3 py-4 sm:px-4 sm:py-5">
        <section className="rounded-[34px] bg-[linear-gradient(140deg,#082f49_0%,#0f766e_34%,#0284c7_70%,#67e8f9_100%)] p-6 text-white shadow-[0_24px_80px_rgba(8,47,73,0.2)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/90">Cloud Sync</p>
          <h2 className="mt-2 text-3xl font-semibold">Supabase 同期</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">
            メールリンクでログインすると、企業・予定・メール・タスク・プロフィールを端末間で同期できます。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="app-metric-card rounded-[26px] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Session</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{userEmail ? 'ログイン中' : '未ログイン'}</p>
            <p className="mt-1 text-xs text-slate-500">同じメールアドレスの端末で共有</p>
          </article>
          <article className="app-metric-card rounded-[26px] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Sync state</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{syncStatus.state === 'syncing' ? '同期中' : syncStatus.state === 'error' ? '要確認' : '保存済み'}</p>
            <p className="mt-1 text-xs text-slate-500">クラウドの最新状態を確認</p>
          </article>
          <article className="app-metric-card rounded-[26px] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Manual action</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">初回のみ同期</p>
            <p className="mt-1 text-xs text-slate-500">ローカル既存データをクラウドへ移行</p>
          </article>
        </section>

        {!isSupabaseConfigured && (
          <section className="rounded-[30px] border border-amber-100 bg-[linear-gradient(180deg,#fffaf5_0%,#fff7ed_100%)] p-5 text-sm leading-6 text-amber-900 shadow-sm">
            Supabase の環境変数がまだ設定されていません。`NEXT_PUBLIC_SUPABASE_URL` と
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` を Vercel とローカル環境へ設定してください。
          </section>
        )}

        {isSupabaseConfigured && !process.env.NEXT_PUBLIC_SITE_URL && (
          <section className="rounded-[30px] border border-amber-100 bg-[linear-gradient(180deg,#fffaf5_0%,#fff7ed_100%)] p-5 text-sm leading-6 text-amber-900 shadow-sm">
            `NEXT_PUBLIC_SITE_URL` が未設定です。公開URLでメールリンクを開きたい場合は、
            Vercel と `.env.local` に `NEXT_PUBLIC_SITE_URL` を設定してください。
          </section>
        )}

        <section className="app-card rounded-[30px] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">アカウント状態</h3>
              <p className="mt-2 text-sm text-slate-600">
                {userEmail ? `ログイン中: ${userEmail}` : 'まだログインしていません。'}
              </p>
              <div className={`mt-4 inline-flex rounded-2xl border px-4 py-3 text-sm font-medium ${syncTone}`}>
                <div>
                  <p>{syncStatus.message}</p>
                  {syncStatus.updatedAt && (
                    <p className="mt-1 text-xs opacity-75">
                      最終更新: {new Date(syncStatus.updatedAt).toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {userEmail && (
              <button
                onClick={handleLogout}
                className="rounded-[24px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.18)]"
              >
                ログアウト
              </button>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="app-card rounded-[30px] p-5">
            <h3 className="text-lg font-semibold text-slate-900">メールリンクでログイン</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              初回だけ「今の端末のデータを同期」を押せば、以後の追加・編集は自動で他端末にも反映されます。
            </p>
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@mail.com"
                className="w-full rounded-[24px] border border-cyan-100 bg-[linear-gradient(180deg,#f7feff_0%,#ecfeff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              <button
                disabled={!canSendLoginMail}
                className="w-full rounded-[24px] bg-[linear-gradient(135deg,#0369a1_0%,#06b6d4_100%)] py-3 font-semibold text-white shadow-[0_14px_28px_rgba(8,145,178,0.18)] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading
                  ? '処理中...'
                  : loginCooldownSeconds > 0
                    ? `${loginCooldownSeconds}秒後に再送できます`
                    : 'ログインメールを送る'}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleManualSync}
                disabled={!isCloudSyncEnabled() || loading}
                className="app-chip rounded-[24px] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-400"
              >
                今の端末のデータを同期
              </button>
              <Link href="/settings" className="app-chip rounded-[24px] px-4 py-3 text-sm font-semibold">
                設定へ
              </Link>
            </div>

            {message && <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>}

            <div className="mt-5 rounded-[24px] border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">メールが届かないとき</p>
              <p className="mt-2">1分ほど待って、迷惑メールとプロモーションも確認してください。</p>
              <p>Supabase 標準メールは短時間の再送に弱いので、連打せず60秒以上あけてください。</p>
              <p className="mt-2 break-all text-xs text-slate-500">リンク先: {appUrl}/auth</p>
            </div>
          </section>

          <section className="space-y-4">
            <article className="app-card rounded-[28px] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">How it works</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">同期の流れ</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="app-tint-panel app-tint-blue rounded-[20px] p-3">1. 公開URLからメールリンクでログイン</div>
                <div className="app-tint-panel app-tint-emerald rounded-[20px] p-3">2. 初回だけローカルデータをクラウドへ同期</div>
                <div className="app-tint-panel app-tint-violet rounded-[20px] p-3">3. 以後は同じメールでログインした端末に自動反映</div>
              </div>
            </article>

            <article className="app-card rounded-[28px] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Redirect</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">現在の公開URL</h3>
              <p className="mt-3 break-all text-sm leading-6 text-slate-600">{appUrl || '未設定'}</p>
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}
