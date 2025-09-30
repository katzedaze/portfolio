# Portfolio Management System

フルスタックのポートフォリオ管理システム。職務経歴、スキル、プロジェクト、自己PRを管理し、公開用のポートフォリオページを生成します。

## 技術スタック

- **Frontend**: Next.js 15.5.4 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**:
  - 開発環境: PostgreSQL (Docker) + node-postgres
  - 本番環境: Neon Database + @neondatabase/serverless
- **Storage**:
  - 開発環境: ローカルファイルシステム (`public/uploads/`)
  - 本番環境: Vercel Blob Storage
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

## 環境構成

このプロジェクトは開発環境と本番環境で異なる構成を使用します：

### 開発環境

- **データベース**: Docker Compose で起動する PostgreSQL (localhost:5432)
- **ストレージ**: ローカルファイルシステム (`public/uploads/`)
- **環境変数**: `.env` ファイル
- **NODE_ENV**: `development`

### 本番環境 (Vercel)

- **データベース**: Neon Database (Serverless PostgreSQL)
- **ストレージ**: Vercel Blob Storage
- **環境変数**: Vercel Environment Variables
- **NODE_ENV**: `production`

## セットアップ

### 必要な環境

#### 開発環境

- Node.js 18以上
- Docker & Docker Compose
- npm or yarn

#### 本番環境

- Vercel CLI
- Neon Database アカウント
- Vercel アカウント

### 開発環境のセットアップ

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
# Database (ローカルPostgreSQL)
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/portfolio_dev"

# Better Auth
BETTER_AUTH_SECRET="dev_secret_key_change_in_production"
BETTER_AUTH_URL="http://localhost:3000"

# Node Environment (開発環境)
NODE_ENV="development"

# 注意: BLOB_READ_WRITE_TOKEN は開発環境では不要
# 開発環境では画像を public/uploads/ に保存します
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

管理画面: <http://localhost:3000/admin/login>
初期アカウント: `admin@example.com` / `admin123`

### 本番環境のセットアップ (Vercel)

#### 1. Neon Database のセットアップ

1. [Neon Console](https://console.neon.tech) にアクセス
2. 新しいプロジェクトを作成（例: `portfolio-db`）
3. 接続文字列をコピー（`postgresql://user:password@host/dbname`）

#### 2. Vercel Blob Storage のセットアップ

1. [Vercel Dashboard](https://vercel.com/dashboard/stores) にアクセス
2. "Create Database" → "Blob" を選択
3. プロジェクトに接続
4. `BLOB_READ_WRITE_TOKEN` が自動的に環境変数に追加されます

#### 3. Vercelにデプロイ

```bash
# Vercel CLIでログイン
vercel login

# 環境変数を設定
printf "your-random-secret-32chars-or-more" | vercel env add BETTER_AUTH_SECRET production
printf "https://your-app.vercel.app" | vercel env add BETTER_AUTH_URL production
printf "postgresql://user:pass@host/db" | vercel env add DATABASE_URL production

# デプロイ
vercel --prod
```

⚠️ **重要**: 環境変数は `printf` を使用してください（`echo` は改行文字を含むためエラーの原因になります）

#### 4. データベーススキーマを適用

```bash
# 本番環境のDATABASE_URLを使用してスキーマを適用
DATABASE_URL="postgresql://..." npm run db:push
```

#### 5. 管理者アカウントを作成

```bash
# Better Auth APIで管理者アカウントを作成
curl -X POST https://your-app.vercel.app/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-secure-password","name":"Admin"}'
```

#### 6. 動作確認

`https://your-app.vercel.app/admin/login` にアクセスしてログインテスト

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

```text
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

## トラブルシューティング

### 開発環境

**データベース接続エラー**

```bash
# Dockerコンテナが起動しているか確認
docker ps

# コンテナを再起動
make restart
# または
docker-compose restart

# .envファイルのDATABASE_URLを確認
cat .env | grep DATABASE_URL
# localhostが含まれていれば自動的にnode-postgresが使用されます
```

**CORSエラー / ログインできない**

- `.env` ファイルの `DATABASE_URL` に `localhost` が含まれているか確認
- 開発サーバーを再起動: `npm run dev` または `make dev`
- データベース接続判定は `DATABASE_URL` の内容で自動的に行われます

**画像アップロードエラー**

- 開発環境では `public/uploads/` ディレクトリに保存されます
- ディレクトリは自動作成されますが、権限エラーが出る場合は手動で作成してください

### 本番環境 (Vercel)

**ログインエラー**

```bash
# Vercelのログを確認
vercel logs --follow

# 環境変数を確認
vercel env ls
```

**パスワードハッシュエラー**

```bash
# 管理者アカウントをリセット
curl -X POST https://your-app.vercel.app/api/reset-admin

# 新しいアカウントを作成
curl -X POST https://your-app.vercel.app/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-secure-password","name":"Admin"}'
```

**画像が表示されない**

- Vercel Blob Storageが正しく接続されているか確認
- `BLOB_READ_WRITE_TOKEN` 環境変数が設定されているか確認
- `next.config.ts` の `remotePatterns` 設定を確認

## アーキテクチャの詳細

### 環境別の動作

このプロジェクトは環境変数で動作を自動的に切り替えます：

**データベース接続 (`lib/db/index.ts`)**

- 判定方法: `DATABASE_URL` に `localhost` が含まれているか、または `NODE_ENV` が `development`
- **開発環境**: node-postgres (Pool) でローカルPostgreSQLに接続
- **本番環境**: @neondatabase/serverless (neon-http) でNeon Databaseに接続

**画像アップロード (`app/api/upload/route.ts`)**

- 判定方法: `NODE_ENV` が `development` かどうか
- **開発環境**: ファイルシステム (`public/uploads/`) に保存
- **本番環境**: Vercel Blob Storage に保存

この仕組みにより、`.env` ファイルの `DATABASE_URL` を変更するだけで適切なドライバが自動選択されます。

## ライセンス

MIT

## サポート

問題が発生した場合は、[Issues](https://github.com/your-repo/issues)で報告してください。
