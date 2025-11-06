# 근처 식당 검색 기능 - 사용 가이드

## 개요

Kakao Maps JavaScript SDK의 Places 서비스를 사용하여 현재 위치 기반으로 근처 식당/카페를 검색하는 기능입니다.

**기존 프로젝트 구조 활용:**

- ✅ `use-kakao-map` hook으로 SDK 로드 관리
- ✅ `libraries=services` 포함되어 Places API 사용 가능
- ✅ JavaScript Key 사용 (REST API Key 불필요)
- ✅ CORS 문제 없음 (클라이언트 SDK 사용)

## 구현된 파일

### 1. `/frontend/src/lib/kakao-local.ts`

Kakao Maps Places 서비스 래퍼

**주요 기능:**

- `searchByCategory()` - 카테고리로 검색 (음식점: FD6, 카페: CE7)
- `searchByKeyword()` - 키워드로 검색
- `formatDistance()` - 거리 포맷팅

**사용 예시:**

```typescript
import { kakaoLocal } from '@/lib/kakao-local'

// 반경 1km 내 음식점 검색
const restaurants = await kakaoLocal.searchByCategory(
  37.5665, // latitude
  126.978, // longitude
  1000, // radius (meters)
  'FD6' // category (FD6: 음식점, CE7: 카페)
)

// 키워드로 검색
const results = await kakaoLocal.searchByKeyword('삼겹살', 37.5665, 126.978, 5000)
```

**내부 동작:**

- `window.kakao.maps.services.Places()` 사용
- 기존 Geocoder와 동일한 방식으로 SDK 활용
- `useKakaoMap` hook이 로드 관리

### 2. `/frontend/src/components/nearby-restaurants.tsx`

근처 식당 목록 표시 컴포넌트

**Props:**

- `radius?: number` - 검색 반경 (기본값: 1000m)
- `onSelectRestaurant?: (restaurant) => void` - 식당 선택 콜백
- `className?: string` - 추가 CSS 클래스

**기능:**

- 🍽️ 음식점 / ☕ 카페 탭 전환
- 📍 현재 위치 자동 감지
- 📏 거리순 정렬
- 📞 전화번호, 주소 표시
- 🔗 카카오맵 링크

## 사용 방법

### 1. 기본 사용

```tsx
import { NearbyRestaurants } from '@/components/nearby-restaurants'

function MyComponent() {
  return (
    <NearbyRestaurants
      radius={1000}
      onSelectRestaurant={(restaurant) => {
        console.log('선택된 식당:', restaurant.place_name)
      }}
    />
  )
}
```

### 2. evaluate-modal에 통합

```tsx
import { NearbyRestaurants } from '@/components/nearby-restaurants'
import type { RestaurantPlace } from '@/lib/kakao-local'

// Modal 안에서
const [showRestaurantSearch, setShowRestaurantSearch] = useState(false)

const handleRestaurantSelect = (restaurant: RestaurantPlace) => {
  setFormData((prev) => ({
    ...prev,
    location: restaurant.place_name,
    // 필요시 좌표도 저장
    latitude: parseFloat(restaurant.y),
    longitude: parseFloat(restaurant.x),
  }))
  setShowRestaurantSearch(false)
}

return (
  <div>
    {/* 기존 location 입력 필드 */}
    <input
      value={formData.location}
      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
    />

    <button onClick={() => setShowRestaurantSearch(!showRestaurantSearch)}>근처 식당 찾기</button>

    {showRestaurantSearch && (
      <NearbyRestaurants radius={1000} onSelectRestaurant={handleRestaurantSelect} />
    )}
  </div>
)
```

### 3. 독립 페이지로 사용

```tsx
// /frontend/src/app/(main)/restaurants/page.tsx
'use client'

import { NearbyRestaurants } from '@/components/nearby-restaurants'

export default function RestaurantsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">주변 맛집</h1>
      <NearbyRestaurants
        radius={2000}
        onSelectRestaurant={(restaurant) => {
          // 선택 후 동작 (예: 상세 페이지로 이동)
          console.log(restaurant)
        }}
      />
    </div>
  )
}
```

## API 응답 구조

```typescript
interface RestaurantPlace {
  id: string // 장소 ID
  place_name: string // 장소명
  category_name: string // 카테고리 (예: "음식점 > 한식 > 삼겹살")
  category_group_code: string // 카테고리 코드
  phone: string // 전화번호
  address_name: string // 지번 주소
  road_address_name: string // 도로명 주소
  x: string // 경도 (longitude)
  y: string // 위도 (latitude)
  place_url: string // 카카오맵 URL
  distance: string // 거리 (미터)
}
```

## 카테고리 코드

Kakao Local API에서 지원하는 주요 카테고리:

- `MT1` - 대형마트
- `CS2` - 편의점
- `PS3` - 어린이집, 유치원
- `SC4` - 학교
- `AC5` - 학원
- **`PK6` - 주차장**
- **`OL7` - 주유소, 충전소**
- **`SW8` - 지하철역**
- **`BK9` - 은행**
- **`CT1` - 문화시설**
- **`AG2` - 중개업소**
- **`PO3` - 공공기관**
- **`AT4` - 관광명소**
- **`AD5` - 숙박**
- **`FD6` - 음식점** ⭐
- **`CE7` - 카페** ⭐
- **`HP8` - 병원**
- **`PM9` - 약국**

## 검색 반경 제한

- **최소**: 0m
- **최대**: 20,000m (20km)
- **기본값**: 1,000m (1km)

## 필요한 환경 변수

`.env.local`에 다음이 설정되어 있어야 합니다:

```bash
NEXT_PUBLIC_KAKAO_API_KEY=your_kakao_javascript_api_key_here
```

**주의:** JavaScript Key를 사용합니다 (REST API Key 아님)

## 기술적 배경

### 왜 REST API 대신 JavaScript SDK를 사용하나?

**문제점 (REST API 방식):**

- ❌ CORS 에러 발생 (브라우저에서 직접 호출 불가)
- ❌ Next.js API Route 우회 필요 (추가 복잡도)
- ❌ REST API Key 별도 발급 필요

**해결책 (JavaScript SDK 방식):**

- ✅ 기존 Kakao Map SDK 활용 (`libraries=services`)
- ✅ CORS 문제 없음 (클라이언트 SDK)
- ✅ 기존 JavaScript Key 재사용
- ✅ `window.kakao.maps.services.Places()` 직접 사용
- ✅ Geocoder와 동일한 패턴

### 현재 프로젝트 구조와의 통합

```
use-kakao-map.ts (hook)
  ↓ SDK 로드
window.kakao.maps.services
  ├── Geocoder (역지오코딩) ← 기존
  └── Places (장소 검색) ← 새로 추가
```

## 주의사항

1. **SDK 로딩 대기**: `useKakaoMap()` hook이 `isLoaded: true`를 반환할 때까지 대기
2. **동일한 API Key**: 기존 Kakao Map과 같은 JavaScript Key 사용
3. **할당량**: Kakao API는 일일 요청 제한이 있으므로 캐싱 고려 필요
4. **타입 정의**: `kakao.maps.d.ts`에 Places 서비스 타입 추가됨

## 개선 아이디어

- [ ] 검색 결과 캐싱 (React Query)
- [ ] 페이지네이션 (더보기 버튼)
- [ ] 필터링 (카테고리, 거리, 평점 등)
- [ ] 지도에 마커 표시
- [ ] 상세 정보 보기 (리뷰, 메뉴 등)
- [ ] 즐겨찾기 기능
