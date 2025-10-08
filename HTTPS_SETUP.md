# DailyMeal HTTPS 서비스 구축 가이드

## 🔒 HTTPS가 필요한 이유

- 📱 **모바일 앱**: iOS는 HTTPS 필수 (ATS - App Transport Security)
- 🔐 **보안**: 데이터 암호화, 사용자 정보 보호
- 🚀 **SEO**: 검색 엔진 순위 향상
- ⚡ **성능**: HTTP/2, 브라우저 최적화

---

## 💡 AWS EC2 DNS vs 커스텀 도메인

### 현재 상황
- **EC2 퍼블릭 DNS**: `ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com`
- **EC2 IP**: `3.34.138.77`

### 도메인 옵션 비교

| 항목 | EC2 DNS | 커스텀 도메인 |
|------|---------|--------------|
| **비용** | 무료 | $10~15/년 |
| **Let's Encrypt** | ❌ 불가능 | ✅ 가능 |
| **AWS ACM** | ✅ 가능 | ✅ 가능 |
| **Cloudflare** | ⚠️ 제한적 | ✅ 완전 지원 |
| **사용자 친화성** | ❌ 긴 이름 | ✅ 짧고 기억하기 쉬움 |
| **IP 변경 시** | ❌ DNS 변경됨 | ✅ 영향 없음 |
| **브랜딩** | ❌ 불가능 | ✅ 가능 |

---

## 🎯 권장 방법

### **방법 1: AWS ACM + EC2 DNS (무료, EC2 DNS 사용)** ⭐️

EC2 DNS를 사용하면서 HTTPS를 적용하는 가장 간단한 방법입니다.

#### 단계:

1. **AWS Certificate Manager에서 인증서 발급**
   - AWS Console → Certificate Manager
   - "Request a certificate" 클릭
   - Public certificate 선택
   - Domain name: `ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com`
   - DNS validation 선택
   - ⚠️ **문제**: EC2 DNS는 Route 53에서 관리하지 않아 DNS 검증이 어려움

2. **대안: Self-signed 인증서 (개발/테스트용)**
   ```bash
   # EC2에서 실행
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/ssl/private/nginx-selfsigned.key \
     -out /etc/ssl/certs/nginx-selfsigned.crt \
     -subj "/C=KR/ST=Seoul/L=Seoul/O=DailyMeal/CN=ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com"
   ```
   
   ⚠️ **브라우저 경고**: Self-signed 인증서는 브라우저에서 "안전하지 않음" 경고 표시

---

### **방법 2: Cloudflare DNS Proxy (무료, 추천!)** ⭐️⭐️⭐️

Cloudflare를 사용하면 커스텀 도메인 없이도 HTTPS를 적용할 수 있습니다.

#### Cloudflare Origin 인증서 사용:

1. **Cloudflare 가입 및 "Free" 도메인 설정**
   - Cloudflare Pages에서 무료 서브도메인 제공
   - 예: `dailymeal.pages.dev`

2. **CNAME 레코드 추가**
   ```
   Type: CNAME
   Name: dailymeal
   Content: ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com
   Proxy: ON
   ```

3. **Cloudflare Origin 인증서 발급**
   - SSL/TLS → Origin Server → Create Certificate
   - 인증서 다운로드 후 EC2에 설치

---

### **방법 3: 커스텀 도메인 + Let's Encrypt (권장!)** ⭐️⭐️⭐️⭐️⭐️

가장 전문적이고 안정적인 방법입니다.

#### 장점:
- ✅ 무료 SSL 인증서 (Let's Encrypt)
- ✅ 자동 갱신
- ✅ 브라우저 신뢰
- ✅ IP 변경 시에도 안정적
- ✅ 짧고 기억하기 쉬운 도메인

#### 저렴한 도메인 옵션:
- **Namecheap**: `.xyz` 도메인 ($1~2/년)
- **Porkbun**: `.com` 도메인 ($9/년)
- **Cloudflare Registrar**: 원가 판매
- **무료**: Freenom (`.tk`, `.ml` 등)

---

## 🚀 빠른 시작: EC2 DNS로 HTTPS (Self-signed)

### 1. Nginx 설치 (이미 설치되어 있다면 Skip)

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Self-signed 인증서 생성

```bash
# 인증서 디렉토리 생성
sudo mkdir -p /etc/ssl/dailymeal

# 인증서 생성
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/dailymeal/private.key \
  -out /etc/ssl/dailymeal/certificate.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=DailyMeal/CN=ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com"

# 권한 설정
sudo chmod 600 /etc/ssl/dailymeal/private.key
```

### 3. Nginx HTTPS 설정

`/etc/nginx/sites-available/dailymeal-ssl` 파일 생성:

```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com;

    # SSL 인증서
    ssl_certificate /etc/ssl/certs/dailymeal.crt;
    ssl_certificate_key /etc/ssl/private/dailymeal.key;

    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 프론트엔드 (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 업로드 파일
    location /uploads {
        proxy_pass http://localhost:8000/uploads;
    }
}
```

### 4. Nginx 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/dailymeal-ssl /etc/nginx/sites-enabled/

# 기존 default 설정 제거 (선택)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 5. 방화벽 설정

```bash
# HTTPS 포트 열기
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw status
```

### 6. 테스트

```bash
# 로컬에서 테스트
curl -k https://ec2-3-34-138-77.ap-northeast-2.compute.amazonaws.com
```

⚠️ **주의**: Self-signed 인증서는 브라우저에서 "안전하지 않음" 경고를 표시합니다.
- Chrome: "고급" → "안전하지 않은 사이트로 이동" 클릭
- 개발/테스트에는 괜찮지만, 프로덕션에는 권장하지 않음

---

## 🎯 최종 권장사항

### 개발/테스트 단계:
✅ **EC2 DNS + Self-signed 인증서** (위 방법)
- 비용: 무료
- 시간: 10분
- 브라우저 경고: 있음

### 프로덕션 단계:
✅ **커스텀 도메인 + Let's Encrypt**
- 비용: $10~15/년
- 시간: 30분
- 브라우저 경고: 없음
- 전문적인 인상

### 절충안:
✅ **Cloudflare 무료 서브도메인**
- `dailymeal.pages.dev` 같은 무료 도메인
- Cloudflare의 자동 HTTPS
- 브라우저 경고: 없음

---

## 🎯 HTTPS 구축 방법 (선택)

### 방법 1: AWS EC2 + Let's Encrypt + Nginx (권장)
### 방법 2: Cloudflare (가장 쉬움)
### 방법 3: AWS Certificate Manager + Load Balancer

---

## 🚀 방법 1: Let's Encrypt + Nginx (무료, 권장)

### 1. 도메인 연결

#### 도메인 구매 (선택사항)
- GoDaddy, Namecheap, Gabia 등
- 또는 무료: Freenom, Cloudflare Pages

#### DNS 설정
현재 EC2 IP: `3.34.138.77`

```
A 레코드 추가:
dailymeal.com → 3.34.138.77
www.dailymeal.com → 3.34.138.77
```

### 2. Nginx 설치 및 설정

SSH로 EC2 접속 후:

```bash
# Nginx 설치
sudo apt update
sudo apt install nginx -y

# 방화벽 설정
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 3. Nginx 리버스 프록시 설정

`/etc/nginx/sites-available/dailymeal` 파일 생성:

```nginx
server {
    listen 80;
    server_name dailymeal.com www.dailymeal.com;

    # 프론트엔드 (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 업로드 파일
    location /uploads {
        proxy_pass http://localhost:8000/uploads;
    }
}
```

심볼릭 링크 생성:
```bash
sudo ln -s /etc/nginx/sites-available/dailymeal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Let's Encrypt SSL 인증서 설치

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d dailymeal.com -d www.dailymeal.com
```

입력 사항:
- 이메일 주소 입력
- 약관 동의 (Y)
- HTTP → HTTPS 리다이렉트: Yes (2번 선택)

### 5. 자동 갱신 설정

```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run

# Cron 작업 (자동 설정됨)
sudo systemctl status certbot.timer
```

---

## ☁️ 방법 2: Cloudflare (가장 쉬움)

### 1. Cloudflare 계정 생성
- https://cloudflare.com 가입

### 2. 도메인 추가
- "Add a Site" 클릭
- 도메인 입력 (예: dailymeal.com)
- Free 플랜 선택

### 3. DNS 레코드 추가
```
Type: A
Name: @
Content: 3.34.138.77
Proxy: ON (주황색 구름 아이콘)

Type: A
Name: www
Content: 3.34.138.77
Proxy: ON
```

### 4. Cloudflare 네임서버로 변경
- Cloudflare에서 제공하는 네임서버 주소 복사
- 도메인 등록업체에서 네임서버 변경

### 5. SSL 설정
- SSL/TLS → Overview → Full (strict) 선택
- 자동으로 HTTPS 적용됨 ✨

### 6. 추가 최적화 (선택)
- Speed → Auto Minify: JS, CSS, HTML 체크
- Speed → Brotli: ON
- Caching → Always Online: ON

---

## 🏗️ 방법 3: AWS Certificate Manager + ALB

### 1. AWS Certificate Manager에서 인증서 발급

```bash
# AWS CLI 설치
sudo apt install awscli -y
aws configure

# ACM 인증서 요청
aws acm request-certificate \
  --domain-name ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com \
  --subject-alternative-names ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com \
  --validation-method DNS
```

### 2. Application Load Balancer 생성

AWS Console → EC2 → Load Balancers:
- Create Load Balancer
- Application Load Balancer
- Internet-facing
- HTTPS (443) 리스너 추가
- ACM 인증서 선택
- Target Group: EC2 인스턴스

### 3. Route 53에서 DNS 설정

---

## 📝 Next.js 및 NestJS 설정 변경

### 1. Next.js 환경변수 (.env.local)

```env
# 프로덕션
NEXT_PUBLIC_API_URL=https://dailymeal.com/api
NEXT_PUBLIC_SITE_URL=https://dailymeal.com
```

### 2. NestJS CORS 설정 (main.ts)

```typescript
app.enableCors({
  origin: [
    'https://dailymeal.com',
    'https://www.dailymeal.com',
    'http://localhost:3000', // 개발용
  ],
  credentials: true,
});
```

### 3. Socket.IO 설정

```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'https://dailymeal.com',
      'https://www.dailymeal.com',
    ],
    credentials: true,
  }
})
```

---

## 📱 모바일 앱 설정 변경

### App.js 수정

```javascript
const WEB_URL = __DEV__ 
  ? 'http://192.168.219.103:3000'  // 개발
  : 'https://dailymeal.com';       // 프로덕션 (HTTPS)
```

---

## ✅ HTTPS 확인 체크리스트

### 웹사이트
- [ ] `https://dailymeal.com` 접속 가능
- [ ] 브라우저 주소창에 자물쇠 아이콘 표시
- [ ] HTTP → HTTPS 자동 리다이렉트
- [ ] API 요청 정상 작동
- [ ] Socket.IO 연결 정상

### SSL 인증서
- [ ] 인증서 유효 기간 확인
- [ ] 자동 갱신 설정 완료

### 성능
- [ ] HTTP/2 활성화 확인
- [ ] Gzip/Brotli 압축 활성화

---

## 🔧 문제 해결

### "Mixed Content" 오류
- 모든 리소스(이미지, CSS, JS)를 HTTPS로 로드
- `http://` → `https://` 또는 `//` (프로토콜 상대 경로)

### Socket.IO 연결 실패
- HTTPS에서는 WSS (WebSocket Secure) 사용 필요
- Nginx에서 Upgrade 헤더 올바르게 설정

### 인증서 갱신 실패
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## 💰 비용 비교

| 방법 | SSL 인증서 | 도메인 | 총 비용 |
|------|-----------|--------|---------|
| **Let's Encrypt** | 무료 | $10~15/년 | $10~15/년 |
| **Cloudflare** | 무료 | $10~15/년 | $10~15/년 |
| **AWS ACM + ALB** | 무료 | $10~15/년 | $20~30/월 |

---

## 🎯 권장 워크플로우

### 1단계: 도메인 준비
- 도메인 구매 또는 기존 도메인 사용
- DNS에 EC2 IP 연결

### 2단계: HTTPS 설정
- **간단한 방법**: Cloudflare (5분)
- **완전 제어**: Let's Encrypt + Nginx (30분)

### 3단계: 애플리케이션 설정
- 환경변수 업데이트
- CORS 설정 수정
- 모바일 앱 URL 변경

### 4단계: 배포 및 테스트
- PM2 재시작
- HTTPS 접속 확인
- 모바일 앱 테스트

---

## 📚 추가 리소스

- [Let's Encrypt 공식 문서](https://letsencrypt.org/docs/)
- [Nginx SSL 설정 가이드](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Cloudflare SSL 가이드](https://developers.cloudflare.com/ssl/)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/)

---

**빠른 시작을 원하시면 Cloudflare 방법을 권장합니다!** ☁️🔒
