/**
 * 데이터베이스에 새로운 필드 추가 스크립트
 * - category: 식사 카테고리 (home/delivery/restaurant)
 * - companionIds: 같이 식사한 친구 ID 배열
 * - companionNames: 같이 식사한 사람 이름 (텍스트)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/dev.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 데이터베이스 마이그레이션 시작...');

db.serialize(() => {
  // 1. category 컬럼 추가
  db.run(`
    ALTER TABLE meal_records 
    ADD COLUMN category VARCHAR DEFAULT 'restaurant'
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ category 컬럼이 이미 존재합니다');
      } else {
        console.error('❌ category 컬럼 추가 실패:', err.message);
      }
    } else {
      console.log('✅ category 컬럼 추가 완료');
    }
  });

  // 2. companionIds 컬럼 추가 (JSON 형식)
  db.run(`
    ALTER TABLE meal_records 
    ADD COLUMN companionIds TEXT
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ companionIds 컬럼이 이미 존재합니다');
      } else {
        console.error('❌ companionIds 컬럼 추가 실패:', err.message);
      }
    } else {
      console.log('✅ companionIds 컬럼 추가 완료');
    }
  });

  // 3. companionNames 컬럼 추가
  db.run(`
    ALTER TABLE meal_records 
    ADD COLUMN companionNames VARCHAR(200)
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ companionNames 컬럼이 이미 존재합니다');
      } else {
        console.error('❌ companionNames 컬럼 추가 실패:', err.message);
      }
    } else {
      console.log('✅ companionNames 컬럼 추가 완료');
    }
  });

  // 4. 테이블 구조 확인
  db.all(`PRAGMA table_info(meal_records)`, (err, rows) => {
    if (err) {
      console.error('❌ 테이블 정보 조회 실패:', err.message);
    } else {
      console.log('\n📋 meal_records 테이블 구조:');
      rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.type}${row.notnull ? ' NOT NULL' : ''}${row.dflt_value ? ` DEFAULT ${row.dflt_value}` : ''}`);
      });
    }
    
    db.close(() => {
      console.log('\n✅ 마이그레이션 완료!');
    });
  });
});
