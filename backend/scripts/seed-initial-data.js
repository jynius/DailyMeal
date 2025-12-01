/**
 * PostgreSQL 초기 데이터 입력 스크립트
 * 
 * 사용법:
 *   node scripts/seed-initial-data.js
 * 
 * 필수 환경 변수:
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL 연결 설정
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'dailymeal_user',
  password: process.env.DB_PASSWORD || 'dailymeal2024!',
  database: process.env.DB_NAME || 'dailymeal',
});

console.log('🌱 DailyMeal 초기 데이터 입력 시작...');
console.log('==========================================\n');

async function seedData() {
  try {
    await client.connect();
    console.log('✅ PostgreSQL 연결 성공\n');

    // 1. 데모 사용자 생성
    console.log('👤 데모 사용자 생성...');
    
    const demoPassword = await bcrypt.hash('demo1234', 10);
    const testPassword = await bcrypt.hash('test1234', 10);

    const users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@dailymeal.com',
        password: demoPassword,
        name: '데모 사용자',
        bio: 'DailyMeal 데모 계정입니다. 자유롭게 테스트해보세요!',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'test@dailymeal.com',
        password: testPassword,
        name: '테스트',
        bio: '테스트 계정',
      },
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password, name, bio, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, user.password, user.name, user.bio]
      );
      console.log(`  ✅ ${user.email} (${user.name})`);
    }

    // 2. 샘플 식사 기록 생성 (AI 추천을 위한 충분한 데이터)
    console.log('\n🍽️  샘플 식사 기록 생성...');
    
    const meals = [
      // 데모 사용자의 기록
      {
        name: '김치찌개',
        location: '우리집 식당',
        rating: 5,
        memo: '얼큰하고 맛있어요!',
        price: 8000,
        category: 'korean',
        address: '서울시 강남구 역삼동',
        latitude: 37.5006,
        longitude: 127.0364,
        userId: '00000000-0000-0000-0000-000000000001',
      },
      {
        name: '비빔밥',
        location: '전주집',
        rating: 4,
        memo: '고소하고 건강한 맛',
        price: 9000,
        category: 'korean',
        address: '서울시 종로구 인사동',
        latitude: 37.5730,
        longitude: 126.9856,
        userId: '00000000-0000-0000-0000-000000000001',
      },
      {
        name: '치킨',
        location: '교촌치킨 강남점',
        rating: 5,
        memo: '치믈리에 추천!',
        price: 18000,
        category: 'chicken',
        address: '서울시 강남구 강남대로',
        latitude: 37.4979,
        longitude: 127.0276,
        userId: '00000000-0000-0000-0000-000000000001',
      },
      // 테스트 사용자의 다양한 맛집 기록 (AI 추천용)
      {
        name: '된장찌개 정식',
        location: '한정식집 봄날',
        rating: 5,
        memo: '집밥 같은 맛',
        price: 12000,
        category: 'korean',
        address: '서울시 강남구 신사동',
        latitude: 37.5240,
        longitude: 127.0201,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '돼지갈비',
        location: '한정식집 봄날',
        rating: 5,
        memo: '반찬이 최고',
        price: 15000,
        category: 'korean',
        address: '서울시 강남구 신사동',
        latitude: 37.5240,
        longitude: 127.0201,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '짜장면',
        location: '차이나타운 본점',
        rating: 4,
        memo: '짜장 맛집',
        price: 7000,
        category: 'chinese',
        address: '서울시 중구 명동',
        latitude: 37.5640,
        longitude: 126.9827,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '짬뽕',
        location: '차이나타운 본점',
        rating: 4,
        memo: '얼큰해요',
        price: 8000,
        category: 'chinese',
        address: '서울시 중구 명동',
        latitude: 37.5640,
        longitude: 126.9827,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '초밥',
        location: '스시로 강남점',
        rating: 5,
        memo: '회전초밥 맛집',
        price: 25000,
        category: 'japanese',
        address: '서울시 강남구 테헤란로',
        latitude: 37.5048,
        longitude: 127.0497,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '라멘',
        location: '이치란 명동점',
        rating: 5,
        memo: '진한 국물',
        price: 12000,
        category: 'japanese',
        address: '서울시 중구 명동길',
        latitude: 37.5635,
        longitude: 126.9847,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '피자',
        location: '피자헛 강남역점',
        rating: 4,
        memo: '치즈 듬뿍',
        price: 28000,
        category: 'western',
        address: '서울시 강남구 강남역',
        latitude: 37.4979,
        longitude: 127.0276,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '스테이크',
        location: '아웃백 역삼점',
        rating: 4,
        memo: '육즙 가득',
        price: 35000,
        category: 'western',
        address: '서울시 강남구 역삼동',
        latitude: 37.5006,
        longitude: 127.0364,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '아메리카노',
        location: '스타벅스 강남대로점',
        rating: 4,
        memo: '작업하기 좋아요',
        price: 4500,
        category: 'cafe',
        address: '서울시 강남구 강남대로',
        latitude: 37.4966,
        longitude: 127.0287,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '케이크 세트',
        location: '투썸플레이스 신사점',
        rating: 5,
        memo: '달달한 휴식',
        price: 8000,
        category: 'cafe',
        address: '서울시 강남구 신사동',
        latitude: 37.5240,
        longitude: 127.0201,
        userId: '00000000-0000-0000-0000-000000000002',
      },
      {
        name: '불고기버거',
        location: '맥도날드 강남점',
        rating: 3,
        memo: '빠르게 해결',
        price: 6500,
        category: 'fastfood',
        address: '서울시 강남구 강남역',
        latitude: 37.4979,
        longitude: 127.0276,
        userId: '00000000-0000-0000-0000-000000000002',
      },
    ];

    for (const meal of meals) {
      await client.query(
        `INSERT INTO meal_records (
          name, location, rating, memo, price, category, address, latitude, longitude, "userId", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          meal.name,
          meal.location,
          meal.rating,
          meal.memo,
          meal.price,
          meal.category,
          meal.address,
          meal.latitude,
          meal.longitude,
          meal.userId,
        ]
      );
      console.log(`  ✅ ${meal.name} @ ${meal.location || '배달'} (${meal.category})`);
    }

    // 3. 친구 관계 생성
    console.log('\n👥 친구 관계 생성...');
    
    await client.query(
      `INSERT INTO friendships ("userId", "friendId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'accepted', NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']
    );
    console.log('  ✅ demo ↔ test 친구 관계');

    // 4. 통계 출력
    console.log('\n📊 초기 데이터 통계');
    console.log('==========================================');

    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const mealCount = await client.query('SELECT COUNT(*) FROM meal_records');
    const friendCount = await client.query('SELECT COUNT(*) FROM friendships');

    console.log(`  Users:       ${userCount.rows[0].count} rows`);
    console.log(`  Meals:       ${mealCount.rows[0].count} rows`);
    console.log(`  Friendships: ${friendCount.rows[0].count} rows`);

    console.log('\n🎉 초기 데이터 입력 완료!');
    console.log('\n📋 데모 계정 로그인 정보:');
    console.log('  이메일: demo@dailymeal.com');
    console.log('  비밀번호: demo1234');
    console.log('  이메일: test@dailymeal.com');
    console.log('  비밀번호: test1234\n');

  } catch (error) {
    console.error('\n❌ 초기 데이터 입력 실패:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 실행
seedData();
