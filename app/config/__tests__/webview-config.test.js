// app/config/__tests__/webview-config.test.js
import { BASE_WEB_URL, WEBVIEW_CONFIG } from '../webview-config'

describe('WEBVIEW_CONFIG', () => {
  it('BASE_WEB_URL이 정의되어 있음', () => {
    expect(BASE_WEB_URL).toBeDefined()
    expect(BASE_WEB_URL).toContain('dailymeal.life')
  })

  it('JavaScript 활성화 설정', () => {
    expect(WEBVIEW_CONFIG.javaScriptEnabled).toBe(true)
  })

  it('DOM Storage 활성화', () => {
    expect(WEBVIEW_CONFIG.domStorageEnabled).toBe(true)
  })

  it('캐시 활성화', () => {
    expect(WEBVIEW_CONFIG.cacheEnabled).toBe(true)
    expect(WEBVIEW_CONFIG.cacheMode).toBe('LOAD_DEFAULT')
  })

  it('인라인 미디어 재생 허용', () => {
    expect(WEBVIEW_CONFIG.allowsInlineMediaPlayback).toBe(true)
    expect(WEBVIEW_CONFIG.allowsFullscreenVideo).toBe(true)
  })

  it('위치 정보 활성화', () => {
    expect(WEBVIEW_CONFIG.geolocationEnabled).toBe(true)
  })

  it('파일 접근 권한 설정', () => {
    expect(WEBVIEW_CONFIG.allowFileAccess).toBe(true)
    expect(WEBVIEW_CONFIG.allowFileAccessFromFileURLs).toBe(true)
    expect(WEBVIEW_CONFIG.allowUniversalAccessFromFileURLs).toBe(true)
  })

  it('Pull to Refresh 활성화', () => {
    expect(WEBVIEW_CONFIG.pullToRefreshEnabled).toBe(true)
  })

  it('다중 윈도우 지원', () => {
    expect(WEBVIEW_CONFIG.setSupportMultipleWindows).toBe(true)
  })

  it('하드웨어 가속 렌더링', () => {
    expect(WEBVIEW_CONFIG.androidLayerType).toBe('hardware')
  })

  it('Third-party 쿠키 활성화', () => {
    expect(WEBVIEW_CONFIG.thirdPartyCookiesEnabled).toBe(true)
  })

  it('Mixed Content 허용', () => {
    expect(WEBVIEW_CONFIG.mixedContentMode).toBe('always')
  })
})
