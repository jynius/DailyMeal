#!/bin/bash
# DailyMeal 개발 환경 시작 스크립트

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 DailyMeal 개발 환경 시작..."
echo "📂 프로젝트 루트: $PROJECT_ROOT"

# 환경 변수 설정
export NODE_ENV=development
export NEXT_PUBLIC_API_URL=http://localhost:8000
export NEXT_PUBLIC_SITE_URL=http://localhost:3000

echo "📦 의존성 설치 중..."

# 1. 백엔드 의존성 설치
echo "   - 백엔드 의존성..."
cd ./backend && npm install

# 2. 프론트엔드 의존성 설치  
echo "   - 프론트엔드 의존성..."
cd ../frontend && npm install
cd ..

echo ""
echo "🚀 개발 서버를 시작하려면 다음 명령어를 각각 다른 터미널에서 실행하세요:"
echo ""
echo "터미널 1 (백엔드):"
echo "   cd backend && npm run start:dev"
echo ""
echo "터미널 2 (프론트엔드):"  
echo "   cd frontend && npm run dev"
echo ""
echo "또는 통합 실행:"
echo "   npm run dev          # package.json 루트 스크립트 사용"
echo ""