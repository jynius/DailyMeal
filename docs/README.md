# 📚 DailyMeal 문서 센터

DailyMeal 프로젝트의 모든 기술 문서와 가이드를 모아둔 곳입니다.

---

## 📖 목차

### 🚀 배포 & 운영
- [**BUILD_DEPLOY_GUIDE.md**](./BUILD_DEPLOY_GUIDE.md) - 빌드 및 배포 프로세스 완벽 가이드
- [**CLEANUP_SUMMARY.md**](./CLEANUP_SUMMARY.md) - 프로덕션 배포 스크립트 정리 완료
- [**ECOSYSTEM_BUILD_SOLUTION.md**](./ECOSYSTEM_BUILD_SOLUTION.md) - ecosystem.config.js 빌드 문제 해결
- [**ECOSYSTEM_CONFIG_GUIDE.md**](./ECOSYSTEM_CONFIG_GUIDE.md) - PM2 Ecosystem 설정 완벽 가이드
- [**ENVIRONMENT_SETUP.md**](./ENVIRONMENT_SETUP.md) - 환경 변수 설정 종합 가이드 ⭐ **필수!**
- [**ENV_INTEGRATION_REPORT.md**](./ENV_INTEGRATION_REPORT.md) - 환경 변수 통합 작업 완료 보고서
- [**ENV_ANALYSIS.md**](./ENV_ANALYSIS.md) - 환경 변수 파일 상세 분석
- [**DEV_ENV_CONFLICT.md**](./DEV_ENV_CONFLICT.md) - 개발 환경 설정 충돌 해결 과정
- [**SUMMARY.md**](./SUMMARY.md) - 문서 재구성 요약

### 🔧 PM2 프로세스 관리
- [**PM2_NAMING_STRATEGY.md**](./PM2_NAMING_STRATEGY.md) - PM2 프로세스 이름 전략
- [**PM2_SCRIPT_GUIDE.md**](./PM2_SCRIPT_GUIDE.md) - PM2 script vs npm 실행 가이드

### 🌐 네트워크 & 인프라
- [**NETWORK_ARCHITECTURE.md**](./NETWORK_ARCHITECTURE.md) - WSL2 + Windows + AWS 네트워크 구조
- [**NGINX_PROXY_SETUP.md**](./NGINX_PROXY_SETUP.md) - Nginx 리버스 프록시 설정 가이드
- [**FIREWALL_SETUP.md**](./FIREWALL_SETUP.md) - Windows 방화벽 및 포트 포워딩 설정
- [**HTTPS_SETUP.md**](./HTTPS_SETUP.md) - HTTPS/SSL 인증서 설정 가이드

### 🔍 문제 해결 & 최적화
- [**LOCALHOST_CLEANUP.md**](./LOCALHOST_CLEANUP.md) - Localhost 하드코딩 제거 작업
- [**SCENARIOS.md**](./SCENARIOS.md) - 다양한 사용 시나리오 및 문제 해결

---

## 🔗 관련 전문 문서

프로젝트의 다른 특화된 문서들:

- [📱 **모바일 앱 배포**](../app/DEPLOYMENT.md) - Expo 앱 빌드 및 배포 가이드
- [🌳 **브랜치 전략**](../.github/BRANCH_SETUP.md) - Git 브랜치 설정 및 관리
- [⚙️ **GitHub Actions**](../.github/GITHUB_ACTIONS_SETUP.md) - CI/CD 환경 설정
- [📋 **Copilot 가이드**](../.github/copilot-instructions.md) - GitHub Copilot 프로젝트 컨텍스트

---

## 🗂️ 문서 분류

### 레벨 1: 필수 읽기 📌
프로젝트를 시작하거나 배포하는 모든 사람이 반드시 읽어야 할 문서

1. [**ENVIRONMENT_SETUP.md**](./ENVIRONMENT_SETUP.md) ⭐ - 환경 변수 설정 (가장 먼저!)
2. [**BUILD_DEPLOY_GUIDE.md**](./BUILD_DEPLOY_GUIDE.md) - 배포 프로세스 이해
3. [**NETWORK_ARCHITECTURE.md**](./NETWORK_ARCHITECTURE.md) - 네트워크 구조 이해
4. [**ECOSYSTEM_CONFIG_GUIDE.md**](./ECOSYSTEM_CONFIG_GUIDE.md) - PM2 설정 이해

### 레벨 2: 운영 가이드 🔧
서버 운영 및 유지보수 담당자를 위한 문서

1. [**PM2_SCRIPT_GUIDE.md**](./PM2_SCRIPT_GUIDE.md) - PM2 스크립트 이해
2. [**NGINX_PROXY_SETUP.md**](./NGINX_PROXY_SETUP.md) - 웹서버 설정
3. [**FIREWALL_SETUP.md**](./FIREWALL_SETUP.md) - 보안 설정
4. [**HTTPS_SETUP.md**](./HTTPS_SETUP.md) - SSL 인증서 관리

### 레벨 3: 참고 자료 📚
특정 문제 해결이나 최적화를 위한 문서

1. [**ENV_INTEGRATION_REPORT.md**](./ENV_INTEGRATION_REPORT.md) - 환경 변수 통합 내역
2. [**ENV_ANALYSIS.md**](./ENV_ANALYSIS.md) - 환경 변수 파일 상세 분석
3. [**DEV_ENV_CONFLICT.md**](./DEV_ENV_CONFLICT.md) - 개발 환경 충돌 해결 과정
4. [**CLEANUP_SUMMARY.md**](./CLEANUP_SUMMARY.md) - 스크립트 정리 내역
5. [**ECOSYSTEM_BUILD_SOLUTION.md**](./ECOSYSTEM_BUILD_SOLUTION.md) - 빌드 문제 해결
6. [**PM2_NAMING_STRATEGY.md**](./PM2_NAMING_STRATEGY.md) - 네이밍 전략
7. [**LOCALHOST_CLEANUP.md**](./LOCALHOST_CLEANUP.md) - 하드코딩 제거
8. [**SCENARIOS.md**](./SCENARIOS.md) - 시나리오별 가이드
9. [**SUMMARY.md**](./SUMMARY.md) - 문서 재구성 요약

---

## 🔍 빠른 검색

### 키워드로 찾기

#### 환경 변수 관련 ⭐
- **초기 설정**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) → "초기 설정 방법"
- **JWT_SECRET**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) → "JWT Configuration"
- **카카오 지도 API**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) → "카카오 지도 API 키 발급"
- **.env vs PM2**: [ENV_INTEGRATION_REPORT.md](./ENV_INTEGRATION_REPORT.md) → "dotenv 통합"
- **파일 분석**: [ENV_ANALYSIS.md](./ENV_ANALYSIS.md) → "4개 .env 파일 비교"
- **충돌 해결**: [DEV_ENV_CONFLICT.md](./DEV_ENV_CONFLICT.md) → "방안 2 선택 과정"

#### 배포 관련
- **초기 배포**: [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md) → "초기 배포"
- **재배포**: [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) → "코드 업데이트"
- **빌드 실패**: [ECOSYSTEM_BUILD_SOLUTION.md](./ECOSYSTEM_BUILD_SOLUTION.md)

#### PM2 관련
- **PM2 시작**: [PM2_SCRIPT_GUIDE.md](./PM2_SCRIPT_GUIDE.md) → "start-pm2.sh"
- **PM2 중지**: [PM2_SCRIPT_GUIDE.md](./PM2_SCRIPT_GUIDE.md) → "stop-pm2.sh"
- **프로세스 이름**: [PM2_NAMING_STRATEGY.md](./PM2_NAMING_STRATEGY.md)
- **PM2 설정**: [ECOSYSTEM_CONFIG_GUIDE.md](./ECOSYSTEM_CONFIG_GUIDE.md)

#### 네트워크 관련
- **WSL2 설정**: [NETWORK_ARCHITECTURE.md](./NETWORK_ARCHITECTURE.md) → "WSL2"
- **방화벽 설정**: [FIREWALL_SETUP.md](./FIREWALL_SETUP.md)
- **Nginx 설정**: [NGINX_PROXY_SETUP.md](./NGINX_PROXY_SETUP.md)
- **HTTPS 설정**: [HTTPS_SETUP.md](./HTTPS_SETUP.md)

#### 문제 해결
- **지도 안 보임**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) → "문제 해결"
- **JWT 오류**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) → "JWT 인증 오류"
- **DB 연결 오류**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) → "데이터베이스 연결 오류"
- **localhost 오류**: [LOCALHOST_CLEANUP.md](./LOCALHOST_CLEANUP.md)

---

## 🎯 시나리오별 가이드

### 새 개발자 온보딩 🆕
1. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 환경 변수 설정
2. [NETWORK_ARCHITECTURE.md](./NETWORK_ARCHITECTURE.md) - 프로젝트 구조 이해
3. [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md) - 로컬 실행 방법

### 서버 운영자 🔧
1. [PM2_SCRIPT_GUIDE.md](./PM2_SCRIPT_GUIDE.md) - PM2 명령어
2. [ECOSYSTEM_CONFIG_GUIDE.md](./ECOSYSTEM_CONFIG_GUIDE.md) - PM2 설정
3. [NGINX_PROXY_SETUP.md](./NGINX_PROXY_SETUP.md) - 웹서버 관리

### DevOps 엔지니어 ⚙️
1. [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md) - CI/CD 파이프라인
2. [FIREWALL_SETUP.md](./FIREWALL_SETUP.md) - 보안 설정
3. [HTTPS_SETUP.md](./HTTPS_SETUP.md) - SSL 인증서

### 문제 해결 담당자 🔍
1. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 환경 변수 문제
2. [SCENARIOS.md](./SCENARIOS.md) - 다양한 시나리오
3. [ECOSYSTEM_BUILD_SOLUTION.md](./ECOSYSTEM_BUILD_SOLUTION.md) - 빌드 오류

---

## 📝 문서 작성 기준

### 문서 추가 시
1. 이 README.md에 링크 추가
2. 적절한 카테고리에 배치
3. 레벨 분류 지정
4. 키워드 검색 섹션에 추가

### 문서 작성 가이드
- **제목**: 명확하고 검색 가능한 이름
- **구조**: 목차, 개요, 상세 내용, 예제, 문제 해결
- **링크**: 관련 문서 간 상호 참조
- **예제**: 실제 사용 가능한 명령어와 코드
- **업데이트**: 변경 사항 발생 시 즉시 반영

---

## 🔄 최근 업데이트

### 2025-10-08
- ✨ **ENVIRONMENT_SETUP.md** 추가 - 환경 변수 설정 종합 가이드
- ✨ **ENV_INTEGRATION_REPORT.md** 추가 - 환경 변수 통합 작업 보고서
- 🔧 JWT_SECRET 환경 변수 적용 완료
- 🔧 KAKAO_MAP_API_KEY 환경 변수 통합
- 🗑️ .env.production 삭제 (미사용)
- 📝 backend/.env.example 생성

### 2025-10-07
- 📚 문서 센터 구조화 완료
- 🏗️ 13개 문서를 docs/ 폴더로 이동
- 📋 레벨별 분류 및 검색 기능 추가
- 🔗 크로스 레퍼런스 체계 확립

---

## 🤝 기여 가이드

문서 개선이나 새로운 가이드 추가는 언제나 환영합니다!

1. 문서 작성 또는 수정
2. 이 README.md에 링크 추가
3. Pull Request 생성
4. 리뷰 후 병합

---

## 📧 문의

문서 관련 문의사항이나 개선 제안은 이슈로 남겨주세요.

**Happy Coding! 🚀**
