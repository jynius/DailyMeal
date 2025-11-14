// 환경변수에서 설정 읽기
const appName = process.env.EXPO_PUBLIC_APP_NAME
const apiUrl = process.env.EXPO_PUBLIC_API_URL
const packageId = process.env.EXPO_PUBLIC_PACKAGE_ID

// 개발 환경 판단 (패키지 ID로)
const isDev = packageId.endsWith('.dev')

console.log('\n✅ App Config:')
console.log(`  - Name: ${appName}`)
console.log(`  - Package: ${packageId}`)
console.log(`  - API URL: ${apiUrl}`)
console.log(`  - Development: ${isDev}\n`)

module.exports = {
  expo: {
    name: appName,
    slug: 'dailymeal',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'dailymeal',
    newArchEnabled: true,
    plugins: ['./plugins/withAndroidQueries', './plugins/withAndroidCleartext'],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#3B82F6',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: packageId,
      associatedDomains: ['applinks:dailymeal.app', 'applinks:www.dailymeal.app'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#3B82F6',
      },
      edgeToEdgeEnabled: true,
      navigationBar: {
        visible: 'immersive',
        backgroundColor: '#ffffff',
      },
      statusBar: {
        hidden: false,
        backgroundColor: '#3B82F6',
        barStyle: 'light-content',
      },
      package: packageId,
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
      usesCleartextTraffic: isDev, // HTTP 허용 (개발 전용)
      permissions: [
        'INTERNET',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'READ_MEDIA_IMAGES',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            { scheme: 'https', host: 'dailymeal.app' },
            { scheme: 'https', host: 'www.dailymeal.app' },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        { action: 'VIEW', data: [{ scheme: 'dailymeal' }], category: ['BROWSABLE', 'DEFAULT'] },
      ],
    },
    web: { favicon: './assets/favicon.png', bundler: 'metro' },
    extra: {
      apiUrl,
    },
  },
}
