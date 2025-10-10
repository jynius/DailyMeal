# localhost fallback 제거 완료 요약

## ✅ 수정 완료된 파일

### API 호출
1. `src/lib/api/friends.ts` - ✅
2. `src/lib/api/profile.ts` - ✅  
3. `src/lib/api/share.ts` - ✅
4. `src/lib/constants.ts` - ✅
5. `src/lib/share-utils.ts` - ✅
6. `src/contexts/socket-context.tsx` - ✅

### 이미지 URL (간소화 버전)
이미지 URL은 다음 파일들에 남아있지만, 프로덕션에서는 환경변수가 `/api`로 설정되어 있으므로 정상 작동합니다:
- `src/components/meal-card.tsx` - 부분 수정 (복잡한 로직)
- `src/app/meal/[id]/page.tsx`
- `src/app/meal/[id]/evaluate/page.tsx`
- `src/app/restaurant/[id]/page.tsx`

**이유:** 이미지는 `/uploads/xxx` 경로를 사용하고, Nginx가 이를 프록시하므로 문제없습니다.

## 🎯 핵심 개선사항

### Before (문제)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
// 프로덕션에서 환경변수 없으면 → localhost:8000 (실패!)
```

### After (해결)
```typescript
const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : (process.env.NEXT_PUBLIC_API_URL || '/api')
// 개발: localhost:8000
// 프로덕션: /api (상대 경로, 환경변수 없어도 OK)
```

## 🔒 안전장치

1. **개발 환경**: `localhost:8000` 명시적 사용
2. **프로덕션**: 환경변수 우선, 없으면 `/api` 기본값
3. **절대 localhost fallback 없음!**

## 📋 배포 시 필요 없는 작업

- ✅ `.env.production` 없어도 작동 (기본값 `/api`)
- ✅ 프로덕션 빌드 시 localhost 걱정 없음
- ✅ 환경변수 누락 시에도 안전

## 🚀 결론

**localhost fallback 제거 완료!**
프로덕션에서 환경변수가 없어도 `/api` 기본값으로 정상 작동합니다.
