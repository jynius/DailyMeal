# 통합 테스트

## 개요

DailyMeal 프론트엔드의 통합 테스트 모음입니다. 주요 사용자 플로우를 자동화된 테스트로 검증합니다.

## 테스트 실행

### 전체 통합 테스트 실행

```bash
npm test -- src/tests/integration --run
```

### 특정 테스트 파일 실행

```bash
# 로그인 플로우 테스트만 실행
npm test -- login-flow.test.tsx --run

# Watch 모드로 실행 (개발 중)
npm test -- login-flow.test.tsx
```

### UI 모드로 실행 (시각적 확인)

```bash
npm run test:ui
```

### 커버리지 확인

```bash
npm run test:coverage
```

## 테스트 목록

### 1. 로그인 플로우 테스트 (`login-flow.test.tsx`)

#### 기본 로그인 케이스
- ✅ 로그인 성공 시 홈(`/`)으로 리다이렉트
- ✅ 로그인 실패 시 에러 메시지 표시

#### returnUrl 리다이렉션 케이스
- ✅ 로그인 성공 시 `/feed`로 리다이렉트
- ✅ 로그인 성공 시 `/restaurant`로 리다이렉트
- ✅ 로그인 성공 시 `/friends`로 리다이렉트

#### 토큰 저장 확인
- ✅ 로그인 성공 시 토큰이 localStorage에 저장됨
- ✅ 로그인 성공 시 토큰이 쿠키에도 저장됨

#### 회원가입 케이스
- ✅ 회원가입 성공 시 홈으로 리다이렉트

## 테스트 시나리오

### 로그인 후 보호된 페이지 접근 플로우

1. **사용자가 로그인 안 된 상태에서 `/feed` 접근**
   - 미들웨어가 `/login?returnUrl=%2Ffeed`로 리다이렉트
   
2. **사용자가 로그인**
   - 이메일/비밀번호 입력
   - 로그인 버튼 클릭
   - 백엔드 API 호출
   
3. **로그인 성공**
   - JWT 토큰 발급
   - `AuthContext.login(token)` 호출
   - 토큰이 localStorage와 쿠키에 저장
   - `isAuthenticated` 상태 업데이트
   
4. **리다이렉션**
   - `returnUrl` 파라미터 확인
   - `/feed`로 리다이렉트
   
5. **보호된 페이지 렌더링**
   - `AuthGuard`가 `isAuthenticated` 확인
   - 인증된 상태이므로 페이지 렌더링

## 문제 해결

### "Clear site data" 후 리다이렉션 이슈

**문제**: 로그인 후 모든 페이지가 메인 페이지(`/`)로 리다이렉트됨

**원인**: 
- 미들웨어가 쿠키의 토큰만 확인
- 클라이언트의 `AuthContext`는 아직 업데이트 안 됨
- 둘 사이의 동기화 실패

**해결책**:
1. `tokenManager.set()` 대신 `AuthContext.login()` 사용
2. 미들웨어에서 `/login` 페이지의 토큰 체크 제거
3. 리다이렉션은 클라이언트(`AuthForm`)에서만 처리

**테스트로 검증**:
```bash
npm test -- login-flow.test.tsx --run
```

모든 테스트가 통과하면 로그인 플로우가 정상적으로 작동하는 것입니다.

## CI/CD 통합

GitHub Actions나 다른 CI 파이프라인에서 테스트를 실행하려면:

```yaml
- name: Run Integration Tests
  run: npm test -- src/tests/integration --run
```

## 추가 테스트 작성 가이드

새로운 통합 테스트를 작성할 때는 다음을 따르세요:

1. **TestWrapper 사용**: `AuthProvider`, `QueryClientProvider` 등 필요한 Provider 포함
2. **모든 외부 의존성 Mock**: API 호출, Next.js router 등
3. **비동기 처리**: `waitFor`를 사용하여 비동기 동작 기다리기
4. **클린업**: `beforeEach`에서 localStorage, 쿠키 초기화

### 예시

```typescript
it('새로운 테스트 케이스', async () => {
  const user = userEvent.setup()
  
  // Mock 설정
  vi.mocked(someApi).mockResolvedValue(mockData)
  
  // 컴포넌트 렌더링
  render(
    <TestWrapper>
      <YourComponent />
    </TestWrapper>
  )
  
  // 사용자 액션
  await user.click(screen.getByRole('button'))
  
  // 결과 확인
  await waitFor(() => {
    expect(someFunction).toHaveBeenCalled()
  })
})
```

## 참고 자료

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
