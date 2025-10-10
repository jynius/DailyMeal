#!/bin/bash

# PostgreSQL 설치 및 DailyMeal 데이터베이스 설정 스크립트
# 사용법: sudo bash setup-postgres.sh

set -e  # 에러 발생 시 즉시 종료

echo "🐘 PostgreSQL 설치 및 설정 시작..."
echo "=========================================="

# 1. PostgreSQL 설치 확인
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL 설치 중..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    echo "✅ PostgreSQL 설치 완료"
else
    echo "✅ PostgreSQL이 이미 설치되어 있습니다."
    psql --version
fi

# 2. PostgreSQL 서비스 시작
echo ""
echo "🔄 PostgreSQL 서비스 시작..."
systemctl start postgresql
systemctl enable postgresql
echo "✅ PostgreSQL 서비스 시작됨"

# 3. 데이터베이스 및 사용자 생성
echo ""
echo "👤 데이터베이스 및 사용자 생성..."

# 환경 변수 또는 기본값 사용
DB_NAME="${DB_NAME:-dailymeal}"
DB_USER="${DB_USERNAME:-dailymeal_user}"
DB_PASSWORD="${DB_PASSWORD:-dailymeal2024!}"

sudo -u postgres psql << EOF
-- 기존 데이터베이스 및 사용자 삭제 (있을 경우)
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};

-- 새로운 사용자 생성
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- 새로운 데이터베이스 생성
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- 데이터베이스 연결
\c ${DB_NAME}

-- 스키마 권한 부여
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT CREATE ON SCHEMA public TO ${DB_USER};

-- 향후 생성될 테이블에 대한 권한
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};

EOF

echo "✅ 데이터베이스 '${DB_NAME}' 생성 완료"
echo "✅ 사용자 '${DB_USER}' 생성 완료"

# 4. 완료 메시지
echo ""
echo "=========================================="
echo "🎉 PostgreSQL 설정 완료!"
echo "=========================================="
echo ""
echo "📋 연결 정보:"
echo "  Database: ${DB_NAME}"
echo "  Username: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo "  Host:     localhost"
echo "  Port:     5432"
echo ""
echo "💡 다음 단계:"
echo "  1. backend/.env 파일 확인"
echo "  2. npm run start (TypeORM이 자동으로 테이블 생성)"
echo "  3. node scripts/seed-initial-data.js (초기 데이터 입력)"
echo ""
