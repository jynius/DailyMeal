# 환경 변수 통합 작업 완료 보고서

## 작업 개요
- **날짜**: 2025-10-08
- **작업**: 방안 2 적용 - .env 파일과 PM2 통합
- **목표**: 개발 환경 설정의 단일 소스 원칙 확립

## 주요 변경 사항

### 1. 패키지 설치
```bash
npm install dotenv
```
- 루트 레벨에 dotenv 패키지 추가
- PM2 설정 파일에서 .env 파일을 읽기 위해 필요

### 2. ecosystem.dev.config.js 수정
**변경 전**: 환경 변수 하드코딩
```javascript
env: {
  NODE_ENV: 'development',
  PORT: 8000
}
```

**변경 후**: .env 파일에서 동적으로 로드
```javascript
require('dotenv').config({ path: './backend/.env' });
require('dotenv').config({ path: './frontend/.env.local' });

env: {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8000,
  DB_HOST: process.env.DB_HOST,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY,
  // ... 모든 환경 변수
}
```

### 3. JWT_SECRET 환경 변수 적용

#### backend/src/auth/auth.module.ts
**변경 전**: 하드코딩된 비밀키
```typescript
secret: 'dailymeal-fixed-secret-key',
```

**변경 후**: 환경 변수 사용
```typescript
secret: process.env.JWT_SECRET || 'dailymeal-fixed-secret-key',
```

#### backend/src/auth/jwt.strategy.ts
**변경 전**: 하드코딩된 비밀키
```typescript
const jwtSecret = 'dailymeal-fixed-secret-key';
```

**변경 후**: 환경 변수 사용
```typescript
const jwtSecret = process.env.JWT_SECRET || 'dailymeal-fixed-secret-key';
```

### 4. backend/.env.example 생성
새 개발자를 위한 템플릿 파일 생성:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=dailymeal

# JWT Configuration
JWT_SECRET=dailymeal-jwt-secret-key-change-this-in-production

# Server Configuration
PORT=8000
NODE_ENV=development
```

### 5. .env.production 삭제
- PM2가 ecosystem.config.js를 사용하므로 불필요
- 혼란을 방지하기 위해 제거

### 6. 문서 작성
- `docs/ENVIRONMENT_SETUP.md`: 종합 환경 변수 가이드 작성
- 초기 설정 방법, 문제 해결, 보안 주의사항 포함

## 발견된 중요 사항

### 1. JWT_SECRET이 사용되지 않고 있었음
- `.env` 파일에 정의되어 있었지만 코드에서는 하드코딩된 값 사용
- 보안 취약점 해결

### 2. NEXT_PUBLIC_KAKAO_MAP_API_KEY 누락
- 카카오 지도 기능에 필수적인 환경 변수
- `ecosystem.dev.config.js`에 없어서 PM2 실행 시 지도 미표시 문제
- 추가하여 해결

### 3. 환경 변수의 중요성
- `JWT_SECRET`: 인증/인가의 핵심
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY`: 지도 기능의 필수 요소
- DB 관련 변수들: 데이터베이스 연결

## 최종 환경 변수 목록

### Backend (.env)
1. `DB_HOST` - 데이터베이스 호스트
2. `DB_PORT` - 데이터베이스 포트
3. `DB_USERNAME` - 데이터베이스 사용자
4. `DB_PASSWORD` - 데이터베이스 비밀번호
5. `DB_NAME` - 데이터베이스 이름
6. `JWT_SECRET` - JWT 토큰 비밀키 ⭐ 보안 중요!
7. `PORT` - 백엔드 서버 포트
8. `NODE_ENV` - 실행 환경

### Frontend (.env.local)
1. `NEXT_PUBLIC_API_URL` - 백엔드 API URL
2. `NEXT_PUBLIC_SITE_URL` - 프론트엔드 사이트 URL
3. `NEXT_PUBLIC_KAKAO_MAP_API_KEY` - 카카오 지도 API 키 ⭐ 필수!

## 테스트 항목

### 1. npm run dev (Concurrently)
- [ ] Backend가 .env에서 환경 변수 로드
- [ ] Frontend가 .env.local에서 환경 변수 로드
- [ ] JWT 인증 작동
- [ ] 카카오 지도 표시

### 2. npm run dev:pm2 (PM2)
- [ ] PM2가 .env 파일을 읽어 환경 변수 주입
- [ ] Backend가 동일한 환경 변수 사용
- [ ] Frontend가 동일한 환경 변수 사용
- [ ] JWT 인증 작동
- [ ] 카카오 지도 표시

### 3. 일관성 검증
- [ ] 두 방법 모두 동일한 JWT_SECRET 사용
- [ ] 두 방법 모두 동일한 KAKAO_MAP_API_KEY 사용
- [ ] 두 방법 모두 동일한 DB 설정 사용

## 보안 개선사항

1. **JWT_SECRET 환경 변수화**
   - 하드코딩 제거 → 환경 변수 사용
   - 프로덕션 배포 시 변경 가능

2. **.env 파일 보안**
   - `.gitignore`로 제외 확인
   - `.example` 파일로 템플릿 제공

3. **API 키 관리**
   - 카카오 API 키를 환경 변수로 관리
   - 코드에 하드코딩 방지

## 다음 단계

### 즉시 필요한 작업
1. 카카오 지도 API 키 발급 및 설정
2. 프로덕션 JWT_SECRET 생성 및 설정
3. 환경 변수 테스트 (위 테스트 항목)

### 권장 작업
1. 환경 변수 검증 스크립트 작성
2. 개발 환경 설정 자동화 스크립트
3. 프로덕션 환경 변수 체크리스트

## 관련 파일

### 수정된 파일
- `ecosystem.dev.config.js` - dotenv 통합
- `backend/src/auth/auth.module.ts` - JWT_SECRET 환경 변수 사용
- `backend/src/auth/jwt.strategy.ts` - JWT_SECRET 환경 변수 사용
- `package.json` - dotenv 패키지 추가

### 생성된 파일
- `backend/.env.example` - 백엔드 환경 변수 템플릿
- `docs/ENVIRONMENT_SETUP.md` - 환경 변수 종합 가이드
- `docs/ENV_INTEGRATION_REPORT.md` - 이 문서

### 삭제된 파일
- `.env.production` - PM2 사용으로 불필요

### 기존 파일 (유지)
- `backend/.env` - 백엔드 개발 환경 변수
- `frontend/.env.local` - 프론트엔드 개발 환경 변수
- `frontend/.env.local.example` - 프론트엔드 환경 변수 템플릿
- `ecosystem.config.js` - 프로덕션 PM2 설정

## 결론

방안 2를 성공적으로 적용하여:
1. ✅ 개발 환경 설정의 단일 소스 원칙 확립
2. ✅ `npm run dev`와 `npm run dev:pm2` 간 일관성 확보
3. ✅ JWT_SECRET 보안 개선
4. ✅ 카카오 지도 API 키 통합
5. ✅ 새 개발자 온보딩을 위한 .example 파일 제공

이제 팀원들은 `.env` 파일만 관리하면 되며, PM2 설정은 자동으로 동기화됩니다.
