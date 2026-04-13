'use client';

import React, { ReactNode } from 'react';
import './globals.css';
import ServiceWorkerRegister from '@/components/PWA/ServiceWorkerRegister';
import SupabaseBootstrap from '@/components/Supabase/SupabaseBootstrap';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#eef4ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="就活管理" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <title>就活管理 - Job Search Management</title>
        <meta name="description" content="就活の日程、メール、リマインダーを一括管理できるアプリケーション" />
      </head>
      <body className="app-body">
        <ServiceWorkerRegister />
        <SupabaseBootstrap />
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
