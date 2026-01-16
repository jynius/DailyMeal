#!/bin/bash

# 사진 메타데이터 재처리 스크립트
# 기존 식사 기록의 사진에서 EXIF 정보를 재추출하여 DB 업데이트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "  사진 메타데이터 재처리"
echo "========================================"
echo ""

# Backend 디렉토리로 이동
cd "$PROJECT_ROOT/backend"

# .env 파일 로드
if [ -f .env ]; then
    echo "✅ .env 파일 로드 중..."
    set -a
    source .env
    set +a
else
    echo "⚠️  .env 파일이 없습니다. 기본값을 사용합니다."
fi

echo ""
echo "🔄 재처리 시작..."
echo ""

# TypeScript 스크립트 실행
npx ts-node scripts/reprocess-photo-metadata.ts

echo ""
echo "✅ 재처리 완료!"
