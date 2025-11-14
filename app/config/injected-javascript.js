// app/config/injected-javascript.js
/**
 * WebView에 주입되는 JavaScript 코드
 * location.href 가로채기를 통해 Intent URL과 Kakao URL을 네이티브로 전달
 */
export const INJECTED_JAVASCRIPT = `
  (function() {
    console.log('🔴 [Injected JS] Installing location.href interceptor...');
    
    // location.href setter 오버라이드
    const originalDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
    
    // 이미 오버라이드되어 있거나 재정의 불가능하면 스킵
    if (originalDescriptor && !originalDescriptor.configurable) {
      console.log('⚠️ [Injected JS] location.href already overridden or not configurable, skipping');
    } else {
      try {
        Object.defineProperty(window.location, 'href', {
          configurable: true,
          set: function(url) {
            console.log('🔗 [Injected JS] location.href setter called:', url);
            
            // Intent URL 감지
            if (url && url.startsWith('intent://')) {
              console.log('📱 [Injected JS] Intent URL detected!');
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'INTENT_URL',
                  url: url
                }));
                console.log('✅ [Injected JS] Intent URL sent to React Native');
              } else {
                console.log('❌ [Injected JS] ReactNativeWebView not found!');
              }
              return; // 실제 navigation 차단
            }
            
            // 카카오톡 URL 감지
            if (url && (url.startsWith('kakaotalk://') || url.startsWith('kakaokompassauth://'))) {
              console.log('📱 [Injected JS] Kakao URL detected!');
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'KAKAO_URL',
                  url: url
                }));
              }
              return;
            }
            
            // 일반 URL은 정상 처리
            if (originalDescriptor && originalDescriptor.set) {
              originalDescriptor.set.call(window.location, url);
            }
          },
          get: originalDescriptor ? originalDescriptor.get : undefined
        });
        console.log('✅ [Injected JS] location.href interceptor installed!');
      } catch (e) {
        console.error('❌ [Injected JS] Failed to override location.href:', e.message);
      }
    }
    
    true;
  })();
`
