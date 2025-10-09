# JWT 토큰 에러 해결 가이드

## 문제 상황

**에러 메시지:**
```
GET http://localhost:8000/meal-records?page=1&limit=10 500 (Internal Server Error)
[JwtAuthGuard] Authentication failed: invalid signature
```

## 원인

1. **서버 재시작**: PM2 재시작 후 JWT_SECRET이 변경되거나 다른 값으로 로드됨
2. **이전 토큰 사용**: 브라우저에 저장된 이전 토큰이 새로운 SECRET과 맞지 않음
3. **환경 변수 불일치**: .env 파일의 JWT_SECRET이 제대로 로드되지 않음

## 해결 방법

### 방법 1: 브라우저에서 토큰 삭제 (권장)

**Chrome/Edge 개발자 도구:**
1. F12 → Application 탭
2. Storage → Local Storage → `http://localhost:3000`
3. `token` 키 삭제
4. 페이지 새로고침 (F5)
5. 다시 로그인

**Console에서 직접 삭제:**
```javascript
// 개발자 도구 Console에서 실행
localStorage.removeItem('token');
location.reload();
```

### 방법 2: JWT_SECRET 확인

**backend/.env 파일 확인:**
```bash
cat backend/.env | grep JWT_SECRET
```

**PM2 환경 변수 확인:**
```bash
pm2 env 0  # dailymeal-backend
```

**일치 여부 확인:**
- `.env` 파일의 JWT_SECRET
- `ecosystem.dev.config.js`에서 로드된 JWT_SECRET
- PM2 프로세스에 실제 전달된 JWT_SECRET

### 방법 3: 서버 완전 재시작

```bash
# 1. PM2 프로세스 삭제
pm2 delete all

# 2. .env 파일 확인
cat backend/.env

# 3. PM2 재시작
pm2 start ecosystem.dev.config.js

# 4. 환경 변수 확인
pm2 env 0
```

## 예방 방법

### 1. JWT_SECRET 고정

**backend/.env:**
```bash
# JWT Configuration
JWT_SECRET=dailymeal-development-secret-key-do-not-change
```

**주의사항:**
- 개발 환경에서는 JWT_SECRET을 고정하여 사용
- 서버 재시작해도 동일한 SECRET 사용
- 프로덕션에서는 강력한 시크릿 사용

### 2. 토큰 만료 시간 조정

**backend/src/auth/auth.module.ts:**
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { 
    expiresIn: '7d'  // 7일로 연장 (개발 편의성)
  },
}),
```

### 3. 토큰 갱신 로직 추가

**frontend에서 401 에러 시 자동 로그아웃:**
```typescript
// API 요청 인터셉터
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## 현재 상황 확인

### JWT_SECRET 확인

```bash
# 1. .env 파일
grep JWT_SECRET backend/.env

# 2. PM2 환경 변수
pm2 env 0 | grep JWT_SECRET

# 3. 백엔드 로그
pm2 logs dailymeal-backend --lines 100 | grep -i jwt
```

### 토큰 유효성 테스트

```bash
# 로그인 테스트
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jynius@sqisoft.com","password":"your_password"}'

# 응답에서 token 확인 후
TOKEN="받은_토큰"

# 인증 테스트
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/meal-records
```

## 빠른 해결 (즉시)

**Chrome 개발자 도구 Console에서:**
```javascript
// 1. 현재 토큰 확인
console.log(localStorage.getItem('token'));

// 2. 토큰 삭제
localStorage.clear();

// 3. 페이지 새로고침
location.reload();

// 4. 다시 로그인
```

---

**작성일**: 2025-10-09
**상태**: ✅ 해결 가이드
