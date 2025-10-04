#!/bin/bash
# DailyMeal PM2 통합 중지 스크립트

usage() {
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  dev      개발 서버만 중지"
    echo "  prod     프로덕션 서버만 중지"  
    echo "  all      모든 PM2 프로세스 중지 (기본값)"
    echo ""
    echo "예시:"
    echo "  $0 dev   # 개발 서버만 중지"
    echo "  $0 all   # 모든 서버 중지"
    exit 1
}

stop_dev() {
    echo "⏹️  DailyMeal 개발 서버 중지 중..."
    pm2 delete dailymeal-backend-dev 2>/dev/null || true
    pm2 delete dailymeal-frontend-dev 2>/dev/null || true
    echo "✅ DailyMeal 개발 서버가 중지되었습니다."
}

stop_prod() {
    echo "⏹️  DailyMeal 프로덕션 서버 중지 중..."
    pm2 delete dailymeal-backend 2>/dev/null || true
    pm2 delete dailymeal-frontend-hybrid 2>/dev/null || true
    echo "✅ DailyMeal 프로덕션 서버가 중지되었습니다."
}

stop_all() {
    echo "⏹️  모든 DailyMeal 서비스 중지 중..."
    pm2 delete all 2>/dev/null || true
    echo "✅ 모든 DailyMeal 서비스가 중지되었습니다."
}

# 인자 처리
case "${1:-all}" in
    dev)
        stop_dev
        ;;
    prod)
        stop_prod
        ;;
    all)
        stop_all
        ;;
    -h|--help)
        usage
        ;;
    *)
        echo "❌ 알 수 없는 옵션: $1"
        usage
        ;;
esac

echo ""
echo "🔧 현재 PM2 상태:"
pm2 list