# 공유 기능 디버깅 가이드

## 🔍 현재 문제
- 공유 버튼 클릭 시 "공유 링크 생성에 실패하였습니다." 에러
- 백엔드 로그: `Error: Unauthorized` (JWT 인증 실패)

## 🎯 원인 분석

### 1. JWT 토큰 문제
백엔드 로그에서 JWT 인증 실패가 발생하고 있습니다:
```
[Nest] 69297 - 10/10/2025, 4:03:01 AM ERROR [ExceptionsHandler] Error: Unauthorized
at JwtAuthGuard.handleRequest
```

### 2. 가능한 원인
- ✅ **토큰 만료**: 이전에 생성된 토큰이 만료됨
- ✅ **시크릿 불일치**: JWT_SECRET이 변경되어 기존 토큰이 무효화됨
- ⚠️ **토큰 전달 실패**: 프론트엔드에서 토큰을 제대로 전달하지 못함

## 🔧 해결 방법

### ✅ 방법 1: 다시 로그인 (가장 간단)

1. **로그아웃**
   - 브라우저에서 F12 (개발자 도구)
   - Console 탭에서:
   ```javascript
   localStorage.removeItem('token')
   location.reload()
   ```

2. **다시 로그인**
   - 로그인 페이지로 이동
   - 계정으로 로그인
   - 새 토큰 발급됨

3. **공유 기능 재시도**

### 🔍 방법 2: 디버깅 (문제 파악)

1. **브라우저 콘솔에서 토큰 확인**
   ```javascript
   console.log('Current Token:', localStorage.getItem('token'))
   ```

2. **토큰 디코딩** (jwt.io에서)
   - 토큰을 복사
   - https://jwt.io 에 붙여넣기
   - 만료 시간(`exp`) 확인

3. **API 요청 로그 확인**
   - 브라우저 개발자 도구 > Network 탭
   - 공유 버튼 클릭
   - `/share/create` 요청 확인
   - Request Headers에 `Authorization: Bearer ...` 있는지 확인

### 🔧 방법 3: 백엔드 재시작 (환경변수 재로드)

```bash
# PM2 프로세스 재시작
npm run dev:pm2

# 또는 수동 재시작
npx pm2 restart dailymeal-backend
```

## 📊 테스트 체크리스트

### Phase 1: 로그인 상태 확인
- [ ] localStorage에 token이 있는지 확인
- [ ] 토큰이 유효한지 확인 (jwt.io)
- [ ] 토큰 만료 시간 확인

### Phase 2: API 요청 확인
- [ ] 브라우저 콘솔에서 디버그 로그 확인
- [ ] Network 탭에서 Authorization 헤더 확인
- [ ] 백엔드 로그에서 JWT 검증 과정 확인

### Phase 3: 공유 기능 테스트
- [ ] 로그아웃 후 다시 로그인
- [ ] 공유 버튼 클릭
- [ ] 링크 생성 성공 확인
- [ ] 클립보드에 복사 확인

## 🐛 디버그 로그 추가됨

프론트엔드 `client.ts`에 다음 로그가 추가되었습니다:
```typescript
console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'None')
console.log('📋 Headers:', headers)
```

이제 공유 버튼을 클릭하면 콘솔에서:
- 토큰이 있는지
- 헤더가 올바르게 설정되었는지
확인할 수 있습니다.

## 🎯 예상 해결 방법

**가장 가능성 높은 원인**: 토큰 만료 또는 시크릿 불일치

**해결책**: 
1. 로그아웃 후 재로그인 ← **추천**
2. 브라우저 LocalStorage 클리어
3. 백엔드 재시작 (환경변수 재로드)

## 📝 테스트 단계

### 1단계: 즉시 테스트
```javascript
// 브라우저 콘솔에서 실행
localStorage.removeItem('token')
location.href = '/'
```

### 2단계: 로그인
- 데모 계정 또는 본인 계정으로 로그인

### 3단계: 공유 버튼 클릭
- 식사 카드에서 공유 버튼 클릭
- 콘솔 로그 확인:
  ```
  🌐 API Request: POST http://localhost:8000/share/create
  🔑 Token: eyJhbGciOiJIUzI1NiI...
  📋 Headers: { Authorization: 'Bearer ...', Content-Type: 'application/json' }
  ```

### 4단계: 성공 확인
- "공유 링크가 복사되었습니다!" 토스트 알림
- ShareModal 열림
- 클립보드에 링크 복사됨

## 🚨 여전히 문제가 발생하면

1. **백엔드 로그 실시간 확인**
   ```bash
   npx pm2 logs dailymeal-backend --lines 50
   ```

2. **JWT_SECRET 확인**
   ```bash
   cat backend/.env | grep JWT_SECRET
   ```

3. **AuthService 확인**
   - `backend/src/auth/auth.service.ts`에서 토큰 생성 로직 확인
   - `validateUser` 메서드가 올바르게 작동하는지 확인

4. **데이터베이스 확인**
   ```bash
   cd backend && node scripts/inspect-db.js
   ```
   - 사용자가 존재하는지 확인
   - userId가 올바른지 확인
