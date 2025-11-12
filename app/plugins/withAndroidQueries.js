const { withAndroidManifest } = require('@expo/config-plugins')

/**
 * Android 11+ 에서 다른 앱(카카오톡)을 실행하기 위한 <queries> 추가
 * @param {*} config
 * @returns
 */
const withAndroidQueries = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults

    // <manifest> 태그 찾기
    if (!androidManifest.manifest) {
      androidManifest.manifest = {}
    }

    // <queries> 태그가 없으면 추가
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = []
    }

    const queries = androidManifest.manifest.queries

    // 카카오톡 패키지 쿼리 추가
    const kakaoQuery = {
      package: [
        {
          $: {
            'android:name': 'com.kakao.talk',
          },
        },
      ],
    }

    // 중복 확인
    const hasKakaoQuery = queries.some((query) => {
      return query.package?.some((pkg) => pkg.$?.['android:name'] === 'com.kakao.talk')
    })

    if (!hasKakaoQuery) {
      queries.push(kakaoQuery)
      console.log('✅ Added Kakao Talk query to AndroidManifest.xml')
    }

    return config
  })
}

module.exports = withAndroidQueries
