import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialUrl, setInitialUrl] = useState(null);
  const webViewRef = useRef(null);
  
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
    const baseUrl = __DEV__ 
      ? 'http://192.168.219.103:3000'
      : 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com';
    
    const queryString = queryParams 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : '';
    
    return `${baseUrl}${path || ''}${queryString}`;
  };
  
  // Deep Link로 시작한 경우 해당 URL로, 아니면 기본 URL
  const WEB_URL = initialUrl 
    ? parseWebUrl(initialUrl)
    : (__DEV__ 
        ? 'http://192.168.219.103:3000'
        : 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com');

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        // Android: Self-signed 인증서 허용
        onShouldStartLoadWithRequest={request => true}
        // iOS: Self-signed 인증서 무시
        ignoreSslError={true}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        // JavaScript 활성화
        javaScriptEnabled={true}
        // DOM 저장소 활성화
        domStorageEnabled={true}
        // 미디어 재생 허용
        mediaPlaybackRequiresUserAction={false}
        // 줌 허용
        scalesPageToFit={true}
        // WebView에서 앱으로 메시지 수신
        onMessage={(event) => {
          const message = JSON.parse(event.nativeEvent.data);
          console.log('Message from WebView:', message);
          // 필요시 처리
        }}
        // 에러 처리
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
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
});
