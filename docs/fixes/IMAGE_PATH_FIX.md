# 이미지 업로드 경로 버그 수정

## 문제

업로드된 이미지가 표시되지 않는 문제

**에러:**
```
GET https://www.dailymeal.life/_next/image?url=%2Fapi%2Fuploads%2Fmeals%2F2025%2F10%2F10%2Fdf4bc48e-65f6-45b1-8d3d-654311030b46.png
400 (Bad Request)
```

## 원인

### ServeStaticModule 경로 설정 오류

**기존 코드 (app.module.ts):**
```typescript
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
  serveRoot: '/uploads',
})
```

**문제점:**
- `process.env.UPLOAD_DIR` = `/data/uploads/dailymeal` (절대 경로)
- `join(__dirname, '..', '/data/uploads')`를 실행하면:
  - `__dirname` = `/home/ubuntu/DailyMeal/backend/dist`
  - 결과: `/home/ubuntu/DailyMeal/backend/data/uploads` ❌

**실제 파일 위치:**
- `/data/uploads/dailymeal/meals/2025/10/10/...` ✅

### 경로 매핑 오류

```
요청: GET /uploads/meals/2025/10/10/df4bc48e.png
       ↓
ServeStaticModule: /home/ubuntu/DailyMeal/backend/data/uploads/meals/...
       ↓
실제 파일: /data/uploads/meals/...
       ↓
결과: 404 Not Found ❌
```

## 해결 방법

### 1. ServeStaticModule 수정

```typescript
ServeStaticModule.forRoot({
  rootPath: process.env.UPLOAD_DIR?.startsWith('/') 
    ? process.env.UPLOAD_DIR              // 절대 경로는 그대로 사용
    : join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'), // 상대 경로만 join
  serveRoot: '/uploads',
})
```

**동작:**
- 절대 경로(`/data/uploads/dailymeal`) → 그대로 사용 ✅
- 상대 경로(`../uploads`) → `__dirname`과 결합 ✅

### 2. 경로 확인

```bash
# PM2 환경 변수 확인
pm2 env 0 | grep UPLOAD
# UPLOAD_DIR: /data/uploads/dailymeal ✅

# 실제 파일 존재 확인
ls -la /data/uploads/dailymeal/meals/2025/10/10/
# -rw-rw-r-- df4bc48e-65f6-45b1-8d3d-654311030b46.png ✅

# 파일 권한 확인
# drwxrwxr-x ubuntu:ubuntu ✅
```

## 배포

### 1. 백엔드 빌드 및 재시작

```bash
cd ~/DailyMeal/backend
npm run build
pm2 restart dailymeal-backend
```

### 2. 로그 확인

```bash
pm2 logs dailymeal-backend --lines 50
```

### 3. 테스트

브라우저에서 이미지 URL 직접 접근:
```
https://www.dailymeal.life/api/uploads/meals/2025/10/10/df4bc48e-65f6-45b1-8d3d-654311030b46.png
```

**예상 결과:** 이미지 표시 ✅

## 추가 검증

### Nginx 설정 확인

```nginx
# /etc/nginx/sites-available/dailymeal
location /uploads {
    proxy_pass http://localhost:8000/uploads;
    # 또는 Nginx가 직접 서빙하도록 변경 가능:
    # alias /data/uploads/;
}
```

현재는 NestJS가 처리하므로 프록시 방식 사용.

### 직접 서빙 방식 (선택)

더 빠른 성능을 원하면 Nginx가 직접 서빙:

```nginx
location /uploads/ {
    alias /data/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

이 경우 ServeStaticModule 제거 가능.

## 예방

### 1. 환경 변수 검증

```typescript
// main.ts
const uploadDir = process.env.UPLOAD_DIR || '../uploads';
console.log('📁 Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.error('❌ Upload directory does not exist:', uploadDir);
  process.exit(1);
}
```

### 2. 경로 유틸리티 사용

```typescript
// utils/path.ts
export function resolveUploadPath(path: string): string {
  return path.startsWith('/') ? path : join(process.cwd(), path);
}
```

### 3. 개발/프로덕션 분리

```typescript
// .env.development
UPLOAD_DIR=../uploads

// ecosystem.config.js (production)
UPLOAD_DIR=/data/uploads/dailymeal
```

## 관련 파일

- ✅ `backend/src/app.module.ts` - ServeStaticModule 수정
- ✅ `ecosystem.config.js` - UPLOAD_DIR 환경 변수 (/data/uploads)
- ⚠️ `backend/src/meal-records/meal-records.controller.ts` - 파일 저장 경로 확인 필요
- ⚠️ `backend/src/users/users.service.ts` - 프로필 이미지 저장 경로 확인 필요

## 테스트 체크리스트

- [ ] 백엔드 빌드 성공
- [ ] PM2 재시작 성공
- [ ] 이미지 URL 직접 접근 가능
- [ ] 프론트엔드에서 이미지 표시
- [ ] 새로운 이미지 업로드 테스트
- [ ] 날짜별 폴더 생성 확인

## 결론

**핵심 이슈:** `path.join()`은 절대 경로(`/data/...`)를 상대 경로로 취급하여 잘못된 경로를 생성함.

**해결:** 절대 경로는 그대로 사용하고, 상대 경로만 `join()` 사용.

이제 이미지가 정상적으로 표시될 것입니다! 🎉
