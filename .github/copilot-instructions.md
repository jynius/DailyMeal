# DailyMeal - AI Coding Assistant Instructions

DailyMeal은 식사 기록, 맛집 공유, 실시간 소셜 기능을 제공하는 풀스택 플랫폼입니다.

## 🏗️ Architecture Overview

**3-Tier Fullstack**: Frontend (Next.js) + Backend (NestJS) + Mobile (Expo React Native)

- **Frontend**: Next.js 15 App Router, TypeScript, TanStack Query, Socket.IO Client
- **Backend**: NestJS 11, PostgreSQL 16 + TypeORM, JWT auth, Socket.IO server
- **Mobile**: Expo SDK 54, WebView 중심 (웹 콘텐츠 래핑 + 네이티브 기능)
- **Process Manager**: PM2 (개발/운영 모두)
- **Infra**: Nginx/Caddy reverse proxy, Let's Encrypt SSL

### Core Data Flow

```
User → Frontend (3000) → Backend API (8000/api) → PostgreSQL
              ↕                    ↕
         Socket.IO Client ←→ Socket.IO Server (realtime module)
```

## 🚀 Development Workflow

### Quick Start

```bash
npm run dev              # 동시 실행: frontend + backend (concurrently)
npm run dev:pm2          # PM2로 실행 (권장, 로그 관리 용이)
./bin/start-pm2.sh       # PM2 스크립트 직접 실행
```

**포트**: Frontend `3000`, Backend `8000`, Swagger `8000/api-docs`

### PM2 Commands (개발 환경)

```bash
pm2 logs                           # 실시간 로그
pm2 logs dailymeal-backend         # 백엔드 로그만
pm2 restart all                    # 재시작
pm2 stop all && pm2 delete all     # 완전 종료
```

**주의**: `npm run start`는 빌드 없이 실행 시도 → 에러. 프로덕션 배포 시 반드시 `npm run build` 선행 필요.

## 📂 Key Directories

```
frontend/src/
├── app/              # Next.js App Router (라우트별 페이지)
├── components/ui/    # Radix UI 기반 재사용 컴포넌트
├── lib/api/          # API 클라이언트 (TanStack Query 래퍼)
├── contexts/         # React Context (실시간 알림, 전역 상태)
└── types/            # TypeScript 공통 타입

backend/src/
├── entities/         # TypeORM 엔티티 (User, MealRecord, Friendship 등)
├── meal-records/     # 식사 기록 CRUD + 이미지 업로드 (Multer)
├── realtime/         # Socket.IO Gateway (실시간 알림/피드)
├── auth/             # JWT + Passport 인증
└── config/           # ConfigService (환경변수 + AWS Secrets Manager)

docs/                 # ⚠️ 프로젝트 모든 기술 문서 (배포, 기능, 픽스)
```

## 🔑 Critical Conventions

### API Client Pattern (Frontend)

**절대 직접 fetch 사용 금지**. 반드시 `frontend/src/lib/api/` 모듈 사용:

```typescript
// ✅ 올바른 방법
import { getMeals } from '@/lib/api'
const meals = await getMeals()

// ❌ 금지
fetch('/api/meals', { headers: {...} })
```

**이유**: `lib/api/client.ts`에서 토큰 관리, 에러 처리, 성능 모니터링 자동 처리.

### Environment Variables

**Frontend**: `NEXT_PUBLIC_*` 접두사 필수 (클라이언트 노출)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api  # 개발
NEXT_PUBLIC_API_URL=/api                       # 운영 (상대 경로)
```

**Backend**: `.env` 직접 사용, `ConfigService`로 접근

```typescript
// backend/src/config/config.service.ts
this.configService.get('DB_HOST')  # ✅
process.env.DB_HOST                # ❌ 금지 (검증 우회)
```

### Database Schema

**핵심 엔티티**: `User` ↔ `MealRecord` (1:N), `Friendship` (자기참조 M:N), `MealShare` (공유 링크)

**마이그레이션**: `synchronize: true` (개발), `false` (운영) - TypeORM 자동 스키마 동기화 사용 중.

### Authentication Flow

1. Login → Backend JWT 발급
2. Frontend `tokenManager.set(token)` (localStorage)
3. 이후 모든 API 요청에 `Authorization: Bearer ${token}` 자동 첨부 (`lib/api/client.ts`)
4. Backend `@UseGuards(JwtAuthGuard)` 데코레이터로 보호

### Socket.IO Integration

**연결**: Frontend `contexts/SocketProvider.tsx` → Backend `realtime/realtime.gateway.ts`

**이벤트**:

- `userAuth` → 사용자 인증 (JWT 검증)
- `joinRoom` / `leaveRoom` → 방 입장/퇴장
- `newMeal` / `newComment` → 실시간 브로드캐스트

**주의**: Socket 연결은 인증 완료 후 자동 시작 (SocketProvider 컴포넌트 확인).

## 🐛 Common Pitfalls

1. **"Could not find production build"**: `npm run build` 먼저 실행 필수 (Next.js)
2. **CORS 에러**: `backend/.env`의 `CORS_ORIGINS` 확인 (개발: `http://localhost:3000`)
3. **이미지 404**: 업로드 경로는 `backend/uploads/`, Nginx에서 `/uploads/` 정적 서빙 필요
4. **Socket 끊김**: Backend 재시작 시 Frontend 소켓 재연결 로직 확인 (자동 재연결 구현됨)
5. **TypeORM 동기화 충돌**: 여러 인스턴스 동시 실행 시 `synchronize: false` 권장

## 📚 Key Documentation

**필수 읽기 전**:

- `docs/deployment/BUILD_DEPLOY_GUIDE.md` - Next.js 빌드/배포 라이프사이클
- `docs/deployment/PM2_NAMING_STRATEGY.md` - PM2 프로세스 이름 규칙
- `frontend/src/lib/api/README.md` - API 모듈 아키텍처
- `docs/features/SCENARIOS.md` - 사용자 시나리오 (기능 이해)

**디버깅**: `docs/fixes/` 디렉토리에 과거 이슈 해결 기록 다수 보관.

## 🛠️ When Working On...

### Adding API Endpoint

1. Backend: `src/{module}/{module}.controller.ts`에 라우트 추가
2. Frontend: `src/lib/api/{module}.ts`에 함수 추가 (apiRequest 래핑)
3. TanStack Query 훅 생성 시 `useMutation` / `useQuery` 패턴 준수

### UI Components

Radix UI + Tailwind 조합 사용. `components/ui/` 기본 컴포넌트 재사용. 새 컴포넌트는 Radix Primitives 우선 고려.

### Mobile App

`app/` 디렉토리는 독립 앱이지만 WebView 중심. Native 기능 (카메라, 위치) 추가 시 Expo API 사용 후 postMessage로 웹과 통신.

## 🚨 Production Deployment

1. **빌드**: `npm run build:all` (frontend + backend 동시)
2. **PM2 시작**: `pm2 start ecosystem.config.js` (운영용)
3. **환경변수**: `.env.production` 파일 준비 (Secrets Manager 사용 권장)
4. **Nginx 설정**: Frontend 정적 파일 + Backend API 프록시 + `/uploads/` 정적 서빙

**포트**: Frontend `3000`, Backend `8000` (Nginx가 80/443으로 프록시)

---

**Last Updated**: 2025-11-06  
**Project Version**: 1.0.0  
**Node**: >=20.0.0, **npm**: >=10.0.0
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.