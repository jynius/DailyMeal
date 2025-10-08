import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  
  // 개발 환경에서는 Windows IP 사용, 프로덕션에서는 실제 도메인 사용
  const WEB_URL = __DEV__ 
    ? 'http://192.168.219.103:3000'  // 개발 모드 - Windows IP
    : 'http://ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com/'; // 프로덕션 모드

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
      
      <WebView
        source={{ uri: WEB_URL }}
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
