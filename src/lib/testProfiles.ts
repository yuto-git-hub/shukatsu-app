export type TestType = 'SPI' | 'TG-WEB' | 'GAB' | 'CAB' | '玉手箱' | 'その他';

export interface CompanyTestProfile {
  type: TestType;
  label: string;
  note: string;
  sourceLabel: string;
  sourceUrl: string;
}

const companyTestProfiles: { match: RegExp; profile: CompanyTestProfile }[] = [
  {
    match: /(日本TCS|タタ・コンサルタンシー|TCS)/i,
    profile: {
      type: 'TG-WEB',
      label: 'TG-WEB',
      note: 'ソリューションエンジニア系の体験談では TG-WEB の報告が中心です。',
      sourceLabel: 'ワンキャリア 日本TCS',
      sourceUrl: 'https://www.onecareer.jp/companies/555/experiences/2026/2182/1074258',
    },
  },
  {
    match: /(サイボウズ)/i,
    profile: {
      type: 'SPI',
      label: 'SPI',
      note: '体験談では SPI 形式の報告がまとまって見られます。',
      sourceLabel: 'ワンキャリア サイボウズ',
      sourceUrl: 'https://www.onecareer.jp/experiences/companies/651/middle_categories/test',
    },
  },
  {
    match: /(伊藤忠テクノソリューションズ|CTC)(?!テクノロジー)/i,
    profile: {
      type: 'SPI',
      label: 'SPI',
      note: 'CTC 本体の体験談では SPI の報告が多めです。',
      sourceLabel: 'ワンキャリア 伊藤忠テクノソリューションズ',
      sourceUrl: 'https://www.onecareer.jp/companies/400/experiences/2026/172916/1087363',
    },
  },
  {
    match: /(NEC|日本電気)/i,
    profile: {
      type: 'SPI',
      label: 'SPI',
      note: 'NEC の体験談では SPI 形式が中心です。',
      sourceLabel: 'ワンキャリア NEC',
      sourceUrl: 'https://www.onecareer.jp/experiences/companies/139/middle_categories/test',
    },
  },
  {
    match: /(日立ソリューションズ)/i,
    profile: {
      type: 'SPI',
      label: 'SPI',
      note: 'SE 職系の体験談では SPI / テストセンター相当の報告が多いです。',
      sourceLabel: 'ワンキャリア 日立ソリューションズ',
      sourceUrl: 'https://www.onecareer.jp/companies/403/experiences/2026/1799/1131545',
    },
  },
  {
    match: /(デロイト|Deloitte)/i,
    profile: {
      type: 'TG-WEB',
      label: 'TG-WEB',
      note: 'デロイト トーマツ コンサルティングでは TG-WEB の報告があります。',
      sourceLabel: 'ワンキャリア デロイト トーマツ',
      sourceUrl: 'https://www.onecareer.jp/companies/5/experiences/2027/8/1248809',
    },
  },
  {
    match: /(KDDI)/i,
    profile: {
      type: '玉手箱',
      label: '玉手箱',
      note: '技術系・業務系で玉手箱の報告が多く、一部 SPI の体験談もあります。',
      sourceLabel: 'ワンキャリア KDDI',
      sourceUrl: 'https://www.onecareer.jp/companies/72/experiences/2026/164518/1155784',
    },
  },
  {
    match: /(日本IBM|IBM)(?!デジタルサービス)/i,
    profile: {
      type: '玉手箱',
      label: '玉手箱',
      note: '日本IBM は玉手箱の報告が多く、職種によってテストセンターの体験談もあります。',
      sourceLabel: 'ワンキャリア 日本IBM',
      sourceUrl: 'https://www.onecareer.jp/companies/20/experiences/2026/61/1152185',
    },
  },
  {
    match: /(Sky|Ｓｋｙ)/i,
    profile: {
      type: 'その他',
      label: '企業オリジナル / SPI系',
      note: 'Sky は SPI・玉手箱・企業オリジナルの報告が混在しているため、職種別確認がおすすめです。',
      sourceLabel: 'ワンキャリア Sky',
      sourceUrl: 'https://www.onecareer.jp/experiences/companies/3918/middle_categories/test',
    },
  },
];

export function inferCompanyTestProfile(companyName: string): CompanyTestProfile | null {
  const trimmedName = companyName.trim();
  if (!trimmedName) {
    return null;
  }

  const matched = companyTestProfiles.find(({ match }) => match.test(trimmedName));
  return matched?.profile ?? null;
}

export function resolveCompanyTestProfile(companyName: string, manualType?: string): CompanyTestProfile | null {
  if (manualType) {
    return {
      type: manualType as TestType,
      label: manualType,
      note: '企業情報で手動設定した受験形式です。',
      sourceLabel: '手動設定',
      sourceUrl: '',
    };
  }

  return inferCompanyTestProfile(companyName);
}
