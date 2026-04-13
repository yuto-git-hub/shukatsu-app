'use client';

import React, { useState } from 'react';
import { Company } from '@/types';

interface CompanyFormProps {
  onSubmit: (
    company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
    changedFields: (keyof Omit<Company, 'id' | 'createdAt' | 'updatedAt'>)[]
  ) => Promise<void>;
  initialData?: Company;
}

export default function CompanyForm({ onSubmit, initialData }: CompanyFormProps) {
  const legacyMyPageFallback = Boolean(initialData?.website && !initialData?.myPageUrl);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    industry: initialData?.industry || '',
    testType: initialData?.testType || '',
    desiredJobType: initialData?.desiredJobType || '',
    salaryInfo: initialData?.salaryInfo || '',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    myPageUrl: initialData?.myPageUrl || initialData?.website || '',
    website: initialData?.myPageUrl ? initialData.website || '' : '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) {
      return;
    }

    const initialValues = {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      testType: initialData?.testType || '',
      desiredJobType: initialData?.desiredJobType || '',
      salaryInfo: initialData?.salaryInfo || '',
      contactPerson: initialData?.contactPerson || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      myPageUrl: initialData?.myPageUrl || initialData?.website || '',
      website: initialData?.myPageUrl ? initialData.website || '' : '',
      notes: initialData?.notes || '',
    };

    const changedFields = Object.keys(formData).filter((key) => {
      const typedKey = key as keyof typeof formData;
      return formData[typedKey] !== initialValues[typedKey];
    }) as (keyof Omit<Company, 'id' | 'createdAt' | 'updatedAt'>)[];

    if (legacyMyPageFallback) {
      if (!changedFields.includes('myPageUrl')) {
        changedFields.push('myPageUrl');
      }
      if (!changedFields.includes('website')) {
        changedFields.push('website');
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(formData, changedFields);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">企業名</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">業界</label>
        <input
          type="text"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="IT / 金融 / 製造 など"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">受験形式</label>
        <select
          value={formData.testType}
          onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="">自動推定にまかせる</option>
          <option value="SPI">SPI</option>
          <option value="TG-WEB">TG-WEB</option>
          <option value="GAB">GAB</option>
          <option value="CAB">CAB</option>
          <option value="玉手箱">玉手箱</option>
          <option value="その他">その他</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">希望職種</label>
          <input
            type="text"
            value={formData.desiredJobType}
            onChange={(e) => setFormData({ ...formData, desiredJobType: e.target.value })}
            placeholder="開発職 / コンサル / 営業 など"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">初任給 / 平均年収</label>
          <input
            type="text"
            value={formData.salaryInfo}
            onChange={(e) => setFormData({ ...formData, salaryInfo: e.target.value })}
            placeholder="月給28万円 / 平均年収620万円"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">担当者名</label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">電話</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">企業メールアドレス</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="recruit@example.co.jp"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">企業マイページ</label>
          <input
            type="url"
            value={formData.myPageUrl}
            onChange={(e) => setFormData({ ...formData, myPageUrl: e.target.value })}
            placeholder="https://mypage.example.com"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">企業ホームページURL</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://example.com"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">メモ</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="企業についてのメモ"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? '保存中...' : initialData ? '更新' : '追加'}
      </button>
    </form>
  );
}
