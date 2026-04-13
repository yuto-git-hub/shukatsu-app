# 就活管理アプリ

就活の日程、メール、リマインダーなど、あらゆることを一括で管理できるNext.jsを使用したウェブアプリケーション。

## 機能

### 📅 スケジュール管理
- 面接、試験、説明会などの予定を管理
- 日付、時間、場所を記録
- ステータス管理（予定中、完了、キャンセル）

### 🏢 企業情報管理
- 応募企業の情報を一元管理
- 企業名、業界、担当者情報、連絡先を記録
- 企業ごとのメモ機能
- 企業ごとの詳細ページで進捗、予定、メール、タスクをまとめて確認

### 📆 カレンダー管理
- 月次カレンダーで予定を視覚的に確認
- Google Calendar 追加リンクを各予定に表示
- Appleカレンダー向けのICSファイルを書き出し可能

### 📧 メール管理
- 企業からのメールを記録・管理
- 既読/未読の管理
- メールの内容を保存

### 🔔 リマインダー
- タスク管理（優先度：高・中・低）
- 完了状態の管理
- 期日の設定

### 👤 プロフィール
- 基本情報（名前、メール、電話）
- 学情（大学、専攻、卒業年度）
- 自己紹介
- マイページとして応募プロフィールを一覧管理

### ⚙️ 設定
- データをJSONでエクスポート
- データの一括削除機能
- アプリ情報とプライバシーポリシー

### 📱 PWA対応
- ホーム画面に追加してアプリのように起動
- オフライン時のフォールバック画面を用意
- Service Worker による基本キャッシュ対応

### ☁️ クラウド同期
- Supabase ログインで端末間同期
- LocalStorage をキャッシュとして併用
- 既存ローカルデータを初回同期時にクラウドへ移行可能

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Hooks + LocalStorage
- **解析**: ESLint

## セットアップ

### 1. Node.jsのインストール

Macをお持ちの場合は、以下のコマンドでNode.jsをインストールしてください：

```bash
# Homebrewがある場合
brew install node

# またはNode.jsの公式サイトからダウンロード
# https://nodejs.org/
```

### 2. 依存関係のインストール

```bash
cd /Users/yu10/Desktop/就活app
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開くとアプリが起動します。

### 3.5 コマンドを打たずに開く方法

Macでは、プロジェクト直下の `start-job-app.command` をダブルクリックすると、依存関係の確認、開発サーバーの起動、ブラウザ表示まで自動で行えます。

- 初回のみ Node.js のインストールは必要です
- 停止したいときは `stop-job-app.command` をダブルクリックしてください

### 3.6 ホーム画面に追加する方法

- iPhone / iPad の Safari: 共有ボタン → `ホーム画面に追加`
- Chrome系ブラウザ: アドレスバー付近のインストール案内、または画面内の `ホーム画面に追加` 導線
- 追加後は通常のタブ表示ではなく、アプリのような見た目で起動できます

### 4. ビルド（本番環境用）

```bash
npm run build
npm start
```

## Supabase セットアップ

### 1. Supabaseプロジェクト作成

- `https://supabase.com/` で新しいプロジェクトを作成
- Project URL と anon key を控える

### 2. テーブル作成

- Supabase の SQL Editor に [supabase/schema.sql](/Users/yu10/Desktop/就活app/supabase/schema.sql) の内容を貼って実行

### 3. 環境変数を設定

- ローカルでは `.env.local` に以下を設定
- Vercel でも同じ値を Environment Variables に追加
- **`.env.local` は公開リポジトリにコミットしないでください**
- 公開用リポジトリには `.env.example` のみを残します

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-public-app-url
```

### 4. 同期を有効化

- アプリの `/auth` ページを開く
- メールリンクでログイン
- 既存のローカルデータを必要に応じて同期

### 5. ログインメールが届かない場合

- 迷惑メール、プロモーション、すべてのメールを確認
- 連続送信せず、最低60秒以上あけて再送
- Supabase標準メールは無料枠・レート制限が厳しいため、本格運用では Supabase Auth の `SMTP Settings` に Resend などの Custom SMTP を設定するのがおすすめ
- `Authentication` → `URL Configuration` で `Site URL` が公開URLになっているか確認
- `Redirect URLs` に `https://shukatsu-app-blush.vercel.app/**` が入っているか確認

### 6. Resend + Supabase SMTP に切り替える

Supabase標準メールで `email rate limit exceeded` が出る場合は、ResendをSupabase Authの送信元に設定すると安定しやすくなります。

#### Resend 側

1. `https://resend.com/` でアカウント作成
2. `Domains` → `Add Domain`
3. 自分のドメインを追加
   - 例: `mail.your-domain.com` や `your-domain.com`
   - 独自ドメインがない場合は、まずドメイン取得が必要
4. Resend が表示するDNSレコードを、ドメイン管理サービス側に追加
5. Resend のドメイン画面で `Verified` になるまで待つ
6. `API Keys` → `Create API Key`
7. API key をコピー

#### Supabase 側

1. Supabase Dashboard で対象プロジェクトを開く
2. `Authentication` → `Emails` または `Email` → `SMTP Settings`
3. SMTP を有効化
4. 以下を入力

```text
Host: smtp.resend.com
Port: 465
Username: resend
Password: Resendで作成したAPI key
Sender email: 認証済みドメインのメールアドレス
Sender name: Job Hunt Hub
```

例:

```text
Sender email: no-reply@your-domain.com
Sender name: Job Hunt Hub
```

5. 保存
6. アプリの `/auth` からログインメールを1回だけ送って確認

注意:

- `Sender email` は Resend で認証済みのドメインを使う
- Gmail など任意のメールアドレスを送信元にするのは避ける
- Supabase標準メールの制限回避には、アプリ側の変更ではなく SMTP 設定が本命

## プロジェクト構造

```
就活app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # ダッシュボード
│   │   ├── schedules/       # スケジュール管理
│   │   ├── companies/       # 企業情報管理
│   │   ├── emails/          # メール管理
│   │   ├── reminders/       # リマインダー
│   │   ├── profile/         # プロフィール
│   │   ├── settings/        # 設定
│   │   └── layout.tsx       # レイアウト
│   ├── components/
│   │   ├── Navigation/      # ナビゲーション
│   │   └── Forms/           # フォームコンポーネント
│   ├── lib/
│   │   ├── storage.ts       # LocalStorageユーティリティ
│   │   └── utils.ts         # ユーティリティ関数
│   └── types/
│       └── index.ts         # TypeScript型定義
├── public/                  # 静的ファイル
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── .gitignore
```

## データストレージ

このアプリはブラウザの**LocalStorage**を使用してデータを保存します。

### 特徴
- ✅ インターネット接続不要
- ✅ サーバーにデータを送信しない
- ✅ プライバシー保護
- ⚠️ デバイス固有（ブラウザをクリアするとデータが削除される）

### バックアップ
設定ページから定期的にデータをエクスポートして、JSONファイルとして保存することをお勧めします。

## 主な開発予定

- [ ] Firebase統合（クラウドバックアップ）
- [ ] ダークモード
- [ ] 通知機能
- [ ] メール連携（Gmail API等）
- [ ] カレンダービュー
- [ ] 統計・分析機能
- [ ] PWA化（オフライン対応）
- [ ] モバイルアプリ化

## トラブルシューティング

### **ポートが既に使用されている場合**
```bash
npm run dev -- -p 3001
```

### **Tailwind CSSが反映されない場合**
```bash
rm -rf .next
npm run dev
```

### **データが見つからない場合**
- ブラウザの開発者ツール → Application → LocalStorage を確認
- キャッシュをクリアしてリロード

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

問題が発生した場合は、設定ページからデータをバックアップしてから、アプリを再インストールしてください。

---

**就活がんばって！💪**
