import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useState, useEffect, useRef } from 'react'
import * as Linking from 'expo-linking'
import * as NavigationBar from 'expo-navigation-bar'
import * as ImagePicker from 'expo-image-picker'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [initialUrl, setInitialUrl] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [serverError, setServerError] = useState(false) // 서버 연결 오류
  const webViewRef = useRef(null)
  const hasLoadedOnce = useRef(false) // 첫 로딩 완료 여부
  const retryIntervalRef = useRef(null) // 자동 재시도 타이머

  useEffect(() => {
    // Android 내비게이션 바 숨기기 (전체화면 모드)
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').catch((err) =>
        console.log('Navigation bar hide failed:', err)
      )

      // 내비게이션 바 배경색 설정 (보일 때를 대비)
      NavigationBar.setBackgroundColorAsync('#ffffff').catch((err) =>
        console.log('Navigation bar color failed:', err)
      )
    }
  }, [])

  useEffect(() => {
    // 앱이 닫혀있을 때 Deep Link로 열린 경우
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url)
        setInitialUrl(url)
      }
    })

    // 앱이 실행 중일 때 Deep Link가 열린 경우
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep Link received:', url)
      handleDeepLink(url)
    })

    return () => subscription.remove()
  }, [])

  // Pull-to-Refresh 핸들러
  const onRefresh = () => {
    console.log('🔄 [Pull-to-Refresh] Started')
    setRefreshing(true)

    // WebView 새로고침
    if (webViewRef.current) {
      console.log('🔄 [Pull-to-Refresh] Reloading WebView')
      webViewRef.current.reload()
    } else {
      console.warn('⚠️ [Pull-to-Refresh] WebView ref is null')
      setRefreshing(false)
    }

    // 안전장치: 5초 후에도 로딩 중이면 강제 종료
    setTimeout(() => {
      if (refreshing) {
        console.log('⚠️ [Pull-to-Refresh] Timeout - forcing end')
        setRefreshing(false)
      }
    }, 5000)
  }

  // 파일 선택 핸들러 - WebView에서 이미지 업로드 시 호출
  const handleImagePicker = async () => {
    try {
      console.log('📸 Starting image picker...')

      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      console.log('📸 Permission status:', status)

      if (status !== 'granted') {
        console.warn('⚠️ Media library permission denied')
        return null
      }

      // 이미지 선택 (갤러리)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // deprecated 경고 해결
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true, // Base64로 변환하여 WebView에 전달
      })

      console.log('📸 Picker result:', result)

      if (!result.canceled && result.assets) {
        console.log('✅ Images selected:', result.assets.length)
        return result.assets
      }
      console.log('⚠️ Image selection canceled or no assets')
      return null
    } catch (err) {
      console.error('❌ Image picker error:', err)
      return null
    }
  }

  // 카메라 촬영 핸들러
  const handleCamera = async () => {
    try {
      console.log('📷 Starting camera...')

      // 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      console.log('📷 Camera permission status:', status)

      if (status !== 'granted') {
        console.warn('⚠️ Camera permission denied')
        Alert.alert('권한 필요', '카메라를 사용하려면 권한이 필요합니다.')
        return null
      }

      // 카메라 실행
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      })

      console.log('📷 Camera result:', result)

      if (!result.canceled && result.assets) {
        console.log('✅ Photo captured')
        return result.assets
      }
      console.log('⚠️ Camera canceled or no assets')
      return null
    } catch (err) {
      console.error('❌ Camera error:', err)
      return null
    }
  }

  // 갤러리/카메라 선택 다이얼로그
  const showImageSourceDialog = () => {
    return new Promise((resolve) => {
      Alert.alert(
        '사진 선택',
        '사진을 가져올 방법을 선택하세요',
        [
          {
            text: '갤러리',
            onPress: async () => {
              const images = await handleImagePicker()
              resolve(images)
            },
          },
          {
            text: '카메라',
            onPress: async () => {
              const photos = await handleCamera()
              resolve(photos)
            },
          },
          {
            text: '취소',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      )
    })
  }

  const handleDeepLink = (url) => {
    // URL 파싱: dailymeal://share/meal/abc123
    // 또는: https://dailymeal.app/share/meal/abc123
    const { hostname, path, queryParams } = Linking.parse(url)

    console.log('Parsed Deep Link:', { hostname, path, queryParams })

    if (path) {
      // WebView에 메시지 전송하여 페이지 이동
      const message = JSON.stringify({
        type: 'NAVIGATE',
        path: path,
        params: queryParams,
      })

      webViewRef.current?.postMessage(message)

      // WebView URL 직접 변경
      const webUrl = parseWebUrl(url)
      webViewRef.current?.injectJavaScript(`
        window.location.href = '${webUrl}';
        true; // iOS에서 필요
      `)
    }
  }

  // 기본 웹 URL 가져오기
  const getBaseWebUrl = () => {
    const Constants = require('expo-constants').default

    // 개발 모드: app.json의 extra.webUrl 사용 (예: http://192.168.x.x:3000)
    // 운영 모드: 프로덕션 URL
    if (__DEV__) {
      return Constants.expoConfig?.extra?.webUrl || 'https://www.dailymeal.life'
    }
    return 'https://www.dailymeal.life'
  }

  const parseWebUrl = (deepLinkUrl) => {
    // Deep Link URL을 웹 URL로 변환
    const { path, queryParams } = Linking.parse(deepLinkUrl)
    const baseUrl = getBaseWebUrl()
    const queryString = queryParams ? '?' + new URLSearchParams(queryParams).toString() : ''
    return `${baseUrl}${path || ''}${queryString}`
  }

  // 자동 재시도 시작
  const startAutoRetry = () => {
    stopAutoRetry() // 기존 타이머 제거
    console.log('⏱️ Auto retry scheduled in 10 seconds')
    retryIntervalRef.current = setTimeout(() => {
      console.log('🔄 Auto retrying...')
      if (webViewRef.current) {
        webViewRef.current.reload()
      }
    }, 10000) // 10초 후 재시도
  }

  // 자동 재시도 중지
  const stopAutoRetry = () => {
    if (retryIntervalRef.current) {
      clearTimeout(retryIntervalRef.current)
      retryIntervalRef.current = null
      console.log('⏱️ Auto retry stopped')
    }
  }

  // 수동 재시도
  const handleRetry = () => {
    console.log('🔄 Manual retry')
    setServerError(false)
    setLoading(true)
    stopAutoRetry()
    if (webViewRef.current) {
      webViewRef.current.reload()
    }
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      stopAutoRetry()
    }
  }, [])

  // Deep Link로 시작한 경우 해당 URL로, 아니면 기본 URL
  const WEB_URL = initialUrl ? parseWebUrl(initialUrl) : getBaseWebUrl()

  // 메시지 핸들러 함수들
  // Intent URL 표준 파싱 (Android Intent URI 스펙 준수)
  // Format: intent://HOST/PATH#Intent;scheme=SCHEME;package=PACKAGE;end
  const parseIntentUrl = (url) => {
    const schemeMatch = url.match(/scheme=([^;]+)/)
    const packageMatch = url.match(/package=([^;]+)/)
    const pathMatch = url.match(/^intent:\/\/([^#]+)/)

    return {
      scheme: schemeMatch ? schemeMatch[1] : null,
      package: packageMatch ? packageMatch[1] : null,
      path: pathMatch ? pathMatch[1] : '',
    }
  }

  const handleIntentUrl = (url) => {
    console.log('🔗 Intent URL detected:', url)

    const { scheme, package: packageName, path } = parseIntentUrl(url)
    console.log('📦 Parsed Intent:', { scheme, packageName, path })

    if (!scheme || !packageName) {
      console.warn('⚠️ Invalid Intent URL format')
      return
    }

    // 카카오톡 Intent 처리
    if (packageName === 'com.kakao.talk') {
      const appUrl = `${scheme}://${path}`
      console.log('📱 Opening Kakao Talk:', appUrl)

      Linking.canOpenURL(appUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(appUrl)
          } else {
            console.log('⚠️ Kakao Talk not installed')
            // Play Store로 이동
            return Linking.openURL(`market://details?id=${packageName}`).catch(() => {
              Alert.alert('카카오톡 설치 필요', '카카오톡을 설치한 후 다시 시도해주세요.')
            })
          }
        })
        .catch((err) => {
          console.error('❌ Failed to open Kakao Talk:', err)
          Alert.alert('오류', '카카오톡을 열 수 없습니다.')
        })
    } else {
      console.log(`⚠️ Unsupported package: ${packageName}`)
    }
  }

  const handleKakaoUrl = (url) => {
    console.log('📱 Kakao URL from WebView:', url)
    Linking.openURL(url).catch((err) => {
      console.error('❌ Failed to open Kakao app:', err)
      Alert.alert('오류', '카카오톡 앱을 열 수 없습니다.')
    })
  }

  const handlePickImage = async () => {
    console.log('📸 pickImage request received')
    const images = await showImageSourceDialog()
    console.log('📸 Images returned:', images ? images.length : 'null')

    if (images) {
      const imageData = images.map((img) => ({
        uri: img.uri,
        base64: img.base64,
        width: img.width,
        height: img.height,
      }))

      console.log('📤 Sending images to WebView:', imageData.length)
      const messageToSend = JSON.stringify({
        type: 'imagesSelected',
        images: imageData,
      })
      console.log('📤 Message length:', messageToSend.length)

      webViewRef.current?.postMessage(messageToSend)
      console.log('✅ postMessage called')
    } else {
      console.log('⚠️ No images selected or canceled')
    }
  }

  const handleTakePhoto = async () => {
    console.log('📷 takePhoto request received (직접 카메라)')
    const photos = await handleCamera()
    if (photos) {
      const photoData = photos.map((photo) => ({
        uri: photo.uri,
        base64: photo.base64,
        width: photo.width,
        height: photo.height,
      }))

      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'imagesSelected',
          images: photoData,
        })
      )
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        // Pull-to-Refresh 활성화
        pullToRefreshEnabled={true}
        onRefresh={onRefresh}
        // JavaScript 활성화 (필수)
        javaScriptEnabled={true}
        // DOM 저장소 활성화 (필수)
        domStorageEnabled={true}
        // Android: Self-signed 인증서 허용 및 Mixed Content 허용
        mixedContentMode="always"
        // 파일 업로드 지원
        androidLayerType="hardware"
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        // 캐시 활성화
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        // 서드파티 쿠키 허용
        thirdPartyCookiesEnabled={true}
        // 줌 허용
        scalesPageToFit={true}
        // 🔥 팝업 허용 (카카오톡 공유 등)
        setSupportMultipleWindows={true}
        // 🐛 WebView console.log를 앱 로그로 캡처 (디버깅용)
        onConsoleMessage={(event) => {
          console.log(`[WebView Console] ${event.nativeEvent.message}`)
        }}
        // 🔥 JavaScript 주입: Intent URL 자동 감지 및 앱으로 전송
        injectedJavaScript={`
          (function() {
            console.log('🚀 [DEBUG] Injected JS starting...');
            
            // window.open 오버라이드하여 Intent URL 캡처
            const originalOpen = window.open;
            window.open = function(url, target, features) {
              console.log('🪟 [DEBUG] window.open called with:', url, target, features);
              
              if (url && url.startsWith('intent://')) {
                console.log('📱 [DEBUG] Intent URL detected in window.open:', url);
                // 네이티브 앱으로 전달
                if (window.ReactNativeWebView) {
                  console.log('✅ [DEBUG] Sending to ReactNativeWebView');
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'INTENT_URL',
                    url: url
                  }));
                } else {
                  console.error('❌ [DEBUG] ReactNativeWebView not available!');
                }
                return null;
              }
              
              if (url && (url.startsWith('kakaotalk://') || url.startsWith('kakaokompassauth://'))) {
                console.log('📱 [DEBUG] Kakao URL detected in window.open:', url);
                if (window.ReactNativeWebView) {
                  console.log('✅ [DEBUG] Sending Kakao URL to ReactNativeWebView');
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'KAKAO_URL',
                    url: url
                  }));
                } else {
                  console.error('❌ [DEBUG] ReactNativeWebView not available!');
                }
                return null;
              }
              
              console.log('➡️ [DEBUG] Calling original window.open');
              return originalOpen.call(window, url, target, features);
            };
            
            // location.href 변경 감지
            let lastHref = window.location.href;
            const observer = new MutationObserver(() => {
              const currentHref = window.location.href;
              if (currentHref !== lastHref) {
                console.log('🔗 [DEBUG] URL changed:', currentHref);
                if (currentHref.startsWith('intent://') || currentHref.startsWith('kakaotalk://')) {
                  console.log('📱 [DEBUG] Special URL in location:', currentHref);
                }
                lastHref = currentHref;
              }
            });
            observer.observe(document, { subtree: true, childList: true });
            
            // 카카오 SDK 모니터링
            if (window.Kakao) {
              console.log('✅ [DEBUG] Kakao SDK detected:', typeof window.Kakao);
              console.log('✅ [DEBUG] Kakao.Share:', typeof window.Kakao.Share);
              console.log('✅ [DEBUG] Kakao.Link:', typeof window.Kakao.Link);
            } else {
              console.log('⏳ [DEBUG] Kakao SDK not loaded yet, will check again...');
              setTimeout(() => {
                if (window.Kakao) {
                  console.log('✅ [DEBUG] Kakao SDK loaded (delayed)');
                } else {
                  console.log('❌ [DEBUG] Kakao SDK still not available');
                }
              }, 2000);
            }
            
            console.log('✅ [DEBUG] DailyMeal WebView bridge initialized');
          })();
          true; // 반드시 true 반환
        `}
        // 🔥 URL 가로채기 - Android 표준 방식
        onShouldStartLoadWithRequest={(request) => {
          const { url } = request
          console.log('🔍 [DEBUG] onShouldStartLoadWithRequest:', url)

          // Intent URL 처리 (Android 표준)
          if (url.startsWith('intent://')) {
            console.log('✅ [DEBUG] Intent URL caught in onShouldStartLoadWithRequest')
            handleIntentUrl(url)
            return false // WebView에서 로딩하지 않음
          }

          // 카카오톡 앱 스킴 직접 처리
          if (url.startsWith('kakaotalk://') || url.startsWith('kakaokompassauth://')) {
            console.log('✅ [DEBUG] Kakao URL caught in onShouldStartLoadWithRequest')
            console.log('📱 Kakao URL detected:', url)
            Linking.openURL(url).catch((err) => {
              console.error('❌ Failed to open Kakao:', err)
              Alert.alert('오류', '카카오톡 앱을 열 수 없습니다.')
            })
            return false
          }

          // 외부 링크는 기본 브라우저로
          if (url.startsWith('http://') || url.startsWith('https://')) {
            const isInternal = url.includes('dailymeal.life') || url.includes('localhost')
            if (!isInternal) {
              console.log('🌐 External link:', url)
              Linking.openURL(url)
              return false
            }
          }

          return true // 내부 링크는 WebView에서 로딩
        }}
        style={styles.webview}
        onLoadStart={() => {
          console.log('Load started')
          // 첫 로딩만 로딩 표시 (이후 페이지 전환은 표시하지 않음)
          if (!hasLoadedOnce.current) {
            setLoading(true)
          }
        }}
        onLoadEnd={() => {
          console.log('✅ Load ended')
          setLoading(false)
          setRefreshing(false) // Pull-to-Refresh 종료
          setServerError(false) // 연결 성공 시 에러 상태 리셋
          stopAutoRetry() // 자동 재시도 중지
          console.log('🔄 [Pull-to-Refresh] Ended')
          hasLoadedOnce.current = true // 첫 로딩 완료 표시
        }}
        onLoadProgress={({ nativeEvent }) => {
          console.log('Load progress:', nativeEvent.progress)
          // 첫 로딩 시 95% 진행되면 로딩 해제
          if (!hasLoadedOnce.current && nativeEvent.progress > 0.95) {
            setLoading(false)
            setRefreshing(false) // Pull-to-Refresh 종료
            hasLoadedOnce.current = true
          }
        }}
        // 미디어 재생 허용
        mediaPlaybackRequiresUserAction={false}
        // Geolocation 권한 허용
        geolocationEnabled={true}
        // 파일 업로드 허용 (Android)
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        // WebView에서 앱으로 메시지 수신
        onMessage={async (event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data)
            console.log('📨 [DEBUG] Message from WebView:', JSON.stringify(message))

            // 메시지 타입별 처리
            if (message.type === 'INTENT_URL') {
              console.log('✅ [DEBUG] INTENT_URL message received')
              handleIntentUrl(message.url)
            } else if (message.type === 'KAKAO_URL') {
              console.log('✅ [DEBUG] KAKAO_URL message received')
              handleKakaoUrl(message.url)
            } else if (message.type === 'SHARE_KAKAO') {
              // ⚠️ DEPRECATED: 웹뷰에서 카카오 SDK를 직접 사용하도록 변경됨
              // 앱의 Share.share()는 이미지를 지원하지 않으므로 사용하지 않음
              console.log('⚠️ WebView handles Kakao sharing directly')
              // await handleShareKakao(message.data)
            } else if (message.type === 'pickImage') {
              await handlePickImage()
            } else if (message.type === 'takePhoto') {
              await handleTakePhoto()
            }
          } catch (e) {
            console.error('❌ Message parse error:', e)
          }
        }}
        // 에러 처리
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error('WebView error:', nativeEvent)
          setLoading(false)
          setServerError(true)
          // 10초 후 자동 재시도
          startAutoRetry()
        }}
        // HTTP 에러 처리
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error('HTTP error:', nativeEvent.statusCode, nativeEvent.url)
          setLoading(false)
          // 5xx 에러만 서버 작업 중으로 표시
          if (nativeEvent.statusCode >= 500) {
            setServerError(true)
            startAutoRetry()
          }
        }}
        // 네비게이션 상태 변경 감지
        onNavigationStateChange={(navState) => {
          console.log('Navigation state:', navState.url, 'Loading:', navState.loading)
        }}
        // 🔥 새 창(팝업) 요청 처리 - 카카오톡 공유 등 (백업용, onShouldStartLoadWithRequest가 우선)
        onOpenWindow={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          const url = nativeEvent.targetUrl
          console.log('🪟 [DEBUG] onOpenWindow called with:', url)

          if (!url) {
            console.log('⚠️ [DEBUG] onOpenWindow: no URL provided')
            return
          }

          // Intent URL 처리
          if (url.startsWith('intent://')) {
            console.log('✅ [DEBUG] Intent URL caught in onOpenWindow')
            handleIntentUrl(url)
            return
          }

          // 카카오톡 앱 스킴 처리
          if (url.startsWith('kakaotalk://') || url.startsWith('kakaokompassauth://')) {
            console.log('✅ [DEBUG] Kakao URL caught in onOpenWindow')
            console.log('📱 Opening Kakao app from popup:', url)
            Linking.openURL(url).catch((err) => {
              console.error('❌ Failed to open Kakao:', err)
              Alert.alert('오류', '카카오톡 앱을 열 수 없습니다.')
            })
            return
          }

          // HTTP/HTTPS URL은 기본 브라우저로
          if (url.startsWith('http://') || url.startsWith('https://')) {
            console.log('🌐 [DEBUG] Opening external URL in browser:', url)
            Linking.openURL(url).catch((err) => {
              console.error('❌ Failed to open URL:', err)
            })
          }
        }}
      />

      {/* 서버 오류 화면 */}
      {serverError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>서버 작업 중</Text>
          <Text style={styles.errorMessage}>
            서버에 연결할 수 없습니다.{'\n'}
            잠시 후 자동으로 재시도됩니다.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>지금 다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 플로팅 새로고침 버튼 */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => {
          console.log('🔄 Refresh button pressed')
          if (webViewRef.current) {
            webViewRef.current.reload()
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.refreshIconContainer}>
          <Text style={styles.refreshIcon}>↻</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 130,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  refreshIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 2,
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})
