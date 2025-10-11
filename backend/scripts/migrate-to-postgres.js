/**
 * SQLite → PostgreSQL 마이그레이션 스크립트 (완전 업데이트)
 * 
 * 사용법:
 *   node scripts/migrate-to-postgres.js
 * 
 * 필수 환경 변수:
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 * 
 * 지원 테이블:
 *   - users (bio 컬럼 추가)
 *   - meal_records (category, companionIds, companionNames 추가)
 *   - friendships
 *   - user_settings
 *   - meal_shares
 *   - share_tracking
 */

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

// 설정
const sqlitePath = path.join(__dirname, '..', 'data', 'dev.sqlite');
const postgresConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dailymeal',
};

console.log('🔄 SQLite → PostgreSQL 마이그레이션 시작');
console.log('==========================================');
console.log(`📁 SQLite: ${sqlitePath}`);
console.log(`🐘 PostgreSQL: ${postgresConfig.host}:${postgresConfig.port}/${postgresConfig.database}`);
console.log('');

// 환경 변수 체크
if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD 환경 변수가 설정되지 않았습니다.');
  console.log('\n사용 예시:');
  console.log('  DB_PASSWORD=your_password node scripts/migrate-to-postgres.js');
  process.exit(1);
}

// SQLite 연결
const sqliteDb = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ SQLite 연결 실패:', err.message);
    process.exit(1);
  }
  console.log('✅ SQLite 연결 성공');
});

// PostgreSQL 연결
const pgClient = new Client(postgresConfig);

async function main() {
  try {
    // PostgreSQL 연결
    await pgClient.connect();
    console.log('✅ PostgreSQL 연결 성공\n');

    // 1. 테이블 생성
    await createTables();

    // 2. 데이터 마이그레이션
    await migrateUsers();
    await migrateMealRecords();
    await migrateFriendships();
    await migrateUserSettings();
    await migrateMealShares();
    await migrateShareTracking();

    // 3. 통계 출력
    await printStats();

    console.log('\n🎉 마이그레이션 완료!');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

async function createTables() {
  console.log('📦 PostgreSQL 테이블 생성...');
  console.log('==========================================');

  // 1. users 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      "profileImage" VARCHAR(255),
      bio TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ users 테이블 생성 완료');

  // 2. meal_records 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS meal_records (
      id VARCHAR(36) PRIMARY KEY,
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
      "userId" VARCHAR(36) NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ meal_records 테이블 생성 완료');

  // 3. friendships 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS friendships (
      id VARCHAR(36) PRIMARY KEY,
      "userId" VARCHAR(36) NOT NULL,
      "friendId" VARCHAR(36) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      "notificationEnabled" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY ("friendId") REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ friendships 테이블 생성 완료');

  // 4. user_settings 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id VARCHAR(36) PRIMARY KEY,
      "userId" VARCHAR(36) NOT NULL,
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
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE ("userId")
    )
  `);
  console.log('✅ user_settings 테이블 생성 완료');

  // 5. meal_shares 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS meal_shares (
      id VARCHAR(36) PRIMARY KEY,
      "shareId" VARCHAR(100) UNIQUE NOT NULL,
      "mealId" VARCHAR(36) NOT NULL,
      "sharerId" VARCHAR(36) NOT NULL,
      "viewCount" INTEGER DEFAULT 0,
      "expiresAt" TIMESTAMP,
      "isActive" BOOLEAN DEFAULT TRUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY ("mealId") REFERENCES meal_records(id) ON DELETE CASCADE,
      FOREIGN KEY ("sharerId") REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ meal_shares 테이블 생성 완료');

  // 6. share_tracking 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS share_tracking (
      id VARCHAR(36) PRIMARY KEY,
      "shareId" VARCHAR(36) NOT NULL,
      "sharerId" VARCHAR(36) NOT NULL,
      "recipientId" VARCHAR(36),
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
    )
  `);
  console.log('✅ share_tracking 테이블 생성 완료');

  // 인덱스 생성
  await pgClient.query(`
    CREATE INDEX IF NOT EXISTS idx_meal_records_userId ON meal_records("userId");
    CREATE INDEX IF NOT EXISTS idx_meal_records_createdAt ON meal_records("createdAt");
    CREATE INDEX IF NOT EXISTS idx_friendships_userId ON friendships("userId");
    CREATE INDEX IF NOT EXISTS idx_friendships_friendId ON friendships("friendId");
    CREATE INDEX IF NOT EXISTS idx_meal_shares_shareId ON meal_shares("shareId");
    CREATE INDEX IF NOT EXISTS idx_share_tracking_sessionId ON share_tracking("sessionId");
    CREATE INDEX IF NOT EXISTS idx_share_tracking_recipientId ON share_tracking("recipientId");
  `);
  console.log('✅ 인덱스 생성 완료\n');
}

function migrateUsers() {
  return new Promise((resolve, reject) => {
    console.log('👤 Users 데이터 마이그레이션...');
    console.log('==========================================');

    sqliteDb.all('SELECT * FROM users', [], async (err, users) => {
      if (err) {
        return reject(err);
      }

      if (users.length === 0) {
        console.log('⚠️  마이그레이션할 사용자 데이터가 없습니다.\n');
        return resolve();
      }

      try {
        for (const user of users) {
          await pgClient.query(
            `INSERT INTO users (id, email, password, name, "profileImage", bio, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET
               email = EXCLUDED.email,
               password = EXCLUDED.password,
               name = EXCLUDED.name,
               "profileImage" = EXCLUDED."profileImage",
               bio = EXCLUDED.bio,
               "updatedAt" = EXCLUDED."updatedAt"`,
            [
              user.id,
              user.email,
              user.password,
              user.name,
              user.profileImage,
              user.bio || null,
              user.createdAt,
              user.updatedAt,
            ]
          );
          console.log(`  ✅ ${user.email} (${user.name})`);
        }

        console.log(`\n✅ ${users.length}명의 사용자 마이그레이션 완료\n`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function migrateMealRecords() {
  return new Promise((resolve, reject) => {
    console.log('🍽️  Meal Records 데이터 마이그레이션...');
    console.log('==========================================');

    sqliteDb.all('SELECT * FROM meal_records', [], async (err, records) => {
      if (err) {
        return reject(err);
      }

      if (records.length === 0) {
        console.log('⚠️  마이그레이션할 식사 기록이 없습니다.\n');
        return resolve();
      }

      try {
        for (const record of records) {
          await pgClient.query(
            `INSERT INTO meal_records (
              id, name, photo, photos, location, latitude, longitude, address,
              rating, memo, price, category, "companionIds", "companionNames",
              "userId", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              photo = EXCLUDED.photo,
              photos = EXCLUDED.photos,
              location = EXCLUDED.location,
              latitude = EXCLUDED.latitude,
              longitude = EXCLUDED.longitude,
              address = EXCLUDED.address,
              rating = EXCLUDED.rating,
              memo = EXCLUDED.memo,
              price = EXCLUDED.price,
              category = EXCLUDED.category,
              "companionIds" = EXCLUDED."companionIds",
              "companionNames" = EXCLUDED."companionNames",
              "userId" = EXCLUDED."userId",
              "updatedAt" = EXCLUDED."updatedAt"`,
            [
              record.id,
              record.name,
              record.photo,
              record.photos,
              record.location,
              record.latitude,
              record.longitude,
              record.address,
              record.rating,
              record.memo,
              record.price,
              record.category || 'restaurant',
              record.companionIds,
              record.companionNames,
              record.userId,
              record.createdAt,
              record.updatedAt,
            ]
          );
          console.log(`  ✅ ${record.name} @ ${record.location || 'N/A'}`);
        }

        console.log(`\n✅ ${records.length}개의 식사 기록 마이그레이션 완료\n`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function migrateFriendships() {
  return new Promise((resolve, reject) => {
    console.log('👥 Friendships 데이터 마이그레이션...');
    console.log('==========================================');

    sqliteDb.all('SELECT * FROM friendships', [], async (err, friendships) => {
      if (err) {
        console.log('⚠️  friendships 테이블이 없거나 비어있습니다.\n');
        return resolve();
      }

      if (friendships.length === 0) {
        console.log('⚠️  마이그레이션할 친구 관계가 없습니다.\n');
        return resolve();
      }

      try {
        for (const friendship of friendships) {
          await pgClient.query(
            `INSERT INTO friendships (
              id, "userId", "friendId", status, "notificationEnabled", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              "notificationEnabled" = EXCLUDED."notificationEnabled",
              "updatedAt" = EXCLUDED."updatedAt"`,
            [
              friendship.id,
              friendship.userId,
              friendship.friendId,
              friendship.status || 'pending',
              friendship.notificationEnabled || false,
              friendship.createdAt,
              friendship.updatedAt,
            ]
          );
        }

        console.log(`✅ ${friendships.length}개의 친구 관계 마이그레이션 완료\n`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function migrateUserSettings() {
  return new Promise((resolve, reject) => {
    console.log('⚙️  User Settings 데이터 마이그레이션...');
    console.log('==========================================');

    sqliteDb.all('SELECT * FROM user_settings', [], async (err, settings) => {
      if (err) {
        console.log('⚠️  user_settings 테이블이 없거나 비어있습니다.\n');
        return resolve();
      }

      if (settings.length === 0) {
        console.log('⚠️  마이그레이션할 사용자 설정이 없습니다.\n');
        return resolve();
      }

      try {
        for (const setting of settings) {
          await pgClient.query(
            `INSERT INTO user_settings (
              id, "userId", 
              "notificationFriendRequest", "notificationNewReview", "notificationNearbyFriend",
              "privacyProfilePublic", "privacyShowLocation", "privacyShowMealDetails",
              "locationHome", "locationOffice",
              "locationHomeLatitude", "locationHomeLongitude",
              "locationOfficeLatitude", "locationOfficeLongitude",
              "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT ("userId") DO UPDATE SET
              "notificationFriendRequest" = EXCLUDED."notificationFriendRequest",
              "notificationNewReview" = EXCLUDED."notificationNewReview",
              "notificationNearbyFriend" = EXCLUDED."notificationNearbyFriend",
              "privacyProfilePublic" = EXCLUDED."privacyProfilePublic",
              "privacyShowLocation" = EXCLUDED."privacyShowLocation",
              "privacyShowMealDetails" = EXCLUDED."privacyShowMealDetails",
              "locationHome" = EXCLUDED."locationHome",
              "locationOffice" = EXCLUDED."locationOffice",
              "locationHomeLatitude" = EXCLUDED."locationHomeLatitude",
              "locationHomeLongitude" = EXCLUDED."locationHomeLongitude",
              "locationOfficeLatitude" = EXCLUDED."locationOfficeLatitude",
              "locationOfficeLongitude" = EXCLUDED."locationOfficeLongitude",
              "updatedAt" = EXCLUDED."updatedAt"`,
            [
              setting.id,
              setting.userId,
              setting.notificationFriendRequest ?? true,
              setting.notificationNewReview ?? true,
              setting.notificationNearbyFriend ?? false,
              setting.privacyProfilePublic ?? false,
              setting.privacyShowLocation ?? true,
              setting.privacyShowMealDetails ?? true,
              setting.locationHome,
              setting.locationOffice,
              setting.locationHomeLatitude,
              setting.locationHomeLongitude,
              setting.locationOfficeLatitude,
              setting.locationOfficeLongitude,
              setting.createdAt,
              setting.updatedAt,
            ]
          );
        }

        console.log(`✅ ${settings.length}개의 사용자 설정 마이그레이션 완료\n`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function migrateMealShares() {
  return new Promise((resolve, reject) => {
    console.log('📤 Meal Shares 데이터 마이그레이션...');
    console.log('==========================================');

    sqliteDb.all('SELECT * FROM meal_shares', [], async (err, shares) => {
      if (err) {
        console.log('⚠️  meal_shares 테이블이 없거나 비어있습니다.\n');
        return resolve();
      }

      if (shares.length === 0) {
        console.log('⚠️  마이그레이션할 공유 데이터가 없습니다.\n');
        return resolve();
      }

      try {
        for (const share of shares) {
          await pgClient.query(
            `INSERT INTO meal_shares (
              id, "shareId", "mealId", "sharerId", "viewCount", "expiresAt", "isActive", "createdAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT ("shareId") DO UPDATE SET
              "viewCount" = EXCLUDED."viewCount",
              "isActive" = EXCLUDED."isActive"`,
            [
              share.id,
              share.shareId,
              share.mealId,
              share.sharerId,
              share.viewCount || 0,
              share.expiresAt,
              share.isActive ?? true,
              share.createdAt,
            ]
          );
        }

        console.log(`✅ ${shares.length}개의 공유 데이터 마이그레이션 완료\n`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function migrateShareTracking() {
  return new Promise((resolve, reject) => {
    console.log('📊 Share Tracking 데이터 마이그레이션...');
    console.log('==========================================');

    sqliteDb.all('SELECT * FROM share_tracking', [], async (err, tracking) => {
      if (err) {
        console.log('⚠️  share_tracking 테이블이 없거나 비어있습니다.\n');
        return resolve();
      }

      if (tracking.length === 0) {
        console.log('⚠️  마이그레이션할 추적 데이터가 없습니다.\n');
        return resolve();
      }

      try {
        for (const track of tracking) {
          await pgClient.query(
            `INSERT INTO share_tracking (
              id, "shareId", "sharerId", "recipientId", "sessionId", 
              "ipAddress", "userAgent", "viewedAt", "convertedAt", 
              "friendRequestSent", "createdAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING`,
            [
              track.id,
              track.shareId,
              track.sharerId,
              track.recipientId,
              track.sessionId,
              track.ipAddress,
              track.userAgent,
              track.viewedAt,
              track.convertedAt,
              track.friendRequestSent || false,
              track.createdAt,
            ]
          );
        }

        console.log(`✅ ${tracking.length}개의 추적 데이터 마이그레이션 완료\n`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function printStats() {
  console.log('📊 마이그레이션 결과 통계');
  console.log('==========================================');

  const userCount = await pgClient.query('SELECT COUNT(*) FROM users');
  const mealCount = await pgClient.query('SELECT COUNT(*) FROM meal_records');
  const friendshipCount = await pgClient.query('SELECT COUNT(*) FROM friendships');
  const settingsCount = await pgClient.query('SELECT COUNT(*) FROM user_settings');
  const shareCount = await pgClient.query('SELECT COUNT(*) FROM meal_shares');
  const trackingCount = await pgClient.query('SELECT COUNT(*) FROM share_tracking');

  console.log(`  Users:          ${userCount.rows[0].count} rows`);
  console.log(`  Meal Records:   ${mealCount.rows[0].count} rows`);
  console.log(`  Friendships:    ${friendshipCount.rows[0].count} rows`);
  console.log(`  User Settings:  ${settingsCount.rows[0].count} rows`);
  console.log(`  Meal Shares:    ${shareCount.rows[0].count} rows`);
  console.log(`  Share Tracking: ${trackingCount.rows[0].count} rows`);

  // 사용자별 통계
  const stats = await pgClient.query(`
    SELECT 
      u.name,
      u.email,
      COUNT(m.id) as meal_count,
      AVG(m.rating) as avg_rating,
      SUM(m.price) as total_spent
    FROM users u
    LEFT JOIN meal_records m ON u.id = m."userId"
    GROUP BY u.id, u.name, u.email
    ORDER BY meal_count DESC
  `);

  if (stats.rows.length > 0) {
    console.log('\n👥 사용자별 통계:');
    stats.rows.forEach((stat) => {
      console.log(`  ${stat.name} (${stat.email})`);
      console.log(`    - 식사 기록: ${stat.meal_count}개`);
      console.log(`    - 평균 별점: ${stat.avg_rating ? parseFloat(stat.avg_rating).toFixed(1) : 'N/A'}`);
      console.log(`    - 총 지출: ${stat.total_spent ? `₩${parseFloat(stat.total_spent).toLocaleString()}` : 'N/A'}`);
    });
  }
}

// 실행
main();
