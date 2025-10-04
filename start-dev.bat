@echo off
echo 🚀 DailyMeal 개발 서버를 시작합니다...
echo.

echo 📱 프론트엔드 서버 시작 (포트: 3000)
echo 🔧 백엔드 서버 시작 (포트: 3001)
echo.

REM 새 터미널 창에서 백엔드 시작
start "Backend Server" cmd /k "cd backend && npm run start:dev"

REM 새 터미널 창에서 프론트엔드 시작
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo ✅ 서버가 시작되었습니다!
echo 📱 프론트엔드: http://localhost:3000
echo 🔧 백엔드 API: http://localhost:3001
echo.
echo 각 터미널 창에서 Ctrl+C로 서버를 중지할 수 있습니다.
pause