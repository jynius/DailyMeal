#!/bin/bash
# check-build.sh - Next.js 빌드 상태 확인 후 PM2 시작

set -e  # 에러 시 중단

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 Checking Next.js build..."
echo "📂 프로젝트 루트: $PROJECT_ROOT"

# .next 디렉토리 확인
if [ ! -d "frontend/.next" ]; then
    echo "❌ No build found. Building now..."
    cd frontend
    npm run build
    cd ..
else
    echo "✅ Build exists."
    read -p "🔄 Rebuild? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔨 Rebuilding..."
        cd frontend
        npm run build
        cd ..
    fi
fi

# 백엔드 빌드 확인
echo "🔍 Checking Backend build..."
if [ ! -d "backend/dist" ]; then
    echo "❌ No backend build found. Building now..."
    cd backend
    npm run build
    cd ..
else
    echo "✅ Backend build exists."
fi

# PM2 시작
echo "🚀 Starting PM2..."
pm2 start ecosystem.config.js

echo "✅ Done!"
pm2 list
