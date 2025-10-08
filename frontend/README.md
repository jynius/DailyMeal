# DailyMeal Frontend

DailyMeal의 Next.js 기반 프론트엔드 애플리케이션입니다.

## 📖 상세 문서

프론트엔드 관련 상세 설정 및 가이드는 프로젝트 문서를 참조하세요:

- [📘 **배포 가이드**](../docs/BUILD_DEPLOY_GUIDE.md) - 빌드 및 배포 방법
- [🔧 **PM2 설정**](../docs/ECOSYSTEM_CONFIG_GUIDE.md) - 프로세스 관리
- [🌐 **네트워크 구조**](../docs/NETWORK_ARCHITECTURE.md) - 시스템 아키텍처
- [📖 **전체 문서**](../docs/README.md) - 모든 문서 보기

## 🚀 빠른 시작

### 개발 모드
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 프로덕션 빌드
```bash
npm run build
npm run start
```

## 🛠️ 기술 스택

- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.IO Client
- **UI Components**: Radix UI
- **Icons**: Lucide React

## 📂 주요 구조

```
src/
├── app/                 # Next.js App Router 페이지
│   ├── meal/           # 식사 기록 페이지
│   ├── restaurants/    # 음식점 페이지
│   └── layout.tsx      # 루트 레이아웃
├── components/          # 재사용 컴포넌트
│   ├── ui/             # UI 기본 컴포넌트
│   └── meal/           # 식사 관련 컴포넌트
├── contexts/            # React Context
├── hooks/               # Custom Hooks
├── lib/                 # 유틸리티 함수
└── types/               # TypeScript 타입 정의
```

## 🔧 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start

# 린트
npm run lint
```

## 🎨 주요 기능

- 📱 **반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- 🎭 **다크 모드** - 시스템 설정 자동 감지
- ⚡ **SSR/SSG** - Next.js의 하이브리드 렌더링
- 🔄 **실시간 업데이트** - WebSocket 연동
- 🖼️ **이미지 최적화** - Next.js Image 컴포넌트
- 📦 **코드 스플리팅** - 자동 번들 최적화

## 📝 환경 변수

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=production
```

## 🎯 페이지 구조

- `/` - 홈 (피드)
- `/meal` - 식사 기록 목록
- `/meal/add` - 새 식사 기록
- `/meal/[id]` - 식사 상세
- `/restaurants` - 음식점 목록
- `/restaurants/[id]` - 음식점 상세
- `/restaurants/map` - 지도 보기

---

**Next.js 공식 문서**: https://nextjs.org/docs  
**Tailwind CSS 문서**: https://tailwindcss.com/docs
