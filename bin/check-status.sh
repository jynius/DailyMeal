#!/bin/bash
# DailyMeal PM2 상태 확인 및 복구 스크립트

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 DailyMeal PM2 상태 진단 시작..."
echo "📂 프로젝트 루트: $PROJECT_ROOT"
echo "================================"

# 1. PM2 상태 확인
echo "📊 현재 PM2 프로세스 상태:"
pm2 list

echo ""
echo "🔍 프로세스별 상세 상태:"
pm2 describe all

# 2. 로그 확인
echo ""
echo "📝 최근 오류 로그 (마지막 10줄):"
echo "--- 백엔드 오류 로그 ---"
pm2 logs dailymeal-backend --lines 5 --err || echo "백엔드 로그 없음"

echo "--- 프론트엔드 오류 로그 ---"
pm2 logs dailymeal-frontend --lines 5 --err || echo "프론트엔드 로그 없음"

# 3. 빌드 상태 확인
echo ""
echo "🔨 빌드 상태 확인:"
if [ -f "./backend/dist/main.js" ]; then
    echo "✅ 백엔드 빌드 완료"
else
    echo "❌ 백엔드 빌드 필요: cd backend && npm run build"
fi

if [ -d "./frontend/.next" ]; then
    echo "✅ 프론트엔드 빌드 완료"
    echo "   빌드 시간: $(stat -c %y ./frontend/.next 2>/dev/null | cut -d' ' -f1-2)"
else
    echo "❌ 프론트엔드 빌드 필요: cd frontend && npm run build"
fi

# 4. 포트 사용 상황 확인
echo ""
echo "🔌 포트 사용 상황:"
echo "--- 백엔드 포트 8000 ---"
lsof -i :8000 | head -5 || echo "포트 8000 사용 중이 아님"

echo "--- 프론트엔드 포트 3000 ---"
lsof -i :3000 | head -5 || echo "포트 3000 사용 중이 아님"

# 5. 시스템 리소스 확인
echo ""
echo "💾 시스템 리소스:"
echo "메모리: $(free -h | awk '/^Mem:/ {print $3"/"$2" ("$3/$2*100"%)"}')"
echo "디스크: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"

# 6. 복구 제안
echo ""
echo "🛠️  문제 해결 제안:"
echo "1. 프론트엔드 빌드 오류가 있다면:"
echo "   cd frontend && rm -rf .next && npm run build"
echo ""
echo "2. PM2 프로세스 재시작:"
echo "   pm2 restart all"
echo ""
echo "3. 완전 재배포:"
echo "   ./deploy-simple.sh"
echo ""
echo "4. 개발 모드로 전환:"
echo "   pm2 delete all && pm2 start ecosystem.dev.config.js"

echo ""
echo "================================"
echo "🔍 진단 완료. 추가 도움이 필요하면 위의 제안을 시도해보세요."