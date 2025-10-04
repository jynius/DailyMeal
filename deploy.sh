#!/bin/bash
# DailyMeal 통합 배포 스크립트
# Hybrid 렌더링 (Static + SSR) 방식

echo "🚀 DailyMeal 배포 시작..."

# 환경 변수 설정
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=/api
export NEXT_PUBLIC_SITE_URL=http://your-domain.com

# 1. 백엔드 의존성 및 빌드
echo "🔧 백엔드 빌드 중..."
cd ./backend
npm ci --omit=dev
npm run build
cd ..

# 2. 프론트엔드 Hybrid 빌드
echo "🎨 프론트엔드 Hybrid 빌드 중..."
cd ./frontend
npm ci --omit=dev
npm run build:hybrid
cd ..

# 3. 기존 PM2 프로세스 정리
echo "🔄 기존 프로세스 정리 중..."
pm2 delete all 2>/dev/null || true

# 4. PM2 Ecosystem으로 시작
echo "🚀 서비스 시작 중..."
pm2 start ecosystem.config.js

# 5. 상태 확인
echo "📊 서비스 상태:"
pm2 list
pm2 logs --lines 5

# 6. 자동 시작 설정
echo "⚙️ 자동 시작 설정 중..."
pm2 save
pm2 startup

echo ""
echo "✅ DailyMeal 배포 완료!"
echo ""
echo "📱 서비스 주소:"
echo "   🌐 프론트엔드: http://localhost:3000 (내부)"
echo "   🔧 백엔드 API: http://localhost:8000 (내부)"
echo "   🌍 Nginx 통합: http://your-domain.com"
echo ""
echo "🎯 렌더링 방식:"
echo "   📄 Static (ISR): /, /feed, /profile (빠른 로딩)"
echo "   🔄 SSR: /meal/[id] (SEO 최적화, 공유 기능)"
echo ""
echo "🔧 관리 명령어:"
echo "   pm2 list              # 프로세스 상태 확인"
echo "   pm2 logs              # 로그 실시간 확인"
echo "   pm2 restart all       # 전체 재시작"
echo "   pm2 stop all          # 전체 정지"
echo "   pm2 delete all        # 전체 삭제"