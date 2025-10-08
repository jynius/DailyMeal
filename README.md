# DailyMeal 🍽️

매일의 식사를 기록하고 음식점을 공유하는 소셜 식단 플랫폼

## ✨ 주요 기능

### 📱 **개인 식사 기록**
- 📸 **사진 기반 식사 기록**: 음식 사진과 함께 식사 정보 기록
- ⭐ **별점 평가 시스템**: 1-5점 별점으로 음식 평가
- 📍 **위치 정보**: 식사 장소 기록
- 💰 **가격 기록**: 음식 가격 정보 저장
- 📝 **메모 기능**: 간단한 후기나 메모 작성

### 🗺️ **음식점 공유 & 맵**
- 🏪 **음식점 데이터베이스**: 개별 음식점 정보 관리
- 🗺️ **지도 연동**: 음식점 위치 지도에서 확인
- 🔍 **검색 & 필터**: 지역, 카테고리별 음식점 검색

### 💬 **소셜 기능**
- 👥 **사용자 프로필**: 개인 식사 기록 및 통계
- �� **댓글 & 공유**: 식사 기록에 댓글 및 공유
- 📊 **통계 & 인사이트**: 식사 패턴 분석

---

## 📚 문서

프로젝트의 모든 기술 문서는 [`docs/`](./docs/) 폴더에 체계적으로 정리되어 있습니다.

### 📖 문서 구조

```
docs/
├── 🚀 배포 & 운영 (9개)
│   ├── BUILD_DEPLOY_GUIDE.md           # 빌드 및 배포 프로세스
│   ├── CLEANUP_SUMMARY.md              # 스크립트 정리 완료
│   ├── ECOSYSTEM_BUILD_SOLUTION.md     # 빌드 문제 해결
│   ├── ECOSYSTEM_CONFIG_GUIDE.md       # PM2 설정 가이드
│   ├── ENVIRONMENT_SETUP.md ⭐          # 환경 변수 설정 (필수!)
│   ├── ENV_INTEGRATION_REPORT.md       # 환경 변수 통합 보고서
│   ├── ENV_ANALYSIS.md                 # 환경 변수 파일 분석
│   ├── DEV_ENV_CONFLICT.md             # 개발 환경 충돌 해결
│   └── SUMMARY.md                      # 문서 재구성 요약
│
├── 🔧 PM2 프로세스 관리 (2개)
│   ├── PM2_NAMING_STRATEGY.md
│   └── PM2_SCRIPT_GUIDE.md
│
├── 🌐 네트워크 & 인프라 (4개)
│   ├── NETWORK_ARCHITECTURE.md
│   ├── NGINX_PROXY_SETUP.md
│   ├── FIREWALL_SETUP.md
│   └── HTTPS_SETUP.md
│
└── 🔍 문제 해결 & 최적화 (2개)
    ├── LOCALHOST_CLEANUP.md
    └── SCENARIOS.md
```

### 🎯 빠른 링크

#### 필수 문서 (처음 시작하시나요?)
- [⭐ **환경 변수 설정**](./docs/ENVIRONMENT_SETUP.md) - 가장 먼저 읽어야 할 문서!
- [📘 **배포 가이드**](./docs/BUILD_DEPLOY_GUIDE.md) - 처음 배포하는 방법
- [🌐 **네트워크 구조**](./docs/NETWORK_ARCHITECTURE.md) - 시스템 아키텍처 이해
- [🔧 **PM2 설정**](./docs/ECOSYSTEM_CONFIG_GUIDE.md) - 프로세스 관리

#### 운영 가이드
- [🔒 **HTTPS 설정**](./docs/HTTPS_SETUP.md) - SSL 인증서 설정
- [🛡️ **방화벽 설정**](./docs/FIREWALL_SETUP.md) - 보안 설정
- [🔄 **PM2 스크립트**](./docs/PM2_SCRIPT_GUIDE.md) - 프로세스 관리 스크립트

#### 문제 해결
- [🐛 **시나리오 가이드**](./docs/SCENARIOS.md) - 상황별 해결 방법
- [📖 **전체 문서 목록**](./docs/README.md) - 모든 문서 보기

---

## 🚀 빠른 시작

### 배포 (권장)
```bash
# 저장소 클론
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal

# 의존성 설치
npm run install:all

# 프로덕션 배포
npm run deploy
```

### 개발 모드
```bash
# 로컬 개발 (Concurrently)
npm run dev

# PM2로 개발 (백그라운드)
npm run dev:pm2
```

자세한 내용은 [배포 가이드](./docs/BUILD_DEPLOY_GUIDE.md)를 참조하세요.

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14.2.13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.15
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.IO Client

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO
- **File Upload**: Multer

### DevOps & Infrastructure
- **Process Manager**: PM2
- **Web Server**: Nginx (리버스 프록시)
- **SSL**: Let's Encrypt (Certbot)
- **Development**: WSL2 (Ubuntu)
- **Production**: AWS EC2 (Ubuntu)

### Mobile
- **Framework**: Expo SDK 54
- **WebView**: React Native WebView 13.15.0

---

## 🔧 개발 참고사항

### 📋 브랜치 전략
| 브랜치 | 환경 | 자동 배포 | 용도 |
|--------|------|-----------|------|
| **`main`** | 🔧 개발 | ❌ | 소스 코드 관리, 기본 개발 브랜치 |
| **`dev`** | 🧪 스테이징 | ✅ | 테스트 서버 자동 배포 |

### 🛠️ 개발 도구 설정
```bash
# ESLint + Prettier 설정 완료
# TypeScript 엄격 모드 활성화  
# Next.js 14 안정 버전 사용

# VS Code 권장 확장:
# - TypeScript + JavaScript
# - Tailwind CSS IntelliSense
# - ESLint + Prettier
```

### 📊 프로젝트 메트릭스 (현재)
- **총 라인수**: ~3,000+ lines
- **컴포넌트**: 15+ 개 재사용 컴포넌트
- **페이지**: 11개 라우트 (SSG 7개 + Dynamic 4개)
- **API 엔드포인트**: 15+ 개
- **번들 크기**: 153kB (First Load JS)
- **빌드 시간**: ~5-10초

---

## 🚀 향후 개선 계획

### 🎯 단기 목표 (v1.1)
- [ ] **PWA 지원**: 오프라인 기능, 푸시 알림
- [ ] **실시간 기능 강화**: Socket.io 최적화
- [ ] **지도 API 연동**: Kakao Map / Google Maps
- [ ] **이미지 최적화**: 썸네일 생성, CDN 연동

### 🔮 중기 목표 (v1.5)
- [ ] **소셜 로그인**: Google, Kakao, Naver 연동
- [ ] **팔로우 시스템**: 친구 맺기, 피드 구독
- [ ] **추천 알고리즘**: 개인 취향 기반 음식점 추천
- [ ] **데이터 분석**: 대시보드, 인사이트 제공

### 🌟 장기 비전 (v2.0)
- [ ] **Multi-tenant**: 여러 지역/그룹 지원
- [ ] **Native 모바일 앱**: React Native 완전 네이티브
- [ ] **AI 기능**: 음식 인식, 자동 태깅
- [ ] **마이크로서비스**: 확장 가능한 아키텍처

---

## 🤝 기여 방법

### 🔧 개발 환경 설정
1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/DailyMeal.git
   cd DailyMeal
   ```

2. **브랜치 생성**
   ```bash
   git checkout -b feature/새기능명
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **커밋 규칙**
   ```bash
   git commit -m "feat: 새로운 기능 추가"
   # feat: 새 기능
   # fix: 버그 수정  
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
