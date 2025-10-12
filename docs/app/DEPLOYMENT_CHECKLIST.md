# DailyMeal 앱 배포 체크리스트

## 📋 배포 전 점검 (2025-10-10)

### ✅ 완료된 항목

- [x] Expo SDK 54 설치 및 설정
- [x] WebView 기반 하이브리드 앱 구현
- [x] Deep Link 스킴 설정 (`dailymeal://`)
- [x] App Links (Android) 설정
- [x] Universal Links (iOS) 설정
- [x] 아이콘 및 스플래시 이미지 준비
- [x] `eas.json` 빌드 프로필 설정
- [x] `app.json` 프로덕션 설정
- [x] expo-constants로 URL 설정 개선

### 🔧 배포 단계

#### 1단계: EAS CLI 설치 및 로그인
```bash
# EAS CLI 글로벌 설치
npm install -g eas-cli

# Expo 계정 로그인
eas login

# 프로젝트 연결 확인
cd /home/jynius/projects/WebApp/DailyMeal/app
eas whoami
```

**필요 정보:**
- Expo 계정 이메일
- Expo 계정 비밀번호
- (없다면 https://expo.dev 에서 회원가입)

---

#### 2단계: 빌드 프로필 선택

**옵션 A: Preview APK (테스트용, 추천!)**
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile preview
```

**장점:**
- ✅ 빠른 빌드 (15-20분)
- ✅ APK 파일 직접 배포 가능
- ✅ 스토어 등록 없이 테스트 가능
- ✅ 무료

**단점:**
- ❌ Google Play Store 업로드 불가 (AAB 필요)

---

**옵션 B: Production AAB (스토어 배포용)**
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile production
```

**장점:**
- ✅ Google Play Store 업로드 가능
- ✅ 자동 버전 증가

**단점:**
- ❌ Play Console 계정 필요 ($25)
- ❌ Keystore 관리 필요

---

#### 3단계: 빌드 실행

```bash
# Preview APK 빌드 (권장)
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile preview
```

**빌드 과정:**
1. Expo 서버에 코드 업로드
2. 클라우드에서 APK/AAB 빌드
3. 빌드 완료 알림 (이메일 또는 터미널)
4. 다운로드 링크 제공

**예상 시간:** 15-20분

---

#### 4단계: APK 다운로드 및 설치

**빌드 목록 확인:**
```bash
eas build:list
```

**다운로드:**
- 터미널에 표시된 링크 클릭
- 또는 https://expo.dev/accounts/[your-username]/projects/dailymeal/builds
- APK 파일 다운로드

**안드로이드 기기에 설치:**
1. APK 파일을 안드로이드 기기로 전송
2. "알 수 없는 출처" 허용 설정
3. APK 파일 실행하여 설치

---

#### 5단계: 테스트

**확인 사항:**
- [ ] 앱 실행 및 웹사이트 로드
- [ ] 로그인/회원가입 동작
- [ ] 식사 기록 추가/수정/삭제
- [ ] 피드 보기
- [ ] 친구 기능
- [ ] 맛집 검색
- [ ] 공유 링크 Deep Link 동작
  - [ ] `dailymeal://share/meal/[id]` 링크 클릭 시 앱 실행
  - [ ] `https://www.dailymeal.life/share/meal/[id]` 링크 클릭 시 앱 열림

---

## 🚀 배포 명령어 요약

### 초기 설정 (1회만)
```bash
# EAS CLI 설치
npm install -g eas-cli

# 로그인
eas login

# 프로젝트 디렉토리로 이동
cd /home/jynius/projects/WebApp/DailyMeal/app
```

### Preview APK 빌드 (테스트용)
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile preview
```

### Production AAB 빌드 (스토어용)
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile production
```

### iOS 빌드 (Apple Developer 계정 필요)
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform ios --profile production
```

---

## 📱 Google Play Store 배포 (선택 사항)

### 사전 요구사항
1. Google Play Console 계정 ($25 일회성 비용)
2. Production AAB 빌드 파일

### 배포 단계
1. https://play.google.com/console 접속
2. "앱 만들기" 클릭
3. 앱 정보 입력:
   - 앱 이름: DailyMeal
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료

4. 앱 콘텐츠 작성:
   - 설명
   - 스크린샷 (최소 2개)
   - 아이콘
   - 기능 그래픽

5. AAB 업로드:
   - "프로덕션" → "출시 만들기"
   - AAB 파일 업로드
   - 출시 노트 작성

6. 심사 제출
   - 예상 심사 기간: 1-7일

---

## 🍎 Apple App Store 배포 (선택 사항)

### 사전 요구사항
1. Apple Developer Program ($99/년)
2. macOS 환경
3. iOS 빌드 파일

### 배포 단계
1. https://developer.apple.com 에서 등록
2. App Store Connect에서 앱 등록
3. iOS 빌드 업로드
4. 앱 정보 및 스크린샷 등록
5. 심사 제출
   - 예상 심사 기간: 1-3일

---

## 🔒 보안 체크리스트

- [ ] API 키가 코드에 하드코딩되지 않았는지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] HTTPS 사용 (프로덕션 환경)
- [ ] JWT 토큰 만료 시간 적절히 설정
- [ ] 사용자 입력 검증 (XSS, SQL Injection 방지)

---

## 📊 현재 프로젝트 정보

**버전:** 1.0.0  
**Bundle ID (iOS):** com.dailymeal.app  
**Package (Android):** com.dailymeal.app  
**EAS Project ID:** 4f64dc67-c866-4a69-89b5-c0453d63899b  
**프로덕션 URL:** https://www.dailymeal.life  

---

## 🆘 문제 해결

### 빌드 실패 시
```bash
# 로그 확인
eas build:list

# 캐시 삭제 후 재시도
rm -rf node_modules
npm install
eas build --platform android --profile preview --clear-cache
```

### Deep Link 동작 안 할 시
1. `app.json`의 `scheme` 확인
2. `intentFilters` (Android) 설정 확인
3. `associatedDomains` (iOS) 설정 확인
4. 웹사이트의 `.well-known` 파일 확인

### WebView 로딩 안 될 시
1. 네트워크 연결 확인
2. HTTPS 인증서 확인
3. CORS 설정 확인 (백엔드)

---

**다음 단계:** EAS CLI 설치 및 로그인 → Preview APK 빌드
