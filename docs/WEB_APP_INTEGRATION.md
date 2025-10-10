# 웹-앱 연동 전략

## 🎯 목표
웹 공유 링크를 통해 앱이 설치된 사용자는 앱으로, 미설치 사용자에게는 앱 설치를 유도합니다.

---

## 📱 구현 전략

### 1단계: Deep Link + Universal Links 설정

#### Android (App Links)
```json
// app.json
{
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "https",
            "host": "dailymeal.app",
            "pathPrefix": "/share"
          },
          {
            "scheme": "dailymeal",
            "host": "share"
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
```

#### iOS (Universal Links)
```json
// app.json
{
  "ios": {
    "associatedDomains": [
      "applinks:dailymeal.app",
      "applinks:www.dailymeal.app"
    ]
  }
}
```

### 2단계: 웹에서 Smart App Banner 구현

#### iOS Safari Smart App Banner
```tsx
// frontend/src/app/layout.tsx
export const metadata: Metadata = {
  other: {
    // iOS Smart App Banner
    'apple-itunes-app': 'app-id=YOUR_APP_ID, app-argument=https://dailymeal.app/share/meal/xyz',
  },
};
```

#### Android Intent 방식
```tsx
// frontend/src/components/app-install-banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export function AppInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PWA로 설치되었는지 확인
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isPWA);

    // 앱이 설치되었는지 확인 (이미 배너를 닫았는지)
    const bannerDismissed = localStorage.getItem('app-banner-dismissed');
    
    // 모바일이고, PWA가 아니고, 배너를 닫지 않았으면 표시
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && !isPWA && !bannerDismissed) {
      // 3초 후 배너 표시
      setTimeout(() => setIsVisible(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  const handleInstall = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      // Android: Play Store로 이동
      window.location.href = 'https://play.google.com/store/apps/details?id=com.dailymeal.app';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS: App Store로 이동
      window.location.href = 'https://apps.apple.com/app/idYOUR_APP_ID';
    } else {
      // 기타: PWA 설치 안내
      alert('브라우저 메뉴에서 "홈 화면에 추가"를 선택해주세요.');
    }
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Smartphone className="w-10 h-10 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">DailyMeal 앱으로 더 편하게!</h3>
            <p className="text-xs opacity-90 truncate">
              더 빠르고 편리한 식사 기록
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            <Download size={16} />
            설치
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3단계: Deep Link 처리

#### 앱에서 Deep Link 수신
```javascript
// app/App.js
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export default function App() {
  const [initialUrl, setInitialUrl] = useState(null);

  useEffect(() => {
    // 앱이 닫혀있을 때 링크로 열린 경우
    Linking.getInitialURL().then((url) => {
      if (url) {
        setInitialUrl(url);
      }
    });

    // 앱이 실행 중일 때 링크가 열린 경우
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (url) => {
    // URL 파싱: dailymeal://share/meal/abc123
    // 또는: https://dailymeal.app/share/meal/abc123
    const { path, queryParams } = Linking.parse(url);
    
    if (path) {
      // WebView에 메시지 전송
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'NAVIGATE',
        path: path,
        params: queryParams,
      }));
    }
  };

  const webViewRef = useRef(null);
  const webUrl = initialUrl 
    ? parseWebUrl(initialUrl)
    : (__DEV__ ? 'http://192.168.219.103:3000' : 'https://dailymeal.app');

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: webUrl }}
      // ... 기타 설정
    />
  );
}

function parseWebUrl(deepLinkUrl) {
  // dailymeal://share/meal/xyz -> https://dailymeal.app/share/meal/xyz
  const parsed = Linking.parse(deepLinkUrl);
  const baseUrl = __DEV__ 
    ? 'http://192.168.219.103:3000'
    : 'https://dailymeal.app';
  
  return `${baseUrl}${parsed.path || ''}${parsed.queryParams ? '?' + new URLSearchParams(parsed.queryParams).toString() : ''}`;
}
```

### 4단계: 웹에서 앱 실행 시도

#### 공유 링크 페이지에서 앱 열기 시도
```tsx
// frontend/src/app/share/meal/[shareId]/page.tsx
'use client';

import { useEffect } from 'react';

export default function ShareMealPage({ params }: { params: { shareId: string } }) {
  useEffect(() => {
    // 앱이 설치되어 있으면 앱으로 열기 시도
    tryOpenInApp();
  }, []);

  const tryOpenInApp = () => {
    const shareId = params.shareId;
    const deepLinkUrl = `dailymeal://share/meal/${shareId}`;
    const universalLinkUrl = `https://dailymeal.app/share/meal/${shareId}`;
    
    // 1. Universal Link 시도 (iOS)
    window.location.href = universalLinkUrl;
    
    // 2. 2초 후에도 페이지에 있으면 Deep Link 시도
    setTimeout(() => {
      if (document.hidden) return; // 이미 앱이 열렸으면 중단
      
      // Deep Link 시도
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLinkUrl;
      document.body.appendChild(iframe);
      
      // 1초 후 iframe 제거
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      // 3초 후에도 앱이 안 열렸으면 설치 유도
      setTimeout(() => {
        if (!document.hidden) {
          showInstallPrompt();
        }
      }, 3000);
    }, 2000);
  };

  const showInstallPrompt = () => {
    // 앱 설치 배너 표시
    setShowBanner(true);
  };

  // ... 나머지 컴포넌트
}
```

---

## 🔗 URL Scheme 설계

### Custom Scheme (모든 플랫폼)
```
dailymeal://share/meal/{shareId}
dailymeal://profile/{userId}
dailymeal://restaurant/{restaurantId}
```

### Universal Links (iOS) & App Links (Android)
```
https://dailymeal.app/share/meal/{shareId}
https://dailymeal.app/profile/{userId}
https://dailymeal.app/restaurant/{restaurantId}
```

---

## 📊 사용자 플로우

### 시나리오 1: 앱이 설치된 사용자
```
1. 웹 링크 클릭
   ↓
2. Universal Link/App Link 감지
   ↓
3. 자동으로 앱 실행
   ↓
4. 앱 내에서 해당 컨텐츠 표시
```

### 시나리오 2: 앱이 없는 사용자
```
1. 웹 링크 클릭
   ↓
2. 웹 페이지 로드
   ↓
3. 3초 후 Smart Banner 표시
   ↓
4. "설치" 버튼 클릭
   ↓
5. App Store/Play Store로 이동
   ↓
6. 앱 설치 후 자동으로 컨텐츠 열기
```

### 시나리오 3: PWA 사용자
```
1. 웹 링크 클릭
   ↓
2. PWA로 열림
   ↓
3. 배너 표시 안 함 (이미 설치됨)
```

---

## 🛠️ 구현 체크리스트

### Backend
- [ ] Deep Link를 처리할 수 있는 API 엔드포인트 준비
- [ ] Universal Links 검증 파일 제공 (.well-known/apple-app-site-association)
- [ ] Android Digital Asset Links 파일 제공 (.well-known/assetlinks.json)

### Frontend (Web)
- [ ] Smart App Banner 컴포넌트 구현
- [ ] Deep Link 시도 로직 구현
- [ ] PWA 설치 감지
- [ ] 배너 닫기 상태 저장 (localStorage)

### App (React Native)
- [ ] Deep Link URL Scheme 등록
- [ ] Universal Links 설정 (iOS)
- [ ] App Links 설정 (Android)
- [ ] Deep Link 파싱 및 라우팅
- [ ] WebView에 초기 URL 전달

### 배포
- [ ] App Store에 앱 등록 (iOS)
- [ ] Play Store에 앱 등록 (Android)
- [ ] Universal Links 도메인 검증
- [ ] Digital Asset Links 검증

---

## 🔍 테스트 방법

### Deep Link 테스트
```bash
# iOS Simulator
xcrun simctl openurl booted "dailymeal://share/meal/test123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "dailymeal://share/meal/test123"

# Universal Links (iOS)
xcrun simctl openurl booted "https://dailymeal.app/share/meal/test123"

# App Links (Android)
adb shell am start -W -a android.intent.action.VIEW -d "https://dailymeal.app/share/meal/test123"
```

### 배너 테스트
1. 모바일 브라우저에서 웹 접속
2. localStorage 클리어
3. 3초 후 배너 표시 확인
4. "설치" 버튼 동작 확인
5. "닫기" 버튼 후 재표시 안 됨 확인

---

## 📈 성과 측정

### 추적할 지표
- Smart Banner 노출수
- Smart Banner 클릭률 (CTR)
- 앱 설치 전환률
- Deep Link를 통한 앱 실행 횟수
- 웹 vs 앱 사용자 비율

### Analytics 구현
```typescript
// frontend/src/lib/analytics.ts
export const trackAppBannerView = () => {
  // GA4 이벤트
  gtag('event', 'app_banner_view', {
    platform: getMobilePlatform(),
  });
};

export const trackAppBannerClick = () => {
  gtag('event', 'app_banner_click', {
    platform: getMobilePlatform(),
  });
};

export const trackDeepLinkOpen = (path: string) => {
  gtag('event', 'deep_link_open', {
    path: path,
    platform: getMobilePlatform(),
  });
};
```

---

## 🎯 다음 단계

1. **도메인 준비**: `dailymeal.app` 도메인 구매 (권장)
2. **Backend 파일 준비**: Universal Links 검증 파일
3. **Frontend 구현**: Smart Banner 컴포넌트
4. **App 업데이트**: Deep Link 처리 로직
5. **스토어 등록**: App Store + Play Store
6. **테스트**: 각 시나리오별 동작 확인
7. **모니터링**: Analytics로 전환율 추적
