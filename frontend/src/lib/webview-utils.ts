/**
 * WebView 관련 유틸리티 함수
 */

/**
 * WebView 환경인지 확인
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // React Native WebView 감지
  return (
    userAgent.includes('reactnative') ||
    // @ts-ignore
    !!window.ReactNativeWebView ||
    // Android WebView
    (userAgent.includes('android') && !userAgent.includes('chrome')) ||
    // iOS WebView
    (userAgent.includes('iphone') || userAgent.includes('ipad')) && 
    !userAgent.includes('safari')
  );
}

/**
 * WebView로 메시지 전송
 */
export function sendMessageToWebView(message: any): void {
  if (typeof window === 'undefined') return;
  
  // @ts-ignore
  if (window.ReactNativeWebView) {
    // @ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}

/**
 * 네비게이션 로깅 (디버깅용)
 */
export function logNavigation(from: string, to: string, method: string = 'unknown'): void {
  console.log(`[Navigation] ${from} → ${to} (${method})`);
  
  if (isWebView()) {
    sendMessageToWebView({
      type: 'navigation',
      from,
      to,
      method,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 클릭 이벤트 로깅 (디버깅용)
 */
export function logClick(element: string, data?: any): void {
  console.log(`[Click] ${element}`, data);
  
  if (isWebView()) {
    sendMessageToWebView({
      type: 'click',
      element,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * WebView에서 라우터 pushState/replaceState 가로채기
 * Next.js의 클라이언트 라우팅이 제대로 작동하는지 확인
 */
export function setupWebViewDebug(): void {
  if (typeof window === 'undefined') return;
  
  // 원본 메서드 저장
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  // pushState 가로채기
  history.pushState = function(...args) {
    console.log('[History] pushState:', args[2]);
    logNavigation(window.location.pathname, args[2] as string, 'pushState');
    return originalPushState.apply(this, args);
  };
  
  // replaceState 가로채기
  history.replaceState = function(...args) {
    console.log('[History] replaceState:', args[2]);
    logNavigation(window.location.pathname, args[2] as string, 'replaceState');
    return originalReplaceState.apply(this, args);
  };
  
  // popstate 이벤트 (뒤로가기)
  window.addEventListener('popstate', (event) => {
    console.log('[History] popstate:', window.location.pathname, event.state);
  });
  
  console.log('[WebView Debug] Setup complete');
}
