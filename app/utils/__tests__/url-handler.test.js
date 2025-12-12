// app/utils/__tests__/url-handler.test.js
import { parseIntentUrl, handleSpecialUrl } from '../url-handler'

// react-native에서 Linking 가져오기 (url-handler가 사용하는 것과 동일)
const { Linking } = require('react-native')

describe('parseIntentUrl', () => {
  it('카카오톡 Intent URL 파싱', () => {
    const url = 'intent://send#Intent;scheme=kakaotalk;package=com.kakao.talk;end'
    const result = parseIntentUrl(url)

    expect(result.scheme).toBe('kakaotalk')
    expect(result.package).toBe('com.kakao.talk')
    expect(result.path).toBe('send')
  })

  it('path가 있는 Intent URL 파싱', () => {
    const url = 'intent://share/text#Intent;scheme=custom;package=com.example;end'
    const result = parseIntentUrl(url)

    expect(result.scheme).toBe('custom')
    expect(result.package).toBe('com.example')
    expect(result.path).toBe('share/text')
  })

  it('scheme 없는 경우 null 반환', () => {
    const url = 'intent://send#Intent;package=com.kakao.talk;end'
    const result = parseIntentUrl(url)

    expect(result.scheme).toBeNull()
    expect(result.package).toBe('com.kakao.talk')
  })

  it('package 없는 경우 null 반환', () => {
    const url = 'intent://send#Intent;scheme=kakaotalk;end'
    const result = parseIntentUrl(url)

    expect(result.scheme).toBe('kakaotalk')
    expect(result.package).toBeNull()
  })

  it('빈 path 처리', () => {
    const url = 'intent://#Intent;scheme=test;package=com.test;end'
    const result = parseIntentUrl(url)

    expect(result.path).toBe('')
  })
})

describe('handleSpecialUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Intent URL 감지 및 처리', () => {
    const url = 'intent://send#Intent;scheme=kakaotalk;package=com.kakao.talk;end'
    const result = handleSpecialUrl(url)

    expect(result).toBe(true) // WebView 로딩 차단
  })

  it('Kakao URL 감지 및 처리', () => {
    const url = 'kakaotalk://inappbrowser?url=https://example.com'
    const result = handleSpecialUrl(url)

    expect(result).toBe(true)
    expect(Linking.openURL).toHaveBeenCalledWith(url)
  })

  it('KakaoKompassAuth URL 처리', () => {
    const url = 'kakaokompassauth://authorize?code=12345'
    const result = handleSpecialUrl(url)

    expect(result).toBe(true)
  })

  it('외부 HTTP URL 처리', () => {
    const url = 'https://google.com'
    const result = handleSpecialUrl(url)

    expect(result).toBe(true)
    expect(Linking.openURL).toHaveBeenCalledWith(url)
  })

  it('외부 HTTP URL (naver) 처리', () => {
    const url = 'https://naver.com/search?q=test'
    const result = handleSpecialUrl(url)

    expect(result).toBe(true)
    expect(Linking.openURL).toHaveBeenCalledWith(url)
  })

  it('내부 dailymeal.life URL은 WebView 처리', () => {
    const url = 'https://www.dailymeal.life/meals'
    const result = handleSpecialUrl(url)

    expect(result).toBe(false)
    expect(Linking.openURL).not.toHaveBeenCalled()
  })

  it('내부 localhost URL은 WebView 처리', () => {
    const url = 'http://localhost:3000/login'
    const result = handleSpecialUrl(url)

    expect(result).toBe(false)
  })

  it('쿼리 파라미터가 있는 내부 URL 처리', () => {
    const url = 'https://www.dailymeal.life/meals?id=123'
    const result = handleSpecialUrl(url)

    expect(result).toBe(false)
  })

  it('상대 경로는 WebView 처리', () => {
    const url = '/meals/new'
    const result = handleSpecialUrl(url)

    expect(result).toBe(false)
  })

  it('잘못된 URL 형식 처리', () => {
    const url = 'not-a-valid-url'
    const result = handleSpecialUrl(url)

    expect(result).toBe(false)
  })
})
