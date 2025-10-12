# React Native WebView 앱 디버깅 가이드

## 개요

DailyMeal 모바일 앱(React Native WebView)을 디버깅하는 다양한 방법을 설명합니다.

## 1. Chrome DevTools (가장 강력)

### Android - USB 디버깅

#### 1.1 사전 준비

```bash
# Android 기기 USB 디버깅 활성화
# 설정 → 휴대전화 정보 → 빌드 번호 7회 탭 (개발자 모드 활성화)
# 설정 → 개발자 옵션 → USB 디버깅 켜기

# ADB 설치 확인 (Ubuntu)
sudo apt-get install android-tools-adb android-tools-fastboot

# 기기 연결 확인
adb devices
# List of devices attached
# 1234567890ABCDEF	device
```

#### 1.2 Chrome DevTools 열기

```bash
# 1. Android 기기를 USB로 연결
# 2. Chrome 브라우저 열기
# 3. 주소창에 입력:
chrome://inspect/#devices

# 4. WebView 찾기:
# "com.dailymeal.app" 또는 "WebView in com.dailymeal.app"

# 5. "inspect" 클릭
```

#### 1.3 DevTools에서 확인 가능한 것

**Console 탭:**
```javascript
// 앱에서 실행된 모든 console.log 확인
[WebView] Detected! Setting up debug mode...
[Link Click] Statistics
[Navigation] / → /statistics (pushState)
[Nav Click] 피드 /feed
```

**Network 탭:**
- API 요청/응답 확인
- 이미지 로딩 실패 확인
- 타임아웃 확인

**Elements 탭:**
- DOM 구조 확인
- CSS 스타일 실시간 수정
- 요소 검사

**Sources 탭:**
- JavaScript 디버깅
- 브레이크포인트 설정
- 단계별 실행

**Application 탭:**
- LocalStorage 확인
- SessionStorage 확인
- Cookies 확인
- Service Worker 상태

## 2. React Native 로그 (터미널)

### 2.1 Android Logcat

```bash
# 모든 로그 보기
adb logcat

# React Native 로그만 필터링
adb logcat | grep ReactNativeJS

# 앱 로그만 필터링
adb logcat | grep "com.dailymeal.app"

# 에러만 필터링
adb logcat *:E

# 특정 태그 필터링
adb logcat -s ReactNative:V ReactNativeJS:V
```

**출력 예시:**
```
10-11 08:27:15.432  1234  5678 I ReactNativeJS: Load started
10-11 08:27:16.123  1234  5678 I ReactNativeJS: [WebView] Detected!
10-11 08:27:16.456  1234  5678 I ReactNativeJS: [Click] 통계 버튼
10-11 08:27:16.789  1234  5678 I ReactNativeJS: [Navigation] / → /statistics
```

### 2.2 필터링 팁

```bash
# 실시간 로그 저장
adb logcat | grep ReactNativeJS > app_log.txt

# 특정 키워드만 보기
adb logcat | grep -i "error\|warning\|exception"

# 컬러 출력 (pidcat 사용)
pip install pidcat
pidcat com.dailymeal.app

# 로그 클리어 후 다시 시작
adb logcat -c && adb logcat | grep ReactNativeJS
```

## 3. Expo Dev Tools

### 3.1 개발 모드에서 실행

```bash
cd ~/projects/WebApp/DailyMeal/app

# Expo 개발 서버 시작
npx expo start

# 또는 특정 네트워크로
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.x.x npx expo start
```

**터미널 출력:**
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press m │ toggle menu
› Press r │ reload app
```

### 3.2 Expo Go 앱에서 실행

1. Google Play에서 "Expo Go" 설치
2. QR 코드 스캔
3. 앱 실행
4. 터미널에서 로그 확인

**장점:**
- 코드 수정 시 자동 새로고침 (Fast Refresh)
- 에러 스택 트레이스 표시
- 네트워크 요청 로깅

## 4. React Native Debugger (고급)

### 4.1 설치

```bash
# Ubuntu
wget https://github.com/jhen0409/react-native-debugger/releases/download/v0.14.0/react-native-debugger_0.14.0_amd64.deb
sudo dpkg -i react-native-debugger_0.14.0_amd64.deb

# 실행
react-native-debugger
```

### 4.2 사용

1. React Native Debugger 실행
2. 포트를 19000 (Expo) 또는 8081 (React Native)로 설정
3. 앱에서 "Debug JS Remotely" 활성화
4. Redux, AsyncStorage, Network 등 확인 가능

## 5. 앱 내부 디버그 메뉴

### 5.1 Android 디버그 메뉴 열기

**방법 1: 흔들기**
- 기기를 흔들면 디버그 메뉴 표시

**방법 2: adb 명령어**
```bash
adb shell input keyevent 82
```

**방법 3: 터미널 단축키**
```bash
# Expo 개발 서버 실행 중
# 터미널에서 'm' 키 누르기
```

### 5.2 디버그 메뉴 옵션

- **Reload**: 앱 새로고침
- **Debug JS Remotely**: Chrome DevTools 연결
- **Enable Fast Refresh**: 코드 수정 시 자동 새로고침
- **Toggle Inspector**: UI 요소 검사
- **Show Perf Monitor**: 성능 모니터 표시

## 6. 코드에 로깅 추가

### 6.1 기본 로깅

```javascript
// App.js
console.log('Normal log');
console.warn('Warning!');
console.error('Error!');
console.info('Info');
console.debug('Debug info');
```

### 6.2 구조화된 로깅

```javascript
// 객체 로깅
console.log('User data:', { id: 123, name: 'John' });

// 테이블 로깅 (Chrome DevTools에서)
console.table([
  { name: 'Page A', visits: 100 },
  { name: 'Page B', visits: 200 }
]);

// 그룹 로깅
console.group('API Request');
console.log('URL:', url);
console.log('Method:', method);
console.log('Body:', body);
console.groupEnd();
```

### 6.3 조건부 로깅

```javascript
const DEBUG = __DEV__; // 개발 모드에서만 true

function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

debugLog('This only shows in dev mode');
```

## 7. 네트워크 디버깅

### 7.1 Chrome DevTools Network 탭

USB 디버깅으로 Chrome DevTools를 열면:
- 모든 HTTP/HTTPS 요청 확인
- 요청/응답 헤더
- 페이로드
- 타이밍
- WebSocket 연결

### 7.2 Proxy 사용 (Charles/Fiddler)

```bash
# Android 기기 WiFi 설정에서 프록시 설정
# IP: 개발 PC IP
# Port: 8888 (Charles 기본 포트)

# Charles에서 SSL 인증서 설치 필요
```

### 7.3 React Native Network Inspector

```javascript
// global 설정에 추가
global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
global.FormData = global.originalFormData || global.FormData;

// fetch 로깅
const originalFetch = global.fetch;
global.fetch = (...args) => {
  console.log('Fetch:', args[0]);
  return originalFetch(...args);
};
```

## 8. WebView 디버깅

### 8.1 WebView 메시지 확인

```javascript
// App.js
onMessage={(event) => {
  console.log('Message from WebView:', event.nativeEvent.data);
}}

// 웹페이지에서
window.ReactNativeWebView?.postMessage(JSON.stringify({
  type: 'DEBUG',
  data: 'Something happened'
}));
```

### 8.2 JavaScript Injection

```javascript
// App.js
injectedJavaScript={`
  console.log('Injected script running');
  window.onerror = function(msg, url, line) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'ERROR',
      message: msg,
      url: url,
      line: line
    }));
  };
  true; // 반드시 true 반환
`}
```

## 9. 퍼포먼스 디버깅

### 9.1 Perf Monitor 활성화

```javascript
// App.js
import { DevSettings } from 'react-native';

useEffect(() => {
  if (__DEV__) {
    DevSettings.addMenuItem('Toggle Perf Monitor', () => {
      // 성능 모니터 토글
    });
  }
}, []);
```

### 9.2 FPS 모니터링

디버그 메뉴 → "Show Perf Monitor"
- JS Frame Rate: JavaScript 스레드 FPS
- UI Frame Rate: UI 스레드 FPS

## 10. 프로덕션 빌드 디버깅

### 10.1 Crashlytics 설정 (선택)

```bash
# Firebase Crashlytics 설치
npm install @react-native-firebase/crashlytics

# 크래시 리포트 자동 수집
```

### 10.2 Sentry 설정 (선택)

```bash
npm install @sentry/react-native

# App.js
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});
```

## 11. 실전 디버깅 시나리오

### 시나리오 1: 버튼 클릭이 안 됨

```bash
# 1. Chrome DevTools 연결
chrome://inspect/#devices

# 2. Console에서 클릭 이벤트 확인
[Click] 버튼명

# 3. Elements에서 z-index, pointer-events 확인
# 4. 클릭 영역 시각화
document.querySelectorAll('*').forEach(el => {
  el.style.outline = '1px solid red';
});
```

### 시나리오 2: 페이지 로딩 느림

```bash
# 1. Network 탭에서 느린 요청 찾기
# 2. Timing 확인
# 3. adb logcat으로 네이티브 레벨 확인

adb logcat | grep -i "performance\|slow"
```

### 시나리오 3: 앱 크래시

```bash
# 1. Logcat에서 스택 트레이스 확인
adb logcat | grep -A 50 "FATAL EXCEPTION"

# 2. 크래시 직전 로그 확인
adb logcat -d > crash_log.txt

# 3. tombstone 파일 확인 (네이티브 크래시)
adb pull /data/tombstones/
```

## 12. 디버깅 체크리스트

### 앱이 실행 안 될 때
- [ ] `adb devices`로 기기 연결 확인
- [ ] USB 디버깅 활성화 확인
- [ ] 앱 권한 확인 (인터넷, 카메라 등)
- [ ] `adb logcat`으로 에러 확인

### WebView 콘텐츠가 안 보일 때
- [ ] Chrome DevTools로 Console 에러 확인
- [ ] Network 탭에서 요청 실패 확인
- [ ] `javaScriptEnabled={true}` 설정 확인
- [ ] 인터넷 연결 확인

### 페이지 전환이 안 될 때
- [ ] Console에서 클릭 이벤트 로그 확인
- [ ] Navigation 로그 확인
- [ ] React Router 상태 확인
- [ ] WebView `domStorageEnabled` 확인

## 13. 유용한 도구들

| 도구 | 용도 | 설치 |
|-----|------|-----|
| Chrome DevTools | WebView 디버깅 | 브라우저 내장 |
| adb logcat | 네이티브 로그 | `apt-get install android-tools-adb` |
| React Native Debugger | 종합 디버깅 | [GitHub](https://github.com/jhen0409/react-native-debugger) |
| Flipper | Facebook 디버거 | [Flipper.dev](https://fbflipper.com/) |
| Reactotron | Redux/API 디버깅 | `npm install reactotron-react-native` |

## 14. 팁과 트릭

### 빠른 디버깅 워크플로우

```bash
# 터미널 1: Logcat 필터링
adb logcat | grep ReactNativeJS

# 터미널 2: 앱 재시작
adb shell am force-stop com.dailymeal.app
adb shell am start -n com.dailymeal.app/.MainActivity

# Chrome DevTools는 항상 열어두기
```

### Console 꾸미기

```javascript
// App.js
console.log('%c🚀 App Started', 'color: green; font-size: 20px');
console.log('%c⚠️ Warning', 'color: orange; font-size: 16px');
console.log('%c❌ Error', 'color: red; font-size: 16px');
```

### 환경별 로깅

```javascript
// config.js
export const DEBUG = {
  network: __DEV__,
  navigation: __DEV__,
  render: false, // 너무 많아서 끄기
};

// 사용
if (DEBUG.navigation) {
  console.log('[Nav]', ...);
}
```

## 결론

**추천 디버깅 방법:**

1. **개발 중**: Expo Dev Tools + Chrome DevTools
2. **프로덕션 빌드 테스트**: Chrome DevTools (USB)
3. **크래시 디버깅**: adb logcat
4. **네트워크 문제**: Chrome DevTools Network 탭
5. **퍼포먼스**: Perf Monitor + Chrome DevTools Performance

DailyMeal 앱의 경우 WebView 디버깅이 핵심이므로 **Chrome DevTools를 USB로 연결하는 것이 가장 효과적**입니다!
