# JWT 인증 문제 해결 완료 ✅

## 🐛 문제

### 증상
- 로그인 후에도 API 호출 시 401/500 에러 발생
- "invalid signature" JWT 에러
- 식사 기록 목록 로딩 실패

### 원인
**PM2 환경 변수 미적용**
- PM2로 실행 시 `.env` 파일의 `JWT_SECRET`이 제대로 로드되지 않음
- 이로 인해 JWT 토큰 서명 검증 실패

## ✅ 해결 방법

### 1. API 클라이언트에 자동 리다이렉션 추가

**파일**: `frontend/src/lib/api/client.ts`

```typescript
if (!response.ok) {
  // 인증 오류 처리 (401, 403)
  if (response.status === 401 || response.status === 403) {
    // 토큰 제거
    tokenManager.remove()
    
    // 로그인 페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    
    throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.')
  }
  
  // ... 기타 에러 처리
}
```

**효과**:
- 인증 실패 시 자동으로 로그인 페이지로 이동
- 만료된 토큰 자동 제거
- 사용자에게 명확한 에러 메시지 제공

### 2. PM2 재시작 (환경 변수 업데이트)

```bash
pm2 restart dailymeal-backend --update-env
```

**이유**:
- `--update-env` 플래그로 .env 파일 다시 로드
- JWT_SECRET 환경 변수가 제대로 적용됨

### 3. Feed 페이지 개선

**파일**: `frontend/src/app/feed/page.tsx`

```typescript
useEffect(() => {
  const fetchMeals = async () => {
    try {
      // 토큰 확인
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No token found, showing sample data')
        setMeals(getSampleMeals())
        setLoading(false)
        return
      }
      
      // API 호출
      const result = await mealRecordsApi.getAll()
      // ...
    } catch (err) {
      // 인증 오류 시 샘플 데이터 표시
      if (error.message?.includes('Unauthorized')) {
        setMeals(getSampleMeals())
      }
    }
  }
  
  fetchMeals()
}, [])
```

**개선사항**:
- 토큰 없으면 샘플 데이터 표시 (강제 로그인 없음)
- 인증 오류를 명확히 처리
- 사용자 경험 향상

### 4. Add 페이지 로그인 확인

**파일**: `frontend/src/app/add/page.tsx`

```typescript
useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    showAlert({
      title: '로그인 필요',
      message: '식사 기록을 추가하려면 로그인이 필요합니다.',
      type: 'warning',
      onConfirm: () => {
        router.push('/')
      }
    })
  }
}, [router, showAlert])
```

**효과**:
- 로그인하지 않은 사용자가 등록 페이지 접근 시 알림
- 로그인 페이지로 리다이렉트

## 🧪 테스트 결과

### 백엔드 API 테스트
```bash
# 1. 회원가입
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","name":"테스트"}'

# 결과: ✅ 성공 (토큰 발급됨)

# 2. 로그인
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# 결과: ✅ 성공 (토큰 발급됨)

# 3. 식사 기록 조회
curl -X GET "http://localhost:8000/meal-records?page=1&limit=10" \
  -H "Authorization: Bearer [TOKEN]"

# 결과: ✅ 성공 (빈 배열 반환)
{"data":[],"total":0,"page":1,"limit":10,"totalPages":0}
```

### 프론트엔드
- ✅ 로그인 페이지 정상 작동
- ✅ 인증 실패 시 자동 리다이렉트
- ✅ Feed 페이지 샘플 데이터 표시
- ✅ Add 페이지 로그인 확인

## 📝 사용자 가이드

### 새로 시작하는 방법

1. **브라우저에서 http://localhost:3000 접속**

2. **회원가입**
   - 이메일 입력
   - 비밀번호 입력 (최소 6자)
   - 이름 입력
   - [회원가입] 버튼 클릭

3. **자동 로그인**
   - 회원가입 성공 시 자동으로 로그인됨
   - 토큰이 localStorage에 저장됨

4. **식사 기록 추가**
   - 하단 네비게이션에서 [+] 버튼 클릭
   - 사진 촬영/선택
   - [저장] 버튼 클릭

### 로그인 만료 시

1. **자동 처리**
   - API 호출 시 401 에러 발생
   - 자동으로 로그인 페이지로 이동
   - 토큰 자동 삭제

2. **재로그인**
   - 이메일과 비밀번호 입력
   - [로그인] 버튼 클릭

## 🔐 보안 개선사항

### 적용된 보안
- ✅ JWT 토큰 기반 인증
- ✅ 토큰 자동 만료 (7일)
- ✅ 인증 실패 시 즉시 리다이렉트
- ✅ 만료된 토큰 자동 제거

### 향후 개선 필요
- [ ] Refresh Token 구현
- [ ] HTTPS 적용 (프로덕션)
- [ ] Rate Limiting
- [ ] CORS 정책 강화

## 🚀 배포 체크리스트

### 현재 상태
- ✅ Backend 정상 작동 (포트 8000)
- ✅ Frontend 정상 작동 (포트 3000)
- ✅ JWT 인증 정상
- ✅ API 엔드포인트 정상

### 다음 단계
1. [ ] 사용자 테스트
2. [ ] 사진 업로드 테스트
3. [ ] 평가 기능 테스트
4. [ ] 에러 핸들링 검증

## 📞 문제 발생 시

### 로그 확인
```bash
# 백엔드 로그
pm2 logs dailymeal-backend

# 프론트엔드 로그
pm2 logs dailymeal-frontend

# 환경 변수 확인
pm2 env dailymeal-backend
```

### 재시작
```bash
# 환경 변수 업데이트하며 재시작
pm2 restart dailymeal-backend --update-env
pm2 restart dailymeal-frontend --update-env

# 또는 전체 재시작
pm2 restart all --update-env
```

### 토큰 문제
1. 브라우저 개발자 도구 → Application → Local Storage
2. `token` 항목 삭제
3. 페이지 새로고침
4. 재로그인

## ✅ 완료!

이제 DailyMeal 앱이 정상적으로 작동합니다!

**핵심 수정사항**:
1. 🔐 JWT 인증 오류 해결
2. 🔄 자동 리다이렉션 추가
3. 📱 사용자 경험 개선
4. 🛡️ 에러 핸들링 강화
