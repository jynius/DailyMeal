# 🔄 UserSettings 마이그레이션 가이드

## 📋 개요

기존 사용자에게 `UserSettings` 초기값을 부여하는 마이그레이션 스크립트입니다.

### 배경
- **문제**: 기존 사용자는 `UserSettings`가 없어서 프로필 페이지 접근 시 오류 발생
- **원인**: 회원가입 시 `UserSettings` 자동 생성 로직이 없었음
- **해결**: 
  1. 신규 가입자: 회원가입 시 자동 생성 (✅ 구현 완료)
  2. 기존 가입자: 마이그레이션 스크립트로 초기값 부여
  3. 방어 코드: `getUserSettings` API에서 없으면 자동 생성 (✅ 구현 완료)

---

## 🚀 마이그레이션 실행

### 1단계: 백엔드 빌드

```bash
cd ~/DailyMeal/backend
npm run build
```

### 2단계: 스크립트 실행

```bash
cd ~/DailyMeal
node backend/scripts/init-user-settings.js
```

### 예상 출력:

```
🚀 UserSettings 초기화 시작...

✅ 데이터베이스 연결 성공

📊 UserSettings가 없는 사용자: 3명

  ✅ user1@example.com (홍길동)
  ✅ user2@example.com (김철수)
  ✅ test@dailymeal.app (테스터)

✅ 총 3명의 사용자에게 UserSettings 초기화 완료!
```

---

## 🔍 스크립트 동작 방식

### 1. UserSettings가 없는 사용자 찾기

```sql
SELECT u.id, u.email, u.name
FROM users u
LEFT JOIN user_settings us ON u.id = us."userId"
WHERE us.id IS NULL
```

### 2. 각 사용자에게 UserSettings 생성

```sql
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
```

### 3. 초기값 설정

| 설정 | 초기값 | 설명 |
|------|--------|------|
| `notificationFriendRequest` | `true` | 친구 요청 알림 |
| `notificationNewReview` | `true` | 새 리뷰 알림 |
| `notificationNearbyFriend` | `false` | 근처 친구 알림 |
| `privacyProfilePublic` | `false` | 프로필 공개 |
| `privacyShowLocation` | `true` | 위치 표시 |
| `privacyShowMealDetails` | `true` | 식사 상세 표시 |

---

## ⚠️ 주의 사항

### 안전한 실행

1. **백업 먼저**
   ```bash
   # PostgreSQL 백업
   pg_dump -U dailymeal_user dailymeal > backup_$(date +%Y%m%d).sql
   ```

2. **테스트 환경에서 먼저 실행**
   ```bash
   # 개발 환경에서 테스트
   NODE_ENV=development node backend/scripts/init-user-settings.js
   ```

3. **프로덕션 실행**
   ```bash
   # 프로덕션 환경
   NODE_ENV=production node backend/scripts/init-user-settings.js
   ```

### 재실행 안전

- ✅ **멱등성**: 같은 스크립트를 여러 번 실행해도 안전
- ✅ **중복 방지**: 이미 UserSettings가 있는 사용자는 건너뜀
- ✅ **오류 처리**: 오류 발생 시 롤백

---

## 🛡️ 방어 코드 (자동 생성)

### `getUserSettings` API

```typescript
async getUserSettings(userId: string) {
  let settings = await this.userSettingsRepository.findOne({
    where: { userId },
  });

  // 설정이 없으면 기본값으로 생성
  if (!settings) {
    settings = this.userSettingsRepository.create({
      userId: userId,
      notificationFriendRequest: true,
      notificationNewReview: true,
      notificationNearbyFriend: false,
      privacyProfilePublic: false,
      privacyShowLocation: true,
      privacyShowMealDetails: true,
      // ... 기타 설정
    });

    settings = await this.userSettingsRepository.save(settings);
  }

  return settings;
}
```

**장점:**
- ✅ 마이그레이션 없이도 동작
- ✅ 새로운 사용자도 자동 처리
- ✅ 오류 방지

---

## 📊 상태 확인

### 1. UserSettings가 없는 사용자 확인

```bash
# psql 접속
psql -U dailymeal_user -d dailymeal

# 확인 쿼리
SELECT 
  u.id, 
  u.email, 
  u.name,
  CASE WHEN us.id IS NULL THEN 'Missing' ELSE 'OK' END as status
FROM users u
LEFT JOIN user_settings us ON u.id = us."userId"
ORDER BY status DESC, u.email;
```

### 2. 마이그레이션 후 확인

```sql
-- 전체 사용자 수
SELECT COUNT(*) FROM users;

-- UserSettings가 있는 사용자 수
SELECT COUNT(*) FROM user_settings;

-- 두 값이 같으면 OK
```

---

## 🔧 트러블슈팅

### 오류: "데이터베이스 연결 실패"

**원인:** 환경 변수 미설정

**해결:**
```bash
# .env 파일 확인
cat backend/.env

# 또는 직접 지정
DB_HOST=localhost \
DB_PORT=5432 \
DB_USERNAME=dailymeal_user \
DB_PASSWORD=dailymeal2024! \
DB_NAME=dailymeal \
node backend/scripts/init-user-settings.js
```

### 오류: "entities not found"

**원인:** 백엔드가 빌드되지 않음

**해결:**
```bash
cd backend
npm run build
cd ..
node backend/scripts/init-user-settings.js
```

### 이미 실행했는지 확인

```bash
# psql에서
SELECT COUNT(*) FROM user_settings;

# 사용자 수와 같으면 이미 완료된 것
SELECT COUNT(*) FROM users;
```

---

## 📝 변경 이력

### 2025-10-11
- ✅ `auth.service.ts`: 회원가입 시 UserSettings 자동 생성
- ✅ `users.service.ts`: getUserSettings에 방어 코드 추가
- ✅ 마이그레이션 스크립트 생성

### 이전
- ❌ UserSettings 자동 생성 없음
- ❌ 기존 사용자 프로필 접근 시 401 오류

---

## ✅ 체크리스트

배포 전:
- [ ] 백엔드 빌드 완료
- [ ] 데이터베이스 백업
- [ ] 마이그레이션 스크립트 테스트 (개발 환경)
- [ ] 프로덕션 마이그레이션 실행
- [ ] UserSettings 생성 확인
- [ ] 프로필 페이지 정상 동작 확인

배포 후:
- [ ] 기존 사용자 로그인 → 프로필 접근 → 정상 동작
- [ ] 신규 가입자 → 프로필 접근 → 정상 동작
- [ ] 회원 탈퇴 → 재가입 → 정상 동작

---

**마이그레이션 실행 준비 완료!** 🚀

서버에서 실행:
```bash
cd ~/DailyMeal
npm run build --prefix backend
node backend/scripts/init-user-settings.js
```
