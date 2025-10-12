# DailyMeal 문서

이 폴더에는 DailyMeal 프로젝트의 모든 기술 문서가 체계적으로 정리되어 있습니다.

## 📁 문서 구조

### 🚀 [setup/](setup/) - 환경 설정
프로젝트 초기 설정 및 데이터베이스 구성 가이드
- [환경 설정](setup/ENVIRONMENT_SETUP.md)
- [환경 변수 체크리스트](setup/ENV_SETUP_CHECKLIST.md)
- [프로덕션 환경 가이드](setup/ENV_PRODUCTION_GUIDE.md)
- [데이터베이스 설정](setup/DATABASE.md)
- [PostgreSQL 설정](setup/POSTGRES_SETUP_GUIDE.md)
- [PostgreSQL 마이그레이션](setup/POSTGRES_MIGRATION.md)

### 📦 [deployment/](deployment/) - 배포
빌드, 배포, 프로세스 관리 가이드
- [빌드 및 배포 가이드](deployment/BUILD_DEPLOY_GUIDE.md)
- [PM2 스크립트 가이드](deployment/PM2_SCRIPT_GUIDE.md)
- [PM2 네이밍 전략](deployment/PM2_NAMING_STRATEGY.md)
- [에코시스템 설정](deployment/ECOSYSTEM_CONFIG_GUIDE.md)

### 🏗️ [infrastructure/](infrastructure/) - 인프라
네트워크, 보안, 프록시 설정
- [네트워크 아키텍처](infrastructure/NETWORK_ARCHITECTURE.md)
- [HTTPS 설정](infrastructure/HTTPS_SETUP.md)
- [방화벽 설정](infrastructure/FIREWALL_SETUP.md)
- [Nginx 완전 설정](infrastructure/NGINX_COMPLETE_CONFIG.md)
- [Nginx 프록시 설정](infrastructure/NGINX_PROXY_SETUP.md)
- [Caddy 설정 가이드](infrastructure/CADDY_SETUP_GUIDE.md)

### ✨ [features/](features/) - 기능 구현
주요 기능 구현 가이드
- [카카오톡 공유 설정](features/KAKAO_SHARE_SETUP.md)
- [공유 시스템 백엔드](features/SHARE_SYSTEM_PHASE1_BACKEND.md)
- [공유 시스템 프론트엔드](features/SHARE_SYSTEM_PHASE2_FRONTEND.md)
- [PWA 아이콘 가이드](features/PWA_ICONS_GUIDE.md)
- [웹앱 통합](features/WEB_APP_INTEGRATION.md)
- [웹앱 통합 퀵스타트](features/WEB_APP_INTEGRATION_QUICKSTART.md)

### 🔧 [fixes/](fixes/) - 버그 수정
발견된 문제와 해결 방법
- [JWT 인증 수정](fixes/JWT_AUTH_FIX.md)
- [JWT 토큰 에러 수정](fixes/JWT_TOKEN_ERROR_FIX.md)
- [카카오 맵 401 에러 수정](fixes/KAKAO_MAP_401_FIX.md)
- [이미지 경로 수정](fixes/IMAGE_PATH_FIX.md)
- [Next.js 이미지 로더 수정](fixes/NEXTJS_IMAGE_LOADER_FIX.md)
- [공유 403 해결](fixes/SHARE_403_SOLUTION.md)
- [Socket.IO Nginx 수정](fixes/SOCKETIO_NGINX_FIX.md)
- [WebView 네비게이션 디버그](fixes/WEBVIEW_NAVIGATION_DEBUG.md)
- [플로팅 버튼과 새로고침](fixes/FLOATING_BUTTON_AND_REFRESH.md)

### 📱 [app/](app/) - 모바일 앱
React Native 앱 개발 및 배포
- [앱 배포 가이드](app/DEPLOYMENT.md)
- [디버깅 가이드](app/DEBUGGING_GUIDE.md)
- [배포 체크리스트](app/DEPLOYMENT_CHECKLIST.md)
- [전체화면 모드](app/FULLSCREEN_MODE.md)
- [새로고침 가이드](app/REFRESH_GUIDE.md)
- [빌드 결과](app/BUILD_RESULT.md)

### 🏪 [app-store/](app-store/) - 앱 스토어 등록
Play Store / App Store 등록 가이드
- [Play Store 배포](app-store/PLAYSTORE_DEPLOYMENT.md)
- [앱 스토어 설명](app-store/APP_STORE_DESCRIPTION.md)

### 💻 [frontend/](frontend/) - 프론트엔드
Next.js 관련 문서
- [로거 시스템](frontend/LOGGER_README.md)
- [API 모니터링](frontend/API_MONITOR_README.md)

### 🔌 [backend/](backend/) - 백엔드
NestJS 관련 문서 (향후 추가 예정)

### 📜 [scripts/](scripts/) - 스크립트
유틸리티 스크립트 문서
- [SVG to PNG 변환기](scripts/README.md)

### 🐙 [github/](github/) - GitHub 설정
GitHub Actions, 브랜치 전략
- [브랜치 설정](github/BRANCH_SETUP.md)
- [GitHub Actions 설정](github/GITHUB_ACTIONS_SETUP.md)

### 📦 [archive/](archive/) - 아카이브
과거 마이그레이션, 리팩토링, 분석 기록

## 🎯 빠른 링크

### 새로 시작하기
1. [환경 설정](setup/ENVIRONMENT_SETUP.md)
2. [데이터베이스 설정](setup/DATABASE.md)
3. [빌드 및 배포](deployment/BUILD_DEPLOY_GUIDE.md)

### 배포하기
1. [배포 체크리스트](deployment/BUILD_DEPLOY_GUIDE.md)
2. [PM2 가이드](deployment/PM2_SCRIPT_GUIDE.md)
3. [HTTPS 설정](infrastructure/HTTPS_SETUP.md)

### 앱 개발
1. [앱 배포 가이드](app/DEPLOYMENT.md)
2. [디버깅 가이드](app/DEBUGGING_GUIDE.md)
3. [Play Store 등록](app-store/PLAYSTORE_DEPLOYMENT.md)

### 문제 해결
- [버그 수정 목록](fixes/)
- [네트워크 문제](infrastructure/NETWORK_ARCHITECTURE.md)
- [방화벽 설정](infrastructure/FIREWALL_SETUP.md)

## 📝 문서 작성 규칙

1. **파일명**: `UPPER_SNAKE_CASE.md` 사용
2. **위치**: 적절한 카테고리 폴더에 배치
3. **링크**: 상대 경로 사용
4. **업데이트**: 변경사항이 있으면 문서도 함께 업데이트

## 🔍 문서 찾기

```bash
# 키워드로 문서 검색
grep -r "키워드" docs/

# 특정 카테고리 문서 목록
ls docs/setup/
```

## 📚 추가 자료

- [메인 README](../README.md)
- [Frontend README](../frontend/README.md)
- [Backend README](../backend/README.md)
- [App README](../app/README.md)
- [Scripts README](../scripts/README.md)
