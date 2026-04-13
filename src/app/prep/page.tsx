'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation/Header';
import { KEYS, storage } from '@/lib/storage';
import { Company, PrepHubData } from '@/types';
import { loadCompaniesSnapshot } from '@/lib/companyStore';
import { CompanyTestProfile, resolveCompanyTestProfile } from '@/lib/testProfiles';

const defaultPrepData: PrepHubData = {
  esCore: '',
  esEpisode: '',
  esSelfPR: '',
  esQuestions: '',
  webTestType: 'SPI',
  webTestPlan: '',
  webTestWeakness: '',
  webTestMemo: '',
  selfValues: '',
  selfStrengths: '',
  selfWorkStyle: '',
  selfAvoid: '',
  updatedAt: '',
};

function completionCount(values: string[]) {
  return values.filter((value) => value.trim().length > 0).length;
}

type WebTestResource = {
  title: string;
  description: string;
  href: string;
  badge: string;
};

const webTestResources: Record<string, WebTestResource[]> = {
  SPI: [
    {
      title: 'マイナビ2027 適性検査対策WEBテスト',
      description: '無料模試と10問単位の練習問題。まず手を動かして慣れたいときに向いています。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/index_v.html',
      badge: '無料模試',
    },
    {
      title: 'キャリタス就活 SPI対策',
      description: 'SPIの概要、能力検査の例題、対策の考え方をまとめて確認できます。',
      href: 'https://job.career-tasu.jp/guide/step/068/',
      badge: '例題',
    },
    {
      title: 'マイナビ 実力アップ講座',
      description: '言語・非言語を分けてスキマ時間に回しやすい練習ページです。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/use_02.html',
      badge: '練習',
    },
  ],
  'TG-WEB': [
    {
      title: 'マイナビ2027 適性検査対策WEBテスト',
      description: '言語・非言語の基礎体力を上げる共通練習として使いやすい無料模試です。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/index_v.html',
      badge: '無料模試',
    },
    {
      title: 'unistyle TG-WEB対策完全版',
      description: 'TG-WEBの形式、問題例、従来型/新型の違いまで整理して確認できます。',
      href: 'https://unistyleinc.com/techniques/963',
      badge: '形式解説',
    },
    {
      title: 'unistyle TG-WEB問題集',
      description: '言語・計数の例題を見ながら、独特な問題形式に慣れるのに便利です。',
      href: 'https://unistyleinc.com/techniques/1103',
      badge: '例題',
    },
  ],
  GAB: [
    {
      title: 'マイナビ2027 適性検査対策WEBテスト',
      description: 'GABの土台になる言語・非言語のスピード練習を無料で回せます。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/index_v.html',
      badge: '無料模試',
    },
    {
      title: 'unistyle GAB/C-GAB/Web-GAB解説',
      description: 'GAB系の受験方式の違いと、商社・金融での対策ポイントがまとまっています。',
      href: 'https://unistyleinc.com/techniques/926',
      badge: '形式解説',
    },
    {
      title: 'ワンキャリア GAB対策',
      description: '言語・計数の問題例を確認しながら、本番の時間感覚をイメージできます。',
      href: 'https://www.onecareer.jp/articles/3506',
      badge: '例題',
    },
  ],
  CAB: [
    {
      title: 'マイナビ2027 適性検査対策WEBテスト',
      description: '非言語の基礎スピードを作る共通練習として最初に触りやすいです。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/index_v.html',
      badge: '無料模試',
    },
    {
      title: 'unistyle CAB対策',
      description: '暗号・法則性などCAB特有の分野を理解したいときに向いています。',
      href: 'https://unistyleinc.com/techniques/1476',
      badge: '形式解説',
    },
    {
      title: 'ワンキャリア Web-CAB対策',
      description: 'Web-CABの問題例と解法の流れをまとめて確認できます。',
      href: 'https://www.onecareer.jp/articles/819',
      badge: '例題',
    },
  ],
  玉手箱: [
    {
      title: 'マイナビ2027 適性検査対策WEBテスト',
      description: '玉手箱の基礎になる言語・非言語の練習を無料で回せます。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/index_v.html',
      badge: '無料模試',
    },
    {
      title: 'unistyle 玉手箱完全対策',
      description: '言語・計数・英語の問題例がまとまっていて、形式理解に向いています。',
      href: 'https://unistyleinc.com/techniques/962',
      badge: '例題',
    },
    {
      title: 'unistyle 玉手箱の対策本まとめ',
      description: '追加でどの問題集を使うか迷ったときの参考になります。',
      href: 'https://unistyleinc.com/techniques/1731',
      badge: '参考書',
    },
  ],
  その他: [
    {
      title: 'マイナビ2027 適性検査対策WEBテスト',
      description: '形式がまだ分からない段階でも、言語・非言語の基礎固めに使えます。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/index_v.html',
      badge: '無料模試',
    },
    {
      title: 'unistyle Webテスト17種類まとめ',
      description: 'どの形式か切り分けたいときに、種類と特徴を一覧で確認できます。',
      href: 'https://unistyleinc.com/techniques/771',
      badge: '形式一覧',
    },
    {
      title: 'マイナビ 適性検査とは？',
      description: 'まず全体像から押さえたいときの入門ページです。',
      href: 'https://job.mynavi.jp/conts/2027/moshi/use_01.html',
      badge: '入門',
    },
  ],
};

export default function PrepPage() {
  const [prep, setPrep] = useState<PrepHubData>(defaultPrepData);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [linkedCompanyName, setLinkedCompanyName] = useState('');

  useEffect(() => {
    const saved = storage.get(KEYS.PREP_HUB);
    if (saved) {
      setPrep({ ...defaultPrepData, ...saved });
    }

    void loadCompaniesSnapshot().then((snapshot) => {
      setCompanies(snapshot);
    });
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const companyName = params.get('company') || '';
      const selectedType = params.get('type');

      setLinkedCompanyName(companyName);

      if (selectedType && selectedType !== (saved?.webTestType || defaultPrepData.webTestType)) {
        setPrep((current) => {
          const next = {
            ...current,
            webTestType: selectedType,
            updatedAt: new Date().toISOString(),
          };
          storage.set(KEYS.PREP_HUB, next);
          return next;
        });
      }

      if (companyName || selectedType) {
        window.history.replaceState({}, '', '/prep');
      }
    }
  }, []);

  const updatePrep = (patch: Partial<PrepHubData>) => {
    const next = {
      ...prep,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    setPrep(next);
    storage.set(KEYS.PREP_HUB, next);
  };

  const esScore = useMemo(
    () => completionCount([prep.esCore, prep.esEpisode, prep.esSelfPR, prep.esQuestions]),
    [prep]
  );
  const testScore = useMemo(
    () => completionCount([prep.webTestType, prep.webTestPlan, prep.webTestWeakness, prep.webTestMemo]),
    [prep]
  );
  const selfScore = useMemo(
    () => completionCount([prep.selfValues, prep.selfStrengths, prep.selfWorkStyle, prep.selfAvoid]),
    [prep]
  );
  const selectedWebTestResources = useMemo(
    () => webTestResources[prep.webTestType] ?? webTestResources['その他'],
    [prep.webTestType]
  );
  const companyProfiles = useMemo(
    () =>
      companies
        .map((company) => ({
          company,
          profile: resolveCompanyTestProfile(company.name, company.testType),
        }))
        .filter((item): item is { company: Company; profile: CompanyTestProfile } => Boolean(item.profile)),
    [companies]
  );

  return (
    <div className="min-h-screen pb-28">
      <Navigation />

      <main className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-4 sm:py-5">
        <section className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
          <article className="rounded-[32px] bg-[linear-gradient(145deg,#111827_0%,#1d4ed8_35%,#7c3aed_70%,#f472b6_100%)] p-6 text-white shadow-[0_24px_80px_rgba(79,70,229,0.26)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">Career Lab</p>
            <h2 className="mt-3 text-3xl font-semibold">ES・Webテスト・自己分析</h2>
            <p className="mt-3 text-sm leading-7 text-white/80">
              応募前の準備を1つのタブにまとめて、書く・振り返る・整えるを同じ流れで進められるハブです。
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/80">
              <span className="rounded-full bg-white/12 px-3 py-1">ESの軸を固める</span>
              <span className="rounded-full bg-white/12 px-3 py-1">テスト対策を残す</span>
              <span className="rounded-full bg-white/12 px-3 py-1">自己分析を言語化する</span>
            </div>
          </article>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ES', value: `${esScore}/4`, tone: 'app-tint-violet' },
              { label: 'Test', value: `${testScore}/4`, tone: 'app-tint-blue' },
              { label: 'Self', value: `${selfScore}/4`, tone: 'app-tint-emerald' },
            ].map((card) => (
              <article key={card.label} className={`app-tint-panel ${card.tone} rounded-[26px] p-4`}>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{card.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <article className="app-card rounded-[30px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-violet-500">ES Studio</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">ESの芯</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">コピペ前提ではなく、どの企業にも使い回せる核をまとめる場所です。</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">志望動機の核</label>
                <textarea
                  value={prep.esCore}
                  onChange={(event) => updatePrep({ esCore: event.target.value })}
                  rows={4}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="なぜこの業界・職種を志望するのか"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">ガクチカ / 代表エピソード</label>
                <textarea
                  value={prep.esEpisode}
                  onChange={(event) => updatePrep({ esEpisode: event.target.value })}
                  rows={4}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="成果、工夫、学びを短く言語化"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">自己PR</label>
                <textarea
                  value={prep.esSelfPR}
                  onChange={(event) => updatePrep({ esSelfPR: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="強みと再現性をまとめる"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">逆質問ストック</label>
                <textarea
                  value={prep.esQuestions}
                  onChange={(event) => updatePrep({ esQuestions: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="面接の最後に聞きたい質問"
                />
              </div>
            </div>
          </article>

          <article className="app-card rounded-[30px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-500">Web Test</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">テスト攻略</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">受験形式ごとの対策と、苦手分野を残しておくエリアです。</p>
            <div className="mt-5 space-y-4">
              {companyProfiles.length > 0 && (
                <div className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-600">Company Link</p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-950">企業ごとの推定受験形式</h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      タップで対策を切替
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {companyProfiles.map(({ company, profile }) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => updatePrep({ webTestType: profile.type })}
                        className={`rounded-full border px-3 py-2 text-left text-xs font-semibold transition sm:text-sm ${
                          prep.webTestType === profile.type && linkedCompanyName === company.name
                            ? 'border-fuchsia-200 bg-white text-fuchsia-700 shadow-sm'
                            : 'border-white bg-white/80 text-slate-700'
                        }`}
                      >
                        {company.name} → {profile.label}
                      </button>
                    ))}
                  </div>
                  {linkedCompanyName && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      企業タブから <span className="font-semibold text-slate-700">{linkedCompanyName}</span> の推定形式を引き継いでいます。
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">受験形式</label>
                <select
                  value={prep.webTestType}
                  onChange={(event) => updatePrep({ webTestType: event.target.value })}
                  className="app-input rounded-[24px] px-4 py-3"
                >
                  <option value="SPI">SPI</option>
                  <option value="TG-WEB">TG-WEB</option>
                  <option value="GAB">GAB</option>
                  <option value="CAB">CAB</option>
                  <option value="玉手箱">玉手箱</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">学習計画</label>
                <textarea
                  value={prep.webTestPlan}
                  onChange={(event) => updatePrep({ webTestPlan: event.target.value })}
                  rows={4}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="何日までにどこまで進めるか"
                />
              </div>
              <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Practice Links</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-950">{prep.webTestType}向けの練習先</h4>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    クリックで外部サイトへ
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {selectedWebTestResources.map((resource) => (
                    <a
                      key={resource.href}
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-[22px] border border-sky-100 bg-white/90 px-4 py-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_16px_40px_rgba(14,165,233,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-950 group-hover:text-sky-700">{resource.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{resource.description}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
                          {resource.badge}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
                {(() => {
                  const activeProfile = companyProfiles.find(({ company }) => company.name === linkedCompanyName)?.profile;
                  if (!activeProfile) {
                    return null;
                  }

                  return (
                    <div className="mt-4 rounded-[20px] border border-white bg-white/90 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-600">Selected Company</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{linkedCompanyName}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{activeProfile.note}</p>
                      <a
                        href={activeProfile.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-medium text-fuchsia-600"
                      >
                        根拠を見る: {activeProfile.sourceLabel}
                      </a>
                    </div>
                  );
                })()}
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  無料で触りやすい練習先を中心に並べています。会員登録が必要なページを含む場合があります。
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">苦手分野</label>
                <textarea
                  value={prep.webTestWeakness}
                  onChange={(event) => updatePrep({ webTestWeakness: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="非言語 / 長文 / 法則性など"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">メモ</label>
                <textarea
                  value={prep.webTestMemo}
                  onChange={(event) => updatePrep({ webTestMemo: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="本番前の注意点や解き方"
                />
              </div>
            </div>
          </article>

          <article className="app-card rounded-[30px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-500">Self Insight</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">自己分析マップ</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">自分の価値観と働き方の軸を、面接で言いやすい言葉に整えます。</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">大事にしたい価値観</label>
                <textarea
                  value={prep.selfValues}
                  onChange={(event) => updatePrep({ selfValues: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="成長 / 裁量 / 安定 / 社会貢献 など"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">自分の強み</label>
                <textarea
                  value={prep.selfStrengths}
                  onChange={(event) => updatePrep({ selfStrengths: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="行動特性や周囲から言われること"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">向いている働き方</label>
                <textarea
                  value={prep.selfWorkStyle}
                  onChange={(event) => updatePrep({ selfWorkStyle: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="チームで進めたい / 裁量が欲しい など"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">避けたい条件</label>
                <textarea
                  value={prep.selfAvoid}
                  onChange={(event) => updatePrep({ selfAvoid: event.target.value })}
                  rows={3}
                  className="app-input rounded-[24px] px-4 py-3"
                  placeholder="働き方・環境で避けたいもの"
                />
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
