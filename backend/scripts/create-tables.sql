-- DailyMeal PostgreSQL 테이블 생성 스크립트
-- 사용법: psql -U dailymeal_user -d dailymeal -f create-tables.sql

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  "profileImage" VARCHAR(255),
  bio TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON COLUMN users.email IS '이메일 (로그인 ID)';
COMMENT ON COLUMN users.password IS '암호화된 비밀번호';
COMMENT ON COLUMN users.bio IS '자기소개';

-- 2. meal_records 테이블
CREATE TABLE IF NOT EXISTS meal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  photo VARCHAR(255),
  photos TEXT,
  location VARCHAR(255),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  address VARCHAR(255),
  rating INTEGER,
  memo VARCHAR(200),
  price DECIMAL(10,2),
  category VARCHAR(50) DEFAULT 'restaurant',
  "companionIds" TEXT,
  "companionNames" VARCHAR(200),
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE meal_records IS '식사 기록';
COMMENT ON COLUMN meal_records.category IS '식사 카테고리: home(집밥), delivery(배달), restaurant(식당)';
COMMENT ON COLUMN meal_records.rating IS '평점 (1-5)';
COMMENT ON COLUMN meal_records."companionIds" IS '함께한 친구 ID (JSON 배열)';

CREATE INDEX idx_meal_records_userId ON meal_records("userId");
CREATE INDEX idx_meal_records_createdAt ON meal_records("createdAt");
CREATE INDEX idx_meal_records_location ON meal_records(location);

-- 3. friendships 테이블
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "friendId" UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  "notificationEnabled" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("friendId") REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE friendships IS '친구 관계';
COMMENT ON COLUMN friendships.status IS '상태: pending(요청중), accepted(수락), rejected(거절), blocked(차단)';

CREATE INDEX idx_friendships_userId ON friendships("userId");
CREATE INDEX idx_friendships_friendId ON friendships("friendId");
CREATE UNIQUE INDEX idx_friendships_unique ON friendships("userId", "friendId");

-- 4. user_settings 테이블
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL UNIQUE,
  "notificationFriendRequest" BOOLEAN DEFAULT TRUE,
  "notificationNewReview" BOOLEAN DEFAULT TRUE,
  "notificationNearbyFriend" BOOLEAN DEFAULT FALSE,
  "privacyProfilePublic" BOOLEAN DEFAULT FALSE,
  "privacyShowLocation" BOOLEAN DEFAULT TRUE,
  "privacyShowMealDetails" BOOLEAN DEFAULT TRUE,
  "locationHome" TEXT,
  "locationOffice" TEXT,
  "locationHomeLatitude" DECIMAL(10,7),
  "locationHomeLongitude" DECIMAL(10,7),
  "locationOfficeLatitude" DECIMAL(10,7),
  "locationOfficeLongitude" DECIMAL(10,7),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_settings IS '사용자 설정';

-- 5. meal_shares 테이블
CREATE TABLE IF NOT EXISTS meal_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "shareId" VARCHAR(100) UNIQUE NOT NULL,
  "mealId" UUID NOT NULL,
  "sharerId" UUID NOT NULL,
  "viewCount" INTEGER DEFAULT 0,
  "expiresAt" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("mealId") REFERENCES meal_records(id) ON DELETE CASCADE,
  FOREIGN KEY ("sharerId") REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE meal_shares IS '식사 공유 정보';
COMMENT ON COLUMN meal_shares."shareId" IS '공유 URL의 짧은 ID';
COMMENT ON COLUMN meal_shares."expiresAt" IS '만료 시간 (기본 30일)';

CREATE INDEX idx_meal_shares_shareId ON meal_shares("shareId");
CREATE INDEX idx_meal_shares_mealId ON meal_shares("mealId");

-- 6. share_tracking 테이블
CREATE TABLE IF NOT EXISTS share_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "shareId" UUID NOT NULL,
  "sharerId" UUID NOT NULL,
  "recipientId" UUID,
  "sessionId" VARCHAR(255) NOT NULL,
  "ipAddress" VARCHAR(45),
  "userAgent" VARCHAR(500),
  "viewedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "convertedAt" TIMESTAMP,
  "friendRequestSent" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("shareId") REFERENCES meal_shares(id) ON DELETE CASCADE,
  FOREIGN KEY ("sharerId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("recipientId") REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE share_tracking IS '공유 추적 (조회, 회원가입, 친구요청)';
COMMENT ON COLUMN share_tracking."sessionId" IS '비로그인 사용자 브라우저 식별';
COMMENT ON COLUMN share_tracking."convertedAt" IS '로그인/가입한 시점';

CREATE INDEX idx_share_tracking_sessionId ON share_tracking("sessionId");
CREATE INDEX idx_share_tracking_recipientId ON share_tracking("recipientId");

-- 테이블 생성 완료
SELECT 'Tables created successfully!' as status;
