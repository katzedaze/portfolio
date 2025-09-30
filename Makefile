.PHONY: help up down restart logs db-push db-studio seed dev build lint clean install setup

# デフォルトターゲット: ヘルプを表示
help:
	@echo "=========================================="
	@echo "Portfolio Project - Makefile Commands"
	@echo "=========================================="
	@echo ""
	@echo "🚀 Quick Start (Development):"
	@echo "  make setup       - Complete setup (install + up + db-push + seed)"
	@echo "  make dev         - Start development server"
	@echo ""
	@echo "🐳 Docker Commands (Development only):"
	@echo "  make up          - Start PostgreSQL container"
	@echo "  make down        - Stop PostgreSQL container"
	@echo "  make restart     - Restart PostgreSQL container"
	@echo "  make logs        - Show container logs"
	@echo ""
	@echo "💾 Database Commands:"
	@echo "  make db-push     - Push schema to database"
	@echo "  make db-studio   - Open Drizzle Studio (GUI at localhost:4983)"
	@echo "  make seed        - Seed initial data (admin account)"
	@echo ""
	@echo "🛠️  Development Commands:"
	@echo "  make dev         - Start Next.js dev server (localhost:3000)"
	@echo "  make build       - Build production bundle"
	@echo "  make lint        - Run ESLint"
	@echo ""
	@echo "🧹 Utility Commands:"
	@echo "  make clean       - Stop containers and remove volumes"
	@echo "  make install     - Install npm dependencies"
	@echo ""
	@echo "📝 Environment:"
	@echo "  Development: Uses Docker PostgreSQL + local file storage"
	@echo "  Production:  Uses Neon Database + Vercel Blob Storage"

# 完全セットアップ (開発環境)
setup: install up
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 3
	@$(MAKE) db-push
	@$(MAKE) seed
	@echo ""
	@echo "=========================================="
	@echo "✅ Setup complete!"
	@echo "=========================================="
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run: make dev"
	@echo "  2. Open: http://localhost:3000"
	@echo "  3. Login: http://localhost:3000/admin/login"
	@echo "     Email: admin@example.com"
	@echo "     Password: admin123"
	@echo ""

# npm依存関係をインストール
install:
	@echo "📦 Installing npm dependencies..."
	npm install
	@echo "✅ Dependencies installed"

# Dockerコンテナを起動 (開発環境のみ)
up:
	@echo "🐳 Starting PostgreSQL container..."
	docker-compose up -d
	@echo "✅ PostgreSQL is running on localhost:5432"

# Dockerコンテナを停止
down:
	@echo "🛑 Stopping PostgreSQL container..."
	docker-compose down
	@echo "✅ Container stopped"

# Dockerコンテナを再起動
restart:
	@echo "🔄 Restarting PostgreSQL container..."
	docker-compose restart
	@echo "✅ Container restarted"

# Dockerコンテナのログを表示
logs:
	docker-compose logs -f

# データベーススキーマをプッシュ
db-push:
	@echo "💾 Pushing database schema..."
	npm run db:push
	@echo "✅ Schema applied"

# Drizzle Studioを起動
db-studio:
	@echo "🎨 Opening Drizzle Studio..."
	@echo "Access at: http://localhost:4983"
	npm run db:studio

# データベースにシードデータを投入
seed:
	@echo "🌱 Seeding database..."
	npm run db:seed
	@echo "✅ Database seeded with admin account"
	@echo "   Email: admin@example.com"
	@echo "   Password: admin123"

# 開発サーバーを起動
dev:
	@echo "🚀 Starting development server..."
	@echo "Access at: http://localhost:3000"
	@echo "Admin: http://localhost:3000/admin/login"
	npm run dev

# アプリケーションをビルド
build:
	@echo "🏗️  Building production bundle..."
	npm run build

# リントを実行
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

# コンテナを停止してボリュームを削除
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	@echo "✅ Containers stopped and volumes removed"
