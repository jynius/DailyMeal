'use client';

import { useEffect } from 'react';

interface AppDeepLinkProps {
  shareId: string;
}

export function AppDeepLink({ shareId }: AppDeepLinkProps) {
  useEffect(() => {
    // 모바일인지 확인
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // 이미 앱 열기를 시도했는지 확인 (중복 시도 방지)
    const attempted = sessionStorage.getItem(`app-open-attempted-${shareId}`);
    if (attempted) return;

    sessionStorage.setItem(`app-open-attempted-${shareId}`, 'true');

    // 앱 열기 시도
    tryOpenInApp();
  }, [shareId]);

  const tryOpenInApp = () => {
    const deepLinkUrl = `dailymeal://share/meal/${shareId}`;
    const universalLinkUrl = `https://dailymeal.app/share/meal/${shareId}`;
    
    // Universal Link 시도 (iOS & Android App Links)
    const universalLinkAttempt = document.createElement('a');
    universalLinkAttempt.href = universalLinkUrl;
    universalLinkAttempt.style.display = 'none';
    document.body.appendChild(universalLinkAttempt);
    universalLinkAttempt.click();
    document.body.removeChild(universalLinkAttempt);
    
    // 2초 후에도 페이지에 있으면 Deep Link 시도
    setTimeout(() => {
      if (document.hidden) return; // 이미 앱이 열렸으면 중단
      
      // Custom Scheme Deep Link 시도 (Fallback)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLinkUrl;
      document.body.appendChild(iframe);
      
      // 1초 후 iframe 제거
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 2000);
  };

  return null; // 렌더링할 UI 없음
}
