'use client';

import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation/Header';
import { UserProfile } from '@/types';
import { KEYS, storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    graduationYear: '',
    bio: '',
  });

  useEffect(() => {
    const saved = storage.get(KEYS.PROFILE);
    if (!saved) {
      return;
    }

    setProfile(saved);
    setFormData({
      name: saved.name || '',
      email: saved.email || '',
      phone: saved.phone || '',
      university: saved.university || '',
      major: saved.major || '',
      graduationYear: saved.graduationYear?.toString() || '',
      bio: saved.bio || '',
    });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newProfile: UserProfile = {
      id: profile?.id || generateId(),
      ...formData,
      graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : undefined,
      createdAt: profile?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    setProfile(newProfile);
    storage.set(KEYS.PROFILE, newProfile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-5">
        <section className="rounded-[34px] bg-[linear-gradient(140deg,#111827_0%,#312e81_34%,#2563eb_72%,#93c5fd_100%)] p-6 text-white shadow-[0_24px_80px_rgba(37,99,235,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/90">My profile</p>
          <h2 className="mt-2 text-3xl font-semibold">{profile?.name || 'プロフィールを設定'}</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">
            履歴書や応募フォームで使う基本情報をここにまとめておけます。
          </p>
          <button
            onClick={() => setIsEditing((current) => !current)}
            className="mt-5 rounded-[24px] bg-white/96 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
          >
            {isEditing ? '編集を閉じる' : profile ? 'プロフィールを編集' : 'プロフィールを入力'}
          </button>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="app-metric-card rounded-[26px] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Contact</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.email || '未設定'}</p>
            <p className="mt-1 text-xs text-slate-500">応募フォームで使う連絡先</p>
          </article>
          <article className="app-metric-card rounded-[26px] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">School</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.university || '未設定'}</p>
            <p className="mt-1 text-xs text-slate-500">学歴・所属の確認用</p>
          </article>
          <article className="app-metric-card rounded-[26px] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Grad year</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.graduationYear || '未設定'}</p>
            <p className="mt-1 text-xs text-slate-500">卒業予定年度</p>
          </article>
        </section>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="app-card mt-5 space-y-4 rounded-[30px] p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">名前</label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">メール</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">電話</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">大学</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(event) => setFormData({ ...formData, university: event.target.value })}
                  className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">専攻</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(event) => setFormData({ ...formData, major: event.target.value })}
                  className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">卒業年度</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(event) => setFormData({ ...formData, graduationYear: event.target.value })}
                className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">自己紹介</label>
              <textarea
                value={formData.bio}
                onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                rows={5}
                className="w-full rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-[24px] bg-[linear-gradient(135deg,#111827_0%,#2563eb_100%)] py-3 font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.18)]">保存</button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-[24px] bg-slate-200 py-3 font-semibold text-slate-700"
              >
                キャンセル
              </button>
            </div>
          </form>
        ) : (
          <section className="app-card mt-5 rounded-[30px] p-5">
            {profile ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-500">名前</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{profile.name}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="app-tint-panel app-tint-blue rounded-[24px] p-4">
                    <p className="text-xs text-slate-500">メール</p>
                    <p className="mt-2 text-sm text-slate-800">{profile.email}</p>
                  </div>
                  <div className="app-tint-panel app-tint-violet rounded-[24px] p-4">
                    <p className="text-xs text-slate-500">電話</p>
                    <p className="mt-2 text-sm text-slate-800">{profile.phone || '未設定'}</p>
                  </div>
                  <div className="app-tint-panel app-tint-emerald rounded-[24px] p-4">
                    <p className="text-xs text-slate-500">大学</p>
                    <p className="mt-2 text-sm text-slate-800">{profile.university || '未設定'}</p>
                  </div>
                  <div className="app-tint-panel app-tint-amber rounded-[24px] p-4">
                    <p className="text-xs text-slate-500">専攻 / 卒業年度</p>
                    <p className="mt-2 text-sm text-slate-800">
                      {profile.major || '未設定'} {profile.graduationYear ? `/ ${profile.graduationYear}年` : ''}
                    </p>
                  </div>
                </div>

                <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-5 shadow-sm">
                  <p className="text-xs text-slate-500">自己紹介</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {profile.bio || 'まだ自己紹介は入力されていません。'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                まだプロフィールが入力されていません。
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
