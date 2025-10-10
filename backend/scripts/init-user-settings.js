#!/usr/bin/env node
/**
 * 기존 사용자에게 UserSettings 초기값 부여 스크립트
 * 실행: node backend/scripts/init-user-settings.js
 */

const { DataSource } = require('typeorm');

// TypeORM 설정
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'dailymeal_user',
  password: process.env.DB_PASSWORD || 'dailymeal2024!',
  database: process.env.DB_NAME || 'dailymeal',
  entities: ['dist/entities/**/*.entity.js'],
  synchronize: false,
});

async function initUserSettings() {
  console.log('🚀 UserSettings 초기화 시작...\n');

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공\n');

    // UserSettings가 없는 사용자 찾기
    const usersWithoutSettings = await AppDataSource.query(`
      SELECT u.id, u.email, u.name
      FROM users u
      LEFT JOIN user_settings us ON u.id = us."userId"
      WHERE us.id IS NULL
    `);

    if (usersWithoutSettings.length === 0) {
      console.log('✅ 모든 사용자가 이미 UserSettings를 가지고 있습니다.');
      await AppDataSource.destroy();
      return;
    }

    console.log(`📊 UserSettings가 없는 사용자: ${usersWithoutSettings.length}명\n`);

    // 각 사용자에게 UserSettings 생성
    for (const user of usersWithoutSettings) {
      await AppDataSource.query(`
        INSERT INTO user_settings (
          "userId",
          "notificationFriendRequest",
          "notificationNewReview",
          "notificationNearbyFriend",
          "privacyProfilePublic",
          "privacyShowLocation",
          "privacyShowMealDetails",
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, true, true, false, false, true, true, NOW(), NOW()
        )
      `, [user.id]);

      console.log(`  ✅ ${user.email} (${user.name})`);
    }

    console.log(`\n✅ 총 ${usersWithoutSettings.length}명의 사용자에게 UserSettings 초기화 완료!`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
initUserSettings();
