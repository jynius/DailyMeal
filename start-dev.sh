#!/bin/bash

# DailyMeal 개발 서버 시작 스크립트
echo "🚀 DailyMeal 개발 서버를 시작합니다..."
echo ""

# 터미널 창을 나누어 각각 실행
echo "📱 프론트엔드 서버 시작 (포트: 3000)"
echo "🔧 백엔드 서버 시작 (포트: 3001)"
echo ""

# 백그라운드에서 백엔드 시작
cd backend
npm run start:dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 프론트엔드 시작 (포그라운드)
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ 서버가 시작되었습니다!"
echo "📱 프론트엔드: http://localhost:3000"
echo "🔧 백엔드 API: http://localhost:3001"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."

# 종료 시그널 처리
trap 'echo "\n🛑 서버를 중지합니다..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT TERM

# 프로세스 대기
wait