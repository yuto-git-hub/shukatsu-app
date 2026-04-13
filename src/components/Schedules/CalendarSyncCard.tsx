'use client';

import React, { useEffect, useState } from 'react';
import { Schedule } from '@/types';
import {
  ensureCalendarFeed,
  getAppleCalendarSubscriptionUrl,
  getCalendarFeedUrl,
} from '@/lib/calendarFeeds';
import { isCloudSyncEnabled } from '@/lib/storage';

interface CalendarSyncCardProps {
  schedules: Schedule[];
}

export default function CalendarSyncCard({ schedules }: CalendarSyncCardProps) {
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [appleUrl, setAppleUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isCloudSyncEnabled()) {
      return;
    }

    ensureCalendarFeed(schedules).then(async () => {
      setFeedUrl(await getCalendarFeedUrl());
      setAppleUrl(await getAppleCalendarSubscriptionUrl());
    });
  }, [schedules]);

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:rounded-[34px] sm:p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Calendar sync</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">Google / iOS カレンダー連携</h3>

      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <p>Google は「URL で追加」、iPhone / iOS は `webcal` の購読リンクで予定を読み込めます。</p>
        <p>予定を更新すると、この購読カレンダーにも反映されます。</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          onClick={async () => {
            setLoading(true);
            const nextFeed = await getCalendarFeedUrl();
            const nextApple = await getAppleCalendarSubscriptionUrl();
            setFeedUrl(nextFeed);
            setAppleUrl(nextApple);
            setMessage(nextFeed ? '購読URLを更新しました。' : '先に同期ログインを完了してください。');
            setLoading(false);
          }}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          {loading ? '更新中...' : '購読URLを作成 / 更新'}
        </button>

        {appleUrl && (
          <a
            href={appleUrl}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            iPhone / Apple カレンダーで開く
          </a>
        )}
      </div>

      {feedUrl && (
        <div className="mt-5 rounded-[20px] bg-slate-50 p-3.5 sm:rounded-[24px] sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">購読URL</p>
          <p className="mt-2 break-all text-sm text-slate-700">{feedUrl}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(feedUrl);
                setMessage('購読URLをコピーしました。Google Calendar の「URLで追加」に貼れます。');
              }}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              URLをコピー
            </button>
            <a
              href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Google Calendar を開く
            </a>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>}
    </article>
  );
}
