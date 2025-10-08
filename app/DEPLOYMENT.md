# DailyMeal 모바일 앱 배포 가이드

## 📱 배포 옵션

### 옵션 1: EAS Build (권장) - 클라우드 빌드
### 옵션 2: 로컬 빌드
### 옵션 3: Expo Go 공유 (개발/테스트용)

---

## 🚀 옵션 1: EAS Build (권장)

Expo의 클라우드 빌드 서비스를 사용합니다.

### 1. EAS CLI 설치
```bash
npm install -g eas-cli
```

### 2. Expo 계정 생성 및 로그인
```bash
eas login
```
- https://expo.dev 에서 계정 생성
- 이메일 인증 완료

### 3. 프로젝트 초기화
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build:configure
```

### 4. 빌드 실행

#### Android APK 빌드 (테스트용)
```bash
eas build --platform android --profile preview
```

#### Android AAB 빌드 (Play Store 배포용)
```bash
eas build --platform android --profile production
```

#### iOS 빌드 (Apple Developer 계정 필요)
```bash
eas build --platform ios --profile production
```

### 5. 빌드 다운로드
- 빌드 완료 후 이메일로 링크 수신
- 또는 `eas build:list` 명령으로 빌드 목록 확인
- APK/AAB 파일 다운로드

---

## 🏗️ 옵션 2: 로컬 빌드

### Android (Windows/Linux/macOS)

#### 사전 요구사항:
- Android Studio 설치
- Java JDK 17 설치
- Android SDK 설치

#### 빌드 명령:
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
npx expo run:android --variant release
```

생성된 APK 위치:
```
android/app/build/outputs/apk/release/app-release.apk
```

### iOS (macOS만 가능)

#### 사전 요구사항:
- Xcode 설치
- Apple Developer 계정

#### 빌드 명령:
```bash
npx expo run:ios --configuration Release
```

---

## 👥 옵션 3: Expo Go 공유 (개발/테스트용)

### 현재 개발 서버 공유

#### 1. Expo 앱 게시
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
npx expo publish
```

#### 2. 공유 링크 생성
- 게시 완료 후 QR 코드 및 링크 생성됨
- 다른 사람에게 링크 공유
- Expo Go 앱으로 실행 가능

#### 단점:
- Expo Go 앱 필요
- 프로덕션 배포 불가
- 일부 네이티브 기능 제한

---

## 🏪 스토어 배포

### Google Play Store

#### 1. Play Console 계정 생성
- https://play.google.com/console
- 개발자 등록 ($25 일회성 비용)

#### 2. AAB 파일 업로드
```bash
eas build --platform android --profile production
```

#### 3. Play Console에서 앱 등록
- 앱 정보, 스크린샷, 설명 입력
- 내부 테스트 → 비공개 테스트 → 프로덕션 단계별 배포

### Apple App Store

#### 1. Apple Developer Program 등록
- https://developer.apple.com
- 연간 $99 비용

#### 2. iOS 빌드
```bash
eas build --platform ios --profile production
```

#### 3. App Store Connect에서 앱 등록
- https://appstoreconnect.apple.com
- 앱 정보, 스크린샷, 설명 입력
- 심사 제출

---

## ⚙️ 배포 전 체크리스트

### app.json 설정 확인
```json
{
  "expo": {
    "name": "DailyMeal",
    "slug": "dailymeal",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.dailymeal.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.dailymeal.app",
      "versionCode": 1
    }
  }
}
```

### App.js에서 프로덕션 URL 확인
```javascript
const WEB_URL = __DEV__ 
  ? 'http://192.168.219.103:3000'  // 개발
  : 'https://ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com'; // 프로덕션
```

프로덕션 URL을 실제 배포된 도메인으로 변경:
```javascript
const WEB_URL = __DEV__ 
  ? 'http://192.168.219.103:3000'  
  : 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com'; // 실제 도메인
```

### 아이콘 및 스플래시 준비
- `assets/icon.png` (1024x1024)
- `assets/splash-icon.png` (1284x2778)
- `assets/adaptive-icon.png` (1024x1024, Android)

---

## 🔧 빌드 프로필 (eas.json)

EAS 빌드 시 자동 생성되는 `eas.json`:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📊 배포 비용 비교

| 방법 | 비용 | 장점 | 단점 |
|------|------|------|------|
| **EAS Build (Free)** | 무료 (제한적) | 간편, 클라우드 빌드 | 빌드 시간 대기 |
| **EAS Build (Paid)** | $29/월 | 빠른 빌드, 우선순위 | 월 비용 발생 |
| **로컬 빌드** | 무료 | 무제한, 빠름 | 환경 설정 복잡 |
| **Expo Go 공유** | 무료 | 즉시 공유 | 프로덕션 불가 |

---

## 🎯 권장 워크플로우

### 개발 단계
```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.219.103 npx expo start
```

### 테스트 배포 (APK)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

### 프로덕션 배포
```bash
# 프로덕션 URL 변경 (App.js)
# 버전 업데이트 (app.json)
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## 📚 참고 문서

- [Expo 빌드 문서](https://docs.expo.dev/build/introduction/)
- [EAS Build 가이드](https://docs.expo.dev/build/setup/)
- [Play Store 배포](https://docs.expo.dev/submit/android/)
- [App Store 배포](https://docs.expo.dev/submit/ios/)
- [앱 서명](https://docs.expo.dev/app-signing/app-credentials/)

---

## 🆘 문제 해결

### "Build failed" 오류
- `app.json`의 bundleIdentifier/package 확인
- 빌드 로그에서 구체적 오류 확인

### iOS 빌드 오류
- Apple Developer 계정 연동 확인
- 인증서 및 프로비저닝 프로파일 확인

### Android 빌드 오류
- Java 버전 확인 (JDK 17 권장)
- Android SDK 버전 확인

---

**빠른 테스트를 원하시면 옵션 1 (EAS Build - Preview)를 권장합니다!**
