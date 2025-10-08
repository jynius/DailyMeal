/**
 * SQLite → PostgreSQL 마이그레이션 스크립트
 * 
 * 사용법:
 *   node scripts/migrate-to-postgres.js
 * 
 * 필수 환경 변수:
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
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

  // users 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      "profileImage" VARCHAR(255),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ users 테이블 생성 완료');

  // meal_records 테이블
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS meal_records (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      photo VARCHAR(255),
      location VARCHAR(255),
      rating INTEGER NOT NULL,
      memo VARCHAR(200),
      price DECIMAL(10,2),
      "userId" VARCHAR(36) NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      photos TEXT,
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      address VARCHAR(255),
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ meal_records 테이블 생성 완료');

  // 인덱스 생성
  await pgClient.query(`
    CREATE INDEX IF NOT EXISTS idx_meal_records_userId 
    ON meal_records("userId")
  `);
  await pgClient.query(`
    CREATE INDEX IF NOT EXISTS idx_meal_records_createdAt 
    ON meal_records("createdAt")
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
            `INSERT INTO users (id, email, password, name, "profileImage", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               email = EXCLUDED.email,
               password = EXCLUDED.password,
               name = EXCLUDED.name,
               "profileImage" = EXCLUDED."profileImage",
               "updatedAt" = EXCLUDED."updatedAt"`,
            [
              user.id,
              user.email,
              user.password,
              user.name,
              user.profileImage,
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
              id, name, photo, location, rating, memo, price, 
              "userId", "createdAt", "updatedAt", 
              photos, latitude, longitude, address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              photo = EXCLUDED.photo,
              location = EXCLUDED.location,
              rating = EXCLUDED.rating,
              memo = EXCLUDED.memo,
              price = EXCLUDED.price,
              "userId" = EXCLUDED."userId",
              "updatedAt" = EXCLUDED."updatedAt",
              photos = EXCLUDED.photos,
              latitude = EXCLUDED.latitude,
              longitude = EXCLUDED.longitude,
              address = EXCLUDED.address`,
            [
              record.id,
              record.name,
              record.photo,
              record.location,
              record.rating,
              record.memo,
              record.price,
              record.userId,
              record.createdAt,
              record.updatedAt,
              record.photos,
              record.latitude,
              record.longitude,
              record.address,
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

async function printStats() {
  console.log('📊 마이그레이션 결과 통계');
  console.log('==========================================');

  const userCount = await pgClient.query('SELECT COUNT(*) FROM users');
  const mealCount = await pgClient.query('SELECT COUNT(*) FROM meal_records');

  console.log(`  Users:        ${userCount.rows[0].count} rows`);
  console.log(`  Meal Records: ${mealCount.rows[0].count} rows`);

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
