'use client';

import React, { ReactNode, useEffect } from 'react';

interface AppSheetProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function AppSheet({ open, title, description, onClose, children }: AppSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/28 backdrop-blur-[6px]"
      />

      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[520px] px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="rounded-[34px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,245,249,0.94)_100%)] p-4 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-2xl">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600">App Sheet</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
              {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="app-secondary-button rounded-full px-4 py-2 text-xs font-semibold"
            >
              閉じる
            </button>
          </div>

          <div className="mt-5 max-h-[72vh] overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
