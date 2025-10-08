#!/bin/bash
# PM2 프로세스 재시작 스크립트

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔄 PM2 프로세스를 재시작합니다..."
echo "📂 프로젝트 루트: $PROJECT_ROOT"

# PM2 프로세스 재시작
pm2 restart all

# 상태 확인
echo ""
echo "📋 현재 PM2 프로세스 상태:"
pm2 list

echo ""
echo "📊 PM2 로그를 확인하려면: pm2 logs"
echo "🌐 프론트엔드: http://localhost:3000"
echo "🚀 백엔드 API: http://localhost:8000"
echo ""
echo "✅ 재시작이 완료되었습니다!"