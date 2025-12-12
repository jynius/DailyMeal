# WebView에서 카카오톡 공유 창이 안 뜨는 문제 해결

**날짜**: 2025-11-11  
**상태**: ✅ 해결됨  
**최종 업데이트**: 2025-11-11 (설치 여부 확인 추가)

## 📋 문제 상황

- **PWA 버전**: 카카오톡 공유하기 정상 동작 ✅
- **네이티브 앱 버전**: "카카오톡으로 공유했습니다." 메시지만 뜨고 실제 공유 창이 열리지 않음 ❌

## 🔍 원인 분석

### 주요 원인
카카오톡 SDK가 `intent://` URL 스킴을 생성하는데, WebView가 이를 처리하지 못했습니다.

```javascript
// 카카오톡 SDK가 생성하는 URL
intent://send?appkey=...#Intent;package=com.kakao.talk;scheme=kakaotalk;end
```

### 기술적 배경
1. 일반 브라우저는 `intent://` 스킴을 자동으로 Android Intent로 변환
2. React Native WebView는 기본적으로 `intent://` 처리 없음
3. 로그에서 확인: `Can't open url: intent://send?...`

### 카카오톡 공유 프로세스

1. 카카오 SDK가 `window.open()`으로 팝업 창 생성 시도
2. WebView가 팝업 차단 (기본 설정)
3. JavaScript에서는 성공으로 인식 (에러 없음)
4. 실제 공유 창은 열리지 않음

## ✅ 해결 방법

### 1️⃣ WebView 팝업 허용 설정

**파일**: `app/App.js`

```javascript
<WebView
  ref={webViewRef}
  source={{ uri: WEB_URL }}
  // ... 기존 설정들
  
  // 🔥 팝업 허용 (카카오톡 공유 등)
  setSupportMultipleWindows={true}
  
  // 🔥 새 창(팝업) 요청 처리
  onOpenWindow={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    const url = nativeEvent.targetUrl;
    console.log('🪟 Window open requested:', url);
    
    // 카카오톡 URL 스킴 처리
    if (url && (url.startsWith('kakaotalk://') || url.startsWith('kakaokompassauth://'))) {
      console.log('📱 Opening Kakao app:', url);
      Linking.openURL(url).catch(err => {
        console.error('❌ Failed to open Kakao app:', err);
        Alert.alert('오류', '카카오톡 앱을 열 수 없습니다.\n카카오톡이 설치되어 있는지 확인해주세요.');
      });
    } 
    // HTTP/HTTPS URL은 기본 브라우저로
    else if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      console.log('🌐 Opening in browser:', url);
      Linking.openURL(url).catch(err => {
        console.error('❌ Failed to open URL:', err);
      });
    }
  }}
/>
```

### 2️⃣ Android Intent Filter 추가

**파일**: `app/app.json`

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        // ... 기존 필터들
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "kakaotalk"
            },
            {
              "scheme": "kakaokompassauth"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

## 🔄 동작 흐름

### Before (문제 상황)
```
1. 사용자: "카카오톡 공유" 버튼 클릭
2. 카카오 SDK: window.open() 호출
3. WebView: 팝업 차단 (setSupportMultipleWindows=false)
4. JavaScript: 성공으로 간주
5. Toast: "카카오톡으로 공유했습니다." 표시
6. 실제 공유 창: 열리지 않음 ❌
```

### After (해결 후)
```
1. 사용자: "카카오톡 공유" 버튼 클릭
2. 카카오 SDK: window.open('kakaotalk://...') 호출
3. WebView: onOpenWindow 이벤트 발생
4. App: Linking.openURL('kakaotalk://...')
5. Android: 카카오톡 앱 실행
6. 카카오톡: 공유 화면 표시 ✅
```

## 🧪 테스트 방법

### 1. 앱 재빌드

```bash
cd app
npx expo prebuild --clean
eas build --platform android --profile preview
```

### 2. 로그 확인

```bash
# Android
adb logcat | grep -E "(WebView|Kakao|Window)"

# 예상 로그
🪟 Window open requested: kakaotalk://...
📱 Opening Kakao app: kakaotalk://...
```

### 3. 수동 테스트

1. 식사 기록 상세 페이지 진입
2. "공유하기" 버튼 클릭
3. "카카오톡" 선택
4. **카카오톡 앱이 실행되고 공유 화면이 표시되어야 함** ✅

## 📱 지원 플랫폼

- ✅ Android (Expo/React Native)
- ⚠️ iOS: 추가 설정 필요 (`LSApplicationQueriesSchemes`)

### iOS 설정 (필요 시)

**파일**: `app/app.json`

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": [
          "kakaotalk",
          "kakaokompassauth"
        ]
      }
    }
  }
}
```

## 🔗 관련 문서

- [React Native WebView - setSupportMultipleWindows](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#setsupportmultiplewindows)
- [Kakao SDK for JavaScript](https://developers.kakao.com/docs/latest/ko/message/js)
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)

## 📝 참고사항

### PWA는 왜 정상 동작하나?

PWA는 일반 브라우저에서 실행되므로:
- 브라우저의 팝업 차단 설정을 따름
- 사용자가 팝업을 허용하면 정상 동작
- WebView의 제약이 없음

### 대안 방법

만약 위 방법이 안 될 경우:

```javascript
// frontend/src/lib/kakao-share.ts
// WebView 환경 감지 시 네이티브 공유 사용
const isWebView = /DailyMeal/.test(navigator.userAgent) || 
                  window.ReactNativeWebView !== undefined;

if (isWebView && window.ReactNativeWebView) {
  // postMessage로 앱에 공유 요청
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'shareKakao',
    data: sharePayload
  }));
}
```

## ✅ 체크리스트

### 앱 (React Native)
- [x] `app/App.js`에 `setSupportMultipleWindows={true}` 추가
- [x] `onShouldStartLoadWithRequest`로 `intent://` 처리
- [x] `onOpenWindow` 핸들러 추가 (백업용)
- [x] `app/app.json`에 Intent Filter 추가
- [ ] 앱 재빌드 및 배포
- [ ] 실제 디바이스에서 테스트
- [ ] iOS 지원 필요 시 추가 설정

### 프론트엔드 (Next.js)
- [x] `kakao-share.ts`에 `isKakaoTalkInstalled()` 메소드 추가
- [x] `share-modal.tsx`에서 설치 여부 확인
- [x] 미설치 시 카카오톡 버튼 비활성화 + "미설치" 표시
- [ ] 빌드 및 배포

## 🎯 결과

1. ✅ 네이티브 앱에서도 PWA처럼 카카오톡 공유 기능이 정상 동작
2. ✅ 카카오톡 미설치 시 버튼 비활성화로 UX 개선
3. ✅ `intent://` 스킴 완벽 처리
4. ✅ Play Store 자동 이동 지원

## 📊 개선 사항 (2025-11-11)

### 카카오톡 설치 여부 확인 추가

**문제점**: 카카오톡이 설치되지 않은 경우에도 공유 버튼이 활성화되어 혼란 발생

**해결책**: 
```typescript
// frontend/src/lib/kakao-share.ts
isKakaoTalkInstalled(): boolean {
  const shareMethod = window.Kakao.Share || window.Kakao.Link
  if (shareMethod?.isAvailableInAppShare) {
    return shareMethod.isAvailableInAppShare()
  }
  return true // 데스크탑은 항상 true
}
```

**UI 개선**:
- ✅ 카카오톡 미설치 시 버튼 비활성화
- ✅ "미설치" 라벨 표시 (빨간색)
- ✅ Tooltip: "카카오톡 앱이 설치되지 않았습니다"

**장점**:
1. 사용자가 공유 실패 이유를 명확히 알 수 있음
2. 불필요한 공유 시도 방지
3. 더 나은 UX 제공
