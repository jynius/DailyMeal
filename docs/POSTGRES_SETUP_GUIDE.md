# PostgreSQL 설치 및 초기 설정 가이드

## 📋 개요

DailyMeal은 PostgreSQL 16을 사용합니다. 이 가이드는 새로운 서버에서 PostgreSQL을 설치하고 DailyMeal 데이터베이스를 설정하는 방법을 설명합니다.

---

## 🚀 빠른 시작 (자동 설치)

### 1. PostgreSQL 설치 및 데이터베이스 생성

```bash
cd backend
sudo bash scripts/setup-postgres.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- ✅ PostgreSQL 16 설치
- ✅ 서비스 시작 및 자동 시작 설정
- ✅ `dailymeal` 데이터베이스 생성
- ✅ `dailymeal_user` 사용자 생성 및 권한 부여

### 2. 환경 변수 설정

`backend/.env` 파일 확인:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dailymeal_user
DB_PASSWORD=dailymeal2024!
DB_NAME=dailymeal
```

### 3. 애플리케이션 시작

TypeORM이 자동으로 테이블을 생성합니다 (synchronize=false일 경우 수동 생성 필요):

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
```

### 3. 데이터베이스 및 사용자 생성

```bash
sudo -u postgres psql

CREATE USER dailymeal_user WITH PASSWORD 'dailymeal2024!';
CREATE DATABASE dailymeal OWNER dailymeal_user;
GRANT ALL PRIVILEGES ON DATABASE dailymeal TO dailymeal_user;

\c dailymeal
GRANT ALL ON SCHEMA public TO dailymeal_user;
GRANT CREATE ON SCHEMA public TO dailymeal_user;

\q
```

### 4. 테이블 생성 (SQL 스크립트 사용)

```bash
psql -U dailymeal_user -d dailymeal -f backend/scripts/create-tables.sql
```

또는 TypeORM synchronize 기능 사용 (app.module.ts에서 `synchronize: true` 설정)

---

## 📊 데이터베이스 구조

### 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 정보 |
| `meal_records` | 식사 기록 |
| `friendships` | 친구 관계 |
| `user_settings` | 사용자 설정 |
| `meal_shares` | 식사 공유 정보 |
| `share_tracking` | 공유 추적 |

### 주요 인덱스

- `meal_records`: userId, createdAt, location
- `friendships`: userId, friendId
- `meal_shares`: shareId, mealId
- `share_tracking`: sessionId, recipientId

---

## 🔍 데이터베이스 확인

### PostgreSQL 콘솔 접속

```bash
sudo -u postgres psql -d dailymeal
```

### 테이블 목록 확인

```sql
\dt
```

### 데이터 확인

```sql
-- 사용자 목록
SELECT id, email, name FROM users;

-- 식사 기록 통계
SELECT 
  u.name,
  COUNT(m.id) as meal_count,
  AVG(m.rating) as avg_rating
FROM users u
LEFT JOIN meal_records m ON u.id = m."userId"
GROUP BY u.id, u.name;
```

---

## 🛠️ 운영 관리

### 백업

```bash
# 데이터베이스 백업
pg_dump -U dailymeal_user dailymeal > backup_$(date +%Y%m%d).sql

# 압축 백업
pg_dump -U dailymeal_user dailymeal | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 복원

```bash
# 백업 복원
psql -U dailymeal_user -d dailymeal < backup_20251010.sql

# 압축 파일 복원
gunzip -c backup_20251010.sql.gz | psql -U dailymeal_user -d dailymeal
```

### 데이터베이스 초기화

```bash
# 모든 테이블 삭제 후 재생성
sudo -u postgres psql -d dailymeal << EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO dailymeal_user;
EOF

# 테이블 재생성
psql -U dailymeal_user -d dailymeal -f backend/scripts/create-tables.sql

# 초기 데이터 입력
node backend/scripts/seed-initial-data.js
```

---

## 🔒 보안 설정

### 비밀번호 변경

```sql
ALTER USER dailymeal_user WITH PASSWORD 'new_secure_password';
```

**프로덕션 환경에서는 반드시 강력한 비밀번호로 변경하세요!**

### PostgreSQL 접근 제한

`/etc/postgresql/16/main/pg_hba.conf` 편집:

```
# IPv4 로컬 연결만 허용
host    dailymeal    dailymeal_user    127.0.0.1/32    scram-sha-256

# 특정 IP만 허용 (예: 192.168.1.100)
host    dailymeal    dailymeal_user    192.168.1.100/32    scram-sha-256
```

재시작:
```bash
sudo systemctl restart postgresql
```

---

## ⚠️ 문제 해결

### PostgreSQL 서비스가 시작되지 않음

```bash
# 로그 확인
sudo journalctl -u postgresql

# 상태 확인
sudo systemctl status postgresql
```

### 연결 거부 오류

```bash
# PostgreSQL이 리스닝 중인지 확인
sudo netstat -tuln | grep 5432

# pg_hba.conf 설정 확인
sudo cat /etc/postgresql/16/main/pg_hba.conf
```

### 권한 오류

```bash
# 권한 재부여
sudo -u postgres psql -d dailymeal << EOF
GRANT ALL PRIVILEGES ON DATABASE dailymeal TO dailymeal_user;
GRANT ALL ON SCHEMA public TO dailymeal_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO dailymeal_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO dailymeal_user;
EOF
```

---

## 📚 관련 문서

- [DATABASE.md](./DATABASE.md) - 데이터베이스 구조 상세 설명
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 환경 변수 설정
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

---

## 💡 팁

1. **개발 환경**: TypeORM의 `synchronize: true`를 사용하면 Entity 변경 시 자동으로 스키마 업데이트
2. **프로덕션 환경**: `synchronize: false`로 설정하고 마이그레이션 스크립트 사용 권장
3. **백업 자동화**: cron으로 정기적인 백업 설정 권장
4. **모니터링**: `pg_stat_activity`로 실행 중인 쿼리 모니터링 가능

```sql
-- 실행 중인 쿼리 확인
SELECT pid, usename, application_name, state, query 
FROM pg_stat_activity 
WHERE datname = 'dailymeal';
```
