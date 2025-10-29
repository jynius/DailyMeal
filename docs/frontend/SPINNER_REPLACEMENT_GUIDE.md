# Spinner 컴포넌트 일괄 대체 가이드

## 📊 현재 상황

총 **19개 파일**에서 인라인 스피너 사용 중

## 🎯 대체 패턴

### 패턴 1: 페이지 전체 로딩 (텍스트 포함)

**Before:**
```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
    <p className="text-gray-600">로딩 중...</p>
  </div>
</div>
```

**After:**
```tsx
<Spinner container="page" text="로딩 중..." />
```

**적용 파일:**
- ✅ app/(main)/statistics/page.tsx
- ✅ app/(main)/feed/page.tsx
- ⏳ app/profile/page.tsx (2곳)
- ⏳ app/(main)/page.tsx
- ⏳ app/(main)/restaurant/page.tsx (2곳)
- ⏳ app/(detail)/restaurant/[id]/page.tsx
- ⏳ app/(detail)/meal/[id]/page.tsx
- ⏳ app/(detail)/meal/[id]/evaluate/page.tsx
- ⏳ app/users/page.tsx
- ⏳ app/share/meal/[shareId]/page.tsx
- ⏳ app/login/page.tsx
- ⏳ app/signup/page.tsx

### 패턴 2: 인라인 작은 스피너 (sm)

**Before:**
```tsx
<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
```

**After:**
```tsx
<Spinner size="sm" />
```

**적용 파일:**
- ✅ app/(detail)/add/page.tsx
- ⏳ components/meal-card.tsx

### 패턴 3: 버튼 내 스피너

**Before:**
```tsx
<div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
```

**After:**
```tsx
<Spinner size="sm" color="gray" />
```

**적용 파일:**
- ⏳ app/(detail)/meal/[id]/page.tsx

### 패턴 4: 특수 색상 스피너

**Before:**
```tsx
<div className="w-6 h-6 mb-2 border-2 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
```

**After:**
```tsx
{/* 노란색은 현재 미지원 - 커스텀 스피너 유지 또는 Spinner 확장 */}
```

**적용 파일:**
- ⏳ components/share-modal.tsx (노란색 - 특수 케이스)

### 패턴 5: 아이콘 기반 스피너

**Before:**
```tsx
<Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
<RefreshCw size={14} className="animate-spin" />
```

**After:**
```tsx
{/* Lucide 아이콘 - 그대로 유지 (Spinner로 대체 불가) */}
```

**유지 파일:**
- ✓ components/kakao-map.tsx (Loader2 아이콘)
- ✓ components/ai-menu-recommendation.tsx (RefreshCw 아이콘)

## 🔧 자동 대체 스크립트

### 1단계: Import 추가

각 파일 상단에 추가:
```tsx
import Spinner from '@/components/ui/spinner'
```

### 2단계: 패턴별 대체

```bash
# VSCode에서 Find & Replace (Regex 모드)

# 패턴 1: 텍스트 포함 페이지 로딩
Find:
<div className="[^"]*min-h-screen[^"]*flex items-center justify-center[^"]*">\s*<div className="text-center">\s*<div className="animate-spin[^"]*"></div>\s*<p className="text-gray-600">([^<]+)</p>\s*</div>\s*</div>

Replace:
<Spinner container="page" text="$1" />

# 패턴 2: 작은 스피너 (h-4 w-4)
Find:
<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-(?:blue|gray)-(?:500|600)[^"]*"></div>

Replace:
<Spinner size="sm" />
```

## 📋 수동 대체 체크리스트

### ✅ 완료
- [x] app/(main)/statistics/page.tsx
- [x] app/(main)/feed/page.tsx
- [x] app/(detail)/add/page.tsx
- [x] components/auth/AuthGuard.tsx

### ⏳ 대기 (총 15개)

#### 페이지 로딩 (13개)
- [ ] app/profile/page.tsx (2곳)
- [ ] app/(main)/page.tsx
- [ ] app/(main)/restaurant/page.tsx (2곳)
- [ ] app/(detail)/restaurant/[id]/page.tsx
- [ ] app/(detail)/meal/[id]/page.tsx (2곳 - 1개는 특수)
- [ ] app/(detail)/meal/[id]/evaluate/page.tsx
- [ ] app/users/page.tsx
- [ ] app/share/meal/[shareId]/page.tsx
- [ ] app/login/page.tsx
- [ ] app/signup/page.tsx

#### 컴포넌트 (2개)
- [ ] components/meal-card.tsx
- [ ] components/share-modal.tsx (특수 - 노란색)

## 💡 대체 예시

### app/profile/page.tsx

**Before (line 60-67):**
```tsx
if (authLoading) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 확인 중...</p>
      </div>
    </div>
  )
}
```

**After:**
```tsx
if (authLoading) {
  return <Spinner container="page" text="인증 확인 중..." />
}
```

## 🎨 Spinner Props 참고

```tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'           // h-4, h-8, h-12
  color?: 'blue' | 'gray' | 'white'   // 색상
  text?: string                        // 로딩 텍스트
  fullScreen?: boolean                 // 풀스크린 센터링
  container?: 'page' | 'section' | 'none'  // 컨테이너 타입
  className?: string                   // 추가 클래스
}
```

## ⚠️ 주의사항

1. **Lucide 아이콘은 유지**: `Loader2`, `RefreshCw` 등은 Spinner로 대체 불가
2. **특수 색상**: 노란색 등 지원하지 않는 색상은 커스텀 유지 or Spinner 확장
3. **컨텍스트 유지**: `pb-20` 등 추가 클래스가 필요한 경우 `className` prop 사용

## 📊 예상 효과

- **코드 라인 수**: ~150줄 → ~30줄 (80% 감소)
- **유지보수**: 15곳 수정 → 1곳 수정
- **일관성**: 통일된 로딩 UI
