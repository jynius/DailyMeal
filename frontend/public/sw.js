const CACHE_NAME = 'dailymeal-v1';
const STATIC_CACHE = 'dailymeal-static-v1';
const API_CACHE = 'dailymeal-api-v1';

// 캐시할 정적 리소스들
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// 설치 이벤트 - 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트 - 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 상태 변경 감지
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NETWORK_STATUS') {
    // 클라이언트에게 네트워크 상태 전달
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NETWORK_STATUS_UPDATE',
          online: event.data.online
        });
      });
    });
  }
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Socket.IO 요청은 인터셉트하지 않음
  if (url.pathname.includes('socket.io')) {
    return;
  }

  // API 요청 처리 (GET만 캐시, 네트워크 우선)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // ✅ GET 요청이고 응답이 성공적일 때만 캐시
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환 (GET 요청만)
          if (request.method === 'GET') {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 캐시도 없으면 오프라인 응답
              return new Response(JSON.stringify({
                error: 'Offline - 네트워크 연결을 확인해주세요',
                offline: true
              }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              });
            });
          }
          // POST/PATCH/DELETE는 네트워크 에러 그대로 throw
          return Promise.reject(new Error('Network request failed'));
        })
    );
    return;
  }

  // 정적 리소스 처리 (캐시 우선)
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => {
        // 네트워크 실패 시 기본 오프라인 페이지
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('', { status: 404 });
      });
    })
  );
});