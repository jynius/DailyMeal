# Nginx 정적 파일 직접 서빙 설정

## 개요

업로드된 이미지를 NestJS를 거치지 않고 Nginx가 직접 서빙하여 성능 향상

## 설정 파일: `/etc/nginx/sites-available/dailymeal`

### 기존 (프록시 방식)

```nginx
location /uploads {
    proxy_pass http://localhost:8000/uploads;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

**문제점:**
- 모든 이미지 요청이 NestJS를 거침
- 백엔드 서버 부하
- 응답 속도 느림

### 개선 (직접 서빙)

```nginx
# ===== 업로드 파일 (이미지) - Nginx 직접 서빙 =====
location /uploads/ {
    # alias: URL의 /uploads/를 /data/upload/로 대체
    alias /data/upload/;
    
    # 캐싱 설정 (30일)
    expires 30d;
    add_header Cache-Control "public, immutable";
    
    # CORS 헤더 (필요시)
    add_header Access-Control-Allow-Origin *;
    
    # 디렉토리 리스팅 금지
    autoindex off;
    
    # 실행 파일 차단 (보안)
    location ~ \.(php|sh|py|exe)$ {
        deny all;
    }
    
    # 이미지 파일만 허용
    location ~ \.(jpg|jpeg|png|gif|webp|svg)$ {
        # 이미지가 없을 경우 기본 이미지 (선택)
        try_files $uri /uploads/default.jpg =404;
    }
}
```

**장점:**
- Nginx가 직접 파일 서빙 (초고속)
- 백엔드 서버 부하 감소
- 브라우저 캐싱으로 트래픽 절감
- CPU/메모리 사용량 감소

## alias 동작 방식

### 경로 매핑

```
요청 URL: https://dailymeal.life/uploads/meals/2025/10/11/abc.jpg
         ↓
location: /uploads/
         ↓
alias:    /data/upload/
         ↓
실제 경로: /data/upload/meals/2025/10/11/abc.jpg
```

**핵심**: `/uploads/` 부분이 `/data/upload/`로 **완전히 대체**

### root와의 차이

#### `alias` (대체)
```nginx
location /uploads/ {
    alias /data/upload/;
}
# /uploads/abc.jpg → /data/upload/abc.jpg
```

#### `root` (추가)
```nginx
location /uploads/ {
    root /data;
}
# /uploads/abc.jpg → /data/uploads/abc.jpg (uploads 중복!)
```

## 배포 가이드

### 1. Nginx 설정 수정

```bash
sudo nano /etc/nginx/sites-available/dailymeal
```

위의 "개선 (직접 서빙)" 설정으로 교체

### 2. 설정 테스트

```bash
sudo nginx -t
```

### 3. Nginx 재시작

```bash
sudo systemctl reload nginx
```

### 4. 디렉토리 권한 확인

```bash
# Nginx 실행 사용자 확인
ps aux | grep nginx
# 보통 www-data 또는 nginx

# 디렉토리 권한 설정
sudo chown -R www-data:www-data /data/upload
sudo chmod -R 755 /data/upload
```

### 5. 테스트

```bash
# 파일 생성
echo "test" | sudo tee /data/upload/test.txt

# 브라우저 또는 curl로 접근
curl https://dailymeal.life/uploads/test.txt
```

## ServeStaticModule 비활성화 (선택)

Nginx가 직접 서빙하면 NestJS의 ServeStaticModule은 불필요:

```typescript
// backend/src/app.module.ts
@Module({
  imports: [
    // ... 기존 설정
    
    // ServeStaticModule 제거 또는 주석 처리
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
    //   serveRoot: '/uploads',
    // }),
  ],
})
```

**장점:**
- NestJS 메모리 사용량 감소
- 애플리케이션 시작 속도 향상

**단점:**
- 파일 접근 권한 체크 불가 (모든 파일이 public)

## 성능 비교

| 방식 | 응답 속도 | 서버 부하 | 캐싱 효율 |
|-----|---------|---------|----------|
| NestJS 프록시 | 느림 (50-100ms) | 높음 | 낮음 |
| Nginx 직접 서빙 | 빠름 (5-10ms) | 낮음 | 높음 |

## 보안 고려사항

### 1. 디렉토리 리스팅 금지

```nginx
autoindex off;  # 필수!
```

### 2. 실행 파일 차단

```nginx
location ~ \.(php|sh|py|exe)$ {
    deny all;
}
```

### 3. 접근 로그 모니터링

```nginx
access_log /var/log/nginx/uploads-access.log;
error_log /var/log/nginx/uploads-error.log;
```

### 4. Rate Limiting (선택)

```nginx
# nginx.conf에 추가
limit_req_zone $binary_remote_addr zone=uploads:10m rate=10r/s;

# location에 적용
location /uploads/ {
    limit_req zone=uploads burst=20;
    alias /data/upload/;
}
```

## 트러블슈팅

### 403 Forbidden

```bash
# 권한 확인
ls -la /data/upload

# Nginx 사용자 확인
ps aux | grep nginx

# 권한 수정
sudo chown -R www-data:www-data /data/upload
sudo chmod -R 755 /data/upload
```

### 404 Not Found

```bash
# 파일 존재 확인
ls -la /data/upload/meals/2025/10/11/

# Nginx 설정 확인
sudo nginx -T | grep -A10 "location /uploads"

# 슬래시 일치 확인
location /uploads/ {
    alias /data/upload/;  # 둘 다 / 로 끝나야 함
}
```

### 캐시 문제

```bash
# 브라우저 캐시 무시하고 테스트
curl -I https://dailymeal.life/uploads/test.jpg

# 캐시 헤더 확인
Cache-Control: public, immutable
Expires: [30일 후 날짜]
```

## 결론

- **개발 환경**: NestJS 프록시 방식 (디버깅 편리)
- **프로덕션**: Nginx 직접 서빙 (성능 최적화)

현재 DailyMeal은 프록시 방식을 사용 중이지만, 트래픽이 증가하면 Nginx 직접 서빙으로 전환 권장.
