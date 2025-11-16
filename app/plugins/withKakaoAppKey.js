// Expo config plugin to add Kakao Native App Key to AndroidManifest.xml and iOS Info.plist
const { withAndroidManifest, withInfoPlist, AndroidConfig } = require('@expo/config-plugins')

/**
 * Adds Kakao Native App Key to Android and iOS configurations
 */
function withKakaoAppKey(config, { androidAppKey, iosAppKey }) {
  // Android: Add meta-data to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)

    // Remove existing Kakao app key if present
    mainApplication['meta-data'] =
      mainApplication['meta-data']?.filter(
        (item) => item.$['android:name'] !== 'com.kakao.sdk.AppKey'
      ) || []

    // Add Kakao app key
    if (androidAppKey) {
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'com.kakao.sdk.AppKey',
          'android:value': androidAppKey,
        },
      })
    }

    return config
  })

  // iOS: Add to Info.plist
  config = withInfoPlist(config, (config) => {
    if (iosAppKey) {
      config.modResults.KAKAO_APP_KEY = iosAppKey

      // Add Kakao URL scheme
      config.modResults.CFBundleURLTypes = config.modResults.CFBundleURLTypes || []

      const kakaoScheme = {
        CFBundleTypeRole: 'Editor',
        CFBundleURLSchemes: [`kakao${iosAppKey}`],
      }

      // Check if already exists
      const existingKakao = config.modResults.CFBundleURLTypes.find((type) =>
        type.CFBundleURLSchemes?.some((scheme) => scheme.startsWith('kakao'))
      )

      if (!existingKakao) {
        config.modResults.CFBundleURLTypes.push(kakaoScheme)
      }

      // Add LSApplicationQueriesSchemes for Kakao
      config.modResults.LSApplicationQueriesSchemes =
        config.modResults.LSApplicationQueriesSchemes || []

      const kakaoSchemes = ['kakaokompassauth', 'kakaolink', 'kakaotalk']
      kakaoSchemes.forEach((scheme) => {
        if (!config.modResults.LSApplicationQueriesSchemes.includes(scheme)) {
          config.modResults.LSApplicationQueriesSchemes.push(scheme)
        }
      })
    }

    return config
  })

  return config
}

module.exports = withKakaoAppKey
