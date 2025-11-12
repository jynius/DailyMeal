# 공유 링크 localhost 문제 해결 (최종)

## 문제 상황

모바일 앱에서 카카오 공유 시 URL이 `http://localhost:3000/share/meal/...`로 표시되는 문제.

## 원인 분석

### 잘못된 환경변수 설계

**기존 설계:**

```bash
FRONTEND_URL=http://localhost:3000  # 서버 내부 통신용
API_BASE_URL=http://localhost:8000  # 이미지 URL 접두사용
```

**문제점:**

1. `FRONTEND_URL`을 **내부 통신**과 **공유 링크 생성** 두 가지 용도로 사용
2. AWS Secrets Manager에 localhost가 그대로 설정되어 있음
3. 이미지 URL과 공유 링크 URL을 구분하지 않음

### 올바른 이해

#### 1. 공유 링크 URL (외부 사용자에게 전달)

```typescript
// backend/src/share/share.service.ts
const baseUrl = this.configService.getFrontendUrl()
const url = `${baseUrl}/share/meal/${shareId}?ref=${ref}`
```

- **목적**: 사용자가 클릭할 수 있는 **공개 URL**
- **운영**: `https://www.dailymeal.life/share/meal/...`
- **개발**: `http://localhost:3000/share/meal/...`

#### 2. 이미지 URL (응답에 포함)

```typescript
// backend/src/config/config.service.ts
transformImageUrl(photo: string | null): string | null {
  const baseUrl = this.get('IMAGE_BASE_URL') || '';
  return `${baseUrl}${photo}`;  // /uploads/meals/abc.jpg
}
```

- **목적**: 프론트엔드가 이미지를 로드할 수 있는 경로
- **운영**: `/uploads/meals/abc.jpg` (상대 경로, Nginx가 서빙)
- **개발**: `http://localhost:8000/uploads/meals/abc.jpg` (절대 경로)

## 해결 방법

### 1. 환경변수 재정의

**명확한 구분:**

```bash
# 공유 링크 생성용 (외부 사용자에게 전달할 도메인)
FRONTEND_URL=https://www.dailymeal.life

# 이미지 URL 접두사 (운영에서는 빈값)
IMAGE_BASE_URL=
```

### 2. 코드 수정

**ConfigService 변경:**

```typescript
// backend/src/config/config.service.ts

/**
 * 이미지 URL 변환
 * - 개발: IMAGE_BASE_URL=http://localhost:8000 → 절대 경로
 * - 운영: IMAGE_BASE_URL=(빈값) → 상대 경로
 */
transformImageUrl(photo: string | null): string | null {
  if (!photo) return null;

  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }

  // IMAGE_BASE_URL이 있으면 붙이고, 없으면 상대 경로 그대로
  const baseUrl = this.get('IMAGE_BASE_URL') || '';
  return `${baseUrl}${photo}`;
}
```

**ShareService (변경 없음):**

```typescript
// backend/src/share/share.service.ts
async createShareLink(mealId: string, userId: string) {
  const ref = this.cryptoService.encrypt(userId);
  const baseUrl = this.configService.getFrontendUrl();  // 공유 링크용
  const url = `${baseUrl}/share/meal/${shareId}?ref=${ref}`;
  return { shareId, url, ref };
}
```

### 3. 환경변수 설정

#### 개발 환경 (.env)

```bash
# 공유 링크: localhost로 공유
FRONTEND_URL=http://localhost:3000

# 이미지: 절대 경로 필요 (CORS)
IMAGE_BASE_URL=http://localhost:8000
```

#### 운영 환경 (AWS Secrets Manager)

```json
{
  "FRONTEND_URL": "https://www.dailymeal.life",
  "IMAGE_BASE_URL": ""
}
```

**주의:** `IMAGE_BASE_URL`은 **빈 문자열**로 설정! (키 자체를 삭제하거나 빈값)

### 4. AWS Secrets Manager 업데이트

```bash
# 1. 현재 Secret 가져오기
aws secretsmanager get-secret-value \
  --secret-id dailymeal/product \
  --query SecretString \
  --output text > secret.json

# 2. 파일 편집
vi secret.json
```

**수정 내용:**

```json
{
  "DB_HOST": "localhost",
  "DB_PORT": "5432",
  "DB_USERNAME": "...",
  "DB_PASSWORD": "...",
  "DB_NAME": "dailymeal",
  "JWT_SECRET": "...",
  "ENCRYPTION_KEY": "...",
  "FRONTEND_URL": "https://www.dailymeal.life",
  "IMAGE_BASE_URL": "",
  "CORS_ORIGINS": "https://www.dailymeal.life"
}
```

**변경 사항:**

- ✅ `FRONTEND_URL`: `http://localhost:3000` → `https://www.dailymeal.life`
- ✅ `API_BASE_URL` 삭제
- ✅ `IMAGE_BASE_URL`: 빈 문자열 추가

```bash
# 3. Secret 업데이트
aws secretsmanager update-secret \
  --secret-id dailymeal/product \
  --secret-string file://secret.json

# 4. 확인
aws secretsmanager get-secret-value \
  --secret-id dailymeal/product \
  --query SecretString \
  --output text | jq .

# 5. 백엔드 재시작
pm2 restart dailymeal-backend
pm2 logs dailymeal-backend --lines 50
```

## 테스트 절차

### 1. 공유 링크 생성 테스트

```bash
# 로그인
TOKEN=$(curl -X POST https://www.dailymeal.life/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  | jq -r '.token')

# 공유 링크 생성
curl -X POST https://www.dailymeal.life/api/share/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mealId":"YOUR_MEAL_ID"}' | jq .
```

**기대 결과:**

```json
{
  "shareId": "abc123",
  "url": "https://www.dailymeal.life/share/meal/abc123?ref=...",
  "ref": "encrypted_ref"
}
```

### 2. 이미지 URL 테스트

```bash
# Meal 조회
curl -X GET https://www.dailymeal.life/api/meal-records \
  -H "Authorization: Bearer $TOKEN" | jq '.[0].photo'
```

**기대 결과:**

```json
"/uploads/meals/2025-01-12/abc123.jpg"
```

**프론트엔드에서 로드:**

```
https://www.dailymeal.life/uploads/meals/2025-01-12/abc123.jpg
```

(Nginx가 `/uploads/` 정적 파일 서빙)

### 3. 모바일 앱 테스트

1. 앱 열기 (재빌드 불필요!)
2. 식사 기록 상세 페이지
3. 카카오 공유 버튼 클릭
4. 미리보기 URL 확인: `https://www.dailymeal.life/share/meal/...` ✅

## 아키텍처 정리

```
┌─────────────────────────────────────────────────────┐
│ 환경변수 명확한 역할 분리                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [공유 링크 생성 - 외부 사용자에게 전달]                │
│   FRONTEND_URL: https://www.dailymeal.life         │
│   사용처: share.service.ts → createShareLink()     │
│   결과: https://www.dailymeal.life/share/meal/...  │
│                                                     │
│ [이미지 URL 접두사 - 응답에 포함]                     │
│   IMAGE_BASE_URL: (빈값)                            │
│   사용처: config.service.ts → transformImageUrl()  │
│   결과: /uploads/meals/abc.jpg (상대 경로)          │
│                                                     │
└─────────────────────────────────────────────────────┘

개발 vs 운영 비교:
┌──────────────┬─────────────────────────┬──────────────────┐
│ 환경변수      │ 개발 환경                │ 운영 환경         │
├──────────────┼─────────────────────────┼──────────────────┤
│ FRONTEND_URL │ http://localhost:3000   │ https://www.daily│
│ IMAGE_BASE_  │ http://localhost:8000   │ (빈값)           │
│   URL        │                         │                  │
├──────────────┼─────────────────────────┼──────────────────┤
│ 공유 링크    │ localhost:3000/share/.. │ www.daily.../... │
│ 이미지 URL   │ localhost:8000/uploads/ │ /uploads/...     │
└──────────────┴─────────────────────────┴──────────────────┘
```

## 왜 이미지는 상대 경로인가?

### 1. 같은 도메인에서 서빙

```
프론트엔드: https://www.dailymeal.life (Next.js)
이미지:     https://www.dailymeal.life/uploads/... (Nginx)
```

→ 같은 도메인이므로 `/uploads/...`만으로 접근 가능

### 2. Nginx 설정

```nginx
location /uploads/ {
    alias /path/to/backend/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 절대 경로를 사용하면 문제점

```json
// 만약 IMAGE_BASE_URL=https://www.dailymeal.life
{
  "photo": "https://www.dailymeal.life/uploads/meals/abc.jpg"
}
```

- ❌ 도메인 변경 시 모든 이미지 URL 변경 필요
- ❌ 개발/스테이징/운영 환경 전환이 복잡해짐
- ❌ CDN 도입 시 변경 범위가 커짐

### 4. 상대 경로의 장점

```json
{
  "photo": "/uploads/meals/abc.jpg"
}
```

- ✅ 도메인 변경에 무관
- ✅ 환경 전환 용이
- ✅ CDN 도입 시 프론트엔드만 수정 (백엔드 무변경)

### 5. ⚠️ 예외: 카카오톡 공유 이미지

**중요:** 카카오톡 공유는 **외부 서버(카카오)**가 이미지를 가져가므로 **절대 URL 필수**!

```typescript
// frontend/src/components/meal-card.tsx
const getAbsoluteImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/...'

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 🔥 상대 경로를 절대 경로로 변환
  // 카카오 서버가 접근할 수 있도록!
  return `${APP_CONFIG.SITE_URL}${url}`
  // 결과: https://www.dailymeal.life/uploads/meals/abc.jpg
}

const shareData = {
  imageUrl: getAbsoluteImageUrl(photoList[0]),
  // → https://www.dailymeal.life/uploads/meals/abc.jpg
}
```

**구분:**

- **브라우저 렌더링**: 상대 경로 OK (`/uploads/...`)
- **카카오톡 공유**: 절대 경로 필수 (`https://www.dailymeal.life/uploads/...`)
- **모바일 앱 WebView**: 상대 경로 OK (같은 도메인)

**왜?**

- 브라우저: 같은 도메인에서 실행 중 → 상대 경로 자동 해석
- 카카오 서버: 외부에서 이미지 다운로드 → 절대 URL 필요

## 관련 파일

- `backend/src/config/config.service.ts` - `transformImageUrl()` 수정 (API_BASE_URL → IMAGE_BASE_URL)
- `backend/src/share/share.service.ts` - `createShareLink()` (변경 없음, FRONTEND_URL 사용)
- `backend/.env` - 개발 환경 설정
- `backend/.env.example` - 환경변수 예시 및 주석
- AWS Secrets Manager `dailymeal/product` - 운영 환경 설정

## 핵심 교훈

1. **환경변수는 목적별로 명확히 분리**
   - 내부 통신: (필요 시 별도 변수)
   - 외부 공유: `FRONTEND_URL`
   - 이미지 접두사: `IMAGE_BASE_URL`

2. **상대 경로 vs 절대 경로**
   - 같은 도메인 리소스: 상대 경로 권장
   - 외부 공유 링크: 절대 경로 필수

3. **개발/운영 환경 구분**
   - 개발: 절대 경로 (CORS, 별도 포트)
   - 운영: 상대 경로 (Nginx 프록시)

4. **환경변수 네이밍**
   - 명확한 용도를 담은 변수명 사용
   - `API_BASE_URL` (애매함) → `IMAGE_BASE_URL` (명확함)

---

**날짜**: 2025-01-12  
**작성자**: Jynius  
**관련 이슈**: 모바일 앱 카카오 공유 localhost URL 문제 (최종 해결)
