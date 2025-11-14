// app/config/webview-config.js
/**
 * WebView 설정 상수
 */

// BASE_WEB_URL은 prebuild 시점에 scripts/inject-weburl.js에 의해 주입됨
export const BASE_WEB_URL = 'https://www.dailymeal.life'

export const WEBVIEW_CONFIG = {
  // 기본 설정
  javaScriptEnabled: true,
  domStorageEnabled: true,
  cacheEnabled: true,
  cacheMode: 'LOAD_DEFAULT',
  // 미디어 및 콘텐츠
  allowsInlineMediaPlayback: true,
  allowsFullscreenVideo: true,
  mediaPlaybackRequiresUserAction: false,
  // 보안 및 권한
  mixedContentMode: 'always',
  thirdPartyCookiesEnabled: true,
  geolocationEnabled: true,
  // 파일 접근
  allowFileAccess: true,
  allowFileAccessFromFileURLs: true,
  allowUniversalAccessFromFileURLs: true,
  // UI
  scalesPageToFit: true,
  pullToRefreshEnabled: true,
  // 팝업
  setSupportMultipleWindows: true,
  // 렌더링
  androidLayerType: 'hardware',
}
