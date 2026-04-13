'use client';

import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation/Header';
import AppSheet from '@/components/UI/AppSheet';
import { Reminder } from '@/types';
import { KEYS, storage } from '@/lib/storage';
import { formatDate, generateId, priorityLabel } from '@/lib/utils';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    priority: Reminder['priority'];
  }>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
  });

  useEffect(() => {
    setReminders(storage.get(KEYS.REMINDERS) || []);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newReminder: Reminder = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
      dueTime: formData.dueTime,
      completed: false,
      priority: formData.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = [newReminder, ...reminders];
    setReminders(updated);
    storage.set(KEYS.REMINDERS, updated);
    setShowForm(false);
    setFormData({ title: '', description: '', dueDate: '', dueTime: '', priority: 'medium' });
  };

  const handleToggleComplete = (id: string) => {
    const updated = reminders.map((reminder) =>
      reminder.id === id
        ? { ...reminder, completed: !reminder.completed, updatedAt: new Date() }
        : reminder
    );
    setReminders(updated);
    storage.set(KEYS.REMINDERS, updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((reminder) => reminder.id !== id);
    setReminders(updated);
    storage.set(KEYS.REMINDERS, updated);
  };

  const activeReminders = reminders.filter((reminder) => !reminder.completed);
  const completedReminders = reminders.filter((reminder) => reminder.completed);
  const highPriorityCount = activeReminders.filter((reminder) => reminder.priority === 'high').length;

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto grid max-w-6xl gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5 xl:grid-cols-[320px,1fr]">
        <section className="space-y-4">
          <div className="rounded-[32px] bg-[linear-gradient(140deg,#7c2d12_0%,#ea580c_34%,#f59e0b_68%,#fde68a_100%)] p-5 text-white shadow-[0_24px_70px_rgba(234,88,12,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100/90">Task focus</p>
                <p className="mt-3 text-2xl font-semibold">未完了 {activeReminders.length}件</p>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">Done</p>
                <p className="mt-1 text-2xl font-semibold">{completedReminders.length}</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/85">
              ES提出、返信、準備タスクを優先度つきで並べて管理できます。
            </p>
            <button
              onClick={() => setShowForm((current) => !current)}
              className="mt-5 w-full rounded-[24px] bg-white/96 px-4 py-3 text-sm font-semibold text-amber-800 shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
            >
              {showForm ? 'フォームを閉じる' : '+ リマインダーを追加'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <article className="app-metric-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Urgent</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{highPriorityCount}</p>
              <p className="mt-1 text-xs text-slate-500">優先度高のタスク</p>
            </article>
            <article className="app-metric-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Done rate</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {reminders.length === 0 ? '0%' : `${Math.round((completedReminders.length / reminders.length) * 100)}%`}
              </p>
              <p className="mt-1 text-xs text-slate-500">完了した割合</p>
            </article>
          </div>

          <div className="app-card rounded-[28px] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Priority guide</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">優先度の目安</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="app-tint-panel app-tint-amber rounded-[20px] p-3">高: 締切直前、返信必須、面接準備</div>
              <div className="app-tint-panel app-tint-blue rounded-[20px] p-3">中: 今週やるES、確認したい連絡</div>
              <div className="app-tint-panel app-tint-emerald rounded-[20px] p-3">低: 後で整理するメモや補助タスク</div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {activeReminders.length > 0 && (
            <div className="app-card rounded-[30px] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">未完了</h2>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {activeReminders.length}件
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {activeReminders
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((reminder) => (
                    <article
                      key={reminder.id}
                      onClick={() => setSelectedReminder(reminder)}
                      className="cursor-pointer rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)] p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{reminder.title}</p>
                          <p className="mt-2 text-xs text-slate-500">{formatDate(reminder.dueDate)} {reminder.dueTime || ''}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reminder.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : reminder.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {priorityLabel(reminder.priority)}
                        </span>
                      </div>

                      {reminder.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{reminder.description}</p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleComplete(reminder.id);
                          }}
                          className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm"
                        >
                          完了
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(reminder.id);
                          }}
                          className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm"
                        >
                          削除
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}

          <div className="app-card rounded-[30px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">完了済み</h2>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {completedReminders.length}件
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {completedReminders.length > 0 ? completedReminders.map((reminder) => (
                <article
                  key={reminder.id}
                  onClick={() => setSelectedReminder(reminder)}
                  className="cursor-pointer rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 text-slate-500 shadow-sm"
                >
                  <p className="text-sm font-semibold line-through">{reminder.title}</p>
                  <p className="mt-2 text-xs">{formatDate(reminder.dueDate)}</p>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleComplete(reminder.id);
                    }}
                    className="mt-4 rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm"
                  >
                    未完了に戻す
                  </button>
                </article>
              )) : (
                <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-6 text-sm text-slate-500 shadow-sm">
                  まだ完了したタスクはありません。
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <AppSheet
        open={showForm}
        title="リマインダーを追加"
        description="締切や準備タスクを、アプリの下部シートから素早く登録できます。"
        onClose={() => setShowForm(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">タイトル</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              className="app-input rounded-[24px] px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">説明</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={4}
              className="app-input rounded-[24px] px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">日付</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
                className="app-input rounded-[24px] px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">時間</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(event) => setFormData({ ...formData, dueTime: event.target.value })}
                className="app-input rounded-[24px] px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">優先度</label>
            <select
              value={formData.priority}
              onChange={(event) => setFormData({ ...formData, priority: event.target.value as 'low' | 'medium' | 'high' })}
              className="app-input rounded-[24px] px-4 py-3"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <button className="app-primary-button w-full rounded-[24px] py-3 font-semibold">
            保存
          </button>
        </form>
      </AppSheet>

      <AppSheet
        open={Boolean(selectedReminder)}
        title={selectedReminder?.title || 'リマインダー詳細'}
        description="期限や内容を詳細で確認できます。"
        onClose={() => setSelectedReminder(null)}
      >
        {selectedReminder && (
          <div className="space-y-4">
            <div className="app-card rounded-[26px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Due</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatDate(selectedReminder.dueDate)} {selectedReminder.dueTime || ''}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedReminder.priority === 'high'
                    ? 'bg-rose-100 text-rose-700'
                    : selectedReminder.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {priorityLabel(selectedReminder.priority)}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {selectedReminder.description || 'このリマインダーには詳細メモがありません。'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleToggleComplete(selectedReminder.id);
                  setSelectedReminder(null);
                }}
                className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm"
              >
                {selectedReminder.completed ? '未完了に戻す' : '完了にする'}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedReminder.id);
                  setSelectedReminder(null);
                }}
                className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm"
              >
                削除
              </button>
            </div>
          </div>
        )}
      </AppSheet>
    </div>
  );
}
