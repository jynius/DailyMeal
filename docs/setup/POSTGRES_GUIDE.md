# PostgreSQL 설정 및 마이그레이션 가이드

> **작성일**: 2025-12-12  
> **대상**: PostgreSQL 16  
> **상태**: ✅ 프로덕션 운영 중

---

## 📋 개요

DailyMeal은 PostgreSQL 16을 데이터베이스로 사용합니다. 이 문서는 PostgreSQL 설치, 초기 설정, SQLite 데이터 마이그레이션을 다룹니다.

---

## 🚀 빠른 시작 (자동 설치)

### 1. PostgreSQL 설치 및 데이터베이스 생성

```bash
cd backend
sudo bash scripts/setup-postgres.sh
```

이 스크립트는 자동으로 수행합니다:
- ✅ PostgreSQL 16 설치
- ✅ 서비스 시작 및 자동 시작 설정
- ✅ `dailymeal` 데이터베이스 생성
- ✅ `dailymeal_user` 사용자 생성 및 권한 부여

### 2. 환경 변수 설정

`backend/.env` 파일 확인:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dailymeal_user
DB_PASSWORD=dailymeal2024!
DB_NAME=dailymeal
```

### 3. 애플리케이션 시작

TypeORM이 자동으로 테이블을 생성합니다:

```bash
# 개발 모드
npm run start:dev

# 또는 PM2
pm2 start ecosystem.dev.config.js
```

### 4. 초기 데이터 입력 (선택사항)

```bash
cd backend
node scripts/seed-initial-data.js
```

**데모 계정:**
- 이메일: `demo@dailymeal.com`
- 비밀번호: `demo1234`

---

## 🔧 수동 설치 (단계별)

### 1. PostgreSQL 설치

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:**
- [PostgreSQL 공식 다운로드](https://www.postgresql.org/download/windows/)

### 2. PostgreSQL 서비스 시작

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql  # 상태 확인
```

### 3. 데이터베이스 및 사용자 생성

```bash
# PostgreSQL 슈퍼유저로 접속
sudo -u postgres psql
```

PostgreSQL 콘솔에서 실행:
```sql
-- 사용자 생성
CREATE USER dailymeal_user WITH PASSWORD 'your_secure_password';

-- 데이터베이스 생성 및 소유권 부여
CREATE DATABASE dailymeal OWNER dailymeal_user;
GRANT ALL PRIVILEGES ON DATABASE dailymeal TO dailymeal_user;

-- dailymeal 데이터베이스로 전환
\c dailymeal

-- 스키마 권한 부여 (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO dailymeal_user;
GRANT CREATE ON SCHEMA public TO dailymeal_user;

-- 종료
\q
```

### 4. 연결 테스트

```bash
psql -U dailymeal_user -d dailymeal -h localhost -p 5432
```

---

## 📦 SQLite → PostgreSQL 마이그레이션

### 마이그레이션이 필요한 경우

- 개발 중 SQLite 데이터를 PostgreSQL로 이전
- 프로덕션 배포 전 테스트 데이터 이전
- 백업 복구

### 마이그레이션 스크립트 사용 (권장)

```bash
cd backend

# 환경 변수 설정
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=dailymeal_user
export DB_PASSWORD=your_secure_password
export DB_NAME=dailymeal

# 마이그레이션 실행
npm run db:migrate
```

**스크립트 동작:**
- SQLite의 모든 테이블 데이터를 PostgreSQL로 복사
- 외래키 제약조건 및 인덱스 자동 생성
- 중복 데이터 자동 업데이트 (UPSERT)
- 진행 상황 및 결과 통계 출력

### 마이그레이션 검증

```bash
# PostgreSQL 접속
sudo -u postgres psql -d dailymeal

# 데이터 확인
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM meal_records;
SELECT COUNT(*) FROM friendships;

# 테이블 구조 확인
\d users
\d meal_records

# 종료
\q
```

---

## 🔍 운영 관리

### 일반적인 작업

**데이터베이스 백업:**
```bash
pg_dump -U dailymeal_user -d dailymeal > backup_$(date +%Y%m%d).sql
```

**백업 복구:**
```bash
psql -U dailymeal_user -d dailymeal < backup_20251212.sql
```

**데이터베이스 초기화 (주의!):**
```bash
sudo -u postgres psql -d dailymeal -c "DROP SCHEMA public CASCADE;"
sudo -u postgres psql -d dailymeal -c "CREATE SCHEMA public;"
sudo -u postgres psql -d dailymeal -c "GRANT ALL ON SCHEMA public TO dailymeal_user;"
```

**연결 확인:**
```bash
sudo -u postgres psql -c "\l"  # 데이터베이스 목록
sudo -u postgres psql -c "\du" # 사용자 목록
```

### 성능 모니터링

**활성 연결 확인:**
```sql
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

**느린 쿼리 확인:**
```sql
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## 🐛 트러블슈팅

### 1. 연결 실패 (ECONNREFUSED)

**증상:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결:**
```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# 서비스 시작
sudo systemctl start postgresql

# 포트 확인
sudo netstat -plnt | grep 5432
```

### 2. 인증 실패 (password authentication failed)

**증상:**
```
FATAL: password authentication failed for user "dailymeal_user"
```

**해결:**
```bash
# 비밀번호 재설정
sudo -u postgres psql
ALTER USER dailymeal_user WITH PASSWORD 'new_password';
\q

# .env 파일 업데이트
DB_PASSWORD=new_password
```

### 3. 권한 부족 (permission denied for schema public)

**증상:**
```
ERROR: permission denied for schema public
```

**해결:**
```bash
sudo -u postgres psql -d dailymeal
GRANT ALL ON SCHEMA public TO dailymeal_user;
GRANT CREATE ON SCHEMA public TO dailymeal_user;
\q
```

### 4. 포트 충돌

**증상:**
```
could not bind IPv4 address "0.0.0.0": Address already in use
```

**해결:**
```bash
# 포트 사용 프로세스 확인
sudo lsof -i :5432

# 기존 프로세스 종료 후 재시작
sudo systemctl restart postgresql

# 또는 다른 포트 사용
# postgresql.conf에서 port 변경 후 재시작
```

---

## 📚 관련 문서

- [환경 설정](ENVIRONMENT_SETUP.md) - 전체 환경 설정 가이드
- [데이터베이스 설정](DATABASE.md) - TypeORM 설정
- [프로덕션 환경 가이드](ENV_PRODUCTION_GUIDE.md) - 프로덕션 배포

---

## 📝 참고 사항

- **프로덕션**: `synchronize: false` 필수 (데이터 손실 방지)
- **개발**: `synchronize: true` 사용 가능 (편의성)
- **마이그레이션**: TypeORM 마이그레이션 기능 사용 권장
- **백업**: 정기적인 백업 스케줄 설정 필수

---

**Last Updated**: 2025-12-12  
**PostgreSQL Version**: 16  
**Status**: ✅ Production Ready
