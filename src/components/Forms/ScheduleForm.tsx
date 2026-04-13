'use client';

import React, { useState } from 'react';
import { Schedule } from '@/types';
interface ScheduleFormProps {
  onSubmit: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Schedule;
  companies: { id: string; name: string }[];
}

export default function ScheduleForm({ onSubmit, initialData, companies }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    companyId: initialData?.companyId || '',
    companyName: initialData?.companyName || '',
    type: initialData?.type || 'interview' as const,
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    time: initialData?.time || '',
    endTime: initialData?.endTime || '',
    location: initialData?.location || '',
    details: initialData?.details || '',
    status: initialData?.status || 'scheduled' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: new Date(formData.date),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="app-card space-y-4 rounded-[30px] p-5">
      <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(14,165,233,0.12)_0%,rgba(99,102,241,0.12)_100%)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Schedule editor</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">
          {initialData ? '予定を編集' : '予定を追加'}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          面接、説明会、テストをアプリ感のあるフォームでまとめて登録できます。
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">企業名</label>
        <select
          value={formData.companyId}
          onChange={(e) => {
            const company = companies.find(c => c.id === e.target.value);
            setFormData({
              ...formData,
              companyId: e.target.value,
              companyName: company?.name || '',
            });
          }}
          className="app-input rounded-[22px] px-4 py-3"
          required
        >
          <option value="">選択してください</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">予定の種類</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="app-input rounded-[22px] px-4 py-3"
          >
            <option value="interview">面接</option>
            <option value="test">テスト</option>
            <option value="explanation">説明会</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">ステータス</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="app-input rounded-[22px] px-4 py-3"
          >
            <option value="scheduled">予定中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">日付</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="app-input rounded-[22px] px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">開始時間</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="app-input rounded-[22px] px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">終了時間</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="app-input rounded-[22px] px-4 py-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">場所</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="オンライン / 東京都渋谷区 など"
          className="app-input rounded-[22px] px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">詳細</label>
        <textarea
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          placeholder="メモや詳細情報"
          rows={3}
          className="app-input rounded-[22px] px-4 py-3"
        />
      </div>

      <button
        type="submit"
        className="app-primary-button w-full rounded-[22px] py-3 font-semibold transition hover:translate-y-[-1px]"
      >
        {initialData ? '更新' : '追加'}
      </button>
    </form>
  );
}
