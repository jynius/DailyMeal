# 🔒 DailyMeal 앱용 HTTPS 인증서 설치 가이드

## 📋 현재 상황

- **서버**: AWS EC2 Ubuntu
- **도메인**: `www.dailymeal.life`
- **문제**: 자체 서명 인증서로 인한 SSL 오류
- **앱 오류**: "SSL error: The certificate authority is not trusted"

---

## 🎯 해결 방법: Caddy 서버 사용 (가장 간단!)

Caddy는 자동으로 Let's Encrypt 인증서를 발급하고 갱신합니다.

### ✅ 장점
- ✅ 자동 HTTPS (설정 2줄)
- ✅ 자동 인증서 갱신
- ✅ 리버스 프록시 내장
- ✅ HTTP/2, HTTP/3 지원

---

## 🚀 Caddy 설치 및 설정

### 1단계: Caddy 설치

```bash
# Ubuntu 서버에서 실행
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 2단계: Caddyfile 설정

```bash
sudo vi /etc/caddy/Caddyfile
```

**내용:**
```
www.dailymeal.life {
    # 프론트엔드 (Next.js)
    reverse_proxy localhost:3000
    
    # API 요청은 백엔드로
    handle /api/* {
        reverse_proxy localhost:8000
    }
    
    # 업로드된 파일
    handle /uploads/* {
        reverse_proxy localhost:8000
    }
    
    # Socket.IO
    handle /socket.io/* {
        reverse_proxy localhost:8000 {
            header_up Connection {http.request.header.Connection}
            header_up Upgrade {http.request.header.Upgrade}
        }
    }
}
```

### 3단계: Caddy 시작

```bash
# Caddy 서비스 시작
sudo systemctl enable caddy
sudo systemctl start caddy

# 상태 확인
sudo systemctl status caddy

# 로그 확인
sudo journalctl -u caddy -f
```

### 4단계: 방화벽 설정

```bash
# 80, 443 포트 열기
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

## 🔧 대안: Nginx + Certbot

Caddy가 안 되면 Nginx + Certbot 사용:

### 1단계: Certbot 설치

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 2단계: Nginx 설정

```bash
sudo vi /etc/nginx/sites-available/dailymeal
```

**내용:**
```nginx
server {
    listen 80;
    server_name www.dailymeal.life;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads {
        proxy_pass http://localhost:8000;
    }
    
    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/dailymeal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3단계: SSL 인증서 발급

```bash
sudo certbot --nginx -d www.dailymeal.life
```

**주의:** EC2 도메인은 Let's Encrypt가 검증하기 어려울 수 있습니다.

---

## ⚠️ EC2 DNS 제한 사항

**문제:** `ec2-*.amazonaws.com` 도메인은 Let's Encrypt가 인증서 발급을 거부할 수 있습니다.

**해결책 2가지:**

### 옵션 1: 커스텀 도메인 구매 (권장) ⭐

```bash
# 1. 도메인 구매 (예: dailymeal.app)
# - Namecheap, GoDaddy, Gabia 등

# 2. Route 53 또는 도메인 DNS 설정
# A 레코드: dailymeal.app → EC2 IP (43.202.215.27)

# 3. Caddy 설정
# Caddyfile:
dailymeal.app {
    reverse_proxy localhost:3000
    # ... (나머지 설정)
}

# 4. Caddy 재시작 (자동으로 인증서 발급)
sudo systemctl restart caddy
```

### 옵션 2: Cloudflare Tunnel (무료, 도메인 필요 없음)

```bash
# 1. Cloudflare Tunnel 설치
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# 2. Cloudflare 로그인 및 터널 생성
cloudflared tunnel login
cloudflared tunnel create dailymeal

# 3. 설정 파일 생성
sudo mkdir -p /etc/cloudflared
sudo vi /etc/cloudflared/config.yml
```

**config.yml:**
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: dailymeal-<random>.trycloudflare.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# 4. 터널 실행
cloudflared tunnel run dailymeal
```

---

## 🎯 추천 방법 순서

1. **커스텀 도메인 + Caddy** (가장 간단하고 전문적) ⭐⭐⭐
2. **커스텀 도메인 + Nginx + Certbot** (전통적인 방법) ⭐⭐
3. **Cloudflare Tunnel** (도메인 없이 가능) ⭐

---

## 📱 앱 설정 업데이트

인증서 설치 후 `app.json` 수정:

```json
{
  "expo": {
    "extra": {
      "productionWebUrl": "https://dailymeal.app"  // 또는 실제 도메인
    }
  }
}
```

그리고 앱 재빌드:
```bash
cd app
eas build --platform android --profile preview
```

---

## ✅ 테스트

```bash
# 1. HTTPS 접속 테스트
curl -I https://your-domain.com

# 2. 인증서 확인
openssl s_client -connect your-domain.com:443 -showcerts

# 3. 앱에서 테스트
# - 공유 링크 클릭
# - SSL 오류 없이 앱 실행 확인
```

---

## 🆘 문제 해결

### Caddy가 인증서를 발급하지 못할 때
```bash
# 로그 확인
sudo journalctl -u caddy -n 50

# 80 포트가 열려 있는지 확인 (Let's Encrypt는 80 포트 필요)
sudo netstat -tlnp | grep :80
```

### "challenge failed" 오류
- EC2 보안 그룹에서 80, 443 포트 열려 있는지 확인
- 도메인 DNS가 올바른 IP를 가리키는지 확인

---

**다음 단계:** 어떤 방법을 선택하시겠습니까?

1. **커스텀 도메인 구매** (dailymeal.app 등)
2. **EC2 도메인 그대로 사용** (Caddy 시도)
3. **Cloudflare Tunnel 사용** (도메인 없이)
