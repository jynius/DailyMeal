#!/bin/bash
# DailyMeal PM2 서비스 중지 스크립트

echo "⏹️  DailyMeal 서비스 중지 중..."

# PM2 프로세스 중지 및 삭제
pm2 delete all 2>/dev/null || true

echo "✅ 모든 DailyMeal 서비스가 중지되었습니다."
echo ""
echo "🔧 상태 확인:"
pm2 list