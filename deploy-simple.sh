#!/bin/bash
# DailyMeal 간단 배포 스크립트 - 프론트엔드 빌드 포함

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 DailyMeal 간단 배포 시작..."

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📂 작업 디렉토리: $(pwd)"

# 1. 기존 PM2 프로세스 중지
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🛑 기존 PM2 프로세스 중지..."
pm2 stop all || true
pm2 delete all || true

# 2. 백엔드 의존성 설치 및 빌드
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔧 백엔드 의존성 설치 및 빌드..."
cd backend
npm install --production=false
npm run build
cd ..

# 3. 프론트엔드 의존성 설치 및 빌드
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎨 프론트엔드 의존성 설치 및 빌드..."
cd frontend
npm install --production=false

# 빌드 전 기존 .next 디렉토리 제거
if [ -d ".next" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🗑️  기존 .next 디렉토리 제거..."
    rm -rf .next
fi

# Next.js 빌드 실행
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔨 Next.js 빌드 실행..."
npm run build

# 빌드 결과 확인
if [ -d ".next" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 프론트엔드 빌드 성공!"
    ls -la .next/
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 프론트엔드 빌드 실패!"
    exit 1
fi

cd ..

# 4. PM2로 서비스 시작 (프로덕션 모드)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 PM2로 서비스 시작..."
pm2 start ecosystem.config.js

# 5. PM2 상태 확인
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 PM2 상태 확인..."
pm2 list
pm2 logs --lines 20

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 배포 완료!"