# 평가 시스템 업데이트 - 사진 등록과 평가 분리

## 📋 변경 요약

사용자 경험 개선을 위해 사진 업로드와 평가를 분리했습니다.

### 변경 전
- 사진, 메뉴명, 평점(필수) → 한 번에 모두 입력해야 등록 가능
- 식사 전에 바로 평가를 해야 하는 비현실적인 UX

### 변경 후
- **1단계**: 사진 + 메뉴명만으로 즉시 등록 가능
- **2단계**: 식사 후 나중에 평가 추가 가능
- 평가는 선택사항이며, 미평가 상태로 표시됨

## 🔧 주요 변경사항

### 1. Backend (NestJS)

#### Entity 수정
**파일**: `backend/src/entities/meal-record.entity.ts`
```typescript
// rating 필드를 nullable로 변경
@Column('int', { nullable: true })
rating: number;
```

#### DTO 수정
**파일**: `backend/src/dto/meal-record.dto.ts`
```typescript
export class CreateMealRecordDto {
  // rating을 필수에서 선택으로 변경
  @ApiProperty({ 
    example: 4, 
    description: '별점 (1-5점) - 나중에 평가 가능',
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  rating?: number;
}
```

### 2. Frontend (Next.js)

#### 등록 페이지 수정
**파일**: `frontend/src/app/add/page.tsx`

1. **검증 로직 제거**
   - rating 필수 검증 제거
   - 사진과 메뉴명만 있으면 등록 가능

2. **UI 개선**
   ```tsx
   // 평점 라벨 변경
   <label className="block text-sm font-medium text-gray-700">
     평점 <span className="text-gray-400 text-xs">(선택사항 - 나중에 평가 가능)</span>
   </label>
   
   // 안내 메시지 추가
   {formData.rating === 0 && (
     <p className="text-xs text-gray-500">💡 식사 후에 평가할 수 있습니다</p>
   )}
   ```

3. **데이터 전송 로직**
   ```typescript
   // rating이 0이면 전송하지 않음
   if (formData.rating > 0) {
     data.append('rating', formData.rating.toString())
   }
   ```

#### 카드 컴포넌트 수정
**파일**: `frontend/src/components/meal-card.tsx`

```tsx
// 평가 유무에 따른 UI 분기
{rating && rating > 0 ? (
  <div className="flex items-center flex-shrink-0">
    {/* 별점 표시 */}
  </div>
) : (
  <span className="text-xs text-gray-400 flex-shrink-0">미평가</span>
)}
```

#### 타입 정의 수정
**파일**: `frontend/src/types/index.ts`

```typescript
export interface MealRecord {
  // ... 기타 필드
  rating?: number  // 필수에서 선택으로 변경
}

export interface CreateMealRequest {
  name: string
  photo: File
  location?: string
  rating?: number  // 선택사항
  memo?: string
  price?: number
}
```

## 📱 사용자 시나리오

### 시나리오 1: 식사 전 사진만 찍고 등록
1. 음식이 나왔을 때 사진 촬영 📸
2. 메뉴 이름만 입력
3. 즉시 저장 (평가 안 함)
4. 나중에 상세 페이지에서 평가 추가 가능

### 시나리오 2: 식사 후 평가와 함께 등록
1. 사진 업로드 📸
2. 메뉴 이름 입력
3. 평가 별점 선택 ⭐⭐⭐⭐⭐
4. 메모 작성 (선택)
5. 저장

### 시나리오 3: 미평가 기록 나중에 평가하기
1. 피드에서 "미평가" 표시된 기록 확인
2. 상세 페이지 진입
3. 수정 버튼으로 평가 추가
4. 업데이트

## 🗃️ 데이터베이스 변경

### SQLite (개발 환경)
```sql
-- rating 컬럼을 nullable로 변경
ALTER TABLE meal_records 
  ALTER COLUMN rating DROP NOT NULL;
```

### 기존 데이터
- 기존 레코드들은 이미 rating 값을 가지고 있어 영향 없음
- 새 레코드만 rating NULL 허용

## ✅ 테스트 체크리스트

- [ ] 사진과 메뉴명만으로 등록 가능한지 확인
- [ ] 평가 없이 등록한 기록이 "미평가"로 표시되는지 확인
- [ ] 평가 포함 등록도 정상 동작하는지 확인
- [ ] 미평가 기록을 나중에 수정할 수 있는지 확인
- [ ] 피드에서 미평가 기록이 제대로 표시되는지 확인
- [ ] 음식점 통계에서 평가 없는 기록 처리 확인

## 🚀 배포 순서

1. **Backend 배포**
   ```bash
   cd backend
   npm run build
   pm2 restart dailymeal-backend
   ```

2. **Frontend 배포**
   ```bash
   cd frontend
   npm run build
   pm2 restart dailymeal-frontend
   ```

3. **데이터베이스 확인**
   ```bash
   cd backend
   node scripts/inspect-db.js
   ```

## 📝 추가 개선 사항 (향후)

1. **평가 추가 기능 강화**
   - 상세 페이지에 "평가하기" 버튼 추가
   - 미평가 기록 일괄 평가 기능

2. **통계 개선**
   - 미평가 기록 필터링 옵션
   - 평가율 통계 표시

3. **알림 기능**
   - 일정 시간 후 평가 알림 (선택사항)

## 🔍 관련 파일

### Backend
- `backend/src/entities/meal-record.entity.ts`
- `backend/src/dto/meal-record.dto.ts`
- `backend/src/meal-records/meal-records.service.ts`
- `backend/src/meal-records/meal-records.controller.ts`

### Frontend
- `frontend/src/app/add/page.tsx`
- `frontend/src/components/meal-card.tsx`
- `frontend/src/types/index.ts`
- `frontend/src/lib/api/client.ts`

## 📚 관련 문서
- [사용자 시나리오](./SCENARIOS.md)
- [데이터베이스 문서](./DATABASE.md)
- [환경 설정 가이드](./ENVIRONMENT_SETUP.md)
