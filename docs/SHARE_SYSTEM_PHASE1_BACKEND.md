# Phase 1: 공유 시스템 백엔드 구현 완료 ✅

## 생성된 파일들

### 1. 엔티티 (Entities)
- `/backend/src/entities/meal-share.entity.ts` - 공유 링크 정보
- `/backend/src/entities/share-tracking.entity.ts` - 공유 추적 (조회, 전환)

### 2. DTO (Data Transfer Objects)
- `/backend/src/dto/share.dto.ts` - 공유 관련 요청/응답 DTO

### 3. 서비스 & 컨트롤러
- `/backend/src/common/crypto.service.ts` - 암호화/복호화 서비스
- `/backend/src/share/share.service.ts` - 공유 비즈니스 로직
- `/backend/src/share/share.controller.ts` - 공유 API 엔드포인트
- `/backend/src/share/share.module.ts` - Share 모듈

### 4. 수정된 파일
- `/backend/src/app.module.ts` - ShareModule 등록, 엔티티 추가
- `/backend/.env` - 암호화 키, URL 설정 추가

---

## API 엔드포인트

### 1. `POST /share/create` (인증 필요)
**설명**: 식사 기록 공유 링크 생성  
**요청**:
```json
{
  "mealId": "meal-uuid"
}
```
**응답**:
```json
{
  "shareId": "abc123xyz",
  "url": "http://localhost:3000/share/meal/abc123xyz?ref=encrypted_user_id",
  "ref": "encrypted_user_id"
}
```

### 2. `GET /share/meal/:shareId` (공개)
**설명**: 공유된 식사 기록 조회 (인증 불필요)  
**응답**:
```json
{
  "id": "meal-uuid",
  "name": "마르게리따 피자",
  "photos": ["http://localhost:8000/uploads/photo1.jpg"],
  "location": "이탈리아 레스토랑",
  "rating": 5,
  "memo": "정말 맛있었어요!",
  "price": 15000,
  "category": "restaurant",
  "createdAt": "2025년 1월",
  "sharerName": "김철수",
  "sharerProfileImage": null,
  "viewCount": 42
}
```

### 3. `POST /share/track-view` (공개)
**설명**: 공유 조회 추적  
**요청**:
```json
{
  "shareId": "abc123xyz",
  "ref": "encrypted_user_id",
  "sessionId": "browser-unique-id"
}
```

### 4. `POST /share/connect-friend` (인증 필요)
**설명**: 공유를 통한 친구 연결  
**요청**:
```json
{
  "ref": "encrypted_user_id"
}
```
**응답**:
```json
{
  "success": true,
  "message": "Friend added successfully"
}
```

### 5. `GET /share/my-stats` (인증 필요)
**설명**: 내 공유 통계 조회  
**응답**:
```json
[
  {
    "shareId": "abc123xyz",
    "mealName": "마르게리따 피자",
    "viewCount": 42,
    "trackingCount": 38,
    "conversions": 5,
    "createdAt": "2025-01-15T..."
  }
]
```

---

## 데이터베이스 스키마

### meal_shares 테이블
```sql
id (uuid, PK)
shareId (varchar(100), unique) - 공유 고유 ID
mealId (uuid, FK → meal_records)
sharerId (uuid, FK → users)
viewCount (int) - 조회 수
expiresAt (timestamp) - 만료 시간
isActive (boolean) - 활성 상태
createdAt (timestamp)
```

### share_tracking 테이블
```sql
id (uuid, PK)
shareId (uuid, FK → meal_shares)
sharerId (uuid, FK → users) - 공유한 사람
recipientId (uuid, FK → users, nullable) - 공유받은 사람
sessionId (varchar(255)) - 브라우저 식별
ipAddress (varchar(45)) - IP 주소
userAgent (varchar(500)) - User Agent
viewedAt (timestamp) - 조회 시간
convertedAt (timestamp, nullable) - 로그인/가입 시간
friendRequestSent (boolean) - 친구 요청 여부
createdAt (timestamp)
```

---

## 주요 기능

### 1. 공유 링크 생성
- 짧고 안전한 shareId 생성 (11자 URL-safe)
- sharerId 암호화하여 ref 파라미터 생성
- 30일 후 자동 만료
- 중복 생성 방지 (기존 링크 재사용)

### 2. 공개 조회 (인증 불필요)
- 개인정보 필터링 (날짜는 "2025년 1월"만 표시)
- 친구 이름 숨김
- 조회수 자동 증가
- 만료된 링크 접근 차단

### 3. 공유 추적
- 비로그인 상태에서도 sessionId로 추적
- IP, User Agent 기록 (악용 방지)
- 중복 조회 필터링

### 4. 친구 자동 연결
- ref 복호화하여 공유자 식별
- 로그인/가입 시 자동으로 양방향 친구 승인
- 이미 친구인 경우 예외 처리
- share_tracking 업데이트 (convertedAt, friendRequestSent)

### 5. 통계 제공
- 공유 링크별 조회수, 추적 수, 전환율
- 마케팅/성장 분석 가능

---

## 환경 변수

```properties
# 암호화 키 (32자 이상 권장)
ENCRYPTION_KEY=dailymeal-secret-key-32-chars!

# 프론트엔드 URL (공유 링크용)
FRONTEND_URL=http://localhost:3000

# API Base URL (이미지 URL용)
API_BASE_URL=http://localhost:8000
```

---

## 보안 고려사항

1. **암호화**: ref 파라미터는 AES-256으로 암호화
2. **만료**: 공유 링크는 30일 후 자동 만료
3. **권한**: 자신의 meal만 공유 가능
4. **추적**: IP, User Agent 기록으로 악용 감지 가능
5. **중복 방지**: sessionId로 중복 조회 필터링

---

## 다음 단계: Phase 2 프론트엔드

1. `/share/meal/[shareId]` 페이지 생성
2. ShareModal에서 공유 링크 생성 API 호출
3. sessionStorage로 ref 저장 및 친구 연결 처리
4. OG 메타태그 추가 (Next.js Metadata API)

---

## 테스트 방법

### 1. 공유 링크 생성
```bash
curl -X POST http://localhost:8000/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mealId":"meal-uuid"}'
```

### 2. 공개 조회
```bash
curl http://localhost:8000/share/meal/abc123xyz
```

### 3. 추적
```bash
curl -X POST http://localhost:8000/share/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "shareId":"abc123xyz",
    "ref":"encrypted_ref",
    "sessionId":"browser-id"
  }'
```

### 4. 친구 연결
```bash
curl -X POST http://localhost:8000/share/connect-friend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ref":"encrypted_ref"}'
```

---

## 완료 ✅

백엔드 Phase 1 완료! 이제 프론트엔드 구현으로 넘어갈 준비가 되었습니다.
