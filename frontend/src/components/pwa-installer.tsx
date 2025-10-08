'use client'

import { useEffect } from 'react'

export function PWAInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
          
          // Service Worker 메시지 리스너
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'NETWORK_STATUS_UPDATE') {
              // 네트워크 상태 변경 이벤트 발생
              window.dispatchEvent(new CustomEvent('networkStatusChange', {
                detail: { online: event.data.online }
              }));
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // 네트워크 상태 감지
    const handleOnline = () => {
      console.log('Network: Online')
      // Service Worker에게 네트워크 상태 전달
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'NETWORK_STATUS',
          online: true
        });
      }
      window.dispatchEvent(new CustomEvent('networkStatusChange', {
        detail: { online: true }
      }));
    };

    const handleOffline = () => {
      console.log('Network: Offline')
      // Service Worker에게 네트워크 상태 전달
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'NETWORK_STATUS',
          online: false
        });
      }
      window.dispatchEvent(new CustomEvent('networkStatusChange', {
        detail: { online: false }
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 초기 네트워크 상태 확인
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [])

  return null
}