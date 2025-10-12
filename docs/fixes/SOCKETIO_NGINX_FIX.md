# 🔌 Socket.IO + Nginx HTTPS 설정

## 문제 증상

```
⚠️ WebSocket connection to 'wss://www.dailymeal.life/socket.io/...' failed: WebSocket is closed before the connection is established.
⚠️ socket connection error (will retry): Invalid namespace
```

---

## 원인

Nginx HTTPS 블록에 Socket.IO WebSocket 프록시 설정이 없거나 잘못됨

---

## 해결 방법

### 1️⃣ Nginx 설정 확인

서버에서:
```bash
sudo nano /etc/nginx/sites-available/dailymeal
```

### 2️⃣ HTTPS 블록(443)에 Socket.IO 추가

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dailymeal.life www.dailymeal.life;
    
    # SSL 인증서 (Certbot 자동 추가)
    ssl_certificate /etc/letsencrypt/live/dailymeal.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dailymeal.life/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # ===== Socket.IO 설정 (중요!) =====
    location /socket.io {
        proxy_pass http://localhost:8000/socket.io;
        proxy_http_version 1.1;
        
        # WebSocket 업그레이드 헤더
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 기본 프록시 헤더
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 설정 (Socket.IO는 장시간 연결 유지)
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        
        # 버퍼링 비활성화 (실시간 통신)
        proxy_buffering off;
    }
    
    # API 프록시
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API 문서
    location /api-docs {
        proxy_pass http://localhost:8000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # 업로드 파일
    location /uploads {
        proxy_pass http://localhost:8000/uploads;
        proxy_set_header Host $host;
    }
    
    # 프론트엔드 (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 파일 업로드 크기 제한
    client_max_body_size 10M;
}
```

### 3️⃣ Nginx 재시작

```bash
# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl reload nginx
```

### 4️⃣ 백엔드 CORS 확인

`backend/src/main.ts`:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://www.dailymeal.life',
    'https://www.dailymeal.life',
    'http://dailymeal.life',
    'https://dailymeal.life',
  ],
  credentials: true,
});
```

---

## 테스트

### 브라우저 콘솔에서:
```javascript
// Socket.IO 연결 테스트
const socket = io('https://www.dailymeal.life', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Socket.IO 연결 성공!');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket.IO 연결 실패:', error);
});
```

### 서버 로그 확인:
```bash
pm2 logs dailymeal-backend --lines 30
```

---

## 체크리스트

- [ ] Nginx HTTPS 블록에 `/socket.io` 설정 추가
- [ ] `proxy_set_header Upgrade $http_upgrade` 설정 확인
- [ ] `proxy_set_header Connection "upgrade"` 설정 확인
- [ ] Nginx 재시작 (`sudo systemctl reload nginx`)
- [ ] 브라우저 콘솔에서 Socket.IO 연결 확인
- [ ] PM2 로그에서 Socket.IO 연결 메시지 확인

---

## 참고

Socket.IO는 다음 순서로 연결을 시도합니다:
1. **WebSocket** (wss://) - 가장 빠름
2. **Long Polling** (https://) - WebSocket 실패 시 대체

Nginx가 WebSocket을 제대로 프록시하지 않으면 Long Polling으로 대체되어 성능이 떨어집니다.
