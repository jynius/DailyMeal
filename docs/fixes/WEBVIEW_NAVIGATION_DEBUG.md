# WebView 페이지 전환 문제 해결 가이드

## 문제 증상

- ✅ 로그인 작동
- ✅ 홈 화면 로딩
- ✅ 공유, 평가, 삭제, 새로고침 버튼 작동
- ❌ 페이지 전환 버튼 동작 안 함 (통계, 맛집, 피드, 프로필 등)
- ❌ 하단 네비게이션 버튼 동작 안 함

## 원인 분석

### 1. Next.js 클라이언트 라우팅 vs WebView

Next.js는 기본적으로 **클라이언트 사이드 라우팅**을 사용:
- `<Link>` 컴포넌트는 `router.push()` 사용
- URL 변경 없이 JavaScript로 페이지 전환
- `history.pushState()` API 사용

React Native WebView는:
- URL 변경만 감지 (예: `https://site.com/page1` → `https://site.com/page2`)
- JavaScript 기반 SPA 라우팅은 감지 못함
- `onShouldStartLoadWithRequest`는 새로운 URL 로딩 시작 시에만 호출

### 2. 가능한 원인들

#### A. JavaScript 비활성화
```javascript
// ❌ 문제
javaScriptEnabled={false}

// ✅ 해결
javaScriptEnabled={true}
```

#### B. DOM Storage 비활성화
```javascript
// ❌ 문제
domStorageEnabled={false}

// ✅ 해결
domStorageEnabled={true}  // localStorage, sessionStorage 필요
```

#### C. 터치 이벤트 차단
```javascript
// onShouldStartLoadWithRequest가 true 반환해야 함
onShouldStartLoadWithRequest={request => {
  console.log('Navigation to:', request.url);
  return true;  // false면 네비게이션 차단!
}}
```

#### D. CSS `pointer-events: none`
```css
/* 일부 요소에 이 스타일이 있으면 클릭 불가 */
.some-element {
  pointer-events: none;
}
```

## 해결 방법

### 1. App.js 수정 (완료)

```javascript
<WebView
  // 필수 설정
  javaScriptEnabled={true}
  domStorageEnabled={true}
  cacheEnabled={true}
  thirdPartyCookiesEnabled={true}
  
  // 네비게이션 감지
  onNavigationStateChange={(navState) => {
    console.log('Navigation:', navState.url, 'Loading:', navState.loading);
  }}
  
  // onShouldStartLoadWithRequest 제거 (문제 가능성)
/>
```

### 2. 프론트엔드 디버깅 추가 (완료)

#### webview-utils.ts
```typescript
// WebView 감지
export function isWebView(): boolean

// 네비게이션 로깅
export function logNavigation(from, to, method)

// History API 가로채기
export function setupWebViewDebug()
```

#### page.tsx, bottom-navigation.tsx
```typescript
// WebView 디버깅 활성화
useEffect(() => {
  if (isWebView()) {
    setupWebViewDebug();
  }
}, []);

// 클릭 이벤트 로깅
onClick={() => {
  logClick('button-name');
  console.log('[Click] Button clicked');
}}
```

### 3. 디버깅 방법

#### A. Chrome DevTools (USB 디버깅)

```bash
# Android 기기를 USB로 연결
# Chrome에서 접속
chrome://inspect/#devices

# WebView 선택 → Console 탭에서 로그 확인
```

**확인할 로그:**
```
[WebView] Detected! Setting up debug mode...
[Click] Button clicked
[Navigation] / → /statistics (pushState)
[History] pushState: /statistics
```

#### B. React Native 로그

```bash
# React Native 앱 실행 중
npx react-native log-android
# 또는
adb logcat | grep ReactNativeJS
```

**확인할 로그:**
```
[Nav Click] 통계 /statistics
Navigation state: https://dailymeal.life/statistics Loading: true
```

#### C. 네트워크 확인

```bash
# 서버 로그 확인
pm2 logs dailymeal-api

# Nginx 로그
sudo tail -f /var/log/nginx/dailymeal-access.log
```

### 4. 테스트 시나리오

#### Test 1: 버튼 클릭 감지
1. 홈 화면에서 "통계" 버튼 클릭
2. Chrome DevTools에서 확인:
   ```
   [Link Click] Statistics
   ```
3. ✅ 로그 나옴 → 클릭 감지됨
4. ❌ 로그 없음 → JavaScript 실행 안 됨 (WebView 설정 문제)

#### Test 2: Next.js 라우팅 동작
1. 버튼 클릭 후 확인:
   ```
   [History] pushState: /statistics
   ```
2. ✅ 로그 나옴 → Next.js 라우팅 작동
3. ❌ 로그 없음 → Next.js 라우터 초기화 실패

#### Test 3: 페이지 전환 완료
1. URL이 변경되고 새 페이지 렌더링되는지 확인
2. WebView의 `onNavigationStateChange` 호출되는지 확인
3. ✅ 페이지 전환 → 문제 해결
4. ❌ 클릭만 되고 전환 안 됨 → 추가 디버깅 필요

## 추가 해결책

### A. Link 컴포넌트 대신 router.push 사용

```tsx
// 기존
<Link href="/statistics">통계</Link>

// 대안
<button onClick={() => {
  console.log('Navigating to /statistics');
  router.push('/statistics');
}}>
  통계
</button>
```

### B. window.location 사용 (강제 페이지 로드)

```typescript
// Next.js 라우터가 작동 안 할 때
onClick={() => {
  if (isWebView()) {
    window.location.href = '/statistics';
  } else {
    router.push('/statistics');
  }
}}
```

### C. Prefetch 비활성화

```tsx
// Next.js Link prefetch 끄기
<Link href="/statistics" prefetch={false}>
  통계
</Link>
```

### D. WebView에서 새 창 열기 처리

```javascript
// App.js
<WebView
  onOpenWindow={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.log('Open window:', nativeEvent.targetUrl);
    // 필요시 처리
  }}
/>
```

## 체크리스트

배포 전 확인사항:

- [ ] 1. `javaScriptEnabled={true}` 설정됨
- [ ] 2. `domStorageEnabled={true}` 설정됨
- [ ] 3. `onShouldStartLoadWithRequest` 제거 또는 `return true`
- [ ] 4. 프론트엔드 빌드 및 배포
- [ ] 5. 앱 리빌드 (Expo EAS)
- [ ] 6. Chrome DevTools로 WebView 디버깅
- [ ] 7. 콘솔 로그 확인 (`[Click]`, `[Navigation]`, `[History]`)
- [ ] 8. 각 버튼 클릭 테스트 (홈, 피드, 맛집, 친구, 프로필, 추가)
- [ ] 9. 페이지 전환 확인
- [ ] 10. 뒤로가기 버튼 동작 확인

## 배포 명령어

### 프론트엔드
```bash
cd ~/DailyMeal
git pull
./bin/deploy.sh
```

### 모바일 앱
```bash
cd ~/projects/WebApp/DailyMeal/app
eas build --platform android --profile preview
```

## 트러블슈팅

### 문제: 클릭 이벤트 자체가 감지 안 됨

**원인**: z-index, pointer-events, touch-action CSS 문제

**해결**:
```css
/* bottom-navigation.tsx */
.touch-target {
  z-index: 50;
  pointer-events: auto;
  touch-action: manipulation;
}
```

### 문제: 클릭은 되지만 페이지 전환 안 됨

**원인**: Next.js 라우터가 WebView에서 초기화 실패

**해결**:
```typescript
// _app.tsx 또는 layout.tsx
useEffect(() => {
  // 라우터 강제 새로고침
  router.refresh();
}, []);
```

### 문제: 일부 버튼만 작동 (공유, 평가, 삭제는 OK)

**원인**: API 호출은 되지만 라우팅은 안 됨

**분석**:
- API 호출: `fetch()` → 정상 작동
- 라우팅: `router.push()` → 실패

**해결**: router 대신 window.location 사용

### 문제: 로그는 나오지만 화면 전환 안 됨

**원인**: Next.js가 페이지를 렌더링했지만 WebView가 표시 안 함

**해결**:
```javascript
// App.js - 강제 리렌더링
onNavigationStateChange={(navState) => {
  if (!navState.loading) {
    webViewRef.current?.reload();
  }
}}
```

## 결론

WebView에서 SPA 라우팅이 작동하지 않는 경우:

1. **1차 해결**: WebView 기본 설정 확인 (JavaScript, DOM Storage)
2. **2차 해결**: 디버깅 로그 추가하여 어디서 막히는지 확인
3. **3차 해결**: Next.js Link → window.location으로 변경
4. **최종 해결**: Chrome DevTools로 실제 WebView 디버깅

현재 변경사항 배포 후 Chrome DevTools로 실제 동작 확인 필요!
