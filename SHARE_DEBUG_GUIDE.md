# 🔍 Phase 3 공유 시스템 디버깅 단계별 가이드

## 현재 상황
- ❌ 공유 버튼 클릭 시 "공유 링크 생성에 실패했습니다" 에러
- ❌ 자동으로 로그아웃되어 로그인 페이지로 이동
- ✅ PM2 재시작 완료
- ✅ 환경변수 로드 확인됨

## 🎯 디버깅 체크리스트

### Step 1: 브라우저 준비
1. Chrome/Edge에서 F12 (개발자 도구)
2. Console 탭 열기
3. Network 탭 열기
4. Console에서 "Preserve log" 체크 ✅
5. Network에서 "Preserve log" 체크 ✅

### Step 2: 현재 상태 확인

**Console에 다음 명령 입력:**
\`\`\`javascript
console.log('Token:', localStorage.getItem('token'))
console.log('Token exists:', !!localStorage.getItem('token'))
\`\`\`

**예상 결과:**
- Token이 있어야 함 (긴 문자열)
- Token exists: true

**만약 Token이 없다면:**
\`\`\`javascript
// 로그아웃 상태 - 다시 로그인 필요
location.href = '/'
\`\`\`

### Step 3: 공유 버튼 클릭 테스트

1. Feed 페이지(/feed)로 이동
2. 아무 식사 카드의 공유 버튼 클릭
3. **Console 로그 확인** (자동으로 출력됨):

**정상 케이스:**
\`\`\`
🔄 Share button clicked for meal: [meal-id]
🔑 Current token: eyJhbGciOiJIUzI1NiIsInR5cCI...
📤 Calling createShare API...
🌐 API Request: POST http://localhost:8000/share/create
🔑 Token: eyJhbGciOiJIUzI1NiI...
📋 Headers: { Authorization: 'Bearer ...', Content-Type: 'application/json' }
📦 Body: {"mealId":"..."}
📡 Response: 201 Created
✅ Share link created: { shareId: '...', url: '...', ref: '...' }
\`\`\`

**에러 케이스:**
\`\`\`
🔄 Share button clicked for meal: [meal-id]
🔑 Current token: eyJhbGciOiJIUzI1NiI...
📤 Calling createShare API...
🌐 API Request: POST http://localhost:8000/share/create
📡 Response: 401 Unauthorized
❌ Failed to create share link: Error: 인증이 필요합니다...
\`\`\`

### Step 4: Network 탭 확인

1. Network 탭에서 **POST /share/create** 요청 찾기
2. 클릭해서 상세 정보 확인

**Headers 탭:**
\`\`\`
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
\`\`\`

**Request 탭:**
\`\`\`json
{
  "mealId": "a6e04cd8-a661-464e-aca6-3f63473cfbf3"
}
\`\`\`

**Response 탭:**
- Status: 201 (성공) 또는 401 (인증 실패)
- Body: 응답 내용 확인

### Step 5: 백엔드 로그 확인

**터미널에서:**
\`\`\`bash
npx pm2 logs dailymeal-backend --lines 20 --nostream
\`\`\`

**찾아야 할 로그:**
- `[JwtAuthGuard] Authentication attempt for POST /share/create`
- `[JwtStrategy] Validating JWT payload`
- `[AuthService] User ... authenticated successfully`

**에러가 있다면:**
- `Error: Unauthorized`
- `JWT validation failed`

## 🔧 가능한 문제와 해결책

### 문제 1: Token이 없음
**증상:** Console에서 Token: null
**해결:**
\`\`\`javascript
location.href = '/'
// 다시 로그인
\`\`\`

### 문제 2: Token은 있지만 401 에러
**증상:** Token 존재하나 백엔드에서 Unauthorized

**원인:** 
- JWT_SECRET 불일치
- Token 만료
- Token이 다른 환경에서 생성됨

**해결:**
\`\`\`javascript
// 1. 토큰 제거
localStorage.removeItem('token')

// 2. 페이지 새로고침
location.reload()

// 3. 다시 로그인
\`\`\`

### 문제 3: ShareModule 미등록
**증상:** 404 Not Found 또는 500 Internal Server Error

**확인:**
\`\`\`bash
# Backend 재시작
npx pm2 restart dailymeal-backend

# 로그 확인
npx pm2 logs dailymeal-backend --lines 50
\`\`\`

### 문제 4: CORS 에러
**증상:** Network 탭에서 CORS policy 에러

**해결:** Backend의 CORS 설정 확인
\`\`\`typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
\`\`\`

## 📊 디버그 결과 보고 양식

테스트 후 다음 정보를 공유해주세요:

\`\`\`
### 브라우저 Console 로그:
[여기에 붙여넣기]

### Network 탭 - /share/create 요청:
Status: [200/401/500]
Request Headers:
  Authorization: [있음/없음]
Response:
  [응답 내용]

### 백엔드 로그 (최근 20줄):
[pm2 logs 결과]

### Token 상태:
Token exists: [true/false]
Token preview: [처음 30자]
\`\`\`

## 🚀 빠른 해결 시도

**가장 흔한 원인:** Token이 오래된 JWT_SECRET으로 생성됨

**즉시 시도:**
\`\`\`javascript
// 브라우저 Console에서 실행
localStorage.clear()
sessionStorage.clear()
location.href = '/'
// 데모 계정으로 재로그인
\`\`\`

그 다음 공유 버튼 재시도!

## 📝 추가 디버깅 정보

디버그 로그가 추가된 파일:
- ✅ `frontend/src/components/meal-card.tsx` - handleShare 함수
- ✅ `frontend/src/lib/api/client.ts` - apiRequest 함수

이제 모든 API 호출 시 상세 로그가 Console에 출력됩니다!
