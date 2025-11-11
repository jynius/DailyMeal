#!/bin/bash
# DailyMeal PM2 중지 스크립트

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "⏹️  DailyMeal 서비스 중지 중..."
pm2 delete dailymeal-backend 2>/dev/null || true
pm2 delete dailymeal-frontend 2>/dev/null || true
echo "✅ DailyMeal 서비스가 중지되었습니다."

echo ""
echo "🔧 현재 PM2 상태:"
pm2 list