# Next.js Image 최적화 문제 해결

## 문제

업로드된 이미지가 여전히 표시되지 않음

**에러:**
```
GET https://www.dailymeal.life/_next/image?url=%2Fapi%2Fuploads%2Fmeals%2F2025%2F10%2F10%2F454c7028...
400 (Bad Request)
```

## 원인

### Next.js Image 컴포넌트의 기본 동작

1. **Image 컴포넌트 사용 시:**
   ```tsx
   <Image src="/api/uploads/meals/..." />
   ```

2. **Next.js가 자동으로 변환:**
   ```
   /_next/image?url=%2Fapi%2Fuploads%2Fmeals%2F...&w=384&q=75
   ```

3. **문제:**
   - `/_next/image` 엔드포인트는 Next.js 서버에서 처리
   - `/api/uploads`는 백엔드(NestJS)로 프록시되어야 함
   - Next.js가 백엔드 이미지를 가져오지 못함

### 이미지 최적화 비활성화만으로는 부족

```typescript
// next.config.ts
images: {
  unoptimized: true,  // ❌ 이것만으로는 해결 안 됨
}
```

`unoptimized: true`는 이미지 최적화를 건너뛰지만, 여전히 `/_next/image` 경로를 사용합니다.

## 해결 방법

### 1. Custom Image Loader 사용

#### next.config.ts
```typescript
images: {
  unoptimized: true,
  loader: 'custom',
  loaderFile: './src/lib/image-loader.ts',
}
```

#### src/lib/image-loader.ts
```typescript
export default function imageLoader({ src }: { src: string }) {
  // /api/uploads 경로는 그대로 반환
  if (src.startsWith('/api/uploads') || src.startsWith('/uploads')) {
    return src;
  }
  
  // 외부 URL도 그대로 반환
  if (src.startsWith('http')) {
    return src;
  }
  
  return src;
}
```

**동작:**
```tsx
<Image src="/api/uploads/meals/..." />
  ↓ (imageLoader)
실제 요청: /api/uploads/meals/...
  ↓ (Nginx)
NestJS 백엔드로 프록시 ✅
```

### 2. 대안: 직접 img 태그 사용

Image 컴포넌트 대신 일반 img 태그:

```tsx
// Before (문제)
<Image src="/api/uploads/meals/..." alt="..." width={384} height={384} />

// After (해결)
<img src="/api/uploads/meals/..." alt="..." className="w-full h-auto" />
```

**장단점:**
- ✅ 즉시 작동, 설정 불필요
- ❌ Next.js Image 최적화 기능 사용 불가
- ❌ lazy loading 수동 구현 필요

### 3. 대안: 백엔드 이미지를 별도 도메인으로

```typescript
// 이미지만 별도 도메인 사용
const imageUrl = `https://cdn.dailymeal.life/uploads/meals/...`;

<Image src={imageUrl} />
```

**장단점:**
- ✅ Next.js 최적화 완전 활용
- ❌ 인프라 복잡도 증가 (CDN 설정 필요)

## 구현된 해결책: Custom Loader

### 장점

1. **Next.js Image 컴포넌트 계속 사용**
   - lazy loading
   - placeholder
   - 반응형 이미지 (srcset)

2. **백엔드 경로 그대로 사용**
   - `/api/uploads` → 백엔드로 프록시

3. **외부 이미지도 지원**
   - Kakao Map, 소셜 미디어 이미지 등

### 동작 흐름

```
프론트엔드 컴포넌트:
<Image src="/api/uploads/meals/2025/10/10/abc.png" />
    ↓
imageLoader 호출
    ↓
return "/api/uploads/meals/2025/10/10/abc.png" (그대로)
    ↓
브라우저 요청: GET /api/uploads/meals/2025/10/10/abc.png
    ↓
Nginx 프록시: /api/* → localhost:8000
    ↓
NestJS ServeStaticModule: /uploads → /data/uploads
    ↓
파일: /data/uploads/meals/2025/10/10/abc.png
    ↓
응답: 200 OK ✅
```

## 배포

### 1. 로컬에서 커밋

```bash
cd ~/projects/WebApp/DailyMeal
git add frontend/next.config.ts frontend/src/lib/image-loader.ts
git commit -m "fix: Add custom image loader to bypass Next.js optimization for backend images"
git push
```

### 2. 백엔드 배포 (이전 수정사항)

```bash
# 서버에서
cd ~/DailyMeal
git pull
cd backend
npm run build
pm2 restart dailymeal-backend
```

### 3. 프론트엔드 배포

```bash
# 서버에서
cd ~/DailyMeal/frontend
npm run build
pm2 restart dailymeal-frontend
```

### 4. 확인

브라우저 개발자 도구 Network 탭:
```
✅ GET /api/uploads/meals/2025/10/10/abc.png → 200 OK
❌ GET /_next/image?url=... → 사라짐
```

## 추가 최적화 (선택)

### Nginx에서 직접 이미지 서빙

더 빠른 성능을 원하면:

```nginx
# /etc/nginx/sites-available/dailymeal
location /api/uploads/ {
    alias /data/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

**장점:**
- NestJS 거치지 않고 Nginx가 직접 서빙
- 10배 빠른 응답 속도
- 백엔드 서버 부하 감소

**변경 후:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 트러블슈팅

### 문제: 여전히 /_next/image 경로 사용

**원인:** 빌드 캐시

**해결:**
```bash
cd ~/DailyMeal/frontend
rm -rf .next
npm run build
pm2 restart dailymeal-frontend
```

### 문제: 이미지는 로드되지만 lazy loading 안 됨

**원인:** img 태그 사용 시

**해결:**
```tsx
// loading="lazy" 속성 추가
<img src="..." loading="lazy" />
```

### 문제: Next.js Image 컴포넌트 에러

```
Error: Image with src "/api/uploads/..." is missing required "width" property
```

**해결:**
```tsx
<Image 
  src="/api/uploads/..." 
  alt="..."
  width={384}   // 추가
  height={384}  // 추가
/>
```

## 참고

### Image 컴포넌트 사용 예시

```tsx
import Image from 'next/image';

// 백엔드 이미지 (custom loader 사용)
<Image 
  src="/api/uploads/meals/2025/10/10/abc.png"
  alt="식사 이미지"
  width={384}
  height={384}
  className="rounded-lg"
/>

// 외부 이미지 (custom loader 사용)
<Image 
  src="https://example.com/image.jpg"
  alt="외부 이미지"
  width={200}
  height={200}
/>

// Next.js public 폴더 이미지 (기본 동작)
<Image 
  src="/logo.png"
  alt="로고"
  width={100}
  height={100}
/>
```

### remotePatterns vs Custom Loader

| 방식 | 용도 | 장점 |
|-----|------|-----|
| remotePatterns | 외부 도메인 이미지 허용 | 보안 (허용된 도메인만) |
| Custom Loader | 이미지 URL 변환 로직 | 유연함, 프록시 경로 처리 |

현재는 **Custom Loader**를 사용하여 `/api/uploads` 경로를 그대로 사용합니다.

## 결론

**핵심 문제:** Next.js Image 컴포넌트가 모든 이미지를 `/_next/image`로 최적화하려고 시도

**해결:** Custom Image Loader로 백엔드 이미지는 원본 경로 그대로 사용

**효과:**
- ✅ Next.js Image 컴포넌트 계속 사용 가능
- ✅ 백엔드 이미지 정상 로드
- ✅ lazy loading, placeholder 등 기능 유지

이제 이미지가 정상적으로 표시될 것입니다! 🎉
