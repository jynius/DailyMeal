# WebView 새로고침 기능 가이드

## 개요

DailyMeal 앱에서 페이지를 새로고침하는 방법을 설명합니다.

## 구현된 기능

### 1. Pull-to-Refresh (당겨서 새로고침)

가장 직관적인 방법으로, 화면을 아래로 당기면 자동으로 새로고침됩니다.

#### 구현 코드

```javascript
<WebView
  ref={webViewRef}
  source={{ uri: WEB_URL }}
  pullToRefreshEnabled={true}  // ✅ Pull-to-Refresh 활성화
  onLoadEnd={() => {
    setRefreshing(false);  // 새로고침 완료 시 종료
  }}
/>
```

#### 사용 방법
1. 화면 최상단에서 아래로 스와이프
2. 로딩 인디케이터 표시
3. 페이지 자동 새로고침
4. 완료 후 인디케이터 사라짐

### 2. 프로그래매틱 새로고침

코드로 직접 새로고침을 트리거할 수 있습니다.

#### 구현 코드

```javascript
const onRefresh = () => {
  setRefreshing(true);
  console.log('Refreshing WebView...');
  
  // WebView 새로고침
  if (webViewRef.current) {
    webViewRef.current.reload();
  }
  
  // 타임아웃 설정 (안전장치)
  setTimeout(() => {
    setRefreshing(false);
  }, 2000);
};
```

#### 사용 방법
- `webViewRef.current.reload()` 호출
- 버튼 클릭 등 이벤트에서 실행 가능

### 3. Deep Link로 새로고침

앱 외부에서 링크를 통해 특정 페이지를 새로고침하거나 이동할 수 있습니다.

```javascript
const handleDeepLink = (url) => {
  const { path } = Linking.parse(url);
  
  // WebView에 메시지 전송
  webViewRef.current?.postMessage(JSON.stringify({
    type: 'NAVIGATE',
    path: path,
  }));
};
```

## 사용자 경험

### Pull-to-Refresh 동작

```
┌──────────────────────┐
│ 🕐 10:30             │
├──────────────────────┤
│  DailyMeal           │
│  ↓↓↓ (당기기)        │ ← 사용자가 아래로 스와이프
├──────────────────────┤
│  🔄 새로고침 중...    │ ← 로딩 인디케이터
├──────────────────────┤
│                      │
│  새로고침된 콘텐츠     │
│                      │
└──────────────────────┘
```

### 장점

1. **직관적**: 모바일 앱에서 표준적인 UX 패턴
2. **자연스러움**: 물리적인 제스처로 동작
3. **피드백**: 시각적 인디케이터로 진행 상태 표시
4. **빠름**: 네트워크 연결만 있으면 즉시 새로고침

## 웹뷰에서 새로고침 트리거

웹 페이지 내부에서도 앱의 새로고침을 트리거할 수 있습니다.

### 방법 1: 웹에서 앱으로 메시지 전송

```javascript
// 프론트엔드 (웹)
if (window.ReactNativeWebView) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'REFRESH'
  }));
}
```

```javascript
// App.js (앱)
onMessage={(event) => {
  const message = JSON.parse(event.nativeEvent.data);
  if (message.type === 'REFRESH') {
    webViewRef.current?.reload();
  }
}}
```

### 방법 2: 일반 새로고침 버튼

웹 페이지에 버튼을 추가:

```jsx
<button onClick={() => window.location.reload()}>
  새로고침
</button>
```

이 방법은 앱 내에서도 웹 브라우저에서도 동일하게 작동합니다.

## 고급 기능

### 1. 자동 새로고침 (주기적)

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    if (webViewRef.current) {
      console.log('Auto refresh...');
      webViewRef.current.reload();
    }
  }, 300000); // 5분마다
  
  return () => clearInterval(interval);
}, []);
```

### 2. 네트워크 재연결 시 자동 새로고침

```javascript
import NetInfo from '@react-native-community/netinfo';

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && !prevConnected.current) {
      console.log('Network reconnected, refreshing...');
      webViewRef.current?.reload();
    }
    prevConnected.current = state.isConnected;
  });
  
  return () => unsubscribe();
}, []);
```

### 3. 포그라운드 복귀 시 새로고침

```javascript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active' && appState.current.match(/inactive|background/)) {
      console.log('App came to foreground, refreshing...');
      webViewRef.current?.reload();
    }
    appState.current = nextAppState;
  });
  
  return () => subscription.remove();
}, []);
```

## 새로고침 상태 관리

### 로딩 인디케이터 표시

```javascript
const [refreshing, setRefreshing] = useState(false);

// 새로고침 시작
const onRefresh = () => {
  setRefreshing(true);
  webViewRef.current?.reload();
};

// WebView 로딩 완료 시
onLoadEnd={() => {
  setRefreshing(false);
}}

// UI
{refreshing && (
  <View style={styles.refreshIndicator}>
    <ActivityIndicator size="small" color="#3B82F6" />
    <Text>새로고침 중...</Text>
  </View>
)}
```

## 트러블슈팅

### 문제: Pull-to-Refresh가 작동하지 않음

**원인**: 웹 페이지가 스크롤 위치에 있지 않음

**해결**:
```javascript
pullToRefreshEnabled={true}
scrollEnabled={true}  // 스크롤 활성화 필수
```

### 문제: 새로고침 후 스크롤 위치 유지

**원인**: 기본적으로 최상단으로 이동

**해결**:
```javascript
// 현재 스크롤 위치 저장 후 복원
const scrollPosition = useRef(0);

// 스크롤 이벤트 감지
injectedJavaScript={`
  window.addEventListener('scroll', () => {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'SCROLL',
      position: window.scrollY
    }));
  });
`}

// 스크롤 위치 복원
onLoadEnd={() => {
  if (scrollPosition.current > 0) {
    webViewRef.current?.injectJavaScript(
      `window.scrollTo(0, ${scrollPosition.current});`
    );
  }
}}
```

### 문제: 새로고침이 너무 느림

**원인**: 캐시 문제

**해결**:
```javascript
// 캐시 강제 새로고침
webViewRef.current?.reload();

// 또는 캐시 비우기
cacheMode="LOAD_NO_CACHE"  // 개발 중에만 사용
```

## 권장 사항

### 1. 피드백 제공
- 새로고침 시작 시 인디케이터 표시
- 완료 시 알림 또는 애니메이션

### 2. 오프라인 처리
- 네트워크 없을 때 새로고침 방지
- 오류 메시지 표시

### 3. 중복 방지
- 이미 새로고침 중일 때 추가 요청 무시
- `refreshing` 상태로 제어

```javascript
const onRefresh = () => {
  if (refreshing) return;  // 이미 새로고침 중이면 무시
  
  setRefreshing(true);
  webViewRef.current?.reload();
};
```

### 4. 타임아웃 설정
- 너무 오래 걸리면 강제 종료
- 사용자 경험 개선

```javascript
setTimeout(() => {
  if (refreshing) {
    setRefreshing(false);
    Alert.alert('새로고침 실패', '다시 시도해주세요.');
  }
}, 10000); // 10초 타임아웃
```

## 비교: 웹 vs 앱

| 기능 | 웹 브라우저 | 모바일 앱 |
|-----|-----------|---------|
| Pull-to-Refresh | ❌ 없음 (브라우저 자체 UI) | ✅ 네이티브 지원 |
| 새로고침 버튼 | ✅ 브라우저 UI | ✅ 커스텀 가능 |
| 자동 새로고침 | ⚠️ 제한적 | ✅ 완전 제어 |
| 포그라운드 복귀 | ❌ 없음 | ✅ 가능 |
| 오프라인 감지 | ⚠️ 제한적 | ✅ 완전 지원 |

## 예제: 완전한 새로고침 시스템

```javascript
export default function App() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const webViewRef = useRef(null);

  const onRefresh = () => {
    if (refreshing) return;
    
    setRefreshing(true);
    console.log('Refreshing at', new Date());
    
    webViewRef.current?.reload();
  };

  const handleLoadEnd = () => {
    setRefreshing(false);
    setLastRefresh(new Date());
    console.log('Refresh completed');
  };

  return (
    <View style={styles.container}>
      {/* 새로고침 상태 표시 */}
      {refreshing && (
        <View style={styles.refreshBanner}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.refreshText}>새로고침 중...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.dailymeal.life' }}
        pullToRefreshEnabled={true}
        onLoadEnd={handleLoadEnd}
      />
      
      {/* 마지막 새로고침 시간 */}
      <Text style={styles.lastRefreshText}>
        마지막 업데이트: {lastRefresh.toLocaleTimeString()}
      </Text>
    </View>
  );
}
```

## 결론

DailyMeal 앱은 **Pull-to-Refresh** 기능을 기본으로 제공하며:

1. ✅ 화면을 아래로 당겨서 새로고침
2. ✅ 자동으로 로딩 상태 표시
3. ✅ 완료 후 자동으로 인디케이터 숨김
4. ✅ 웹 표준 UX 패턴 준수

추가로 프로그래매틱 새로고침, 자동 새로고침 등 다양한 방법을 지원합니다.
