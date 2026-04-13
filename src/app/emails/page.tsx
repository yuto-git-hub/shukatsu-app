'use client';

import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation/Header';
import AppSheet from '@/components/UI/AppSheet';
import { Email } from '@/types';
import { KEYS, storage } from '@/lib/storage';
import { formatDateTime, generateId } from '@/lib/utils';

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    from: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    setEmails(storage.get(KEYS.EMAILS) || []);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newEmail: Email = {
      id: generateId(),
      companyId: formData.companyId,
      companyName: formData.companyName,
      from: formData.from,
      subject: formData.subject,
      body: formData.body,
      date: new Date(),
      isRead: false,
      createdAt: new Date(),
    };

    const updated = [newEmail, ...emails];
    setEmails(updated);
    storage.set(KEYS.EMAILS, updated);
    setShowForm(false);
    setFormData({ companyId: '', companyName: '', from: '', subject: '', body: '' });
  };

  const handleMarkAsRead = (id: string) => {
    const updated = emails.map((email) =>
      email.id === id ? { ...email, isRead: true } : email
    );
    setEmails(updated);
    storage.set(KEYS.EMAILS, updated);
  };

  const handleDelete = (id: string) => {
    const updated = emails.filter((email) => email.id !== id);
    setEmails(updated);
    storage.set(KEYS.EMAILS, updated);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedEmail = emails.find((email) => email.id === selectedId) || emails[0];
  const unreadCount = emails.filter((email) => !email.isRead).length;
  const todayCount = emails.filter((email) => {
    const date = new Date(email.date);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto grid max-w-6xl gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5 xl:grid-cols-[320px,1fr]">
        <section className="space-y-4">
          <div className="rounded-[30px] bg-[linear-gradient(140deg,#052e16_0%,#047857_38%,#14b8a6_72%,#99f6e4_100%)] p-5 text-white shadow-[0_24px_70px_rgba(5,150,105,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/90">Contact log</p>
                <p className="mt-3 text-2xl font-semibold">未読 {unreadCount}件</p>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">Inbox</p>
                <p className="mt-1 text-2xl font-semibold">{emails.length}</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/80">
              企業とのやり取りを時系列で残して、見逃しを防ぎます。
            </p>
            <button
              onClick={() => setShowForm((current) => !current)}
              className="mt-5 w-full rounded-[24px] bg-white/96 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
            >
              {showForm ? 'フォームを閉じる' : '+ メールを追加'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <article className="app-metric-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Today</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{todayCount}</p>
              <p className="mt-1 text-xs text-slate-500">今日受け取った連絡</p>
            </article>
            <article className="app-metric-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Read</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{emails.length - unreadCount}</p>
              <p className="mt-1 text-xs text-slate-500">既読になった件数</p>
            </article>
          </div>

          <div className="app-card rounded-[28px] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Flow</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">メールの整理方法</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="app-tint-panel app-tint-emerald rounded-[20px] p-3">届いたメールを企業名つきで記録</div>
              <div className="app-tint-panel app-tint-blue rounded-[20px] p-3">重要な本文は選択パネルで見返す</div>
              <div className="app-tint-panel app-tint-violet rounded-[20px] p-3">未読を潰して抜け漏れを防ぐ</div>
            </div>
          </div>

          <div className="space-y-3">
            {emails.length === 0 ? (
              <div className="app-card rounded-[30px] p-8 text-center text-sm text-slate-500">
                メールはまだ登録されていません。
              </div>
            ) : (
              emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => {
                    setSelectedId(email.id);
                    if (!email.isRead) {
                      handleMarkAsRead(email.id);
                    }
                  }}
                  className={`block w-full rounded-[24px] border p-4 text-left shadow-sm transition ${
                    selectedEmail?.id === email.id
                      ? 'border-emerald-200 bg-[linear-gradient(180deg,#f0fdf4_0%,#dcfce7_100%)]'
                      : 'app-soft-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{email.subject}</p>
                      <p className="mt-1 text-xs text-slate-500">{email.companyName}</p>
                    </div>
                    {!email.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{email.body}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="app-tint-panel app-tint-blue rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-sky-700/80">Selected</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{selectedEmail?.companyName || '未選択'}</p>
              <p className="mt-1 text-xs text-slate-500">企業単位でやり取りを追えます</p>
            </article>
            <article className="app-tint-panel app-tint-emerald rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80">Inbox health</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {unreadCount === 0 ? '見逃しなし' : `未読 ${unreadCount}件`}
              </p>
              <p className="mt-1 text-xs text-slate-500">気になる連絡をすぐ確認できます</p>
            </article>
          </div>

          {selectedEmail ? (
            <div className="app-card rounded-[32px] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedEmail.subject}</h2>
                  <p className="mt-2 text-sm text-slate-500">{selectedEmail.companyName}</p>
                </div>
                <button
                  onClick={() => handleDelete(selectedEmail.id)}
                  className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm"
                >
                  削除
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="app-tint-panel app-tint-blue rounded-[22px] p-4 text-sm text-slate-600">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Sender</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{selectedEmail.from}</p>
                </div>
                <div className="app-tint-panel app-tint-violet rounded-[22px] p-4 text-sm text-slate-600">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Received</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{formatDateTime(selectedEmail.date)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[26px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fffb_0%,#ecfdf5_100%)] p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                {selectedEmail.body}
              </div>
            </div>
          ) : (
            <div className="app-card rounded-[32px] p-8 text-center text-sm text-slate-500">
              表示するメールを選択してください。
            </div>
          )}
        </section>
      </main>

      <AppSheet
        open={showForm}
        title="メールを追加"
        description="企業とのやり取りを後から見返しやすいように記録します。"
        onClose={() => setShowForm(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">企業名</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(event) => setFormData({ ...formData, companyName: event.target.value })}
              className="app-input rounded-[24px] px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">送信者</label>
            <input
              type="email"
              value={formData.from}
              onChange={(event) => setFormData({ ...formData, from: event.target.value })}
              className="app-input rounded-[24px] px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">件名</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
              className="app-input rounded-[24px] px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">本文</label>
            <textarea
              value={formData.body}
              onChange={(event) => setFormData({ ...formData, body: event.target.value })}
              rows={6}
              className="app-input rounded-[24px] px-4 py-3"
              required
            />
          </div>

          <button className="app-primary-button w-full rounded-[24px] py-3 font-semibold">
            保存
          </button>
        </form>
      </AppSheet>
    </div>
  );
}
