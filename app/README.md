# DailyMeal Mobile App (Expo)

DailyMeal 웹사이트를 WebView로 감싼 크로스 플랫폼 모바일 앱입니다.

## 📖 상세 문서

모바일 앱 개발 및 배포에 필요한 가이드는 [docs/app/](../docs/app/) 폴더를 참조하세요:

- [📱 앱 배포 가이드](../docs/app/DEPLOYMENT.md) - EAS Build, APK/AAB 빌드, 앱스토어 배포
- [🔍 디버깅 가이드](../docs/app/DEBUGGING_GUIDE.md) - Chrome DevTools, ADB 연결
- [📋 배포 체크리스트](../docs/app/DEPLOYMENT_CHECKLIST.md) - 배포 전 확인사항
- [📱 전체화면 모드](../docs/app/FULLSCREEN_MODE.md) - Android 전체화면 설정
- [🔄 새로고침 기능](../docs/app/REFRESH_GUIDE.md) - Pull-to-refresh 구현
- [📦 빌드 결과](../docs/app/BUILD_RESULT.md) - 최근 빌드 기록

### 인프라 문서
- [🔥 방화벽 설정](../docs/infrastructure/FIREWALL_SETUP.md) - WSL2 개발 환경 필수 설정
- [🌐 네트워크 구조](../docs/infrastructure/NETWORK_ARCHITECTURE.md) - 시스템 아키텍처

### 앱 스토어 배포
- [🏪 Play Store 배포](../docs/app-store/PLAYSTORE_DEPLOYMENT.md) - Google Play 등록 가이드
- [� 앱 스토어 설명](../docs/app-store/APP_STORE_DESCRIPTION.md) - 앱 설명 및 스크린샷

## ⚠️ 중요: 방화벽 설정 필요

WSL2 환경에서 개발 시 Windows 방화벽 설정이 필요합니다.  
**→ [방화벽 설정 가이드](../docs/FIREWALL_SETUP.md) 참고**

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행

#### Android
```bash
npx expo start --android
```

#### iOS (macOS만 가능)
```bash
npx expo start --ios
```

#### 웹 브라우저
```bash
npx expo start --web
```

#### Expo Go 앱으로 테스트
```bash
npx expo start
```
그 후 QR 코드를 스캔하여 Expo Go 앱에서 실행

## 📱 빌드

### Android APK 빌드 (Preview)
```bash
eas build --platform android --profile preview
```

### Android AAB 빌드 (Production)
```bash
eas build --platform android --profile production
```

### iOS 빌드 (macOS + Apple Developer 계정 필요)
```bash
eas build --platform ios --profile preview
```

## 🛠️ 기술 스택

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **WebView**: React Native WebView 13.15.0
- **Build**: EAS Build

## 📂 주요 구조

```
app/
├── app/
│   ├── _layout.tsx      # 루트 레이아웃
│   └── index.tsx        # 메인 화면 (WebView)
├── assets/              # 이미지, 아이콘
├── app.json             # Expo 설정
└── eas.json             # EAS Build 설정
```

## 🔧 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npx expo start

# Android 실행
npx expo start --android

# iOS 실행
npx expo start --ios

# 웹 실행
npx expo start --web

# 타입 체크
npx tsc --noEmit
```

## 📝 환경 설정

### app.json
```json
{
  "expo": {
    "name": "DailyMeal",
    "slug": "dailymeal",
    "version": "1.0.0",
    "scheme": "dailymeal",
    "web": {
      "bundler": "metro",
      "output": "static"
    }
  }
}
```

### eas.json
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

## 🌐 WebView URL 설정

앱의 WebView는 다음 URL을 로드합니다:

- **개발**: `http://172.21.114.94:3000` (WSL2)
- **프로덕션**: `https://dailymeal.jynius.com`

URL 변경은 `app/index.tsx` 파일에서 수정하세요.

## 📦 빌드 결과물

### Android
- **Preview**: `dailymeal-preview.apk` (테스트용)
- **Production**: `dailymeal-production.aab` (Google Play 업로드용)

### iOS
- **Preview**: `.ipa` 파일 (TestFlight 배포용)
- **Production**: `.ipa` 파일 (App Store 제출용)

## 🔍 트러블슈팅

### 방화벽 문제
WSL2에서 Windows 방화벽이 연결을 차단하는 경우:
```powershell
# PowerShell (관리자 권한)
New-NetFirewallRule -DisplayName "WSL2 React Native" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000,8000,8081,19000-19006
```

자세한 내용은 [방화벽 설정 가이드](../docs/FIREWALL_SETUP.md) 참조

### Expo Go 연결 안 됨
1. 방화벽 규칙 확인
2. 같은 Wi-Fi 네트워크 사용 확인
3. `npx expo start --tunnel` 시도

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
eas build:cancel
eas build --platform android --profile preview --clear-cache
```

---

**Expo 공식 문서**: https://docs.expo.dev/  
**React Native WebView**: https://github.com/react-native-webview/react-native-webview
