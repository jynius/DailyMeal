# 🌐 Nginx 완전한 설정 (HTTPS + Socket.IO)

## 📋 `/etc/nginx/sites-available/dailymeal`

```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    listen [::]:80;
    server_name dailymeal.life www.dailymeal.life;
    
    # Let's Encrypt 인증 경로
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 나머지는 HTTPS로 리다이렉트
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dailymeal.life www.dailymeal.life;
    
    # SSL 인증서 (Certbot이 자동 추가)
    ssl_certificate /etc/letsencrypt/live/dailymeal.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dailymeal.life/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # 로그
    access_log /var/log/nginx/dailymeal-access.log;
    error_log /var/log/nginx/dailymeal-error.log;
    
    # ===== Socket.IO (중요: /api/socket.io/ → /socket.io/) =====
    location /api/socket.io/ {
        # proxy_pass 끝에 /를 붙이면 자동으로 /api/socket.io/ → /socket.io/ 치환
        # query string은 자동으로 전달됨
        proxy_pass http://localhost:8000/socket.io/;
        proxy_http_version 1.1;
        
        # WebSocket 업그레이드
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 프록시 헤더
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 (장시간 연결)
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        
        # 버퍼링 비활성화 (실시간)
        proxy_buffering off;
    }
    
    # ===== API 프록시 (NestJS) =====
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
    
    # ===== API 문서 (Swagger) =====
    location /api-docs {
        proxy_pass http://localhost:8000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # ===== 업로드 파일 (이미지) =====
    location /uploads {
        proxy_pass http://localhost:8000/uploads;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # ===== 프론트엔드 (Next.js) =====
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 파일 업로드 크기 제한
    client_max_body_size 10M;
}
```

---

## 🔑 핵심 포인트

### 1. Socket.IO 경로 매핑
```nginx
location /api/socket.io/ {
    # 프론트엔드: /api/socket.io/?EIO=4&transport=websocket
    # proxy_pass 끝의 /가 자동 치환
    proxy_pass http://localhost:8000/socket.io/;
    # 백엔드로 전달: /socket.io/?EIO=4&transport=websocket
}
```

**왜 이렇게?**
- Socket.IO는 **하위 경로가 없고 query string만 사용**
- `location /api/socket.io/` + `proxy_pass .../socket.io/`
  - Nginx가 `/api/socket.io/` 부분을 `/socket.io/`로 자동 치환
  - query string은 자동으로 전달
- **rewrite 불필요!** (간단하고 명확)

### 2. WebSocket 업그레이드
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### 3. 장시간 연결 유지
```nginx
proxy_read_timeout 86400;  # 24시간
proxy_send_timeout 86400;
```

---

## 📊 요청 흐름

```
브라우저
  ↓
wss://www.dailymeal.life/api/socket.io/?EIO=4&transport=websocket
  ↓
Nginx HTTPS (443)
  ↓ rewrite: /api/socket.io/xxx → /socket.io/xxx
  ↓
NestJS Backend (localhost:8000)
  ↓
Socket.IO Server (/socket.io)
```

---

## ✅ 적용 방법

```bash
# 1. 백업
sudo cp /etc/nginx/sites-available/dailymeal /etc/nginx/sites-available/dailymeal.backup-$(date +%Y%m%d-%H%M%S)

# 2. 설정 편집
sudo nano /etc/nginx/sites-available/dailymeal
# 위 내용으로 교체

# 3. 테스트
sudo nginx -t

# 4. 적용
sudo systemctl reload nginx

# 5. 확인
curl -I https://www.dailymeal.life/api-docs
pm2 logs dailymeal-backend --lines 20
```

---

## 🧪 테스트

### 브라우저 콘솔에서:
```javascript
// 연결 테스트
const socket = io({
  path: '/api/socket.io',
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Socket.IO 연결 성공!', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ 연결 실패:', error.message);
});
```

### 예상 결과:
```
✅ Socket.IO 연결 성공! abc123xyz
```

---

## 🎯 체크리스트

- [ ] Nginx 설정에 `/api/socket.io` location 추가
- [ ] `rewrite` 규칙으로 `/api` 제거
- [ ] WebSocket 헤더 설정 확인
- [ ] 타임아웃 설정 확인
- [ ] `sudo nginx -t` 성공
- [ ] `sudo systemctl reload nginx` 완료
- [ ] 브라우저에서 Socket.IO 연결 테스트
- [ ] PM2 로그에서 연결 확인

---

## 📚 참고

- Socket.IO 공식 문서: https://socket.io/docs/v4/reverse-proxy/
- Nginx WebSocket Proxy: https://nginx.org/en/docs/http/websocket.html
