# Nginx Proxy 설정 가이드 (DailyMeal)

## 🎯 **현재 상황**

### **Frontend 설정**
```javascript
// ecosystem.config.js
NEXT_PUBLIC_API_URL: '/api'
```

### **Nginx 설정 (현재)**
```nginx
location /api {
    proxy_pass http://localhost:8000;  # ❌ 문제!
}
```

### **백엔드 실제 경로**
```typescript
// NestJS 컨트롤러
@Controller('restaurants')  // /restaurants
@Controller('meal-records')  // /meal-records
```

---

## 🚨 **문제점**

### **경로 불일치**

```
클라이언트 요청
  ↓ fetch('/api/restaurants')
  
Nginx 수신
  ↓ /api/restaurants
  
Nginx 프록시
  ↓ proxy_pass http://localhost:8000
  ↓ → http://localhost:8000/api/restaurants
  
백엔드 수신
  ❌ /api/restaurants (존재하지 않음!)
  ✅ /restaurants (실제 경로)
```

**결과: 404 Not Found**

---

## ✅ **해결 방법**

### **방법 1: Nginx Rewrite (권장)** ⭐

#### **설정**
```nginx
# /etc/nginx/sites-available/dailymeal-ssl

server {
    listen 443 ssl http2;
    server_name www.dailymeal.life;

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

    # 백엔드 API (/api 제거)
    location /api/ {
        rewrite ^/api(.*)$ $1 break;  # ← 핵심! /api 제거
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:8000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 업로드 파일
    location /uploads/ {
        proxy_pass http://localhost:8000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name www.dailymeal.life;
    return 301 https://$server_name$request_uri;
}
```

#### **동작 흐름**
```
클라이언트
  ↓ GET /api/restaurants
  
Nginx location /api/
  ↓ rewrite ^/api(.*)$ $1 break
  ↓ /api/restaurants → /restaurants
  
proxy_pass http://localhost:8000
  ↓ GET /restaurants
  
백엔드
  ✅ /restaurants (매칭 성공!)
```

#### **장점**
- ✅ 백엔드 코드 수정 불필요
- ✅ Swagger 경로 유지 (`/api-docs`)
- ✅ 유연한 프록시 관리
- ✅ 프론트엔드 설정 그대로 (`/api`)

---

### **방법 2: 백엔드에 Global Prefix 추가**

#### **설정**
```typescript
// backend/src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 글로벌 prefix 추가
  app.setGlobalPrefix('api');  // ← 모든 경로에 /api 추가
  
  // CORS 설정
  app.enableCors({ ... });
  
  // Swagger 설정 (prefix 제외)
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);  // /api/api-docs가 아닌 /api-docs
  
  await app.listen(port);
}
```

#### **Nginx 설정 (단순)**
```nginx
location /api/ {
    proxy_pass http://localhost:8000/api/;  # 그대로 전달
    # ... 기타 헤더 설정
}
```

#### **동작 흐름**
```
클라이언트
  ↓ GET /api/restaurants
  
Nginx
  ↓ proxy_pass http://localhost:8000/api/
  ↓ GET /api/restaurants
  
백엔드 (with globalPrefix)
  ✅ /api/restaurants (매칭 성공!)
```

#### **장점**
- ✅ Nginx 설정 단순
- ✅ 명시적인 API 경로

#### **단점**
- ❌ 백엔드 코드 수정 필요
- ❌ Swagger 경로 혼란 가능
- ❌ 로컬 개발 시 `/api` prefix 필요

---

## 🎯 **최종 권장: 방법 1 (Nginx Rewrite)**

### **이유**
1. **백엔드 코드 수정 불필요**
   - NestJS 컨트롤러 그대로 유지
   - Swagger 경로 유지

2. **개발 환경 일관성**
   - 로컬: `http://localhost:8000/restaurants`
   - 프로덕션: `https://ec2-.../api/restaurants`
   - 백엔드 입장에서는 동일

3. **유연성**
   - Nginx에서 프록시 규칙만 변경
   - 백엔드 재배포 불필요

---

## 🚀 **적용 방법**

### **1. Nginx 설정 파일 수정**

```bash
# EC2에서 실행
sudo nano /etc/nginx/sites-available/dailymeal-ssl
```

**변경 내용:**
```nginx
# 변경 전
location /api {
    proxy_pass http://localhost:8000;
}

# 변경 후
location /api/ {
    rewrite ^/api(.*)$ $1 break;  # ← 추가
    proxy_pass http://localhost:8000;
    # ... 기타 설정
}
```

### **2. Nginx 설정 테스트**

```bash
sudo nginx -t
```

**성공 메시지:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### **3. Nginx 재시작**

```bash
sudo systemctl reload nginx
# 또는
sudo systemctl restart nginx
```

### **4. 테스트**

```bash
# 프론트엔드 접속
curl https://www.dailymeal.life

# API 테스트 (외부에서)
curl https://www.dailymeal.life/api/restaurants

# 내부에서 백엔드 직접 접속
curl http://localhost:8000/restaurants
```

---

## 📊 **경로 매핑 정리**

### **클라이언트 관점**

| 요청 URL | 용도 |
|----------|------|
| `https://ec2-...` | 프론트엔드 (Next.js) |
| `https://ec2-.../api/restaurants` | 백엔드 API |
| `https://ec2-.../api/meal-records` | 백엔드 API |
| `https://ec2-.../uploads/xxx.png` | 업로드 파일 |
| `https://ec2-.../socket.io` | Socket.IO |

### **Nginx 변환**

| 클라이언트 요청 | Nginx 변환 | 백엔드 수신 |
|----------------|-----------|-----------|
| `/api/restaurants` | → `/restaurants` | `/restaurants` ✅ |
| `/api/meal-records/1` | → `/meal-records/1` | `/meal-records/1` ✅ |
| `/uploads/a.png` | → `/uploads/a.png` | `/uploads/a.png` ✅ |
| `/socket.io` | → `/socket.io` | `/socket.io` ✅ |

### **백엔드 내부 접속 (Swagger 등)**

```bash
# Nginx 거치지 않고 직접 접속
http://localhost:8000/api-docs  # ✅ Swagger
http://localhost:8000/restaurants  # ✅ API
```

---

## 🔧 **Rewrite 규칙 설명**

### **기본 문법**
```nginx
rewrite regex replacement [flag];
```

### **우리의 규칙**
```nginx
rewrite ^/api(.*)$ $1 break;
```

**분석:**
- `^/api` : 시작이 `/api`인 경로 매칭
- `(.*)` : `/api` 뒤의 모든 문자 캡처 (그룹 1)
- `$1` : 캡처된 그룹 1로 교체
- `break` : rewrite 후 다른 rewrite 규칙 무시

**예시:**
```
/api/restaurants
  ↓ ^/api(.*)$ → $1
  ↓ (.*)에 /restaurants 캡처
  ↓ $1로 교체
/restaurants
```

### **중요: Trailing Slash**

```nginx
# ✅ 올바름
location /api/ {
    rewrite ^/api(.*)$ $1 break;
    proxy_pass http://localhost:8000;
}

# ❌ 문제 발생 가능
location /api {
    rewrite ^/api(.*)$ $1 break;
    proxy_pass http://localhost:8000;
}
```

**이유:**
- `/api/` : `/api`로 시작하는 모든 경로 매칭
- `/api` : `/api` 정확히 매칭 또는 prefix 매칭 (애매함)

---

## ✅ **체크리스트**

### **설정 전**
- [ ] 백엔드 실제 경로 확인 (`/restaurants`, `/meal-records` 등)
- [ ] Swagger 경로 확인 (`/api-docs`)
- [ ] 프론트엔드 `NEXT_PUBLIC_API_URL` 확인 (`/api`)

### **Nginx 설정**
- [ ] `location /api/` 설정
- [ ] `rewrite ^/api(.*)$ $1 break;` 추가
- [ ] `proxy_pass http://localhost:8000` 설정
- [ ] 기타 헤더 설정 (`X-Real-IP`, `X-Forwarded-For` 등)

### **테스트**
- [ ] `sudo nginx -t` 성공
- [ ] Nginx 재시작
- [ ] 외부에서 API 접속 테스트
- [ ] 프론트엔드에서 API 호출 테스트
- [ ] Socket.IO 연결 테스트
- [ ] 업로드 파일 접근 테스트

---

## 🎉 **완료 후 확인**

```bash
# 1. 프론트엔드 접속
https://www.dailymeal.life

# 2. API 테스트 (브라우저 또는 curl)
https://www.dailymeal.life/api/restaurants

# 3. 백엔드 직접 접속 (서버 내부)
curl http://localhost:8000/restaurants

# 4. Swagger (서버 내부)
curl http://localhost:8000/api-docs
```

**모두 정상 작동하면 완료!** ✅
