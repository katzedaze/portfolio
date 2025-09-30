# Portfolio Management System

フルスタックのポートフォリオ管理システム。職務経歴、スキル、プロジェクト、自己PRを管理し、公開用のポートフォリオページを生成します。

## 技術スタック

- **Frontend**: Next.js 15.5.4 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth 1.3.23
- **UI**: Shadcn/ui (Tailwind CSS)
- **Additional**: react-markdown, @dnd-kit (drag & drop)

## 主な機能

### 管理画面 (`/admin`)

- **プロフィール管理**: 名前、連絡先、SNSリンク、自己紹介（Markdown対応）
- **スキル管理**: カテゴリ別スキル管理、習熟度、経験年数、ドラッグ&ドロップ並び替え
- **自己PR管理**: 複数の自己PR項目を作成・管理
- **企業管理**: 職務経歴の企業情報（社名、業界、入退社日）を管理
- **プロジェクト管理**: プロジェクト詳細、技術スタック、担当業務、成果実績
- **アカウント設定**: メールアドレス・パスワード変更

### 公開ページ (`/`)

- プロフィール表示
- スキル一覧（カテゴリ別）
- 自己PR
- 職務経歴（企業・プロジェクト情報）

## セットアップ

### 必要な環境

- Node.js 18以上
- Docker & Docker Compose
- npm or yarn

### 初回セットアップ

1. **リポジトリをクローン**

```bash
git clone <repository-url>
cd portfolio
```

2. **依存関係をインストール**

```bash
npm install
# または
make install
```

3. **環境変数を設定**

`.env`ファイルを作成し、以下の環境変数を設定：

```bash
# Database
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/portfolio_dev"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

4. **PostgreSQLコンテナを起動**

```bash
docker-compose up -d
# または
make up
```

5. **データベーススキーマを適用**

```bash
npm run db:push
# または
make db-push
```

6. **初期データを投入**

```bash
npm run db:seed
# または
make seed
```

初期管理者アカウント:

- Email: `admin@example.com`
- Password: `admin123`

⚠️ **初回ログイン後、必ずパスワードを変更してください**

7. **開発サーバーを起動**

```bash
npm run dev
# または
make dev
```

アプリケーションが <http://localhost:3000> で起動します。

## Makeコマンド

便利なMakeコマンドが用意されています：

```bash
make help        # コマンド一覧を表示
make up          # Dockerコンテナ起動
make down        # Dockerコンテナ停止
make restart     # Dockerコンテナ再起動
make logs        # Dockerログを表示
make db-push     # データベーススキーマを適用
make db-studio   # Drizzle Studio起動（データベースGUI）
make seed        # データベースにシードデータ投入
make dev         # 開発サーバー起動
make build       # プロダクションビルド
make lint        # ESLint実行
make clean       # コンテナ停止＆ボリューム削除
make install     # npm依存関係インストール
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# リント実行
npm run lint

# データベーススキーマ適用
npm run db:push

# データベースGUI起動
npm run db:studio

# シードデータ投入
npm run db:seed
```

## プロジェクト構成

```
portfolio/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理画面ページ
│   ├── api/               # API Routes
│   └── page.tsx           # 公開ページ
├── components/            # Reactコンポーネント
│   └── ui/               # Shadcn/uiコンポーネント
├── lib/                   # ユーティリティ
│   ├── auth/             # Better Auth設定
│   ├── db/               # データベース設定・スキーマ
│   └── validations.ts    # Zodバリデーション
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
├── public/                # 静的ファイル
└── docker-compose.yml     # Docker設定
```

## データベース管理

### Drizzle Studio（データベースGUI）

```bash
npm run db:studio
```

<http://localhost:4983> でデータベースを視覚的に管理できます。

### スキーマ変更の手順

1. `lib/db/schema.ts`を編集
2. スキーマを適用: `npm run db:push`
3. 必要に応じてマイグレーション生成: `npm run db:generate`

## 認証

Better Authを使用したメール/パスワード認証:

- セッション管理
- パスワードハッシュ化（bcrypt）
- CSRF保護

管理画面（`/admin`）は認証必須です。

## デプロイ

### Vercel（推奨）

1. Vercelにプロジェクトをインポート
2. 環境変数を設定（`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`）
3. PostgreSQLデータベースを接続（Vercel Postgres、Supabase等）
4. デプロイ後、シードコマンドでデータ投入

### その他のプラットフォーム

Next.js 15対応のホスティングサービスであれば動作します：

- Railway
- Render
- AWS (Amplify, ECS)
- Google Cloud Run

## ライセンス

MIT

## サポート

問題が発生した場合は、[Issues](https://github.com/your-repo/issues)で報告してください。
