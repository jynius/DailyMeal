// app/utils/url-handler.js
import { Linking, Alert } from 'react-native'

/**
 * Intent URL 표준 파싱 (Android Intent URI 스펙 준수)
 * Format: intent://HOST/PATH#Intent;scheme=SCHEME;package=PACKAGE;end
 */
export const parseIntentUrl = (url) => {
  const schemeMatch = url.match(/scheme=([^;]+)/)
  const packageMatch = url.match(/package=([^;]+)/)
  const pathMatch = url.match(/^intent:\/\/([^#]+)/)

  return {
    scheme: schemeMatch ? schemeMatch[1] : null,
    package: packageMatch ? packageMatch[1] : null,
    path: pathMatch ? pathMatch[1] : '',
  }
}

/**
 * 특수 URL 처리 (Intent, Kakao, External)
 * @param {string} url - 처리할 URL
 * @returns {boolean} - 처리되었으면 true, WebView에서 로딩해야 하면 false
 */
export const handleSpecialUrl = (url) => {
  console.log('🔍 [URL Handler] Checking URL:', url)

  // 1. Intent URL 처리
  if (url.startsWith('intent://')) {
    console.log('✅ [URL Handler] Intent URL detected')
    handleIntentUrl(url)
    return true // WebView 로딩 차단
  }

  // 2. Kakao 스킴 처리
  if (url.startsWith('kakaotalk://') || url.startsWith('kakaokompassauth://')) {
    console.log('✅ [URL Handler] Kakao URL detected')
    handleKakaoUrl(url)
    return true
  }

  // 3. 외부 HTTP(S) URL 처리
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const isInternal = url.includes('dailymeal.life') || url.includes('localhost')

    if (!isInternal) {
      console.log('🌐 [URL Handler] External URL detected')
      Linking.openURL(url).catch((err) => {
        console.error('❌ Failed to open external URL:', err)
      })
      return true
    }
  }

  // 4. 내부 URL은 WebView에서 처리
  console.log('➡️ [URL Handler] Internal URL, passing to WebView')
  return false
}

/**
 * Intent URL 처리
 */
const handleIntentUrl = (url) => {
  console.log('🔗 [Intent] Processing:', url.substring(0, 100))

  const { scheme, package: packageName, path } = parseIntentUrl(url)
  console.log('📦 [Intent] Parsed:', { scheme, packageName, path })

  if (!scheme || !packageName) {
    console.warn('⚠️ [Intent] Invalid format')
    return
  }

  // 카카오톡 Intent 처리
  if (packageName === 'com.kakao.talk') {
    const appUrl = `${scheme}://${path}`
    console.log('📱 [Intent] Opening Kakao Talk:', appUrl)

    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(appUrl)
        } else {
          console.log('⚠️ [Intent] Kakao Talk not installed')
          return Linking.openURL(`market://details?id=${packageName}`).catch(() => {
            Alert.alert('카카오톡 설치 필요', '카카오톡을 설치한 후 다시 시도해주세요.')
          })
        }
      })
      .catch((err) => {
        console.error('❌ [Intent] Failed to open Kakao Talk:', err)
        Alert.alert('오류', '카카오톡을 열 수 없습니다.')
      })
  } else {
    console.log(`⚠️ [Intent] Unsupported package: ${packageName}`)
  }
}

/**
 * Kakao URL 처리
 */
const handleKakaoUrl = (url) => {
  console.log('📱 [Kakao] Opening:', url)

  Linking.openURL(url).catch((err) => {
    console.error('❌ [Kakao] Failed to open:', err)
    Alert.alert('오류', '카카오톡 앱을 열 수 없습니다.')
  })
}
