# 웹-앱 연동 빠른 시작 가이드

## 🎯 지금 바로 테스트하기

### 1. 로컬 테스트 (개발 중)

#### Frontend 실행
```bash
cd frontend
npm run dev
# http://localhost:3000 에서 실행됨
```

#### 앱 실행 (Expo Go)
```bash
cd app
npx expo start

# 모바일에서 Expo Go 앱으로 QR 코드 스캔
# 또는 에뮬레이터에서:
# - i: iOS 시뮬레이터
# - a: Android 에뮬레이터
```

#### Deep Link 테스트
```bash
# 앱이 실행된 상태에서

# iOS Simulator
xcrun simctl openurl booted "dailymeal://share/meal/test123"

# Android Emulator (앱 패키지명 필요)
adb shell am start -W -a android.intent.action.VIEW \
  -d "dailymeal://share/meal/test123" \
  com.dailymeal.app
```

---

## 📱 Smart Banner 테스트

### 방법 1: 모바일 브라우저
```
1. 모바일 기기를 개발 PC와 같은 Wi-Fi에 연결
2. PC IP 확인: ifconfig (Mac/Linux) 또는 ipconfig (Windows)
3. 모바일 브라우저에서 http://YOUR_IP:3000 접속
4. 아무 페이지나 접속
5. 3초 후 하단에 배너 표시 확인
```

### 방법 2: 배너 디버깅
브라우저 콘솔에서:
```javascript
// 배너 강제 표시 (localStorage 초기화)
localStorage.removeItem('app-banner-dismissed');
localStorage.removeItem('app-banner-dismissed-time');
location.reload();
```

---

## 🚀 프로덕션 배포 준비

### 체크리스트 (순서대로)

#### 1. 도메인 준비 (필수)
- [ ] `dailymeal.app` 도메인 구매
- [ ] DNS A 레코드 설정 (EC2 IP)
- [ ] HTTPS 인증서 설치 (Let's Encrypt)
  ```bash
  sudo certbot --nginx -d dailymeal.app -d www.dailymeal.app
  ```

#### 2. 검증 파일 배포 확인
```bash
# 올바른 응답 확인 (HTTP 200, application/json)
curl -i https://dailymeal.app/.well-known/apple-app-site-association
curl -i https://dailymeal.app/.well-known/assetlinks.json
```

#### 3. iOS 앱 준비
- [ ] Apple Developer 계정 가입 ($99/year)
- [ ] Team ID 확인:
  ```
  https://developer.apple.com/account
  → Membership Details → Team ID (10자리 영숫자)
  ```
- [ ] `frontend/public/.well-known/apple-app-site-association` 파일 수정:
  ```json
  "appID": "YOUR_TEAM_ID.com.dailymeal.app"
  ```

#### 4. Android 앱 준비
- [ ] Google Play Console 계정 가입 ($25 one-time)
- [ ] EAS 프로덕션 Keystore 생성:
  ```bash
  cd app
  eas credentials
  # Android → Production → Set up a new keystore
  # SHA256 지문 복사
  ```
- [ ] `frontend/public/.well-known/assetlinks.json` 파일 수정:
  ```json
  "sha256_cert_fingerprints": ["복사한_SHA256_지문"]
  ```

#### 5. 앱 빌드
```bash
cd app

# iOS (Apple Developer 계정 필요)
eas build --platform ios

# Android
eas build --platform android

# 빌드 완료 후 다운로드 링크 제공됨
```

#### 6. 앱 스토어 제출
- [ ] App Store Connect에서 앱 등록
- [ ] Play Console에서 앱 등록
- [ ] 스크린샷, 설명, 아이콘 업로드
- [ ] 심사 제출

#### 7. 앱 스토어 URL 업데이트
앱 승인 후 `frontend/src/components/app-install-banner.tsx` 수정:
```tsx
// iOS App Store URL
window.location.href = 'https://apps.apple.com/app/dailymeal/id실제_앱_ID';

// Google Play Store URL
window.location.href = 'https://play.google.com/store/apps/details?id=com.dailymeal.app';
```

---

## 🔧 자주 발생하는 문제

### Deep Link가 작동하지 않아요
```bash
# 1. 앱이 실행 중인지 확인
# 2. URL Scheme 확인
cat app/app.json | grep scheme

# 3. 로그 확인
# iOS: Xcode Console
# Android: adb logcat | grep DailyMeal

# 4. Deep Link 재시도
xcrun simctl openurl booted "dailymeal://share/meal/test123"
```

### Smart Banner가 안 보여요
```javascript
// 브라우저 콘솔에서 실행
console.log('User Agent:', navigator.userAgent);
console.log('Is Mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
console.log('Banner Dismissed:', localStorage.getItem('app-banner-dismissed'));

// 배너 강제 표시
localStorage.clear();
location.reload();
```

### Universal Link가 웹 페이지를 열어요 (앱이 안 열림)
```
✅ 확인사항:
1. HTTPS로 접속했는지 (HTTP는 작동 안 함)
2. Safari에서 테스트했는지 (Chrome은 미지원)
3. 앱이 설치되었는지
4. iOS 설정 → Safari → "Universal Link" 활성화 확인
5. 디바이스 재부팅 (캐시 문제)

❌ 피해야 할 것:
- 링크를 직접 복사-붙여넣기 (자동 감지 안 됨)
- QR 코드 앱으로 열기 (일부 앱은 Universal Link 차단)
- 메신저 앱 내부 브라우저 (카카오톡, 라인 등)
```

---

## 📊 테스트 체크리스트

### 로컬 환경
- [ ] Frontend 정상 실행 (http://localhost:3000)
- [ ] 앱 정상 실행 (Expo Go)
- [ ] Deep Link 테스트 성공
- [ ] Smart Banner 표시 확인
- [ ] 배너 "닫기" 후 재표시 안 됨 확인

### 프로덕션 환경
- [ ] HTTPS 접속 가능
- [ ] `.well-known` 파일 접근 가능
- [ ] Universal Link 검증 통과 (Apple)
- [ ] App Link 검증 통과 (Google)
- [ ] 앱 스토어 등록 완료
- [ ] 실제 기기에서 Deep Link 작동 확인

---

## 🆘 도움이 필요하면

### 개발 문서
- **Expo Deep Linking**: https://docs.expo.dev/guides/deep-linking/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Universal Links**: https://developer.apple.com/ios/universal-links/
- **App Links**: https://developer.android.com/training/app-links

### 디버깅 도구
- **iOS AASA Validator**: https://search.developer.apple.com/appsearch-validation-tool/
- **Android Asset Links Tester**: https://developers.google.com/digital-asset-links/tools/generator
- **Expo Diagnostics**: `npx expo-doctor`

### 커뮤니티
- Expo Discord: https://discord.gg/expo
- Stack Overflow: `[expo]` 태그
- GitHub Issues: https://github.com/expo/expo/issues

---

**마지막 업데이트**: 2025-01-22
**버전**: 1.0.0
