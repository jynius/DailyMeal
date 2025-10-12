# 모바일 앱 전체화면 모드 설정

## 개요

Android 앱에서 하단 내비게이션 바(뒤로가기, 홈, 최근 앱 버튼)를 숨겨서 더 넓은 화면을 제공합니다.

## 변경 사항

### 1. package.json - 패키지 추가
```json
"expo-navigation-bar": "^4.0.5"
```
Android 내비게이션 바를 제어하는 Expo 패키지

### 2. app.json - 설정 추가

```json
"android": {
  "navigationBar": {
    "visible": "immersive",
    "backgroundColor": "#ffffff"
  },
  "statusBar": {
    "hidden": false,
    "backgroundColor": "#3B82F6",
    "barStyle": "light-content"
  }
}
```

**navigationBar 옵션:**
- `"visible": "leanback"` - 숨김 (터치 시 재표시)
- `"visible": "immersive"` - 숨김 (스와이프 시 재표시) ✅ 선택
- `"visible": "sticky-immersive"` - 완전 숨김 (다시 표시 안 됨)

**statusBar 설정:**
- `hidden: false` - 상태바는 유지 (시계, 배터리 표시)
- `backgroundColor: "#3B82F6"` - 파란색 배경
- `barStyle: "light-content"` - 흰색 아이콘

### 3. App.js - 런타임 제어

```javascript
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

useEffect(() => {
  // Android 내비게이션 바 숨기기
  if (Platform.OS === 'android') {
    NavigationBar.setVisibilityAsync('hidden')
      .catch(err => console.log('Navigation bar hide failed:', err));
    
    NavigationBar.setBackgroundColorAsync('#ffffff')
      .catch(err => console.log('Navigation bar color failed:', err));
  }
}, []);
```

**StatusBar 설정:**
```javascript
<StatusBar style="light" translucent backgroundColor="transparent" />
```
- `style="light"` - 아이콘 밝게 (어두운 배경용)
- `translucent` - 투명 상태바 (콘텐츠가 상태바 영역까지 확장)
- `backgroundColor="transparent"` - 완전 투명

## 화면 레이아웃

### Before (내비게이션 바 보임)
```
┌──────────────────────┐
│ 🕐 10:30  [배터리]     │ ← Status Bar
├──────────────────────┤
│                      │
│   앱 콘텐츠 영역        │
│                      │
│                      │
├──────────────────────┤
│  ◀  ⚪  ▢           │ ← Navigation Bar (숨기고 싶은 영역)
└──────────────────────┘
```

### After (내비게이션 바 숨김)
```
┌──────────────────────┐
│ 🕐 10:30  [배터리]     │ ← Status Bar
├──────────────────────┤
│                      │
│   앱 콘텐츠 영역        │
│                      │
│                      │
│                      │ ← 화면 공간 확대!
└──────────────────────┘
```

## 사용자 경험

### 내비게이션 바 복원
- **스와이프 제스처**: 화면 하단에서 위로 스와이프하면 일시적으로 표시
- **자동 숨김**: 몇 초 후 자동으로 다시 숨겨짐
- **뒤로가기**: 웹뷰에서 뒤로가기 동작 지원 (JavaScript 제어)

### 상태바
- **항상 표시**: 시계, 배터리, 네트워크 상태 확인 가능
- **투명 배경**: 앱 콘텐츠가 상태바 영역까지 확장
- **자동 색상**: 웹페이지 배경색에 따라 아이콘 색상 조정

## 설치 및 빌드

### 1. 패키지 설치
```bash
cd ~/projects/WebApp/DailyMeal/app
npm install
```

### 2. 앱 빌드
```bash
eas build --platform android --profile preview
```

### 3. 테스트
- APK 설치 후 앱 실행
- 하단 내비게이션 바가 숨겨졌는지 확인
- 화면 하단에서 위로 스와이프하여 복원 테스트

## 트러블슈팅

### 문제: 내비게이션 바가 여전히 보임

**원인**: API 레벨이나 제조사별 차이

**해결**:
```javascript
// App.js - 더 강력한 설정
NavigationBar.setVisibilityAsync('sticky-immersive');
NavigationBar.setBehaviorAsync('overlay-swipe');
```

### 문제: 상태바와 콘텐츠 겹침

**원인**: `translucent` 설정으로 콘텐츠가 상태바 영역까지 확장

**해결**: 이미 `pt-safe` CSS로 해결됨
```css
.pt-safe {
  padding-top: max(0.75rem, env(safe-area-inset-top, 0px));
}
```

### 문제: 뒤로가기 버튼 동작 안 함

**해결**: WebView에서 뒤로가기 처리
```javascript
// 추가 가능한 코드
import { BackHandler } from 'react-native';

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true; // 이벤트 소비
    }
    return false;
  });
  
  return () => backHandler.remove();
}, []);
```

## 다른 플랫폼

### iOS
iOS는 내비게이션 바가 없으므로 설정 불필요. 다만:
- **Home Indicator**: 화면 하단의 가로선 (숨길 수 없음)
- **Safe Area**: 자동으로 처리됨

### 웹
웹 브라우저에서는 적용되지 않으며, 일반적인 브라우저 UI가 표시됨.

## 참고

### Navigation Bar 가시성 옵션

| 옵션 | 동작 | 권장 |
|-----|------|-----|
| `"leanback"` | 터치 시 재표시 | 게임 |
| `"immersive"` | 스와이프로 재표시 | 일반 앱 ✅ |
| `"sticky-immersive"` | 완전 숨김 | 키오스크 |

### Edge-to-Edge 설정

```json
"edgeToEdgeEnabled": true
```
- Android 15+ 필수
- 콘텐츠가 화면 전체 영역 사용
- Safe Area 처리 필요

## 효과

- ✅ 화면 공간 약 10-15% 증가
- ✅ 몰입감 향상
- ✅ 모던한 앱 UX
- ✅ 웹뷰가 네이티브 앱처럼 보임

## 추가 최적화 아이디어

### 1. 스플래시 스크린 전체화면
```json
"splash": {
  "resizeMode": "cover",
  "backgroundColor": "#3B82F6"
}
```

### 2. 제스처 네비게이션 우선 사용
```javascript
NavigationBar.setBehaviorAsync('overlay-swipe');
```

### 3. 다크모드 대응
```javascript
if (colorScheme === 'dark') {
  NavigationBar.setBackgroundColorAsync('#000000');
}
```

## 결론

Android 내비게이션 바를 숨겨서:
- 더 넓은 화면 제공
- 네이티브 앱 같은 느낌
- 사용자 집중도 향상

다만 처음 사용하는 사용자를 위해 온보딩 화면에서 "화면 하단을 스와이프하면 뒤로가기 버튼이 나타납니다" 같은 안내를 추가하는 것을 권장합니다.
