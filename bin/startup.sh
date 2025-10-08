#!/bin/bash
# DailyMeal 프로젝트 PM2 시작 스크립트

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 DailyMeal PM2 시작..."
echo "📂 프로젝트 루트: $PROJECT_ROOT"

# 환경 변수 설정
export NODE_ENV=production

# 1. 의존성이 설치되어 있는지 확인
echo "백엔드 의존성 확인 중..."
cd ./backend && npm ci --omit=dev

echo "프론트엔드 의존성 확인 중..."
cd ../frontend && npm ci --omit=dev

echo "프론트엔드 빌드 중..."
npm run build

# 2. 기존 PM2 프로세스 정리
echo "기존 PM2 프로세스 정리 중..."
cd ..
pm2 delete all 2>/dev/null || true

# 3. Nest.js 백엔드 앱 실행 (포트는 main.ts에서 설정)
echo "백엔드 서버 시작 중..."
pm2 start ./backend/dist/main.js --name "dailymeal-backend" --cwd ./backend --log-date-format="YYYY-MM-DD HH:mm:ss"

# 4. Next.js 프론트엔드 앱 실행 (3000번 포트)
echo "프론트엔드 서버 시작 중..."
pm2 start "npm run start" --name "dailymeal-frontend" --cwd ./frontend --log-date-format="YYYY-MM-DD HH:mm:ss"

# 5. PM2 프로세스 목록 확인
echo "PM2 프로세스 상태:"
pm2 list

# 6. 서버 재부팅 시 자동으로 앱을 다시 시작하도록 설정
echo "PM2 자동 시작 설정 중..."
pm2 save
pm2 startup

echo "DailyMeal 서버가 성공적으로 시작되었습니다!"
echo "프론트엔드: http://localhost:3000"
echo "백엔드 API: http://localhost:3001"
