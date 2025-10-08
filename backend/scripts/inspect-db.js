/**
 * SQLite 데이터베이스 검사 스크립트
 * 
 * 사용법:
 *   node scripts/inspect-db.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'dev.sqlite');

console.log('📊 DailyMeal SQLite Database Inspector');
console.log('==========================================');
console.log(`📁 Database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
    process.exit(1);
  }
});

// 테이블 목록 조회
db.all(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`, [], (err, tables) => {
  if (err) {
    console.error('❌ 테이블 목록 조회 실패:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('📋 테이블 목록:');
  console.log('==========================================');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  console.log('');

  // 각 테이블의 스키마 확인
  let completed = 0;
  const schemas = {};

  tables.forEach(table => {
    db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
      if (err) {
        console.error(`❌ ${table.name} 스키마 조회 실패:`, err.message);
      } else {
        schemas[table.name] = columns;
      }
      
      completed++;
      
      if (completed === tables.length) {
        printSchemas(schemas);
        checkDataCounts(db, tables);
      }
    });
  });
});

function printSchemas(schemas) {
  console.log('🏗️  테이블 스키마:');
  console.log('==========================================');
  
  Object.keys(schemas).forEach(tableName => {
    console.log(`\n📦 ${tableName}`);
    console.log('-'.repeat(40));
    
    schemas[tableName].forEach(col => {
      const nullable = col.notnull ? 'NOT NULL' : 'NULLABLE';
      const pk = col.pk ? ' PRIMARY KEY' : '';
      const def = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
      console.log(`  ${col.name.padEnd(20)} ${col.type.padEnd(15)} ${nullable}${pk}${def}`);
    });
  });
  console.log('');
}

function checkDataCounts(db, tables) {
  console.log('📊 데이터 통계:');
  console.log('==========================================');
  
  let completed = 0;
  const counts = {};
  
  tables.forEach(table => {
    db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, row) => {
      if (err) {
        console.error(`❌ ${table.name} 카운트 실패:`, err.message);
        counts[table.name] = 0;
      } else {
        counts[table.name] = row.count;
        console.log(`  ${table.name.padEnd(20)} ${row.count} rows`);
      }
      
      completed++;
      
      if (completed === tables.length) {
        console.log('');
        showSampleData(db, counts);
      }
    });
  });
}

function showSampleData(db, counts) {
  // users 샘플 데이터
  if (counts.users > 0) {
    console.log('👤 Users 샘플 데이터 (최근 3개):');
    console.log('==========================================');
    
    db.all(`
      SELECT id, email, name, createdAt 
      FROM users 
      ORDER BY createdAt DESC 
      LIMIT 3
    `, [], (err, users) => {
      if (err) {
        console.error('❌ Users 조회 실패:', err.message);
      } else {
        users.forEach(user => {
          console.log(`  ID: ${user.id}`);
          console.log(`  Email: ${user.email}`);
          console.log(`  Name: ${user.name}`);
          console.log(`  Created: ${user.createdAt}`);
          console.log('');
        });
      }
      
      showMealRecords(db, counts);
    });
  } else {
    console.log('👤 Users: 데이터 없음\n');
    showMealRecords(db, counts);
  }
}

function showMealRecords(db, counts) {
  if (counts.meal_records > 0) {
    console.log('🍽️  Meal Records 샘플 데이터 (최근 5개):');
    console.log('==========================================');
    
    db.all(`
      SELECT id, name, location, rating, price, createdAt 
      FROM meal_records 
      ORDER BY createdAt DESC 
      LIMIT 5
    `, [], (err, meals) => {
      if (err) {
        console.error('❌ Meal Records 조회 실패:', err.message);
      } else {
        meals.forEach(meal => {
          console.log(`  ID: ${meal.id}`);
          console.log(`  Name: ${meal.name}`);
          console.log(`  Location: ${meal.location || 'N/A'}`);
          console.log(`  Rating: ${'⭐'.repeat(meal.rating)}`);
          console.log(`  Price: ${meal.price ? `₩${meal.price}` : 'N/A'}`);
          console.log(`  Created: ${meal.createdAt}`);
          console.log('');
        });
      }
      
      showUserStats(db, counts);
    });
  } else {
    console.log('🍽️  Meal Records: 데이터 없음\n');
    showUserStats(db, counts);
  }
}

function showUserStats(db, counts) {
  if (counts.users > 0 && counts.meal_records > 0) {
    console.log('📈 사용자별 식사 기록 통계:');
    console.log('==========================================');
    
    db.all(`
      SELECT 
        u.name,
        u.email,
        COUNT(m.id) as meal_count,
        AVG(m.rating) as avg_rating,
        SUM(m.price) as total_spent
      FROM users u
      LEFT JOIN meal_records m ON u.id = m.userId
      GROUP BY u.id
      ORDER BY meal_count DESC
    `, [], (err, stats) => {
      if (err) {
        console.error('❌ 통계 조회 실패:', err.message);
      } else {
        stats.forEach(stat => {
          console.log(`  ${stat.name} (${stat.email})`);
          console.log(`    식사 기록: ${stat.meal_count}개`);
          console.log(`    평균 별점: ${stat.avg_rating ? stat.avg_rating.toFixed(1) : 'N/A'}`);
          console.log(`    총 지출: ${stat.total_spent ? `₩${stat.total_spent.toLocaleString()}` : 'N/A'}`);
          console.log('');
        });
      }
      
      finalize(db);
    });
  } else {
    finalize(db);
  }
}

function finalize(db) {
  db.close((err) => {
    if (err) {
      console.error('❌ 데이터베이스 종료 실패:', err.message);
    } else {
      console.log('✅ 검사 완료!');
    }
  });
}
