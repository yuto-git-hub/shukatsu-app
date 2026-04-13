'use client';

import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  if (dismissed) {
    return null;
  }

  if (!installEvent && !isIOS) {
    return null;
  }

  return (
    <div className="rounded-[24px] border border-cyan-200 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_100%)] p-4 text-white shadow-[0_18px_40px_rgba(8,47,73,0.24)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">PWA</p>
          <h3 className="mt-2 text-lg font-semibold">ホーム画面に追加</h3>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {installEvent
              ? 'インストールすると、普通のアプリのようにフルスクリーンで開けます。'
              : 'iPhoneでは共有メニューから「ホーム画面に追加」を選ぶとアプリのように使えます。'}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80"
        >
          閉じる
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {installEvent ? (
          <button
            onClick={async () => {
              await installEvent.prompt();
              await installEvent.userChoice;
              setInstallEvent(null);
            }}
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            今すぐインストール
          </button>
        ) : (
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/85">
            Safariで共有 → ホーム画面に追加
          </div>
        )}
      </div>
    </div>
  );
}
