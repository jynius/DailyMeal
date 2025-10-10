#!/bin/bash
# DailyMeal 간단 배포 스크립트 - 프론트엔드 빌드 포함

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 DailyMeal 간단 배포 시작..."

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📂 프로젝트 루트: $PROJECT_ROOT"

# 0. 프론트엔드 환경 변수 파일 확인 및 생성
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔍 프론트엔드 환경 변수 확인..."
if [ ! -f "frontend/.env.production" ]; then
    if [ -f "frontend/.env.production.example" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  .env.production이 없습니다."
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📝 .env.production.example을 복사하세요:"
        echo "    cp frontend/.env.production.example frontend/.env.production"
        echo "    vi frontend/.env.production  # 실제 키 값 입력"
        exit 1
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ .env.production.example 파일이 없습니다!"
        exit 1
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ .env.production 파일 존재"
fi

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

# 최근 로그만 출력 (--nostream 옵션으로 대기하지 않음)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📋 최근 로그 (20줄):"
pm2 logs --lines 20 --nostream

echo ""
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 배포 완료!"
echo ""
echo "💡 실시간 로그 확인: pm2 logs"
echo "💡 상태 확인: pm2 status"
echo "💡 재시작: pm2 restart all"