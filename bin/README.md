# 🔧 DailyMeal Shell Scripts

프로젝트 관리 및 배포를 위한 Shell 스크립트 모음

## 📜 스크립트 목록

### 🚀 핵심 스크립트 (Linux/macOS/WSL2)

#### 1. deploy.sh
**서버 배포 스크립트** - 프로덕션 환경에서 사용

```bash
./bin/deploy.sh
# 또는
npm run deploy
```

**기능:**
- ✅ 환경 변수 확인 (.env.production)
- ✅ 기존 PM2 프로세스 중지
- ✅ 백엔드/프론트엔드 의존성 설치 및 빌드
- ✅ PM2로 서비스 시작 (ecosystem.config.js 사용)
- ✅ 배포 상태 확인 및 로그 출력

**사용 시나리오:**
- 서버에 새 버전 배포
- 코드 변경 후 프로덕션 재시작
- 환경 변수 변경 후 재배포

#### 2. start-pm2.sh
**로컬 개발 서버 시작** - PM2로 개발 환경 실행

```bash
./bin/start-pm2.sh
# 또는
npm run dev:pm2
```

**기능:**
- ✅ 개발 환경 변수 설정 (NODE_ENV=development)
- ✅ 백엔드/프론트엔드 의존성 설치
- ✅ PM2로 개발 서버 시작 (ecosystem.dev.config.js 사용)
- ✅ 개발 서버 상태 확인

**사용 시나리오:**
- 로컬에서 프로덕션 환경 시뮬레이션
- PM2 기반 개발 환경 구동
- 멀티 프로세스 개발 테스트

#### 3. stop-pm2.sh
**PM2 프로세스 중지**

```bash
# 모든 프로세스 중지
./bin/stop-pm2.sh all
npm run stop

# 개발 환경만 중지
./bin/stop-pm2.sh dev
npm run stop:dev

# 프로덕션만 중지
./bin/stop-pm2.sh prod
npm run stop:prod
```

**기능:**
- ✅ 선택적 프로세스 중지 (dev/prod/all)
- ✅ 안전한 종료 처리
- ✅ PM2 저장 상태 업데이트

**사용 시나리오:**
- 개발 서버 중지
- 배포 전 프로세스 정리
- 환경 전환 시 중지

### 🪟 Windows 전용 스크립트 (PowerShell)

#### 4. check-firewall-windows.ps1
**Windows 방화벽 확인 및 설정**

```powershell
# PowerShell (관리자 권한)에서 실행
.\bin\check-firewall-windows.ps1
```

**기능:**
- ✅ WSL2 포트 (3000, 8000) 방화벽 규칙 확인
- ✅ 누락된 규칙 자동 생성
- ✅ 기존 규칙 상태 표시

**사용 시나리오:**
- WSL2 개발 환경 초기 설정
- 외부에서 로컬 서버 접근 필요 시
- 방화벽 규칙 문제 해결

#### 5. wsl-port-forward.ps1
**WSL 포트 포워딩 설정**

```powershell
# PowerShell (관리자 권한)에서 실행
.\bin\wsl-port-forward.ps1
```

**기능:**
- ✅ WSL2 IP 자동 탐지
- ✅ Windows → WSL 포트 포워딩 설정
- ✅ 방화벽 규칙 자동 구성

**사용 시나리오:**
- WSL2 네트워크 접근 문제 해결
- 외부 디바이스에서 WSL 서버 접근
- 모바일 앱 개발 시 로컬 서버 연결

## 🎯 일반적인 사용 패턴

### 로컬 개발
```bash
# 일반 개발 (개별 터미널)
npm run dev          # frontend + backend 동시 실행

# PM2로 개발 (백그라운드)
npm run dev:pm2      # PM2로 dev 환경 실행
npm run stop:dev     # 개발 환경 중지
```

### 서버 배포
```bash
# 서버에서 배포
cd /path/to/DailyMeal
./bin/deploy.sh      # 전체 빌드 및 배포

# PM2 관리
pm2 status           # 상태 확인
pm2 logs             # 실시간 로그
pm2 restart all      # 재시작
```

### Windows WSL2 설정
```powershell
# PowerShell (관리자 권한)
cd C:\path\to\DailyMeal
.\bin\check-firewall-windows.ps1   # 방화벽 확인
.\bin\wsl-port-forward.ps1          # 포트 포워딩
```

## 📚 상세 문서

- [스크립트 재구성 기록](../docs/archive/SCRIPTS_REORGANIZATION.md) - 스크립트 정리 히스토리
- [배포 가이드](../docs/deployment/BUILD_DEPLOY_GUIDE.md) - 전체 배포 프로세스
- [PM2 가이드](../docs/deployment/PM2_SCRIPT_GUIDE.md) - PM2 사용법
- [방화벽 설정](../docs/infrastructure/FIREWALL_SETUP.md) - WSL2 방화벽 설정

## 🔧 스크립트 구조

모든 스크립트는 다음 구조를 따릅니다:

```bash
#!/bin/bash

# 프로젝트 루트 디렉토리 자동 탐지
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 스크립트 내용...
```

**장점:**
- 어디서든 스크립트 실행 가능
- 프로젝트 루트 기준으로 상대 경로 사용
- 일관된 작업 디렉토리 보장

## 🗑️ 제거된 스크립트

다음 스크립트는 사용 빈도가 낮아 archive로 이동되었습니다:
- `setup-caddy.sh` - Nginx 사용으로 불필요
- `restart-pm2.sh` - `pm2 restart` 명령으로 대체
- `check-build.sh` - 수동 확인으로 대체
- `check-status.sh` - `pm2 status` 명령으로 대체
- `check-firewall.sh` - 초기 설정 후 불필요
- `dev-setup.sh` - 초기 설정 후 불필요
- `cleanup-disk.sh` - 수동 실행으로 충분
- `startup.sh` - deploy.sh로 통합

**보관 위치:** `docs/archive/removed-scripts/`

## 💡 팁

### npm 스크립트로 실행
```bash
npm run deploy       # ./bin/deploy.sh
npm run dev:pm2      # ./bin/start-pm2.sh
npm run stop         # ./bin/stop-pm2.sh all
```

### PM2 직접 사용
```bash
pm2 start ecosystem.config.js        # 프로덕션 시작
pm2 start ecosystem.dev.config.js    # 개발 시작
pm2 logs                             # 실시간 로그
pm2 monit                            # 모니터링
```

### 실행 권한 부여
```bash
chmod +x bin/*.sh
```

## ❓ 문제 해결

### 스크립트 실행 안됨
```bash
# 실행 권한 확인
ls -la bin/

# 실행 권한 부여
chmod +x bin/deploy.sh
```

### WSL2 네트워크 문제
```powershell
# Windows PowerShell (관리자 권한)
.\bin\check-firewall-windows.ps1
.\bin\wsl-port-forward.ps1
```

### PM2 프로세스 문제
```bash
# 모든 프로세스 중지
pm2 delete all

# 새로 시작
./bin/deploy.sh
```
