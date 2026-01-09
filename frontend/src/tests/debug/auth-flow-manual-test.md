# 수동 테스트: 로그인 후 페이지 접근

## 목적
자동화된 테스트는 통과하지만 실제 브라우저에서는 실패하는 문제를 디버깅합니다.

## 테스트 절차

### 1. 초기 상태 확인
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 열기
3. Application > Storage > Clear site data 클릭
4. 페이지 새로고침

### 2. 로그인 수행
1. 로그인 페이지로 이동 (`http://localhost:3000/login`)
2. 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. **Console 로그 확인**:
   ```
   [AuthContext] Login with token { tokenLength: xxx }
   [AuthContext] Token saved and verified { saved: true/false, matches: true/false, cookieSet: true/false }
   [AuthForm] 🔍 Login Success - Redirect Info: { returnUrl: null, ... }
   [AuthForm] ✅ Redirecting to default: /
   ```

### 3. Application Storage 확인
**로그인 직후 즉시 확인**:
- Application > Local Storage > `http://localhost:3000`
  - `token` 키가 있는지 확인
  - 값이 JWT 토큰인지 확인
- Application > Cookies > `http://localhost:3000`
  - `token` 쿠키가 있는지 확인
  - 값이 localStorage와 동일한지 확인

### 4. 메인 페이지 확인
홈(`/`)으로 리다이렉트된 후:
- **Console 로그 확인**:
  ```
  [AuthContext] useState initializer - Token exists { hasToken: true/false, tokenLength: xxx, cookieExists: true/false }
  [AuthContext] useState initializer - Initial auth check { isValid: true/false, exp: ... }
  ```

### 5. 보호된 페이지 접근
하단 네비게이션에서 "피드" 클릭:
- **Console 로그 확인**:
  ```
  [Click] nav-메뉴 ► {href: '/feed', ...}
  [Nav click] 메뉴 ▶ /feed
  [AuthContext] useState initializer - Token exists { hasToken: true/false, ... }
  [AuthGuard] Auth check ► {isAuthenticated: true/false}
  ```

## 예상 결과

### ✅ 정상 동작 (테스트 통과 시)
```
1. 로그인 시:
   - Token saved and verified: { saved: true, matches: true, cookieSet: true }
   
2. 홈 리다이렉트 시:
   - Token exists: { hasToken: true, tokenLength: xxx, cookieExists: true }
   - Initial auth check: { isValid: true, exp: <미래 날짜> }
   
3. /feed 접근 시:
   - Token exists: { hasToken: true, ... }
   - Auth check: { isAuthenticated: true }
   - Feed 페이지 렌더링
```

### ❌ 현재 문제 (실제 브라우저)
```
1. 로그인 시:
   - Token saved and verified: { saved: ?, matches: ?, cookieSet: ? }
   
2. 홈 리다이렉트 시:
   - Token exists: { hasToken: false, ... } ← 문제!
   
3. /feed 접근 시:
   - Token exists: { hasToken: false, ... }
   - Auth check: { isAuthenticated: false } ← 문제!
   - /login으로 리다이렉트
```

## 디버깅 포인트

### 가능성 1: 토큰 저장 실패
- `tokenManager.set()`이 호출되지 않음
- `localStorage.setItem()` 실패 (권한 문제?)
- `document.cookie` 설정 실패

**확인 방법**: 로그인 직후 `localStorage.getItem('token')` 콘솔에서 직접 실행

### 가능성 2: 타이밍 이슈
- `tokenManager.set()` 비동기 문제
- `router.replace()` 즉시 호출로 페이지 이동이 너무 빨라서 저장이 완료되기 전에 이동
- 브라우저가 localStorage 동기화 전에 페이지 언로드

**확인 방법**: `login()` 함수에 `await new Promise(resolve => setTimeout(resolve, 100))` 추가 후 테스트

### 가능성 3: AuthContext 재초기화 이슈
- 페이지 리다이렉트 시 `AuthProvider`가 언마운트/재마운트
- `useState` initializer가 다시 실행되지만 localStorage가 아직 비어있음

**확인 방법**: `useState` initializer에 `debugger;` 추가하고 중단점에서 `localStorage.getItem('token')` 확인

## 해결 방법 후보

1. **localStorage 저장 확인 후 리다이렉트**
   ```typescript
   login(token)
   await new Promise(resolve => setTimeout(resolve, 0)) // 다음 틱까지 대기
   router.replace(returnUrl)
   ```

2. **AuthContext에서 storage 이벤트 리스닝**
   - 이미 구현되어 있지만 같은 탭에서는 발생하지 않음

3. **URL에 임시 토큰 전달 (보안 위험)**
   - 권장하지 않음

4. **서버 사이드 세션 사용**
   - 현재 아키텍처 변경 필요
