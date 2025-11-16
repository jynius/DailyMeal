// Expo config plugin to add Kakao Maven repository to Android build
const { withProjectBuildGradle } = require('@expo/config-plugins')

/**
 * Adds Kakao Maven repository to Android project's build.gradle
 * This is required for @react-native-kakao SDK to resolve dependencies
 */
module.exports = function withKakaoMaven(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const kakaoRepo = "maven { url 'https://devrepo.kakao.com/nexus/content/groups/public/' }"

      // Check if Kakao repo already exists
      if (!config.modResults.contents.includes(kakaoRepo)) {
        // Add Kakao Maven repository to allprojects.repositories
        config.modResults.contents = config.modResults.contents.replace(
          /(allprojects\s*{[\s\S]*?repositories\s*{[\s\S]*?)(})/,
          `$1    ${kakaoRepo}\n  $2`
        )
      }
    }
    return config
  })
}
