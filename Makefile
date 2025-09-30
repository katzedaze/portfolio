.PHONY: help up down restart logs db-push db-studio seed dev build lint clean

# デフォルトターゲット: ヘルプを表示
help:
	@echo "Portfolio Project - Makefile Commands"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up          - Start Docker containers (PostgreSQL)"
	@echo "  make down        - Stop Docker containers"
	@echo "  make restart     - Restart Docker containers"
	@echo "  make logs        - Show Docker container logs"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-push     - Push database schema changes"
	@echo "  make db-studio   - Open Drizzle Studio (database GUI)"
	@echo "  make seed        - Seed the database with initial data"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev         - Start Next.js development server"
	@echo "  make build       - Build Next.js application"
	@echo "  make lint        - Run ESLint"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean       - Stop containers and remove volumes"
	@echo "  make install     - Install npm dependencies"

# Dockerコンテナを起動
up:
	docker-compose up -d
	@echo "✅ Docker containers started"
	@echo "PostgreSQL is running on localhost:5432"

# Dockerコンテナを停止
down:
	docker-compose down
	@echo "✅ Docker containers stopped"

# Dockerコンテナを再起動
restart:
	docker-compose restart
	@echo "✅ Docker containers restarted"

# Dockerコンテナのログを表示
logs:
	docker-compose logs -f

# データベーススキーマをプッシュ
db-push:
	npm run db:push

# Drizzle Studioを起動
db-studio:
	npm run db:studio

# データベースにシードデータを投入
seed:
	npm run db:seed

# 開発サーバーを起動
dev:
	npm run dev

# アプリケーションをビルド
build:
	npm run build

# リントを実行
lint:
	npm run lint

# コンテナを停止してボリュームを削除
clean:
	docker-compose down -v
	@echo "✅ Docker containers stopped and volumes removed"

# npm依存関係をインストール
install:
	npm install
