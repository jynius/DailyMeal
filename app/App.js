import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform, RefreshControl, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import * as NavigationBar from 'expo-navigation-bar';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialUrl, setInitialUrl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const webViewRef = useRef(null);
  const hasLoadedOnce = useRef(false); // 첫 로딩 완료 여부
  const fileInputRef = useRef(null); // 파일 입력 참조
  
  useEffect(() => {
    // Android 내비게이션 바 숨기기 (전체화면 모드)
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden')
        .catch(err => console.log('Navigation bar hide failed:', err));
      
      // 내비게이션 바 배경색 설정 (보일 때를 대비)
      NavigationBar.setBackgroundColorAsync('#ffffff')
        .catch(err => console.log('Navigation bar color failed:', err));
    }
  }, []);
  
  useEffect(() => {
    // 앱이 닫혀있을 때 Deep Link로 열린 경우
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        setInitialUrl(url);
      }
    });

    // 앱이 실행 중일 때 Deep Link가 열린 경우
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep Link received:', url);
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  // 권한 요청 - 현재 빌드에서는 비활성화
  // useEffect(() => {
  //   requestPermissions();
  // }, []);

  const requestPermissions = async () => {
    // 권한 모듈은 다음 빌드에 포함될 예정
    console.log('⚠️ Permission modules will be available after next build');
    
    // WebView가 자동으로 권한을 요청하므로 앱 레벨 권한은 선택사항
    /*
    if (!Location || !ImagePicker) {
      console.log('⚠️ Permission modules not available - skipping permission requests');
      return;
    }

    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        console.warn('⚠️ Location permission denied');
      } else {
        console.log('✅ Location permission granted');
      }

      // 카메라 & 갤러리 권한
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        console.warn('⚠️ Camera permission denied');
      } else {
        console.log('✅ Camera permission granted');
      }

      if (mediaStatus !== 'granted') {
        console.warn('⚠️ Media library permission denied');
      } else {
        console.log('✅ Media library permission granted');
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
    */
  };

  // Pull-to-Refresh 핸들러
  const onRefresh = () => {
    console.log('🔄 [Pull-to-Refresh] Started');
    setRefreshing(true);
    
    // WebView 새로고침
    if (webViewRef.current) {
      console.log('🔄 [Pull-to-Refresh] Reloading WebView');
      webViewRef.current.reload();
    } else {
      console.warn('⚠️ [Pull-to-Refresh] WebView ref is null');
      setRefreshing(false);
    }
    
    // 안전장치: 5초 후에도 로딩 중이면 강제 종료
    setTimeout(() => {
      if (refreshing) {
        console.log('⚠️ [Pull-to-Refresh] Timeout - forcing end');
        setRefreshing(false);
      }
    }, 5000);
  };

  // 파일 선택 핸들러 - WebView에서 이미지 업로드 시 호출
  const handleImagePicker = async () => {
    try {
      console.log('📸 Starting image picker...');
      
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Permission status:', status);
      
      if (status !== 'granted') {
        console.warn('⚠️ Media library permission denied');
        return null;
      }

      // 이미지 선택 (갤러리)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // deprecated 경고 해결
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true, // Base64로 변환하여 WebView에 전달
      });

      console.log('📸 Picker result:', result);

      if (!result.canceled && result.assets) {
        console.log('✅ Images selected:', result.assets.length);
        return result.assets;
      }
      console.log('⚠️ Image selection canceled or no assets');
      return null;
    } catch (err) {
      console.error('❌ Image picker error:', err);
      return null;
    }
  };

  // 카메라 촬영 핸들러
  const handleCamera = async () => {
    try {
      console.log('📷 Starting camera...');
      
      // 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 Camera permission status:', status);
      
      if (status !== 'granted') {
        console.warn('⚠️ Camera permission denied');
        Alert.alert('권한 필요', '카메라를 사용하려면 권한이 필요합니다.');
        return null;
      }

      // 카메라 실행
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      });

      console.log('📷 Camera result:', result);

      if (!result.canceled && result.assets) {
        console.log('✅ Photo captured');
        return result.assets;
      }
      console.log('⚠️ Camera canceled or no assets');
      return null;
    } catch (err) {
      console.error('❌ Camera error:', err);
      return null;
    }
  };
  
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
              const images = await handleImagePicker();
              resolve(images);
            }
          },
          {
            text: '카메라',
            onPress: async () => {
              const photos = await handleCamera();
              resolve(photos);
            }
          },
          {
            text: '취소',
            style: 'cancel',
            onPress: () => resolve(null)
          }
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  };

  const handleDeepLink = (url) => {
    // URL 파싱: dailymeal://share/meal/abc123
    // 또는: https://dailymeal.app/share/meal/abc123
    const { hostname, path, queryParams } = Linking.parse(url);
    
    console.log('Parsed Deep Link:', { hostname, path, queryParams });
    
    if (path) {
      // WebView에 메시지 전송하여 페이지 이동
      const message = JSON.stringify({
        type: 'NAVIGATE',
        path: path,
        params: queryParams,
      });
      
      webViewRef.current?.postMessage(message);
      
      // WebView URL 직접 변경
      const webUrl = parseWebUrl(url);
      webViewRef.current?.injectJavaScript(`
        window.location.href = '${webUrl}';
        true; // iOS에서 필요
      `);
    }
  };

  const parseWebUrl = (deepLinkUrl) => {
    // Deep Link URL을 웹 URL로 변환
    const { path, queryParams } = Linking.parse(deepLinkUrl);
    
    // app.json의 extra 설정에서 URL 가져오기
    const Constants = require('expo-constants').default;
    
    // HTTPS 사용 (SSL 인증서 설정 완료)
    const baseUrl = __DEV__ 
      ? Constants.expoConfig?.extra?.webUrl || 'http://localhost:3000'
      : 'https://www.dailymeal.life';
    
    const queryString = queryParams 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : '';
    
    return `${baseUrl}${path || ''}${queryString}`;
  };
  
  // Deep Link로 시작한 경우 해당 URL로, 아니면 기본 URL
  const Constants = require('expo-constants').default;
  const WEB_URL = initialUrl 
    ? parseWebUrl(initialUrl)
    : (__DEV__ 
        ? Constants.expoConfig?.extra?.webUrl || 'http://localhost:3000'
        : 'https://www.dailymeal.life');

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
        style={styles.webview}
        onLoadStart={() => {
          console.log('Load started');
          // 첫 로딩만 로딩 표시 (이후 페이지 전환은 표시하지 않음)
          if (!hasLoadedOnce.current) {
            setLoading(true);
          }
        }}
        onLoadEnd={() => {
          console.log('✅ Load ended');
          setLoading(false);
          setRefreshing(false); // Pull-to-Refresh 종료
          console.log('🔄 [Pull-to-Refresh] Ended');
          hasLoadedOnce.current = true; // 첫 로딩 완료 표시
        }}
        onLoadProgress={({ nativeEvent }) => {
          console.log('Load progress:', nativeEvent.progress);
          // 첫 로딩 시 95% 진행되면 로딩 해제
          if (!hasLoadedOnce.current && nativeEvent.progress > 0.95) {
            setLoading(false);
            setRefreshing(false); // Pull-to-Refresh 종료
            hasLoadedOnce.current = true;
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
            const message = JSON.parse(event.nativeEvent.data);
            console.log('📨 Message from WebView:', message);
            
            // 이미지 선택 요청 처리 (갤러리/카메라 선택 다이얼로그)
            if (message.type === 'pickImage') {
              console.log('📸 pickImage request received');
              const images = await showImageSourceDialog();
              console.log('📸 Images returned:', images ? images.length : 'null');
              
              if (images) {
                // 선택된 이미지를 WebView로 전달
                const imageData = images.map(img => ({
                  uri: img.uri,
                  base64: img.base64,
                  width: img.width,
                  height: img.height,
                }));
                
                console.log('📤 Sending images to WebView:', imageData.length);
                const messageToSend = JSON.stringify({
                  type: 'imagesSelected',
                  images: imageData,
                });
                console.log('📤 Message length:', messageToSend.length);
                
                webViewRef.current?.postMessage(messageToSend);
                console.log('✅ postMessage called');
              } else {
                console.log('⚠️ No images selected or canceled');
              }
            }
            
            // 카메라 촬영 직접 요청 (deprecated - 위의 pickImage로 통합됨)
            if (message.type === 'takePhoto') {
              console.log('📷 takePhoto request received (직접 카메라)');
              const photos = await handleCamera();
              if (photos) {
                const photoData = photos.map(photo => ({
                  uri: photo.uri,
                  base64: photo.base64,
                  width: photo.width,
                  height: photo.height,
                }));
                
                webViewRef.current?.postMessage(JSON.stringify({
                  type: 'imagesSelected',
                  images: photoData,
                }));
              }
            }
          } catch (e) {
            console.error('❌ Message parse error:', e);
          }
        }}
        // 에러 처리
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setLoading(false);
        }}
        // HTTP 에러 처리
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP error:', nativeEvent.statusCode, nativeEvent.url);
          setLoading(false);
        }}
        // 네비게이션 상태 변경 감지
        onNavigationStateChange={(navState) => {
          console.log('Navigation state:', navState.url, 'Loading:', navState.loading);
        }}
      />
      
      {/* 플로팅 새로고침 버튼 */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={() => {
          console.log('🔄 Refresh button pressed');
          if (webViewRef.current) {
            webViewRef.current.reload();
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.refreshIconContainer}>
          <Text style={styles.refreshIcon}>↻</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
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
});
