# 웹-앱 연동 구현 완료 보고서

## ✅ 구현 완료 항목

### 1. 스마트 앱 배너 (Smart App Banner)
**파일**: `frontend/src/components/app-install-banner.tsx`

**기능**:
- 모바일 브라우저에서 3초 후 자동 표시
- PWA로 이미 설치된 경우 표시하지 않음
- 7일 후 재표시 (localStorage 기반)
- iOS/Android 플랫폼별 App Store/Play Store 링크
- 부드러운 slide-up 애니메이션

**적용**: `frontend/src/app/layout.tsx`에 전역 추가됨

---

### 2. Deep Link 처리
**파일**: `app/App.js`

**구현 사항**:
- `expo-linking` 패키지 설치 완료
- Deep Link 수신 핸들러 구현
  - 앱이 닫혀있을 때: `Linking.getInitialURL()`
  - 앱이 실행 중일 때: `Linking.addEventListener()`
- WebView에 Deep Link URL 전달
- Custom Scheme: `dailymeal://share/meal/{id}`

**URL Scheme 설정**:
```javascript
// app.json
"scheme": "dailymeal"
```

---

### 3. Universal Links (iOS)
**파일**: `app/app.json`

```json
"ios": {
  "associatedDomains": [
    "applinks:dailymeal.app",
    "applinks:www.dailymeal.app"
  ]
}
```

**검증 파일**: `frontend/public/.well-known/apple-app-site-association`

**⚠️ 필수 수정사항**:
- `TEAM_ID`를 실제 Apple Developer Team ID로 교체 필요
- 예: `"appID": "ABC123XYZ.com.dailymeal.app"`

**Team ID 확인 방법**:
```
1. https://developer.apple.com/account 접속
2. "Membership Details" → "Team ID" 확인
3. 10자리 영숫자 (예: ABC123XYZ)
```

---

### 4. App Links (Android)
**파일**: `app/app.json`

```json
"android": {
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        {
          "scheme": "https",
          "host": "dailymeal.app",
          "pathPrefix": "/share"
        }
      ]
    }
  ]
}
```

**검증 파일**: `frontend/public/.well-known/assetlinks.json`

**⚠️ 필수 수정사항**:
- `SHA256_FINGERPRINT_HERE`를 실제 앱 서명 인증서의 SHA256 지문으로 교체 필요

**SHA256 지문 확인 방법**:
```bash
# Debug 빌드
cd app
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android | grep SHA256

# EAS Build (권장)
eas credentials
# Android → Production → Keystore → View SHA256 fingerprint
```

---

### 5. 공유 페이지에서 앱 열기 시도
**파일**: `frontend/src/components/app-deep-link.tsx`

**기능**:
- 모바일에서만 작동
- 페이지 로드 시 자동으로 앱 열기 시도
- 순서:
  1. Universal Link/App Link 시도 (우선)
  2. 2초 후 앱이 안 열리면 Custom Scheme 시도 (Fallback)
  3. 중복 시도 방지 (sessionStorage)

**적용**: `frontend/src/app/share/meal/[shareId]/page.tsx`에 추가됨

---

## 🚀 배포 전 체크리스트

### Backend (필수)
- [ ] **도메인 준비**: `dailymeal.app` 도메인 구매 및 DNS 설정
- [ ] **HTTPS 설정**: SSL 인증서 설치 (Let's Encrypt 권장)
- [ ] **검증 파일 배포**: `.well-known/` 디렉토리 접근 가능 확인
  ```bash
  curl -i https://dailymeal.app/.well-known/apple-app-site-association
  curl -i https://dailymeal.app/.well-known/assetlinks.json
  ```
- [ ] **Content-Type 확인**: `application/json` 응답 필수

### iOS 앱 (필수)
- [ ] **Team ID 업데이트**: `apple-app-site-association` 파일 수정
- [ ] **Xcode 설정**: Associated Domains capability 추가
  ```
  Signing & Capabilities → + Capability → Associated Domains
  Domains: applinks:dailymeal.app
  ```
- [ ] **App Store 등록**: 
  - Bundle ID: `com.dailymeal.app`
  - 앱 등록 후 App ID 확인
  - `app-install-banner.tsx`에 App ID 업데이트
  ```tsx
  window.location.href = 'https://apps.apple.com/app/idYOUR_APP_ID';
  ```

### Android 앱 (필수)
- [ ] **SHA256 지문 업데이트**: `assetlinks.json` 파일 수정
- [ ] **EAS Build 설정**: 프로덕션 Keystore 생성
  ```bash
  eas credentials
  # Android → Production → Set up a new keystore
  ```
- [ ] **Play Store 등록**:
  - Package: `com.dailymeal.app`
  - 앱 등록 후 Play Store URL 확인
  - `app-install-banner.tsx`에 URL 업데이트
  ```tsx
  window.location.href = 'https://play.google.com/store/apps/details?id=com.dailymeal.app';
  ```

### 테스트 (권장)
- [ ] **Local Deep Link 테스트**:
  ```bash
  # iOS
  xcrun simctl openurl booted "dailymeal://share/meal/test123"
  
  # Android
  adb shell am start -W -a android.intent.action.VIEW \
    -d "dailymeal://share/meal/test123"
  ```
- [ ] **Smart Banner 테스트**: 모바일 브라우저에서 확인
- [ ] **Universal Link 검증**:
  - iOS: https://search.developer.apple.com/appsearch-validation-tool/
  - Android: https://developers.google.com/digital-asset-links/tools/generator

---

## 📱 사용자 플로우

### 시나리오 1: 앱 설치된 사용자
```
웹 링크 클릭 (https://dailymeal.app/share/meal/abc123)
   ↓
Universal Link/App Link 자동 감지
   ↓
앱 자동 실행 (백그라운드에서 웹 열기 없음)
   ↓
해당 공유 페이지 표시
```

### 시나리오 2: 앱 미설치 사용자
```
웹 링크 클릭
   ↓
웹 페이지 로드
   ↓
3초 후 Smart Banner 표시
   ↓
"설치" 버튼 클릭
   ↓
App Store/Play Store 이동
   ↓
앱 설치 후 자동으로 컨텐츠 열기
```

### 시나리오 3: PWA 사용자
```
웹 링크 클릭
   ↓
PWA로 열림
   ↓
Smart Banner 표시 안 함 (이미 설치된 것으로 간주)
```

---

## 🧪 로컬 테스트 방법

### 1. Frontend 실행
```bash
cd frontend
npm run dev
```

### 2. 앱 빌드 및 실행
```bash
cd app

# iOS (Mac만 가능)
npx expo run:ios

# Android
npx expo run:android

# 또는 Expo Go 사용 (개발 중)
npx expo start
```

### 3. Deep Link 테스트
```bash
# 앱이 실행된 상태에서

# iOS Simulator
xcrun simctl openurl booted "dailymeal://share/meal/test123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW \
  -d "dailymeal://share/meal/test123" \
  com.dailymeal.app
```

### 4. Smart Banner 테스트
```
1. 모바일 기기에서 http://YOUR_IP:3000 접속
2. 공유 링크 페이지 접속
3. 3초 후 배너 표시 확인
4. "설치" 버튼 동작 확인
5. "닫기" 후 localStorage 확인
```

---

## 🔧 트러블슈팅

### iOS Universal Links가 작동하지 않을 때
1. **HTTPS 확인**: HTTP에서는 작동하지 않음
2. **리다이렉트 확인**: 301/302 없이 직접 접근 가능해야 함
3. **캐시 문제**: iOS는 최대 24시간 캐시, 디바이스 재부팅 권장
4. **Safari에서 테스트**: Chrome/Firefox는 Universal Link 미지원
5. **Team ID 확인**: `apple-app-site-association`의 Team ID 정확성

### Android App Links가 작동하지 않을 때
1. **SHA256 확인**: 정확한 지문 사용 필수
2. **autoVerify**: `app.json`에 `"autoVerify": true` 확인
3. **검증 도구 사용**: 
   ```bash
   adb shell pm get-app-links com.dailymeal.app
   ```
4. **수동 검증 재시도**:
   ```bash
   adb shell pm verify-app-links --re-verify com.dailymeal.app
   ```

### Smart Banner가 표시되지 않을 때
1. **모바일 확인**: 데스크톱에서는 표시 안 됨
2. **localStorage 클리어**: 개발자 도구에서 `app-banner-dismissed` 삭제
3. **PWA 확인**: 이미 PWA로 설치되었으면 표시 안 됨
4. **시간 대기**: 페이지 로드 후 3초 대기

---

## 📊 성과 측정 (TODO)

향후 Google Analytics 또는 Mixpanel 연동 시:

### 추적 이벤트
- `app_banner_view`: 배너 노출
- `app_banner_click`: 배너 클릭
- `app_banner_dismiss`: 배너 닫기
- `deep_link_open`: Deep Link로 앱 실행
- `app_install`: 앱 설치 (Play Store/App Store 제공 데이터)

### 전환 퍼널
```
웹 방문자
  ↓ (Smart Banner View)
배너 노출
  ↓ (CTR - Click Through Rate)
배너 클릭
  ↓ (Install Rate)
앱 설치
  ↓ (Activation Rate)
첫 앱 실행
```

---

## 🎯 다음 단계 (우선순위)

### Phase 1: 도메인 및 배포
1. ✅ 코드 구현 완료
2. ⏳ `dailymeal.app` 도메인 구매
3. ⏳ HTTPS 설정 (Let's Encrypt)
4. ⏳ `.well-known` 파일 배포 및 검증

### Phase 2: 앱 스토어 준비
1. ⏳ Apple Developer 계정 준비 ($99/year)
2. ⏳ Google Play Console 계정 준비 ($25 one-time)
3. ⏳ 앱 아이콘, 스크린샷, 설명 준비
4. ⏳ Team ID 및 SHA256 지문 업데이트

### Phase 3: 빌드 및 배포
1. ⏳ EAS Build로 프로덕션 빌드 생성
   ```bash
   eas build --platform ios
   eas build --platform android
   ```
2. ⏳ App Store/Play Store 제출
3. ⏳ 앱 심사 통과 후 URL 업데이트

### Phase 4: 모니터링
1. ⏳ Analytics 이벤트 추가
2. ⏳ 전환율 추적 대시보드 구축
3. ⏳ A/B 테스트 (배너 디자인, 타이밍 등)

---

## 📚 참고 자료

- **Expo Deep Linking**: https://docs.expo.dev/guides/deep-linking/
- **iOS Universal Links**: https://developer.apple.com/ios/universal-links/
- **Android App Links**: https://developer.android.com/training/app-links
- **Smart App Banners**: https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners
- **EAS Build**: https://docs.expo.dev/build/introduction/

---

## 💡 추가 최적화 아이디어

### 단기 (1-2주)
- [ ] Deep Link 실패 시 Fallback UI 개선
- [ ] 배너 디자인 A/B 테스트
- [ ] 로딩 상태 개선 (Skeleton UI)

### 중기 (1개월)
- [ ] Branch.io 또는 Firebase Dynamic Links 통합 (deferred deep linking)
- [ ] 앱 다운로드 인센티브 (쿠폰, 보상 등)
- [ ] Push Notification 설정 가이드

### 장기 (3개월)
- [ ] QR 코드 생성 및 공유 기능
- [ ] 앱 내 초대 시스템 (referral)
- [ ] 크로스 플랫폼 프로모션 캠페인

---

**작성일**: 2025-01-22
**버전**: 1.0.0
**상태**: 구현 완료 (배포 대기)
