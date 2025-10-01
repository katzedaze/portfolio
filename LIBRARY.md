# ライブラリドキュメント

このプロジェクトで使用している主要なライブラリの最新情報と使用方法をまとめたドキュメントです。

## 目次

1. [Next.js 15](#nextjs-15)
2. [Drizzle ORM](#drizzle-orm)
3. [Better Auth](#better-auth)
4. [shadcn/ui](#shadcnui)
5. [Zod](#zod)
6. [@dnd-kit](#dnd-kit)
7. [その他の重要なライブラリ](#その他の重要なライブラリ)

---

## Next.js 15

### 概要

- **バージョン**: 15.5.4
- **Library ID**: `/vercel/next.js`
- **説明**: React ベースのフルスタック Web アプリケーションフレームワーク
- **Trust Score**: 10/10
- **Code Snippets**: 3200+

### 主な機能

- **App Router**: 最新のファイルベースルーティングシステム
- **Server Components**: デフォルトでサーバーサイドレンダリング
- **API Routes**: `/app/api` ディレクトリでバックエンドAPI構築
- **Turbopack**: 高速なビルドツール

### プロジェクトでの使用例

#### App Router でのページ作成

```typescript
// app/page.tsx
export default async function Page() {
  // Server Component で直接データフェッチ
  const data = await fetch('https://...', { cache: 'no-store' })
  return <div>{/* ... */}</div>
}
```

#### Dynamic Routes

```typescript
// app/blog/[slug]/page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>Blog Post: {slug}</div>
}
```

#### API Route Handler

```typescript
// app/api/users/route.ts
export async function GET() {
  return Response.json({ message: 'Hello World' })
}
```

#### データフェッチとキャッシング

```typescript
// ISR (Incremental Static Regeneration)
const revalidatedData = await fetch('https://...', {
  next: { revalidate: 3600 }, // 1時間ごとに再検証
})

// 動的データ (毎回フェッチ)
const dynamicData = await fetch('https://...', { cache: 'no-store' })

// 静的データ (キャッシュ)
const staticData = await fetch('https://...', { cache: 'force-cache' })
```

### 参考リンク

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading)

---

## Drizzle ORM

### 概要

- **バージョン**: 0.44.5
- **Library ID**: `/drizzle-team/drizzle-orm`
- **説明**: TypeScript-first な軽量 ORM（PostgreSQL、MySQL、SQLite 対応）
- **Trust Score**: 7.6/10
- **Code Snippets**: 410+

### 主な機能

- **型安全なクエリビルダー**: TypeScript による完全な型推論
- **Schema-first**: コードでスキーマを定義し、マイグレーション自動生成
- **Serverless対応**: エッジランタイムでも動作
- **Drizzle Studio**: ビジュアルなデータベース管理ツール

### プロジェクトでの使用例

#### PostgreSQL スキーマ定義

```typescript
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core'

// デフォルトスキーマ (public)
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// カスタムスキーマ
const mySchema = pgSchema('mySchema')
const posts = mySchema.table('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
})
```

#### クエリの実行

```typescript
// SELECT クエリ
const allUsers = await db.select().from(users)

// WHERE 条件付き
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.verified, true))

// INSERT
await db.insert(users).values({
  name: 'John Doe',
  verified: false,
})

// UPDATE
await db
  .update(users)
  .set({ verified: true })
  .where(eq(users.id, 1))
```

#### Views と Materialized Views

```typescript
import { pgView, pgMaterializedView, sql } from 'drizzle-orm/pg-core'

// ビュー定義
export const simpleView = pgView('simple_users_view').as((qb) =>
  qb.select().from(users)
)

// マテリアライズドビュー
export const materializedView = pgMaterializedView('materialized_users_view').as(
  (qb) => qb.select().from(users)
)
```

### プロジェクトでの設定

#### データベース接続 (`lib/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)
```

#### マイグレーション

```bash
# スキーマからマイグレーションファイル生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# 開発環境で直接スキーマをプッシュ
npm run db:push

# Drizzle Studio 起動
npm run db:studio
```

### 参考リンク

- [Drizzle ORM 公式ドキュメント](https://orm.drizzle.team/)
- [PostgreSQL Schema Reference](https://orm.drizzle.team/docs/sql-schema-declaration)

---

## Better Auth

### 概要

- **バージョン**: 1.3.23
- **Library ID**: `/better-auth/better-auth`
- **説明**: フレームワーク非依存の TypeScript 認証・認可ライブラリ
- **Trust Score**: 7.6/10
- **Code Snippets**: 1314+

### 主な機能

- **Email/Password 認証**: bcryptjs によるパスワードハッシュ化
- **セッション管理**: Cookie ベースのセッション管理
- **プラグインエコシステム**: 2FA、Magic Link、OAuth など拡張可能
- **型安全**: TypeScript による完全な型サポート

### プロジェクトでの使用例

#### サーバーサイド設定 (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // データベース接続設定
  },
  emailAndPassword: {
    enabled: true,
  },
})
```

#### Next.js API Route (`app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { POST, GET } = toNextJsHandler(auth)
```

#### クライアントサイド設定 (`lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // クライアント設定
})
```

#### Server Component でセッション取得

```typescript
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
    </div>
  )
}
```

#### Next.js Middleware で認証チェック

```typescript
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard", "/admin/*"]
}
```

#### Server Action でのサインイン

```typescript
"use server"
import { auth } from "@/lib/auth"

const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: "user@email.com",
      password: "password",
    }
  })
}
```

### プロジェクトでの認証フロー

1. ユーザーが `/admin/login` でメール・パスワードを入力
2. Better Auth が認証処理とパスワード検証
3. セッション Cookie を自動設定
4. `/admin/*` ルートは `useSession()` でクライアント側チェック
5. API Routes は `auth.api.getSession()` でサーバー側チェック

### 参考リンク

- [Better Auth 公式ドキュメント](https://www.better-auth.com/)
- [Next.js Integration Guide](https://www.better-auth.com/docs/integrations/next)

---

## shadcn/ui

### 概要

- **バージョン**: Latest (Radix UI ベース)
- **Library ID**: `/shadcn-ui/ui`
- **説明**: アクセシブルでカスタマイズ可能な UI コンポーネントコレクション
- **Trust Score**: 10/10
- **Code Snippets**: 1107+

### 主な機能

- **コピー&ペースト**: コンポーネントをプロジェクトに直接追加
- **Radix UI ベース**: アクセシビリティに優れた UI プリミティブ
- **Tailwind CSS**: ユーティリティファーストのスタイリング
- **完全カスタマイズ可能**: 自分のコンポーネントライブラリを構築

### プロジェクトでの使用例

#### コンポーネントのインストール

```bash
# CLI 経由でコンポーネント追加
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add input

# 複数同時インストール
npx shadcn@latest add button dialog select input
```

#### components.json 設定

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

#### コンポーネントの使用例

```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">オプション1</SelectItem>
            <SelectItem value="option2">オプション2</SelectItem>
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  )
}
```

#### 必須依存関係（手動インストール時）

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
```

### プロジェクトでの使用パターン

- **管理画面のモーダル**: すべて `max-w-7xl` で統一
- **Select コンポーネント**: `SelectTrigger` に `className="w-full"` を必ず追加
- **フォーム**: `useState` による制御コンポーネント
- **トースト通知**: Sonner ライブラリと組み合わせて使用

### 参考リンク

- [shadcn/ui 公式ドキュメント](https://ui.shadcn.com/)
- [コンポーネント一覧](https://ui.shadcn.com/docs/components)

---

## Zod

### 概要

- **バージョン**: 4.1.11
- **Library ID**: `/colinhacks/zod`
- **説明**: TypeScript-first なスキーマバリデーションライブラリ
- **Trust Score**: 9.6/10
- **Code Snippets**: 590+

### 主な機能

- **型推論**: スキーマから TypeScript 型を自動生成
- **バリデーション**: ランタイムでのデータ検証
- **カスタムバリデーション**: `.refine()` でカスタムルール追加
- **エラーハンドリング**: 詳細なエラー情報

### プロジェクトでの使用例

#### 基本的なスキーマ定義

```typescript
import { z } from "zod"

// 文字列スキーマ
const stringSchema = z.string()
stringSchema.parse("hello") // => "hello"
stringSchema.parse(123) // throws ZodError

// オブジェクトスキーマ
const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(120),
  email: z.string().email(),
  verified: z.boolean().default(false),
})

type User = z.infer<typeof UserSchema>
// type User = { name: string; age: number; email: string; verified: boolean }
```

#### API バリデーション (`lib/validations.ts`)

```typescript
import { z } from "zod"

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  technologies: z.array(z.string()),
  companyId: z.string().uuid().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
})

export const UpdateSkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: z.enum(["frontend", "backend", "infrastructure", "others"]),
  yearsOfExperience: z.number().min(0).max(500), // ×10 して保存
  proficiency: z.number().min(1).max(5),
})
```

#### API Route でのバリデーション

```typescript
import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { CreateProjectSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateProjectSchema.parse(body)

    // データベース操作
    await db.insert(projects).values(validatedData)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

#### カスタムバリデーション

```typescript
const PasswordSchema = z
  .string()
  .min(8, "パスワードは8文字以上必要です")
  .refine((val) => /[A-Z]/.test(val), {
    message: "大文字を1文字以上含める必要があります",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "数字を1文字以上含める必要があります",
  })
```

#### 非同期バリデーション

```typescript
const UniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const existingUser = await db.select().from(users).where(eq(users.email, email))
    return existingUser.length === 0
  },
  { message: "このメールアドレスは既に使用されています" }
)

// 使用時は parseAsync を使う
await UniqueEmailSchema.parseAsync("user@example.com")
```

### プロジェクトでの注意点

- **ZodError のエラーアクセス**: `error.issues` を使用（`error.errors` ではない）
- **Skills の経験年数**: 0.1 単位で扱うため、保存時は ×10、取得時は ÷10

### 参考リンク

- [Zod 公式ドキュメント](https://zod.dev/)
- [エラーハンドリング](https://zod.dev/ERROR_HANDLING)

---

## @dnd-kit

### 概要

- **バージョン**: 最新版
- **Library ID**: `/clauderic/dnd-kit`
- **説明**: React 用のモダンで軽量なドラッグ&ドロップツールキット
- **Trust Score**: 9.3/10
- **Code Snippets**: 9+

### 主な機能

- **モジュラー設計**: 必要な機能だけをインストール
- **アクセシビリティ**: キーボード操作対応
- **カスタマイズ可能**: Modifiers で動作を柔軟に制御
- **パフォーマンス**: 最適化されたレンダリング

### プロジェクトで使用するパッケージ

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### プロジェクトでの使用例

#### 基本的なソート可能リスト

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { arrayMove } from '@dnd-kit/sortable'

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export function SortableList({ items }: { items: Array<{ id: string; name: string }> }) {
  const [sortedItems, setSortedItems] = useState(items)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setSortedItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over!.id)
        const newItems = arrayMove(items, oldIndex, newIndex)

        // displayOrder を更新
        updateDisplayOrder(newItems)

        return newItems
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortedItems} strategy={verticalListSortingStrategy}>
        {sortedItems.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {item.name}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

#### Modifiers の使用

```tsx
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'

function App() {
  return (
    <DndContext modifiers={[restrictToVerticalAxis]}>
      {/* 垂直方向のみドラッグ可能 */}
    </DndContext>
  )
}
```

#### カスタム Snap-to-Grid Modifier

```typescript
import { createSnapModifier } from '@dnd-kit/modifiers'

const gridSize = 20 // pixels
const snapToGridModifier = createSnapModifier(gridSize)

// または、カスタム実装
function snapToGrid(args) {
  const { transform } = args
  return {
    ...transform,
    x: Math.ceil(transform.x / gridSize) * gridSize,
    y: Math.ceil(transform.y / gridSize) * gridSize,
  }
}
```

### プロジェクトでのドラッグ&ドロップパターン

1. `@dnd-kit/core` と `@dnd-kit/sortable` を使用
2. アイテムに `displayOrder` フィールドを持たせる
3. ドラッグ終了時に全アイテムの `displayOrder` を PUT リクエストで更新
4. `arrayMove()` で楽観的 UI 更新

### 参考リンク

- [@dnd-kit 公式ドキュメント](https://docs.dndkit.com/)
- [Sortable プリセット](https://docs.dndkit.com/presets/sortable)

---

## その他の重要なライブラリ

### react-markdown

- **バージョン**: 10.1.0
- **用途**: Markdown レンダリング
- **プロジェクトでの使用**: プロフィール、プロジェクト説明、自己PRの表示

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
    >
      {content}
    </ReactMarkdown>
  )
}
```

### Sonner

- **バージョン**: 2.0.7
- **用途**: トースト通知
- **プロジェクトでの使用**: CRUD 操作の成功/失敗通知

```tsx
import { toast } from 'sonner'

// 成功通知
toast.success("プロジェクトを作成しました")

// エラー通知
toast.error("プロジェクトの作成に失敗しました")
```

### date-fns

- **バージョン**: 4.1.0
- **用途**: 日付フォーマット
- **プロジェクトでの使用**: 企業の在籍期間、プロジェクト期間の表示

```typescript
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

const formattedDate = format(new Date(), 'yyyy年MM月', { locale: ja })
```

### yubinbango-core2

- **バージョン**: 0.6.3
- **用途**: 日本の郵便番号から住所自動入力
- **プロジェクトでの使用**: プロフィールの住所入力

```typescript
import { Core } from 'yubinbango-core2'

const core = new Core('1000001', (addr) => {
  console.log(addr.region)     // 東京都
  console.log(addr.locality)   // 千代田区
  console.log(addr.street)     // 千代田
})
```

### bcryptjs

- **バージョン**: 3.0.2
- **用途**: パスワードハッシュ化
- **プロジェクトでの使用**: Better Auth がバックエンドで自動使用

---

## 開発時の注意事項

### バージョン管理

- `package.json` でバージョンを固定
- 定期的に `npm outdated` で更新確認
- メジャーバージョンアップ時は破壊的変更に注意

### TypeScript 設定

- `next.config.ts` で `ignoreBuildErrors: true` を設定
- これは `yubinbango-core2` の型定義問題に対処するため
- 型定義ファイル: `types/yubinbango-core2.d.ts`

### 依存関係の更新

```bash
# 最新パッチバージョンに更新
npm update

# メジャー/マイナーバージョン確認
npm outdated

# 特定パッケージの更新
npm install next@latest
```

---

## 参考リソース

### 公式ドキュメント

- [Next.js](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zod](https://zod.dev/)
- [@dnd-kit](https://docs.dndkit.com/)

### Context7 での情報取得

このドキュメントは Context7 MCP を使用して最新のライブラリ情報を取得し、作成されました。定期的に更新を確認することをお勧めします。

---

**最終更新**: 2025-10-01
