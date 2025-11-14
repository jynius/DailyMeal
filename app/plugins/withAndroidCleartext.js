const { withAndroidManifest } = require('@expo/config-plugins')

/**
 * Expo Config Plugin to add android:usesCleartextTraffic="true" for development builds
 */
const withAndroidCleartext = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest

    // Get the application element
    const application = androidManifest.application?.[0]
    if (!application) {
      console.warn('⚠️ Could not find <application> element in AndroidManifest.xml')
      return config
    }

    // Check if we're in development mode
    const packageId = process.env.EXPO_PUBLIC_PACKAGE_ID
    const isDevelopment = packageId.endsWith('.dev')

    if (isDevelopment) {
      // Add usesCleartextTraffic="true" for development
      application.$['android:usesCleartextTraffic'] = 'true'
      console.log(
        '✅ Added android:usesCleartextTraffic="true" to AndroidManifest.xml (development mode)'
      )
    } else {
      // Ensure it's false or not set for production
      delete application.$['android:usesCleartextTraffic']
      console.log(
        '✅ Removed android:usesCleartextTraffic from AndroidManifest.xml (production mode)'
      )
    }

    return config
  })
}

module.exports = withAndroidCleartext
