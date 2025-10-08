# 📊 DailyMeal 데이터베이스 문서

## 개요

DailyMeal은 개발 환경에서 **SQLite**, 프로덕션 환경에서 **PostgreSQL**을 사용합니다.

- **개발**: `backend/data/dev.sqlite` (SQLite 파일)
- **프로덕션**: PostgreSQL 서버 연결 (환경 변수 설정)

💡 **PostgreSQL로 마이그레이션하기**: [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) 가이드를 참조하세요.

---

## 📋 테이블 구조

### 1. `users` 테이블

사용자 계정 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | varchar (UUID) | PRIMARY KEY | 사용자 고유 ID |
| `email` | varchar | UNIQUE, NOT NULL | 이메일 주소 (로그인 ID) |
| `password` | varchar | NOT NULL | 암호화된 비밀번호 (bcrypt) |
| `name` | varchar | NOT NULL | 사용자 이름 |
| `profileImage` | varchar | NULLABLE | 프로필 이미지 URL |
| `createdAt` | datetime | NOT NULL | 생성일시 |
| `updatedAt` | datetime | NOT NULL | 수정일시 |

**관계:**
- `users` 1 : N `meal_records` (한 사용자가 여러 식사 기록 작성)

**인덱스:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `email`

**샘플 데이터:**
```sql
-- 현재 개발 DB에 1명의 사용자 등록됨
ID:    77cf40ac-a2b6-40ed-96f0-50b6ad861ed3
Email: jynius@sqisoft.com
Name:  안정규
```

---

### 2. `meal_records` 테이블

사용자의 식사 기록을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | varchar (UUID) | PRIMARY KEY | 식사 기록 고유 ID |
| `name` | varchar | NOT NULL | 음식 이름 |
| `photo` | varchar | NULLABLE | 대표 사진 URL (레거시) |
| `photos` | TEXT (JSON) | NULLABLE | 다중 사진 배열 `["url1", "url2", ...]` |
| `location` | varchar | NULLABLE | 장소명 (예: "홍대 이탈리안 식당") |
| `latitude` | decimal(10,7) | NULLABLE | GPS 위도 |
| `longitude` | decimal(10,7) | NULLABLE | GPS 경도 |
| `address` | varchar | NULLABLE | 상세 주소 (GPS 역변환) |
| `rating` | INTEGER | NOT NULL | 별점 (1-5) |
| `memo` | varchar(200) | NULLABLE | 메모 (최대 200자) |
| `price` | decimal(10,2) | NULLABLE | 가격 (원) |
| `userId` | varchar (UUID) | NOT NULL, FOREIGN KEY | 작성자 ID |
| `createdAt` | datetime | NOT NULL | 생성일시 |
| `updatedAt` | datetime | NOT NULL | 수정일시 |

**관계:**
- `meal_records` N : 1 `users` (외래키: `userId`)

**인덱스:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `userId` → `users.id`

**샘플 데이터 (최근 5개):**
```sql
1. 김치찌게 @ 근처 정식집
   별점: ⭐⭐⭐⭐⭐ | 가격: ₩11,000
   
2. 크림 파스타 @ 홍대 이탈리안 식당
   별점: ⭐⭐⭐⭐⭐ | 가격: ₩20,000
```

---

## 🔧 데이터베이스 설정

### TypeORM 설정 (`backend/src/app.module.ts`)

```typescript
TypeOrmModule.forRoot(
  (() => {
    const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
    const common = {
      entities: [User, MealRecord],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    };

    if (dbType === 'postgres' || dbType === 'postgresql') {
      // 프로덕션: PostgreSQL
      return {
        type: 'postgres' as const,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'dailymeal',
        ...common,
      };
    }

    // 개발: SQLite
    return {
      type: 'sqlite' as const,
      database: join(__dirname, '..', 'data', 'dev.sqlite'),
      ...common,
    };
  })(),
)
```

### 환경 변수 설정

**개발 환경 (기본값):**
```bash
# DB_TYPE 미설정 또는 'sqlite'
# 파일 경로: backend/data/dev.sqlite
```

**프로덕션 환경:**
```bash
DB_TYPE=postgres
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=dailymeal
```

---

## 🛠️ 데이터베이스 관리

### 1. 데이터베이스 검사 스크립트

프로젝트에 포함된 검사 스크립트로 DB 내용 확인:

```bash
# backend 디렉토리에서 실행
node scripts/inspect-db.js
```

**출력 내용:**
- 📋 테이블 목록
- 🏗️ 테이블 스키마
- 📊 데이터 통계 (각 테이블의 row 수)
- 👤 Users 샘플 데이터 (최근 3개)
- 🍽️ Meal Records 샘플 데이터 (최근 5개)
- 📈 사용자별 식사 기록 통계

### 2. TypeORM Synchronize

**개발 환경:**
```typescript
synchronize: true  // Entity 변경 시 자동으로 테이블 스키마 업데이트
```

⚠️ **주의**: `synchronize: true`는 기존 데이터 손실 가능성이 있으므로 **프로덕션에서는 절대 사용 금지**

**프로덕션 환경:**
```typescript
synchronize: false  // 수동 마이그레이션 필요
```

### 3. 데이터베이스 초기화 (개발용)

개발 환경에서 DB를 완전히 초기화하려면:

```bash
# 1. 서버 중지
npm run stop

# 2. SQLite 파일 삭제
rm backend/data/dev.sqlite

# 3. 서버 재시작 (TypeORM이 자동으로 테이블 생성)
npm run dev:pm2
```

---

## 📊 현재 데이터베이스 상태

### 통계 (2025-10-09 기준)

| 테이블 | 레코드 수 |
|--------|-----------|
| `users` | 1 |
| `meal_records` | 10 |

### 사용자별 식사 기록 통계

| 사용자 | 식사 기록 | 평균 별점 | 총 지출 |
|--------|-----------|-----------|---------|
| 안정규 (jynius@sqisoft.com) | 10개 | 5.0 | ₩312,000 |

### 최근 식사 기록 (Top 5)

1. **김치찌개** @ 근처 정식집
   - 별점: ⭐⭐⭐⭐⭐
   - 가격: ₩11,000
   - 등록일: 2025-10-07

2. **크림 파스타** @ 홍대 이탈리안 식당
   - 별점: ⭐⭐⭐⭐⭐
   - 가격: ₩20,000
   - 등록일: 2025-10-04

---

## 🔍 SQL 쿼리 예제

### 사용자 생성
```sql
INSERT INTO users (id, email, password, name, createdAt, updatedAt)
VALUES (
  '새로운-UUID',
  'user@example.com',
  '암호화된-비밀번호',
  '홍길동',
  datetime('now'),
  datetime('now')
);
```

### 식사 기록 생성
```sql
INSERT INTO meal_records (
  id, name, location, rating, price, userId, createdAt, updatedAt
)
VALUES (
  '새로운-UUID',
  '비빔밥',
  '강남역 한식당',
  5,
  12000,
  '사용자-UUID',
  datetime('now'),
  datetime('now')
);
```

### 사용자별 식사 통계 조회
```sql
SELECT 
  u.name,
  u.email,
  COUNT(m.id) as meal_count,
  AVG(m.rating) as avg_rating,
  SUM(m.price) as total_spent
FROM users u
LEFT JOIN meal_records m ON u.id = m.userId
GROUP BY u.id
ORDER BY meal_count DESC;
```

### 최근 식사 기록 조회
```sql
SELECT 
  m.name,
  m.location,
  m.rating,
  m.price,
  m.createdAt,
  u.name as user_name
FROM meal_records m
INNER JOIN users u ON m.userId = u.id
ORDER BY m.createdAt DESC
LIMIT 10;
```

### 위치 기반 검색 (GPS 활용)
```sql
SELECT 
  name,
  location,
  latitude,
  longitude,
  rating,
  price
FROM meal_records
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
ORDER BY createdAt DESC;
```

---

## 🚀 마이그레이션 전략

### 개발 → 프로덕션 전환

1. **PostgreSQL 설치 및 설정**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # 데이터베이스 생성
   sudo -u postgres createdb dailymeal
   
   # 사용자 생성 및 권한 부여
   sudo -u postgres psql
   CREATE USER dailymeal_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE dailymeal TO dailymeal_user;
   ```

2. **환경 변수 설정**
   ```bash
   # ecosystem.config.js 또는 .env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=dailymeal_user
   DB_PASSWORD=secure_password
   DB_NAME=dailymeal
   ```

3. **첫 실행 (자동 스키마 생성)**
   ```bash
   # synchronize: true 상태에서 첫 실행
   npm run deploy
   
   # TypeORM이 자동으로 테이블 생성
   ```

4. **데이터 마이그레이션 (선택)**
   ```bash
   # SQLite → PostgreSQL 데이터 이관 (필요시)
   # pgloader 도구 사용 또는 수동 export/import
   ```

---

## 📝 Entity 파일 위치

- **User Entity**: `backend/src/entities/user.entity.ts`
- **MealRecord Entity**: `backend/src/entities/meal-record.entity.ts`

Entity 파일을 수정하면 TypeORM이 자동으로 스키마를 업데이트합니다 (개발 환경에서만).

---

## ⚠️ 주의사항

### 개발 환경
- ✅ `synchronize: true` 사용 가능
- ✅ SQLite 파일 삭제로 간단히 초기화 가능
- ⚠️ SQLite는 동시성 제한 있음 (단일 파일)

### 프로덕션 환경
- ❌ `synchronize: false` 필수 (데이터 손실 방지)
- ✅ PostgreSQL 사용 권장 (동시성, 성능)
- ⚠️ 스키마 변경 시 수동 마이그레이션 필요

### 보안
- 🔒 `password` 컬럼은 bcrypt로 암호화됨
- 🔒 환경 변수로 DB 인증 정보 관리
- 🔒 프로덕션 DB 패스워드는 강력하게 설정

---

## 🔗 관련 문서

- [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) - PostgreSQL 마이그레이션 가이드 🔄
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 환경 변수 설정 가이드
- [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md) - 배포 가이드
- [TypeORM 공식 문서](https://typeorm.io/)

---

**작성일**: 2025-10-09
**최종 업데이트**: 2025-10-09
**상태**: ✅ 완료
