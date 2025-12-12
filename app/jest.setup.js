// Mock expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}))

jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}))

jest.mock('expo-navigation-bar', () => ({
  setVisibilityAsync: jest.fn(() => Promise.resolve()),
  setBackgroundColorAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() => 
    Promise.resolve({ 
      canceled: false, 
      assets: [{ uri: 'test://image.jpg' }] 
    })
  ),
}))

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}))

jest.mock('@react-native-kakao/share', () => ({
  shareFeedTemplate: jest.fn(() => Promise.resolve()),
}))

// React Native mock
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android || obj.default),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
}))

// Alert mock
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}))

// Global console
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
