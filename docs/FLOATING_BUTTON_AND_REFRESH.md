# Floating 버튼 및 Pull-to-Refresh 수정

## 수정 사항

### 1. Floating 버튼 위치 조정

#### 문제
- DailyMeal 헤더는 safe area 패딩으로 내려옴 ✅
- Floating 버튼(+)은 여전히 높은 위치에 고정 ❌
- 불일치로 인한 UI 불균형

#### 해결
```tsx
// bottom-navigation.tsx
<Link 
  href="/add"
  style={{ 
    bottom: `calc(5rem + env(safe-area-inset-bottom, 0px))` 
  }}
>
```

**변경사항:**
- `bottom-20` (5rem 고정) → 동적 계산
- Safe area 고려하여 하단 네비게이션 위에 적절히 배치
- 헤더와 일관된 spacing

**결과:**
```
┌──────────────────┐
│ 상태바           │
│ ✨ DailyMeal     │ ← 헤더 (safe area 적용)
├──────────────────┤
│                  │
│  콘텐츠           │
│                  │
│              [+] │ ← Floating 버튼 (safe area 적용)
├──────────────────┤
│ 홈 피드 맛집      │ ← 하단 네비게이션
└──────────────────┘
```

### 2. Pull-to-Refresh 디버깅 강화

#### 기존 문제
- `pullToRefreshEnabled={true}` 설정됨
- 하지만 작동 확인이 어려움
- 로깅 부족

#### 개선 사항

**1. onRefresh 콜백 명시적 추가**
```javascript
<WebView
  pullToRefreshEnabled={true}
  onRefresh={onRefresh}  // ✅ 명시적 콜백
/>
```

**2. 강화된 로깅**
```javascript
const onRefresh = () => {
  console.log('🔄 [Pull-to-Refresh] Started');
  setRefreshing(true);
  
  if (webViewRef.current) {
    console.log('🔄 [Pull-to-Refresh] Reloading WebView');
    webViewRef.current.reload();
  } else {
    console.warn('⚠️ [Pull-to-Refresh] WebView ref is null');
  }
};
```

**3. 안전장치 추가**
```javascript
// 5초 타임아웃
setTimeout(() => {
  if (refreshing) {
    console.log('⏱️ [Pull-to-Refresh] Timeout - forcing end');
    setRefreshing(false);
  }
}, 5000);
```

**4. onLoadEnd에서 종료**
```javascript
onLoadEnd={() => {
  console.log('✅ Load ended');
  setRefreshing(false);
  console.log('🔄 [Pull-to-Refresh] Ended');
}}
```

## Pull-to-Refresh 작동 조건

### Android에서 작동하려면:

1. **WebView가 스크롤 최상단에 있어야 함**
   - 페이지가 스크롤 가능해야 함
   - 현재 스크롤 위치가 y=0

2. **제스처 감지**
   - 화면을 아래로 당기는 제스처
   - 최소 거리 이상 당겨야 트리거

3. **웹 페이지가 제스처 차단 안 함**
   - `touch-action: none` CSS가 없어야 함
   - JavaScript에서 터치 이벤트 차단 안 함

### 작동 확인 방법

#### 1. adb logcat으로 확인
```bash
adb logcat | grep ReactNativeJS

# 예상 출력:
# 🔄 [Pull-to-Refresh] Started
# 🔄 [Pull-to-Refresh] Reloading WebView
# ✅ Load ended
# 🔄 [Pull-to-Refresh] Ended
```

#### 2. 사용자 동작
1. 홈 화면 최상단으로 스크롤
2. 화면을 아래로 당김 (swipe down)
3. 로딩 인디케이터 표시 확인
4. 페이지 새로고침 확인

#### 3. 디버깅 체크리스트
- [ ] 로그: `[Pull-to-Refresh] Started` 출력됨
- [ ] 로그: `Reloading WebView` 출력됨
- [ ] 화면: 상단에 로딩 인디케이터 표시
- [ ] 로그: `Load ended` 출력됨
- [ ] 로그: `[Pull-to-Refresh] Ended` 출력됨

## 문제 해결

### 문제 1: Pull-to-Refresh가 트리거 안 됨

**원인:** 웹 페이지가 스크롤 최상단이 아님

**해결:**
```javascript
// 웹 페이지에서 스크롤을 최상단으로
window.scrollTo(0, 0);
```

**또는 App.js에서:**
```javascript
injectedJavaScript={`
  window.scrollTo(0, 0);
  true;
`}
```

### 문제 2: 제스처가 웹 페이지에 의해 차단됨

**원인:** CSS `overscroll-behavior` 설정

**해결:**
```css
/* globals.css */
body {
  overscroll-behavior-y: auto; /* 기본값 */
}
```

### 문제 3: 로딩 인디케이터만 보이고 새로고침 안 됨

**원인:** `webViewRef.current`가 null

**해결:** 로그 확인
```bash
adb logcat | grep "WebView ref is null"
```

만약 이 로그가 나오면 WebView가 마운트되지 않은 상태.

### 문제 4: Android에서만 안 됨 (iOS는 작동)

**원인:** Android WebView 버전 차이

**해결:**
```javascript
// Android 전용 설정 추가
import { Platform } from 'react-native';

<WebView
  pullToRefreshEnabled={Platform.OS === 'android'}
  bounces={Platform.OS === 'ios'}
/>
```

## 대안 방법

Pull-to-Refresh가 작동하지 않으면:

### 1. 새로고침 버튼 추가

```javascript
// 웹 페이지 헤더에 버튼 추가
<button onClick={() => window.location.reload()}>
  새로고침
</button>
```

### 2. WebView 메시지로 트리거

```javascript
// 웹 페이지
if (window.ReactNativeWebView) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'REFRESH'
  }));
}

// App.js
onMessage={(event) => {
  const message = JSON.parse(event.nativeEvent.data);
  if (message.type === 'REFRESH') {
    webViewRef.current?.reload();
  }
}}
```

### 3. 흔들기 제스처

```bash
npm install react-native-shake

# App.js
import RNShake from 'react-native-shake';

useEffect(() => {
  const subscription = RNShake.addListener(() => {
    console.log('Shake detected - refreshing');
    webViewRef.current?.reload();
  });
  
  return () => subscription.remove();
}, []);
```

## 테스트 방법

### 1. 로컬 빌드 테스트
```bash
cd ~/projects/WebApp/DailyMeal/app
npx expo start
# 'a' 눌러서 Android에서 실행
```

### 2. 프로덕션 빌드 테스트
```bash
eas build --platform android --profile preview
# APK 설치 후 테스트
```

### 3. adb로 모니터링
```bash
# 터미널 1: 로그 모니터링
adb logcat | grep -i "refresh\|reload\|pull"

# 터미널 2: 앱 재시작
adb shell am force-stop com.dailymeal.app
adb shell am start -n com.dailymeal.app/.MainActivity
```

## 배포

```bash
# 프론트엔드 (Floating 버튼 위치)
cd ~/DailyMeal
git add frontend/src/components/bottom-navigation.tsx
git commit -m "fix: Adjust floating button position with safe area"
git push

cd frontend
npm run build
pm2 restart dailymeal-frontend

# 앱 (Pull-to-Refresh 디버깅)
cd ~/projects/WebApp/DailyMeal/app
git add App.js
git commit -m "feat: Enhance pull-to-refresh with better logging"
git push

# 새 APK 빌드
eas build --platform android --profile preview
```

## 결론

### Floating 버튼
- ✅ Safe area 고려한 동적 위치 계산
- ✅ 헤더와 일관된 spacing
- ✅ 하단 네비게이션과 적절한 간격

### Pull-to-Refresh
- ✅ 명시적 콜백 추가
- ✅ 강화된 로깅으로 디버깅 용이
- ✅ 안전장치 (타임아웃) 추가
- ⏳ 실제 작동 여부는 디버깅 필요

디버깅으로 정확한 원인을 파악하세요! 🔍
