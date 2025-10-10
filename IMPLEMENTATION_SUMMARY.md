# 🎯 회원 관리 개선 및 환경 변수 설정 완료

## ✅ 구현 완료 사항

### 1. 회원가입 시 UserSettings 자동 생성 ⭐
**문제:** 기존 사용자 프로필 페이지 접근 시 401 오류  
**원인:** UserSettings 미생성  
**해결:**

#### backend/src/auth/auth.service.ts
```typescript
// 회원가입 시 UserSettings 자동 생성
const userSettings = this.userSettingsRepository.create({
  userId: user.id,
  notificationFriendRequest: true,
  notificationNewReview: true,
  notificationNearbyFriend: false,
  privacyProfilePublic: false,
  privacyShowLocation: true,
  privacyShowMealDetails: true,
});

await this.userSettingsRepository.save(userSettings);
```

#### backend/src/auth/auth.module.ts
```typescript
// UserSettings Repository 추가
TypeOrmModule.forFeature([User, UserSettings])
```

---

### 2. 회원 탈퇴 기능 추가 ⭐

#### 백엔드 (이미 구현됨)
- ✅ `DELETE /users/me` API
- ✅ 비밀번호 확인
- ✅ 프로필 이미지 삭제
- ✅ Cascade 삭제 (관련 데이터 자동 삭제)

#### 프론트엔드
```typescript
// frontend/src/app/profile/page.tsx
const handleDeleteAccount = async () => {
  if (!confirm('정말로 회원 탈퇴하시겠습니까?\n\n모든 데이터가 삭제되며 복구할 수 없습니다.')) {
    return
  }

  const password = prompt('비밀번호를 입력하세요:')
  if (!password) return

  try {
    await profileApi.deleteAccount(password)
    tokenManager.remove()
    alert('회원 탈퇴가 완료되었습니다.')
    router.push('/login')
  } catch (error: any) {
    alert(error?.message || '회원 탈퇴에 실패했습니다')
  }
}
```

**UI:**
- 프로필 페이지 하단에 "회원 탈퇴" 버튼 추가
- 확인 다이얼로그 2단계 (경고 + 비밀번호)
- 탈퇴 완료 후 로그인 페이지로 이동

---

### 3. 기존 사용자용 마이그레이션 스크립트

#### backend/scripts/init-user-settings.js
```javascript
// UserSettings가 없는 사용자 찾기
const usersWithoutSettings = await AppDataSource.query(`
  SELECT u.id, u.email, u.name
  FROM users u
  LEFT JOIN user_settings us ON u.id = us."userId"
  WHERE us.id IS NULL
`);

// 각 사용자에게 UserSettings 생성
for (const user of usersWithoutSettings) {
  await AppDataSource.query(`
    INSERT INTO user_settings (...) VALUES (...)
  `, [user.id]);
}
```

**실행 방법:**
```bash
cd ~/DailyMeal
npm run build --prefix backend
node backend/scripts/init-user-settings.js
```

---

### 4. 환경 변수 설정 개선

#### frontend/.env.production.example (NEW)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
NEXT_PUBLIC_KAKAO_API_KEY=your_kakao_javascript_key_here
```

#### ecosystem.config.js
```javascript
// 불필요한 NEXT_PUBLIC_* 환경 변수 제거
env: {
  NODE_ENV: 'production',
  PORT: 3000
  // NEXT_PUBLIC_*는 .env.production에서 관리
}
```

#### bin/deploy.sh
```bash
# .env.production 파일 확인 로직 추가
if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  .env.production이 없습니다."
    echo "📝 .env.production.example을 복사하세요"
    exit 1
fi
```

---

### 5. HTTPS 인증서 설정 준비

#### bin/setup-caddy.sh (NEW)
- Caddy 자동 설치 스크립트
- Caddyfile 자동 생성
- Let's Encrypt 인증서 자동 발급

#### docs/CADDY_SETUP_GUIDE.md (NEW)
- Caddy 설치 및 설정 가이드
- 문제 해결 방법
- 관리 명령어

#### docs/APP_HTTPS_SETUP.md (NEW)
- 앱용 HTTPS 인증서 설정 가이드
- Caddy, Nginx, Cloudflare Tunnel 비교
- 선택 가이드

---

### 6. 문서화

#### docs/USER_SETTINGS_MIGRATION.md (NEW)
- 마이그레이션 스크립트 사용법
- 트러블슈팅
- 상태 확인 방법

#### docs/ENV_PRODUCTION_GUIDE.md (NEW)
- 프로덕션 환경 변수 관리 가이드
- Git 관리 전략
- 배포 프로세스

#### DEPLOYMENT_CHECKLIST.md (NEW)
- 전체 배포 체크리스트
- 단계별 실행 방법
- 테스트 체크리스트

#### docs/FILE_CLEANUP_REPORT.md (NEW)
- 파일 정리 보고서
- .bak 파일 삭제 기록

---

## 🐛 수정된 버그

### 1. 프로필 페이지 401 오류
- **원인**: UserSettings 미생성
- **해결**: 
  - 신규 가입자: 자동 생성
  - 기존 가입자: 마이그레이션 스크립트
  - 방어 코드: getUserSettings에서 자동 생성

### 2. 카카오 지도 표시 안 됨
- **원인**: .env.production에 KAKAO_API_KEY 누락
- **해결**: .env.production.example 생성, deploy.sh 체크 로직 추가

### 3. PM2 환경 변수 반영 안 됨
- **원인**: NEXT_PUBLIC_*는 빌드 시점에 번들링
- **해결**: .env.production으로 관리, 빌드 필요

---

## 📋 배포 순서

### 1. Git Commit & Push
```bash
git add .
git commit -m "feat: 회원 탈퇴 기능 추가 및 UserSettings 자동 생성

- 회원가입 시 UserSettings 자동 생성 (프로필 오류 수정)
- 회원 탈퇴 기능 UI 추가
- 기존 사용자용 UserSettings 마이그레이션 스크립트 추가
- .env.production 설정 개선
- Caddy HTTPS 설정 스크립트 추가
- 배포 가이드 및 문서 작성"

git push origin main
```

### 2. 서버 배포
```bash
ssh ubuntu@ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
cd ~/DailyMeal
git pull origin main

# .env.production 생성 (처음만)
cp frontend/.env.production.example frontend/.env.production
vi frontend/.env.production  # 실제 키 입력

# 기존 사용자 마이그레이션 (처음만)
npm run build --prefix backend
node backend/scripts/init-user-settings.js

# 배포
./bin/deploy.sh
```

### 3. Caddy 설치
```bash
# 서버에서
./bin/setup-caddy.sh

# 확인
curl -I https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
```

### 4. 앱 재빌드
```bash
# 로컬에서
cd app
eas build --platform android --profile preview
```

---

## ✅ 테스트 체크리스트

### 신규 가입자
- [ ] 회원가입
- [ ] 프로필 페이지 접근 → 정상 동작
- [ ] 설정 페이지 접근 → 정상 동작
- [ ] 회원 탈퇴 → 성공

### 기존 가입자
- [ ] 마이그레이션 스크립트 실행
- [ ] 로그인
- [ ] 프로필 페이지 접근 → 정상 동작 (401 오류 없음)
- [ ] 설정 페이지 접근 → 정상 동작
- [ ] 회원 탈퇴 → 성공

### 탈퇴 후 재가입
- [ ] 회원 탈퇴
- [ ] 같은 이메일로 재가입 → 성공
- [ ] 프로필 페이지 접근 → 정상 동작
- [ ] 모든 데이터 초기화 확인

### HTTPS
- [ ] 브라우저에서 HTTPS 접속
- [ ] 자물쇠 아이콘 확인
- [ ] 앱에서 SSL 오류 없이 실행

---

## 🎉 완료!

모든 기능이 구현되었습니다:
- ✅ 회원가입 시 UserSettings 자동 생성
- ✅ 회원 탈퇴 기능
- ✅ 기존 사용자 마이그레이션
- ✅ 환경 변수 설정 개선
- ✅ HTTPS 인증서 준비
- ✅ 상세 문서화

**다음 단계:** Git commit 후 서버 배포! 🚀
