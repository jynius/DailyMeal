# PostgreSQL 마이그레이션 가이드

## 개요

개발 환경의 SQLite 데이터를 프로덕션 PostgreSQL로 마이그레이션하는 가이드입니다.

---

## 🎯 마이그레이션 시나리오

### 시나리오 1: 새로운 PostgreSQL 서버
처음으로 PostgreSQL을 설정하고 데이터를 이전하는 경우

### 시나리오 2: 기존 PostgreSQL 업데이트
이미 PostgreSQL이 실행 중이고 SQLite의 최신 데이터로 업데이트하는 경우

---

## 📋 사전 준비

### 1. PostgreSQL 설치 및 설정

**Ubuntu/Debian:**
```bash
# PostgreSQL 설치
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- [PostgreSQL 공식 다운로드](https://www.postgresql.org/download/windows/)

### 2. 데이터베이스 및 사용자 생성

```bash
# PostgreSQL 슈퍼유저로 접속
sudo -u postgres psql

# PostgreSQL 콘솔에서 실행
CREATE DATABASE dailymeal;
CREATE USER dailymeal_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE dailymeal TO dailymeal_user;

# PostgreSQL 15+ 추가 설정
\c dailymeal
GRANT ALL ON SCHEMA public TO dailymeal_user;
GRANT CREATE ON SCHEMA public TO dailymeal_user;

# 종료
\q
```

### 3. pg npm 패키지 설치

```bash
cd backend
npm install pg
```

### 4. 환경 변수 설정

**backend/.env** (또는 ecosystem.config.js에 추가):
```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dailymeal_user
DB_PASSWORD=your_secure_password
DB_NAME=dailymeal
```

---

## 🚀 마이그레이션 실행

### 방법 1: 마이그레이션 스크립트 사용 (권장)

**단계별 실행:**

```bash
# 1. backend 디렉토리로 이동
cd backend

# 2. 환경 변수 설정 (임시)
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=dailymeal_user
export DB_PASSWORD=your_secure_password
export DB_NAME=dailymeal

# 3. 마이그레이션 실행
node scripts/migrate-to-postgres.js
```

**출력 예시:**
```
🔄 SQLite → PostgreSQL 마이그레이션 시작
==========================================
📁 SQLite: /path/to/backend/data/dev.sqlite
🐘 PostgreSQL: localhost:5432/dailymeal

✅ SQLite 연결 성공
✅ PostgreSQL 연결 성공

📦 PostgreSQL 테이블 생성...
==========================================
✅ users 테이블 생성 완료
✅ meal_records 테이블 생성 완료
✅ 인덱스 생성 완료

👤 Users 데이터 마이그레이션...
==========================================
  ✅ jynius@sqisoft.com (안정규)

✅ 1명의 사용자 마이그레이션 완료

🍽️  Meal Records 데이터 마이그레이션...
==========================================
  ✅ 김치찌개 @ 근처 정식집
  ✅ 크림 파스타 @ 홍대 이탈리안 식당
  ...

✅ 10개의 식사 기록 마이그레이션 완료

📊 마이그레이션 결과 통계
==========================================
  Users:        1 rows
  Meal Records: 10 rows

👥 사용자별 통계:
  안정규 (jynius@sqisoft.com)
    - 식사 기록: 10개
    - 평균 별점: 5.0
    - 총 지출: ₩312,000

🎉 마이그레이션 완료!
```

### 방법 2: TypeORM Synchronize 사용 (빈 DB만)

데이터 없이 테이블 구조만 생성하는 경우:

```bash
# 1. 환경 변수 설정
export DB_TYPE=postgres
export DB_HOST=localhost
export DB_USERNAME=dailymeal_user
export DB_PASSWORD=your_secure_password
export DB_NAME=dailymeal

# 2. 서버 시작 (synchronize: true로 자동 생성)
npm run start:dev

# TypeORM이 자동으로 테이블 생성
```

⚠️ **주의**: 이 방법은 기존 데이터를 이전하지 않고 빈 테이블만 생성합니다.

---

## 🔍 마이그레이션 검증

### 1. PostgreSQL 접속 및 확인

```bash
# PostgreSQL 접속
psql -h localhost -U dailymeal_user -d dailymeal

# 테이블 목록 확인
\dt

# 테이블 구조 확인
\d users
\d meal_records

# 데이터 확인
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM meal_records;

# 사용자별 식사 기록 통계
SELECT 
  u.name,
  COUNT(m.id) as meal_count
FROM users u
LEFT JOIN meal_records m ON u.id = m."userId"
GROUP BY u.id, u.name;

# 종료
\q
```

### 2. 애플리케이션 테스트

```bash
# 프로덕션 모드로 서버 시작
npm run build
npm run start:prod

# 또는 PM2로
npm run deploy
```

**확인 사항:**
- ✅ 서버가 정상 시작되는지
- ✅ 로그인이 정상 작동하는지
- ✅ 식사 기록 목록이 표시되는지
- ✅ 새 식사 기록 생성이 가능한지

---

## 🔧 트러블슈팅

### 문제 1: 연결 실패 (ECONNREFUSED)

**원인**: PostgreSQL 서버가 실행되지 않거나 방화벽 차단

**해결:**
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 시작
sudo systemctl start postgresql

# 포트 확인
sudo netstat -plnt | grep 5432
```

### 문제 2: 인증 실패 (password authentication failed)

**원인**: 잘못된 비밀번호 또는 pg_hba.conf 설정

**해결:**
```bash
# pg_hba.conf 확인
sudo nano /etc/postgresql/14/main/pg_hba.conf

# 다음 라인 추가 (개발 환경)
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5

# PostgreSQL 재시작
sudo systemctl restart postgresql
```

### 문제 3: 권한 부족 (permission denied for schema public)

**원인**: PostgreSQL 15+ 기본 권한 변경

**해결:**
```sql
-- PostgreSQL에 접속
sudo -u postgres psql dailymeal

-- 권한 부여
GRANT ALL ON SCHEMA public TO dailymeal_user;
GRANT CREATE ON SCHEMA public TO dailymeal_user;
ALTER DATABASE dailymeal OWNER TO dailymeal_user;
```

### 문제 4: 외래키 제약 위반

**원인**: 데이터 순서 문제 (meal_records를 users보다 먼저 삽입)

**해결**: 스크립트는 자동으로 users → meal_records 순서로 마이그레이션합니다.

---

## 🔄 재마이그레이션 (데이터 업데이트)

기존 PostgreSQL 데이터를 최신 SQLite 데이터로 업데이트하는 경우:

### 옵션 1: 테이블 삭제 후 재생성

```bash
# PostgreSQL 접속
psql -h localhost -U dailymeal_user -d dailymeal

# 테이블 삭제 (순서 중요!)
DROP TABLE IF EXISTS meal_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# 종료
\q

# 마이그레이션 재실행
node scripts/migrate-to-postgres.js
```

### 옵션 2: UPSERT (충돌 시 업데이트)

마이그레이션 스크립트는 이미 `ON CONFLICT DO UPDATE` 구문을 사용하므로, 재실행하면 자동으로 업데이트됩니다.

```bash
# 그냥 재실행
node scripts/migrate-to-postgres.js
```

---

## 📊 성능 최적화

### 인덱스 추가

마이그레이션 스크립트는 기본 인덱스만 생성합니다. 추가 인덱스:

```sql
-- 위치 기반 검색용
CREATE INDEX idx_meal_records_location ON meal_records(location);

-- GPS 검색용
CREATE INDEX idx_meal_records_coordinates ON meal_records(latitude, longitude);

-- 별점 검색용
CREATE INDEX idx_meal_records_rating ON meal_records(rating);

-- 복합 인덱스 (사용자 + 날짜)
CREATE INDEX idx_meal_records_user_date ON meal_records("userId", "createdAt" DESC);
```

### 통계 정보 업데이트

```sql
-- 테이블 분석 (쿼리 최적화용)
ANALYZE users;
ANALYZE meal_records;

-- 통계 확인
SELECT * FROM pg_stat_user_tables;
```

---

## 🔐 보안 설정

### 1. 강력한 비밀번호 사용

```sql
-- 비밀번호 변경
ALTER USER dailymeal_user WITH PASSWORD 'very_secure_complex_password_123!@#';
```

### 2. 원격 접속 제한

**postgresql.conf:**
```conf
# 로컬 접속만 허용 (개발)
listen_addresses = 'localhost'

# 또는 특정 IP만 허용 (프로덕션)
listen_addresses = '10.0.0.100'
```

**pg_hba.conf:**
```conf
# 특정 IP에서만 접속 허용
host    dailymeal       dailymeal_user  10.0.0.0/24     md5
```

### 3. SSL 연결 (프로덕션)

```javascript
// backend/src/app.module.ts
{
  type: 'postgres',
  host: process.env.DB_HOST,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  // ...
}
```

---

## 📝 체크리스트

마이그레이션 전:
- [ ] PostgreSQL 설치 및 실행 확인
- [ ] 데이터베이스 및 사용자 생성
- [ ] 환경 변수 설정
- [ ] pg npm 패키지 설치
- [ ] SQLite 백업 (`cp data/dev.sqlite data/dev.sqlite.backup`)

마이그레이션:
- [ ] 마이그레이션 스크립트 실행
- [ ] 에러 없이 완료되었는지 확인
- [ ] 데이터 개수 확인 (users, meal_records)

마이그레이션 후:
- [ ] PostgreSQL 접속 테스트
- [ ] 테이블 구조 확인
- [ ] 샘플 데이터 조회
- [ ] 애플리케이션 실행 테스트
- [ ] 로그인 테스트
- [ ] API 기능 테스트

---

## 🔗 관련 문서

- [DATABASE.md](./DATABASE.md) - 데이터베이스 구조
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 환경 변수 설정
- [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md) - 프로덕션 배포

---

**작성일**: 2025-10-09
**최종 업데이트**: 2025-10-09
**상태**: ✅ 완료
