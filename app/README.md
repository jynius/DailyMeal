# DailyMeal Mobile App (Expo)

DailyMeal 웹사이트를 WebView로 감싼 크로스 플랫폼 모바일 앱입니다.

## ⚠️ 중요: 방화벽 설정 필요

WSL2 환경에서 개발 시 Windows 방화벽 설정이 필요합니다.  
**→ [방화벽 설정 가이드](../FIREWALL_SETUP.md) 참고**

## 🚀 시작하기

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

### Android APK 빌드
```bash
eas build --platform android --profile preview
```

### iOS 빌드 (macOS + Apple Developer 계정 필요)
```bash
eas build --platform ios --profile preview
```

## ⚙️ 설정

### 웹사이트 URL 변경
`App.js` 파일에서 `WEB_URL` 상수를 수정:
```javascript
const WEB_URL = __DEV__ 
  ? 'http://localhost:3000'  // 개발 모드
  : 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com'; // 프로덕션 (실제 도메인으로 변경)
```

### 앱 이름 및 패키지명 변경
`app.json` 파일 수정:
```json
{
  "expo": {
    "name": "DailyMeal",
    "slug": "dailymeal",
    "ios": {
      "bundleIdentifier": "com.dailymeal.app"
    },
    "android": {
      "package": "com.dailymeal.app"
    }
  }
}
```

## 📋 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Android Studio (Android 빌드 시)
- Xcode (iOS 빌드 시, macOS만)
- Expo Go 앱 (테스트용)

## 🔧 문제 해결

### Android 로컬 테스트 시 "Unable to connect" 오류
- `App.js`의 `WEB_URL`을 `http://10.0.2.2:3000` (Android 에뮬레이터) 또는 실제 IP 주소로 변경

### iOS 시뮬레이터에서 localhost 연결 불가
- `http://localhost:3000` 대신 컴퓨터의 실제 IP 주소 사용 (예: `http://192.168.1.100:3000`)

## 📚 참고 문서

- [Expo 문서](https://docs.expo.dev/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [EAS Build](https://docs.expo.dev/build/introduction/)
