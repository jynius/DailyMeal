# 운영 서버 환경변수 디버깅 가이드

## 문제 상황

모바일 앱에서 공유 시 localhost URL이 생성되는 문제

## 확인 절차

### 1. 운영 서버 SSH 접속

```bash
ssh user@your-production-server
```

### 2. 백엔드 환경변수 확인

```bash
# 백엔드 디렉토리로 이동
cd /path/to/production/DailyMeal/backend

# .env 파일에서 FRONTEND_URL 확인
grep FRONTEND_URL .env

# 예상 출력:
# ❌ FRONTEND_URL=http://localhost:3000  (문제)
# ✅ FRONTEND_URL=https://www.dailymeal.life  (정상)
```

### 3. PM2 프로세스 환경변수 확인

```bash
# 실행 중인 프로세스 환경변수 확인
pm2 show dailymeal-backend

# 또는
pm2 env dailymeal-backend
```

### 4. 실시간 로그로 확인

```bash
# 백엔드 로그에서 공유 링크 생성 시 URL 확인
pm2 logs dailymeal-backend --lines 100 | grep "createShare\|FRONTEND_URL"
```

### 5. 임시 디버깅 엔드포인트 추가 (선택사항)

**backend/src/share/share.controller.ts**에 임시 엔드포인트 추가:

```typescript
@Get('debug/config')
debugConfig() {
  return {
    frontendUrl: this.configService.getFrontendUrl(),
    nodeEnv: process.env.NODE_ENV,
  };
}
```

그 후 브라우저에서 확인:

```
https://www.dailymeal.life/api/share/debug/config
```

### 6. 백엔드 로그에 디버깅 추가

**backend/src/share/share.service.ts** 수정:

```typescript
async createShareLink(mealId: string, userId: string) {
  // ... 기존 코드 ...

  const baseUrl = this.configService.getFrontendUrl();
  console.log('🔍 [DEBUG] Creating share link with FRONTEND_URL:', baseUrl);
  console.log('🔍 [DEBUG] NODE_ENV:', process.env.NODE_ENV);

  const url = `${baseUrl}/share/meal/${shareId}?ref=${ref}`;
  console.log('🔍 [DEBUG] Generated share URL:', url);

  return { shareId, url, ref };
}
```

### 7. 수정 방법

만약 `FRONTEND_URL=http://localhost:3000`으로 확인되면:

```bash
# .env 파일 수정
nano .env

# 또는
vi .env

# 변경:
# FRONTEND_URL=http://localhost:3000
# ↓
# FRONTEND_URL=https://www.dailymeal.life

# 저장 후 백엔드 재시작
pm2 restart dailymeal-backend

# 로그 확인
pm2 logs dailymeal-backend --lines 50
```

## 가능한 원인들

1. **배포 시 .env 파일이 업데이트되지 않음**
   - 로컬 개발용 .env가 그대로 서버에 복사됨
2. **PM2 ecosystem 설정에서 환경변수 오버라이드**
   - `ecosystem.config.js`에서 FRONTEND_URL 설정 확인 필요
3. **AWS Secrets Manager 또는 환경변수 관리 도구 사용 시**
   - 실제 환경변수가 파일이 아닌 다른 곳에서 로드됨
4. **캐시된 환경변수**
   - PM2가 이전 환경변수를 캐시하고 있을 수 있음
   - `pm2 delete all && pm2 start` 필요

## 해결 후 검증

```bash
# 앱에서 공유 버튼 클릭
# 백엔드 로그 확인
pm2 logs dailymeal-backend --lines 20

# 예상 로그:
# 🔍 [DEBUG] Creating share link with FRONTEND_URL: https://www.dailymeal.life
# 🔍 [DEBUG] Generated share URL: https://www.dailymeal.life/share/meal/abc123?ref=...
```
