#!/bin/bash
# DailyMeal 로컬 개발 서버 시작 (PM2 사용)

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 DailyMeal 로컬 개발 서버 시작 (PM2)..."
echo "📂 프로젝트 루트: $PROJECT_ROOT"

# 환경 변수 설정
export NODE_ENV=development
export NEXT_PUBLIC_API_URL=http://localhost:8000
export NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 1. 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치 중..."
cd ./backend && npm install

# 2. 프론트엔드 의존성 설치
echo "📦 프론트엔드 의존성 설치 중..."
cd ../frontend && npm install
cd ..

# 3. 기존 개발 서버 중지
echo "⏹️  기존 개발 서버 중지 중..."
pm2 delete ecosystem.dev.config.js 2>/dev/null || true

# 4. PM2로 개발 서버 시작
echo "🚀 PM2 개발 서버 시작 중..."
pm2 start ecosystem.dev.config.js

# 5. 상태 확인
echo ""
echo "📊 PM2 개발 서버 상태:"
pm2 list

echo ""
echo "✅ DailyMeal 개발 서버가 시작되었습니다!"
echo ""
echo "📱 접속 주소:"
echo "   🌐 프론트엔드: http://localhost:3000"
echo "   🔧 백엔드 API: http://localhost:8000"
echo "   📚 API 문서: http://localhost:8000/api-docs"
echo ""
echo "🔧 PM2 명령어:"
echo "   pm2 list                    # 프로세스 상태 확인"
echo "   pm2 logs                    # 실시간 로그 확인"
echo "   pm2 logs dailymeal-backend-dev  # 백엔드 로그만"
echo "   pm2 logs dailymeal-frontend-dev # 프론트엔드 로그만"
echo "   pm2 restart all             # 모든 프로세스 재시작"
echo "   pm2 stop all                # 모든 프로세스 중지"
echo "   pm2 delete all              # 모든 프로세스 삭제"
echo ""