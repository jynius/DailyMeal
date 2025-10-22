# DailyMeal 🍽️

매일의 식사를 기록하고 음식점을 공유하는 소셜 식단 플랫폼입니다. 웹(Next.js), 모바일(Expo React Native), 백엔드(NestJS)로 구성된 풀스택 프로젝트입니다.

## ✨ 주요 기능

- **📱 2단계 식사 기록 시스템**:
  - **1단계**: 바쁠 땐 사진만 찍어 빠르게 기록 (자동 제목 생성)
  - **2단계**: 시간 여유가 있을 때 평점, 메모, 위치 등 상세 정보 추가
- **🗺️ 음식점 공유 & 맵**:
  - 음식점 정보 관리 및 위치를 지도에서 확인
  - 지역, 카테고리별 검색 및 필터링
- **💬 소셜 및 공유**:
  - 사용자 프로필, 식사 기록에 대한 댓글 및 공유
  - 고유 링크로 식사 기록 공유 및 조회 수 추적
- **🔔 실시간 기능**:
  - Socket.IO 기반의 실시간 피드 및 알림

## 🏗️ 기술 스택

- **Frontend**: Next.js 14.2.13 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query, Socket.IO Client
- **Backend**: NestJS 11.x, TypeScript, PostgreSQL 16, TypeORM, JWT + Passport, Socket.IO, Multer
- **Mobile**: Expo SDK 54, React Native WebView
- **Infrastructure**: Nginx/Caddy, PM2, Let's Encrypt, Ubuntu (Production: AWS EC2)

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal
```

### 2. 의존성 설치
```bash
npm run install:all
```

### 3. 환경 변수 설정 (필수)
`.env.example` 파일을 복사하여 각 환경에 맞는 설정 파일을 생성합니다.
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.local.example frontend/.env.local

# 생성된 .env 파일들에 DB 정보, API 키 등 환경에 맞는 값을 입력합니다.
nano backend/.env
nano frontend/.env.local
```

### 4. 개발 서버 실행
```bash
# 프론트엔드, 백엔드 동시 실행
npm run dev
```

## 📦 프로젝트 구조

```
DailyMeal/
├── frontend/       # Next.js 프론트엔드 (Port: 3000)
├── backend/        # NestJS 백엔드 (Port: 8000)
├── app/            # React Native 앱 (Expo)
├── docs/           # 프로젝트 문서
├── scripts/        # 유틸리티 스크립트
└── bin/            # 배포/운영 스크립트
```

## 📝 최근 변경사항

### 2025.10.10 - PostgreSQL 마이그레이션 완료 🎉
- PostgreSQL 16 설치 및 데이터베이스 설정
- 전체 테이블 구조 마이그레이션 및 데이터 이전 완료
- 관련 문서 정리 및 환경 변수 설정 업데이트

### 2025.10.08 - 문서 구조 및 안정성 개선
- 모든 기술 문서를 `docs/` 폴더로 통합
- Next.js, React 버전 다운그레이드를 통해 Bus Error 해결
- Socket.IO 및 TailwindCSS 호환성 문제 해결로 빌드 안정성 확보

## 📄 라이선스

This project is licensed under the MIT License.

---

**Made with ❤️ by [@jynius](https://github.com/jynius)**

## 🏗️ 기술 스택

### � **웹-앱 연동** (NEW! ⭐)

- 📲 **Smart App Banner**: 모바일 웹에서 앱 설치 유도
| 구분 | 기술 |- 🔗 **Deep Linking**: 웹 링크로 앱 자동 실행
|------|------|- 🌐 **Universal Links**: iOS/Android 네이티브 연동
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Zustand, Socket.IO |- 📱 **PWA 지원**: 모바일 브라우저에서 앱처럼 사용
| **Backend** | NestJS, TypeScript, PostgreSQL, TypeORM, Socket.IO, JWT |
| **Mobile** | React Native (Expo), WebView, expo-image-picker |### 💬 **공유 시스템**
| **Infrastructure** | Nginx/Caddy, PM2, Let's Encrypt, Ubuntu |- 🔗 **식사 공유**: 고유 링크로 식사 기록 공유

- 📊 **조회 추적**: 공유 링크 조회 수 및 통계

## 🚀 빠른 시작- 👥 **친구 추천**: 공유 링크를 통한 친구 연결
```bash
# 저장소 클론
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal
# 환경 변수 설정
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 개발 환경 실행
npm run dev
```

### 🗺️ **음식점 공유 & 맵**
- 🏪 **음식점 데이터베이스**: 개별 음식점 정보 관리
- 🗺️ **지도 연동**: 음식점 위치 지도에서 확인
- 🔍 **검색 & 필터**: 지역, 카테고리별 음식점 검색

### 💬 **소셜 기능**
- 👥 **사용자 프로필**: 개인 식사 기록 및 통계
- 💬 **댓글 & 공유**: 식사 기록에 댓글 및 공유
- 📊 **통계 & 인사이트**: 식사 패턴 분석

---
# DailyMeal 🍽️

간단한 소개
-----------------
DailyMeal은 매일의 식사를 사진으로 기록하고 평가를 공유하는 풀스택 서비스입니다. 웹(Next.js), 모바일(Expo React Native), 백엔드(NestJS)로 구성되어 있으며, 소셜 피드, 댓글/좋아요, 위치 기반 음식점 정보, 실시간 알림(Socket.IO) 등을 제공합니다.

주요 기능
-----------------
- 식사 사진 업로드 및 갤러리
- 2단계 식사 기록: 사진 저장(빠른 입력) → 이후 평가(평점, 메모, 위치)
- 평점(1-5) 및 상세 메모
- 위치(음식점) 자동 기록 및 지도 표시
- 공유(딥링크, 카카오톡 등) 및 조회 통계
- 좋아요, 댓글, 실시간 알림

기술 스택
-----------------
- Frontend: Next.js (TypeScript), Tailwind CSS, Zustand, TanStack Query, Socket.IO Client
- Backend: NestJS (TypeScript), PostgreSQL 16, TypeORM, JWT + Passport, Socket.IO, Multer
- Mobile: Expo React Native (WebView, expo-image-picker)
- Infra: Nginx/Caddy, PM2, Let's Encrypt, Ubuntu (Production: AWS EC2)

빠른 시작
-----------------
1) 리포지토리 클론

```bash
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal
```

2) 환경 변수 설정 (필수)

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.local.example frontend/.env.local

# 환경값 편집
nano backend/.env
nano frontend/.env.local
```

3) 의존성 설치

```bash
npm run install:all
```

4) 개발 모드 실행

```bash
# 전체 개발 서버 (Concurrently)
npm run dev

# 백엔드 개발
cd backend && npm install && npm run start:dev

# 프론트엔드 개발
cd frontend && npm install && npm run dev
```

프로덕션 배포 예시
-----------------

```bash
# PM2로 프로덕션 시작
pm2 start ecosystem.config.js

# 또는 배포 스크립트 사용
./bin/deploy.sh
```

프로젝트 구조(요약)
-----------------
DailyMeal/
- frontend/    # Next.js 프론트엔드 (포트: 3000)
- backend/     # NestJS 백엔드 (포트: 8000)
- app/         # React Native (Expo)
- docs/        # 프로젝트 문서
- scripts/     # 유틸 스크립트
- bin/         # 배포/운영 스크립트

문서
-----------------
전체 문서는 `docs/` 폴더에 정리되어 있습니다. 주요 문서 링크:

- 환경 설정: `docs/setup/ENVIRONMENT_SETUP.md`
- 배포 가이드: `docs/deployment/BUILD_DEPLOY_GUIDE.md`
- PostgreSQL 설치: `docs/setup/POSTGRES_SETUP_GUIDE.md`
- Socket.IO 구조: `docs/SOCKET_IO_FINAL.md`
- 2단계 식사 기록: `docs/TWO_PHASE_MEAL_SYSTEM.md`

운영/엔터프라이즈 참고
-----------------
- PM2, Nginx/Caddy 설정 문서 및 ECOSYSTEM 관련 가이드가 `docs/deployment/`에 포함되어 있습니다.

연락처
-----------------
- 이메일: support@dailymeal.life
- 개인정보 관련: privacy@dailymeal.life
- GitHub: https://github.com/jynius/DailyMeal

라이선스
-----------------
이 프로젝트는 개인 프로젝트입니다. 필요한 경우 별도 라이선스 파일을 추가하세요.

추가 참고
-----------------
더 상세한 설정/문서/스크립트는 `docs/`, `frontend/README.md`, `backend/README.md`, `app/README.md`에서 확인하세요.

   # docs: 문서 수정
   # style: 코드 포맷팅
   # refactor: 코드 리팩토링
   # chore: 빌드/설정 변경
   ```

### 🐛 이슈 리포트
- **버그**: 재현 단계와 환경 정보 포함
- **기능 요청**: 사용 시나리오와 예상 동작 설명
- **질문**: 구체적인 상황과 시도한 방법 포함

---

## 📝 최근 해결된 이슈들

### 2025.10.10 - PostgreSQL 마이그레이션 완료 🎉
- ✅ **PostgreSQL 16 설치**: Ubuntu 24.04에 PostgreSQL 설치 및 설정
- ✅ **데이터베이스 생성**: dailymeal DB 및 사용자 권한 설정
- ✅ **마이그레이션 스크립트 업데이트**: 6개 테이블 전체 구조 반영
  - users (bio 컬럼 추가)
  - meal_records (category, companionIds, companionNames 추가)
  - friendships, user_settings, meal_shares, share_tracking (완전 지원)
- ✅ **데이터 마이그레이션**: 3명 사용자, 26개 식사 기록, 3개 공유 성공
- ✅ **환경 변수 설정**: backend/.env에 PostgreSQL 연결 정보 업데이트
- ✅ **문서 정리**: 루트 디렉토리 md 파일들을 docs로 이동

### 2025.10.08 - 문서 구조 개선
- ✅ **문서 정리**: 모든 기술 문서를 `docs/` 폴더로 통합 (13개 파일)
- ✅ **README 간소화**: 각 폴더 README를 간결하게 재작성
- ✅ **문서 인덱스**: `docs/README.md`에 카테고리별, 레벨별 분류
- ✅ **배포 스크립트 정리**: deploy-simple.sh를 deploy.sh로 통합

### 2025.10.08 - 안정성 및 호환성 개선
- ✅ **Bus Error 해결**: Next.js 15.5.4 → 14.2.13, React 19.1.0 → 18.3.1 다운그레이드
- ✅ **404 오류 해결**: 전체 사이트 접근 불가 문제 해결
- ✅ **Socket.IO 안정화**: CORS 설정 개선 및 연결 로직 단순화
- ✅ **TailwindCSS 호환성**: v4 → v3.4.15 다운그레이드로 빌드 안정성 확보
- ✅ **PM2 안정성**: 프로세스 재시작 횟수 대폭 감소

---

## 📞 문의 및 지원

- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/jynius/DailyMeal/issues)
- **개발자**: [@jynius](https://github.com/jynius)
- **문서**: [docs/README.md](./docs/README.md)

---

## 📄 라이선스

This project is licensed under the MIT License.

---

**Made with ❤️ by [@jynius](https://github.com/jynius)**
