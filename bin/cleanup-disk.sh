#!/bin/bash
# 디스크 긴급 정리 스크립트 - DailyMeal

echo "🧹 디스크 정리 시작..."
echo "==========================================\n"

# 현재 디스크 사용량
echo "📊 현재 디스크 사용량:"
df -h /
echo ""

# 1. APT 캐시 정리
echo "📦 APT 캐시 정리..."
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y
echo "✅ APT 캐시 정리 완료\n"

# 2. 저널 로그 정리 (7일 이상)
echo "📝 저널 로그 정리..."
sudo journalctl --vacuum-time=7d
echo "✅ 저널 로그 정리 완료\n"

# 3. Snap 이전 버전 정리
echo "📸 Snap 이전 버전 정리..."
DISABLED_SNAPS=$(sudo snap list --all | awk '/disabled/{print $1, $3}')
if [ -n "$DISABLED_SNAPS" ]; then
    echo "$DISABLED_SNAPS" | while read snapname revision; do
        echo "  - $snapname (revision $revision) 제거 중..."
        sudo snap remove "$snapname" --revision="$revision" 2>/dev/null || true
    done
    echo "✅ Snap 정리 완료"
else
    echo "  정리할 Snap 없음"
fi
echo ""

# 4. npm 캐시 정리
echo "📦 npm 캐시 정리..."
npm cache clean --force
echo "✅ npm 캐시 정리 완료\n"

# 5. PM2 로그 정리
echo "📋 PM2 로그 정리..."
pm2 flush 2>/dev/null || echo "  PM2가 실행 중이 아닙니다"
echo "✅ PM2 로그 정리 완료\n"

# 6. 오래된 로그 파일 압축 (10MB 이상)
echo "🗜️  시스템 로그 압축..."
sudo find /var/log -type f -name "*.log" -size +10M -exec gzip {} \; 2>/dev/null || true
echo "✅ 로그 압축 완료\n"

# 7. 프로젝트 로그 정리 (선택적)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "🗂️  프로젝트 로그 정리..."
find "$PROJECT_ROOT" -type f -name "*.log" -size +10M -delete 2>/dev/null || true
echo "✅ 프로젝트 로그 정리 완료\n"

# 8. .next 캐시 정리 (재생성 가능)
echo "🗄️  Next.js 캐시 정리..."
if [ -d "$PROJECT_ROOT/frontend/.next/cache" ]; then
    rm -rf "$PROJECT_ROOT/frontend/.next/cache"
    echo "✅ .next 캐시 제거 완료"
else
    echo "  .next 캐시 없음"
fi
echo ""

echo "==========================================\n"
echo "✅ 디스크 정리 완료!\n"

# 정리 후 디스크 사용량
echo "📊 정리 후 디스크 사용량:"
df -h /
echo ""

# 확보된 용량 계산은 수동으로 확인
echo "💡 팁: 더 많은 공간이 필요하면 EBS 볼륨 확장을 고려하세요."
echo "   문서: docs/DISK_CLEANUP_GUIDE.md"
