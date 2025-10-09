const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'data', 'dev.sqlite');
const db = new sqlite3.Database(dbPath);

async function seedFriendships() {
  console.log('🌱 Adding test friendships...');

  // 테스트 사용자 생성
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    { id: 'user-1', email: 'alice@test.com', name: '앨리스', password: hashedPassword },
    { id: 'user-2', email: 'bob@test.com', name: '밥', password: hashedPassword },
    { id: 'user-3', email: 'charlie@test.com', name: '찰리', password: hashedPassword },
  ];

  // 사용자 추가
  for (const user of users) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO user (id, email, name, password, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [user.id, user.email, user.name, user.password],
        (err) => {
          if (err) {
            console.error(`Error adding user ${user.name}:`, err);
            reject(err);
          } else {
            console.log(`✅ User added: ${user.name} (${user.email})`);
            resolve();
          }
        }
      );
    });
  }

  // Friendship 테이블 생성 (없을 경우)
  await new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        friendId TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id),
        FOREIGN KEY (friendId) REFERENCES user(id)
      )`,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // 친구 관계 추가
  const friendships = [
    { id: 'friendship-1', userId: 'user-1', friendId: 'user-2', status: 'accepted' },
    { id: 'friendship-2', userId: 'user-1', friendId: 'user-3', status: 'pending' },
  ];

  for (const friendship of friendships) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO friendships (id, userId, friendId, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [friendship.id, friendship.userId, friendship.friendId, friendship.status],
        (err) => {
          if (err) {
            console.error('Error adding friendship:', err);
            reject(err);
          } else {
            console.log(`✅ Friendship added: ${friendship.userId} -> ${friendship.friendId} (${friendship.status})`);
            resolve();
          }
        }
      );
    });
  }

  console.log('✨ Friendship seed data added successfully!');
  db.close();
}

seedFriendships().catch(console.error);
