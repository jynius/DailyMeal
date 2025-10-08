# DailyMeal Backend

DailyMeal의 NestJS 기반 백엔드 API 서버입니다.

## 📖 상세 문서

백엔드 관련 상세 설정 및 가이드는 프로젝트 문서를 참조하세요:

- [📘 **배포 가이드**](../docs/BUILD_DEPLOY_GUIDE.md) - 빌드 및 배포 방법
- [🔧 **PM2 설정**](../docs/ECOSYSTEM_CONFIG_GUIDE.md) - 프로세스 관리
- [🌐 **네트워크 구조**](../docs/NETWORK_ARCHITECTURE.md) - 시스템 아키텍처
- [📖 **전체 문서**](../docs/README.md) - 모든 문서 보기

## 🚀 빠른 시작

### 개발 모드
```bash
npm run start:dev
```

### 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## 🛠️ 기술 스택

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO
- **File Upload**: Multer

## 📂 주요 구조

```
src/
├── auth/              # 인증 모듈
├── meal-records/      # 식사 기록 API
├── restaurants/       # 음식점 API
├── realtime/          # WebSocket 모듈
├── common/            # 공통 모듈
├── entities/          # 데이터베이스 엔티티
└── dto/               # 데이터 전송 객체
```

## 🔧 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 모드 (watch)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 린트
npm run lint
```

## 🌐 API 엔드포인트

- `GET /api/meal-records` - 식사 기록 목록
- `POST /api/meal-records` - 식사 기록 생성
- `GET /api/restaurants` - 음식점 목록
- `POST /api/restaurants` - 음식점 등록
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

자세한 API 명세는 [API 문서](../docs/API_REFERENCE.md)를 참조하세요.

## 📝 환경 변수

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=./data/dev.sqlite
JWT_SECRET=your-secret-key
```

---

**NestJS 공식 문서**: https://docs.nestjs.com/
