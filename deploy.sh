#!/bin/bash
# DailyMeal 리소스 최적화 배포 스크립트
# Hybrid 렌더링 (Static + SSR) + 성능 모니터링

set -e  # 오류 발생 시 스크립트 중단

# 📊 로깅 및 리소스 측정 함수
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

measure_resources() {
    local stage="$1"
    log_with_timestamp "📊 [$stage] 시스템 리소스:"
    
    # 메모리 사용량
    MEMORY_INFO=$(free -h | awk '/^Mem:/ {print "사용=" $3 " 여유=" $7 " (" int($3/$2 * 100) "%"}')
    echo "  💾 메모리: $MEMORY_INFO"
    
    # 디스크 사용량  
    DISK_INFO=$(df -h / | awk 'NR==2{print "사용=" $3 " 여유=" $4 " (" $5 ")"}')
    echo "  💽 디스크: $DISK_INFO"
    
    # CPU 부하
    CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | sed 's/^[ \t]*//')
    echo "  ⚡ CPU 부하: $CPU_LOAD"
    
    # Node.js 프로세스 메모리 사용량
    NODE_MEMORY=$(ps aux | grep -E "(node|next)" | grep -v grep | awk '{sum+=$6} END {if(sum) print int(sum/1024) "MB"; else print "0MB"}')
    NODE_COUNT=$(ps aux | grep -E "(node|next)" | grep -v grep | wc -l)
    echo "  🔄 Node.js: ${NODE_COUNT}개 프로세스, ${NODE_MEMORY} 사용 중"
    echo ""
}

log_with_timestamp "🚀 DailyMeal 리소스 최적화 배포 시작..."

# 환경 변수 설정 (리소스 최적화)
export NODE_ENV=${NODE_ENV:-production}
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}

# 환경별 포트 및 메모리 제한 설정
export BACKEND_PORT=${BACKEND_PORT:-8000}
export FRONTEND_PORT=${FRONTEND_PORT:-3000}
export NODE_OPTIONS="--max-old-space-size=1024"  # 1GB 제한
log_with_timestamp "🏷️ 프로덕션 환경 (메모리 제한: 1GB)"

# 초기 리소스 상태 측정
measure_resources "배포 시작"

# 🧹 기존 프로세스 정리 (메모리 해제)
log_with_timestamp "🧹 기존 프로세스 정리 중..."
pkill -f "node.*backend" 2>/dev/null || true
pkill -f "next.*frontend" 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 3

# 시스템 캐시 정리 (신중하게)
sync
echo 1 > /proc/sys/vm/drop_caches 2>/dev/null || true

measure_resources "정리 후"

# 1. 백엔드 의존성 및 빌드 (리소스 최적화)
log_with_timestamp "🔧 백엔드 빌드 중 (리소스 절약 모드)..."
cd ./backend

# 메모리 사용량 최소화를 위한 npm 설정
npm ci --omit=dev --prefer-offline --no-audit --silent
npm run build

measure_resources "백엔드 빌드 후"
cd ..

# 2. 프론트엔드 Hybrid 빌드 (리소스 최적화)
log_with_timestamp "🎨 프론트엔드 Hybrid 빌드 중 (리소스 절약 모드)..."
cd ./frontend

# Next.js 빌드 메모리 최적화
NODE_OPTIONS="$NODE_OPTIONS" npm ci --omit=dev --prefer-offline --no-audit --silent
NODE_OPTIONS="$NODE_OPTIONS" npm run build:hybrid

measure_resources "프론트엔드 빌드 후"
cd ..

# 3. 리소스 제한을 적용한 PM2 서비스 시작
log_with_timestamp "🚀 PM2로 서비스 시작 중 (리소스 제한 적용)..."

# 백엔드 시작 (리소스 모니터링 포함)
cd ./backend
pm2 start npm --name "dailymeal-backend" \
    --node-args="$NODE_OPTIONS" \
    --max-memory-restart 800M \
    --autorestart true \
    --watch false \
    -- run start:prod

# 백엔드 포트 설정
pm2 set dailymeal-backend PORT $BACKEND_PORT
cd ..

# 프론트엔드 시작 (리소스 모니터링 포함)  
cd ./frontend
pm2 start npm --name "dailymeal-frontend" \
    --node-args="$NODE_OPTIONS" \
    --max-memory-restart 600M \
    --autorestart true \
    --watch false \
    -- start

# 프론트엔드 포트 설정
pm2 set dailymeal-frontend PORT $FRONTEND_PORT
cd ..

sleep 5
measure_resources "서비스 시작 후"

# 4. 헬스 체크 및 성능 측정
log_with_timestamp "🏥 헬스 체크 및 성능 측정..."

# 백엔드 헬스 체크
for i in {1..5}; do
    log_with_timestamp "🔍 백엔드 체크 $i/5..."
    START_TIME=$(date +%s%N)
    if curl -f -s --max-time 10 "http://localhost:$BACKEND_PORT/api-docs" > /dev/null 2>&1; then
        END_TIME=$(date +%s%N)
        RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
        log_with_timestamp "✅ 백엔드 서비스 정상 (응답시간: ${RESPONSE_TIME}ms, 포트: $BACKEND_PORT)"
        break
    elif [ $i -eq 5 ]; then
        log_with_timestamp "❌ 백엔드 헬스 체크 실패"
        pm2 logs dailymeal-backend --lines 10
        exit 1
    else
        sleep 5
    fi
done

# 프론트엔드 헬스 체크
for i in {1..5}; do
    log_with_timestamp "🔍 프론트엔드 체크 $i/5..."
    START_TIME=$(date +%s%N)
    if curl -f -s --max-time 10 "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
        END_TIME=$(date +%s%N)
        RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
        log_with_timestamp "✅ 프론트엔드 서비스 정상 (응답시간: ${RESPONSE_TIME}ms, 포트: $FRONTEND_PORT)"
        break
    elif [ $i -eq 5 ]; then
        log_with_timestamp "❌ 프론트엔드 헬스 체크 실패"
        pm2 logs dailymeal-frontend --lines 10
        exit 1
    else
        sleep 5
    fi
done

# 5. PM2 자동 시작 설정
log_with_timestamp "⚙️ PM2 자동 시작 설정..."
pm2 save
pm2 startup --no-daemon 2>/dev/null || true

# 6. 최종 성능 리포트 생성
log_with_timestamp "📊 최종 성능 리포트 생성..."
mkdir -p logs

REPORT_FILE="logs/deploy-report-$(date +%Y%m%d-%H%M%S).log"
{
    echo "=========================================="
    echo "DailyMeal 배포 성능 리포트"
    echo "배포 완료 시간: $(date)"
    echo "환경: $NODE_ENV"
    echo "=========================================="
    echo ""
    
    echo "📊 최종 시스템 상태:"
    measure_resources "배포 완료"
    
    echo "🔄 PM2 프로세스 상태:"
    pm2 list
    
    echo ""
    echo "📈 메모리 사용량 상세:"
    pm2 monit --no-colors | head -15
    
    echo ""
    echo "🌐 네트워크 포트 상태:"
    netstat -tlnp 2>/dev/null | grep -E ":$BACKEND_PORT|:$FRONTEND_PORT" || echo "포트 정보 없음"
    
} > "$REPORT_FILE"

measure_resources "최종 상태"

echo ""
log_with_timestamp "🎉 DailyMeal 배포 완료!"
echo "=========================================="
echo "📱 서비스 주소:"
echo "   � 프론트엔드: http://localhost:$FRONTEND_PORT"
echo "   🔧 백엔드 API: http://localhost:$BACKEND_PORT"
echo "   📚 API 문서: http://localhost:$BACKEND_PORT/api-docs"
echo ""
echo "🎯 렌더링 방식:"
echo "   📄 Static (ISR): /, /feed, /profile (빠른 로딩)"
echo "   🔄 SSR: /restaurants/[id] (SEO 최적화, 공유 기능)"
echo ""
echo "📊 성능 정보:"
echo "   💾 메모리 제한: $(echo $NODE_OPTIONS | grep -o '[0-9]*'MB)"
echo "   📄 성능 리포트: $REPORT_FILE"
echo ""
echo "🔧 관리 명령어:"
echo "   pm2 list              # 프로세스 상태 확인"
echo "   pm2 logs              # 로그 실시간 확인"
echo "   pm2 monit             # 리소스 모니터링"
echo "   pm2 restart all       # 전체 재시작"
echo "   pm2 stop all          # 전체 정지"
echo "=========================================="