'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export function AppInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PWA로 설치되었는지 확인
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isPWA);

    // 앱이 설치되었는지 확인 (이미 배너를 닫았는지)
    const bannerDismissed = localStorage.getItem('app-banner-dismissed');
    const dismissedTime = localStorage.getItem('app-banner-dismissed-time');
    
    // 7일 후 다시 표시
    const shouldShowAgain = dismissedTime 
      ? Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000
      : true;
    
    // 모바일이고, PWA가 아니고, 배너를 닫지 않았거나 7일 지났으면 표시
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && !isPWA && (!bannerDismissed || shouldShowAgain)) {
      // 3초 후 배너 표시
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
    localStorage.setItem('app-banner-dismissed-time', Date.now().toString());
  };

  const handleInstall = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      // Android: Play Store로 이동 (앱 출시 후 URL 업데이트 필요)
      window.location.href = 'https://play.google.com/store/apps/details?id=com.dailymeal.app';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS: App Store로 이동 (앱 출시 후 URL 업데이트 필요)
      window.location.href = 'https://apps.apple.com/app/dailymeal/idYOUR_APP_ID';
    } else {
      // 기타: PWA 설치 안내
      alert('브라우저 메뉴에서 "홈 화면에 추가"를 선택해주세요.');
    }
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Smartphone className="w-10 h-10 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">DailyMeal 앱으로 더 편하게!</h3>
            <p className="text-xs opacity-90 truncate">
              더 빠르고 편리한 식사 기록
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            <Download size={16} />
            설치
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
