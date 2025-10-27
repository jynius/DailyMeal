# 환경 변수 설정 체크리스트

## 📋 신규 설치 체크리스트

프로젝트를 처음 클론한 후 반드시 확인해야 할 사항들입니다.

### 1. 환경 변수 파일 생성

#### Backend (.env)
```bash
cp backend/.env.example backend/.env
```

**필수 설정 항목:**
- ✅ `DB_USERNAME`: PostgreSQL 사용자 이름 (기본: dailymeal_user)
- ✅ `DB_PASSWORD`: PostgreSQL 비밀번호 (⚠️ 반드시 변경!)
- ✅ `DB_NAME`: 데이터베이스 이름 (기본: dailymeal)
- ✅ `JWT_SECRET`: JWT 서명 키 (⚠️ 프로덕션에서 반드시 변경!)
- ✅ `ENCRYPTION_KEY`: 공유 링크 암호화 키 (32자)

**선택 설정 항목:**
- `DB_HOST`: 데이터베이스 호스트 (기본: localhost)
- `DB_PORT`: 데이터베이스 포트 (기본: 5432)
- `PORT`: API 서버 포트 (기본: 8000)
- `UPLOAD_DIR`: 업로드 디렉토리 (기본: ../uploads)

#### Frontend (.env.local)
```bash
cp frontend/.env.local.example frontend/.env.local
```

**필수 설정 항목:**
- ✅ `NEXT_PUBLIC_API_URL`: Backend API URL
- ✅ `NEXT_PUBLIC_SITE_URL`: Frontend URL
- ✅ `NEXT_PUBLIC_KAKAO_API_KEY`: 카카오 JavaScript API 키

### 2. PostgreSQL 설정

```bash
# 자동 설치 (Ubuntu/Debian)
sudo bash backend/scripts/setup-postgres.sh

# 테이블 생성
psql -U dailymeal_user -d dailymeal -f backend/scripts/create-tables.sql

# 초기 데이터 입력 (선택사항)
node backend/scripts/seed-initial-data.js
```

### 3. 환경 변수 검증

```bash
# Backend 환경 변수 확인
cd backend && node -e "require('dotenv').config(); console.log(process.env.DB_NAME)"

# Frontend 환경 변수 확인 (빌드 시)
cd frontend && npm run build
```

---

## 🚨 환경 변수 누락 시 증상

### Backend

#### DB_USERNAME, DB_PASSWORD, DB_NAME 누락
```
[Nest] ERROR [TypeOrmModule] Unable to connect to the database.
Error: password authentication failed for user "undefined"
```

**해결 방법**: `backend/.env` 파일에 PostgreSQL 인증 정보 추가

#### JWT_SECRET 누락
```
[Nest] WARN JWT secret not configured, using default (insecure!)
```

**해결 방법**: `backend/.env`에 `JWT_SECRET` 추가

#### ENCRYPTION_KEY 누락
```
Error: Invalid encrypted data
```

**해결 방법**: `backend/.env`에 `ENCRYPTION_KEY` 추가 (32자)

### Frontend

#### NEXT_PUBLIC_API_URL 누락
```
TypeError: fetch failed
Request failed: http://undefined/api/...
```

**해결 방법**: `frontend/.env.local`에 `NEXT_PUBLIC_API_URL` 추가

#### NEXT_PUBLIC_KAKAO_API_KEY 누락
```
카카오 맵이 표시되지 않음
Console: Kakao is not defined
```

**해결 방법**: `frontend/.env.local`에 `NEXT_PUBLIC_KAKAO_API_KEY` 추가

---

## ✅ 환경 변수 확인 스크립트

### Backend 환경 변수 확인
```bash
#!/bin/bash
# backend/scripts/check-env.sh

ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ backend/.env 파일이 없습니다!"
  echo "   cp backend/.env.example backend/.env"
  exit 1
fi

echo "✅ backend/.env 파일 존재"

# 필수 변수 확인
REQUIRED_VARS=(
  "DB_USERNAME"
  "DB_PASSWORD"
  "DB_NAME"
  "JWT_SECRET"
  "ENCRYPTION_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" "$ENV_FILE"; then
    echo "⚠️  ${var} 누락!"
  else
    echo "✅ ${var} 설정됨"
  fi
done
```

### Frontend 환경 변수 확인
```bash
#!/bin/bash
# frontend/scripts/check-env.sh

ENV_FILE="frontend/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ frontend/.env.local 파일이 없습니다!"
  echo "   cp frontend/.env.local.example frontend/.env.local"
  exit 1
fi

echo "✅ frontend/.env.local 파일 존재"

# 필수 변수 확인
REQUIRED_VARS=(
  "NEXT_PUBLIC_API_URL"
  "NEXT_PUBLIC_SITE_URL"
  "NEXT_PUBLIC_KAKAO_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" "$ENV_FILE"; then
    echo "⚠️  ${var} 누락!"
  else
    echo "✅ ${var} 설정됨"
  fi
done
```

---

## 🔐 보안 주의사항

### ⚠️ 절대 Git에 커밋하지 말아야 할 파일

```gitignore
# 이미 .gitignore에 포함됨
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 🔒 프로덕션 환경 체크리스트

- [ ] `JWT_SECRET`: 랜덤 생성된 강력한 키 사용
- [ ] `ENCRYPTION_KEY`: 32자 이상 랜덤 키 사용
- [ ] `DB_PASSWORD`: 강력한 비밀번호 (최소 16자, 특수문자 포함)
- [ ] `NODE_ENV=production` 설정
- [ ] 데이터베이스 백업 설정 완료
- [ ] SSL 인증서 설정 완료

### 🔑 비밀 키 생성 방법

```bash
# JWT_SECRET 생성 (64자)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY 생성 (32자)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 16  # ENCRYPTION_KEY
```

---

## 📝 참고 문서

- [환경 변수 설정 가이드](./ENVIRONMENT_SETUP.md) - 상세 설정 방법
- [PostgreSQL 설치 가이드](./POSTGRES_SETUP_GUIDE.md) - DB 설치 및 초기 설정
- [배포 가이드](./BUILD_DEPLOY_GUIDE.md) - 전체 배포 프로세스
