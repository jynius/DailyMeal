# Shell 스크립트 재구성 보고서

## 날짜: 2025-10-08

---

## 📋 작업 개요

프로젝트 루트에 흩어져 있던 shell script들을 `bin/` 폴더로 이동하고, 어디서든 실행 가능하도록 경로 자동 탐지 기능을 추가했습니다. 또한 Windows 개발자를 위한 PowerShell 스크립트도 함께 정리했습니다.

---

## 🔄 변경 사항

### 1. 폴더 구조 변경

**이전 구조:**
```
/
├── check-build.sh
├── check-firewall.sh
├── check-firewall-windows.ps1     # Windows 전용
├── check-status.sh
├── deploy.sh
├── dev-setup.sh
├── restart-pm2.sh
├── start-pm2.sh
├── startup.sh
├── stop-pm2.sh
├── wsl-port-forward.ps1            # Windows 전용
└── ...기타 파일들
```

**변경 후 구조:**
```
/
├── bin/
│   ├── check-build.sh              # Linux/macOS
│   ├── check-firewall.sh           # Linux
│   ├── check-firewall-windows.ps1  # Windows 🪟
│   ├── check-status.sh
│   ├── deploy.sh
│   ├── dev-setup.sh
│   ├── restart-pm2.sh
│   ├── start-pm2.sh
│   ├── startup.sh
│   ├── stop-pm2.sh
│   └── wsl-port-forward.ps1        # Windows 🪟
└── ...기타 파일들
```

**스크립트 분류:**
- **Bash 스크립트 (9개)**: Linux/macOS/WSL2에서 실행
- **PowerShell 스크립트 (2개)**: Windows 호스트에서만 실행 (WSL2 네트워크 설정용)

### 2. 스크립트 경로 자동 탐지

모든 스크립트 상단에 다음 코드를 추가:

```bash
# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📂 프로젝트 루트: $PROJECT_ROOT"
```

**작동 원리:**
1. `SCRIPT_DIR`: 스크립트가 위치한 디렉토리 (`bin/`)
2. `PROJECT_ROOT`: 프로젝트 루트 (스크립트 디렉토리의 상위)
3. `cd "$PROJECT_ROOT"`: 항상 프로젝트 루트에서 실행

### 3. package.json 업데이트

**변경 전:**
```json
{
  "scripts": {
    "dev:pm2": "./start-pm2.sh",
    "deploy": "./deploy.sh",
    "setup": "./dev-setup.sh",
    "stop": "./stop-pm2.sh all"
  }
}
```

**변경 후:**
```json
{
  "scripts": {
    "dev:pm2": "./bin/start-pm2.sh",
    "deploy": "./bin/deploy.sh",
    "setup": "./bin/dev-setup.sh",
    "stop": "./bin/stop-pm2.sh all"
  }
}
```

---

## ✅ 수정된 스크립트 목록

| 파일 | 설명 | 경로 자동 탐지 |
|------|------|----------------|
| `check-build.sh` | 빌드 상태 확인 | ✅ |
| `check-firewall.sh` | 방화벽 상태 확인 | ✅ |
| `check-status.sh` | PM2 상태 진단 | ✅ |
| `deploy.sh` | 프로덕션 배포 | ✅ |
| `dev-setup.sh` | 개발 환경 설정 | ✅ |
| `restart-pm2.sh` | PM2 재시작 | ✅ |
| `start-pm2.sh` | PM2 개발 서버 시작 | ✅ |
| `startup.sh` | PM2 프로덕션 시작 | ✅ |
| `stop-pm2.sh` | PM2 중지 | ✅ |

**총 9개 스크립트 모두 수정 완료**

---

## 🎯 장점

### 1. 깔끔한 프로젝트 구조
- 루트 디렉토리가 깔끔해짐
- 스크립트들이 `bin/` 폴더에 체계적으로 정리됨

### 2. 실행 위치 무관
```bash
# 어디서든 실행 가능
cd /home/jynius/projects/WebApp/DailyMeal
./bin/deploy.sh  # ✅ 작동

cd /tmp
/home/jynius/projects/WebApp/DailyMeal/bin/deploy.sh  # ✅ 작동

cd /home/jynius/projects/WebApp/DailyMeal/backend
../bin/deploy.sh  # ✅ 작동
```

### 3. package.json 스크립트 유지
```bash
# 기존처럼 npm scripts 사용 가능
npm run dev:pm2   # ✅ 작동
npm run deploy    # ✅ 작동
npm run stop      # ✅ 작동
```

### 4. 일관성 있는 로그
모든 스크립트가 프로젝트 루트를 출력:
```
📂 프로젝트 루트: /home/jynius/projects/WebApp/DailyMeal
```

---

## 📝 사용 방법

### 직접 실행
```bash
# 프로젝트 루트에서
./bin/deploy.sh
./bin/start-pm2.sh
./bin/stop-pm2.sh all

# 다른 위치에서
/path/to/DailyMeal/bin/deploy.sh
```

### npm scripts 사용 (권장)
```bash
npm run deploy      # 배포
npm run dev:pm2     # PM2 개발 서버
npm run setup       # 개발 환경 설정
npm run stop        # PM2 중지
npm run stop:dev    # 개발 서버만 중지
npm run stop:prod   # 프로덕션만 중지
```

### 상태 확인
```bash
./bin/check-status.sh     # PM2 상태 진단
./bin/check-build.sh      # 빌드 파일 확인
./bin/check-firewall.sh   # Linux 방화벽 확인
```

### Windows 개발자 (PowerShell)

**WSL2 환경에서 개발하는 경우**, Windows 호스트에서 실행:

```powershell
# Windows PowerShell (관리자 권한)
cd C:\path\to\DailyMeal

# WSL2 포트 포워딩 자동 설정
.\bin\wsl-port-forward.ps1

# 방화벽 규칙 및 포트 상태 확인
.\bin\check-firewall-windows.ps1
```

**PowerShell 스크립트 설명:**
- `wsl-port-forward.ps1`: WSL2 IP를 자동 감지하여 포트 3000, 8000 포워딩 설정
- `check-firewall-windows.ps1`: Windows 방화벽 규칙 및 포트 연결 상태 확인

**참고**: 이 스크립트들은 Windows 호스트에서만 실행되며, Linux/macOS 개발자는 필요하지 않습니다.
./bin/check-build.sh      # 빌드 상태 확인
./bin/check-firewall.sh   # 방화벽 상태 확인
```

---

## 🔧 기술적 세부사항

### 경로 탐지 메커니즘

```bash
# 1. 스크립트 자신의 위치 파악
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 결과: /home/jynius/projects/WebApp/DailyMeal/bin

# 2. 프로젝트 루트 계산 (상위 디렉토리)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# 결과: /home/jynius/projects/WebApp/DailyMeal

# 3. 프로젝트 루트로 이동
cd "$PROJECT_ROOT"
```

### 상대 경로 처리

모든 스크립트는 프로젝트 루트를 기준으로 작성:
```bash
cd "$PROJECT_ROOT"

# 이제 모든 경로가 루트 기준
cd ./backend
cd ./frontend
./ecosystem.config.js
./ecosystem.dev.config.js
```

---

## ✅ 테스트 결과

### 1. Bash 스크립트 테스트

**check-status.sh 테스트:**
```bash
$ ./bin/check-status.sh
🔍 DailyMeal PM2 상태 진단 시작...
📂 프로젝트 루트: /home/jynius/projects/WebApp/DailyMeal
================================
✅ 정상 작동
```

**npm scripts 테스트:**
```bash
$ npm run dev:pm2
> ./bin/start-pm2.sh
🔧 DailyMeal 로컬 개발 서버 시작 (PM2)...
📂 프로젝트 루트: /home/jynius/projects/WebApp/DailyMeal
✅ 정상 작동
```

**다른 위치에서 실행 테스트:**
```bash
$ cd /tmp
$ /home/jynius/projects/WebApp/DailyMeal/bin/check-status.sh
📂 프로젝트 루트: /home/jynius/projects/WebApp/DailyMeal
✅ 정상 작동
```

### 2. PowerShell 스크립트 이동

**이동된 파일:**
- `wsl-port-forward.ps1` → `bin/wsl-port-forward.ps1`
- `check-firewall-windows.ps1` → `bin/check-firewall-windows.ps1`

**경로 독립성:**
- PowerShell 스크립트는 파일 시스템 경로에 의존하지 않음 (네트워크 설정만 수행)
- 경로 자동 탐지 코드 불필요
- Windows 호스트에서만 실행

---

## 🎯 스크립트 분류 및 사용 시나리오

### Linux/macOS/WSL2 개발자

**필요한 스크립트:**
```bash
./bin/check-build.sh          # 빌드 확인
./bin/check-firewall.sh       # Linux 방화벽 확인
./bin/check-status.sh         # PM2 상태
./bin/deploy.sh               # 배포
./bin/dev-setup.sh            # 개발 환경 설정
./bin/restart-pm2.sh          # 재시작
./bin/start-pm2.sh            # 개발 서버 시작
./bin/startup.sh              # 프로덕션 시작
./bin/stop-pm2.sh             # 중지
```

### Windows + WSL2 개발자

**WSL2 내부에서 (Bash):**
```bash
# 위 모든 Bash 스크립트 사용 가능
./bin/start-pm2.sh
./bin/check-status.sh
```

**Windows 호스트에서 (PowerShell):**
```powershell
# 네트워크 설정 스크립트만 필요
.\bin\wsl-port-forward.ps1          # 포트 포워딩
.\bin\check-firewall-windows.ps1    # 방화벽 확인
```

### 프로덕션 서버 (Linux)

**필요한 스크립트:**
```bash
./bin/deploy.sh               # 자동 배포
./bin/startup.sh              # 서버 시작
./bin/restart-pm2.sh          # 재시작
./bin/check-status.sh         # 상태 확인
./bin/check-firewall.sh       # 방화벽 확인
```

---

## 📚 관련 문서 업데이트

다음 문서들을 업데이트했습니다:

- [x] `README.md` - 스크립트 목록 및 Windows 섹션 추가
- [ ] `docs/BUILD_DEPLOY_GUIDE.md` - 배포 명령어 (필요시)
- [ ] `docs/PM2_SCRIPT_GUIDE.md` - PM2 스크립트 사용법 (필요시)

---

## 🎉 결론

### 완료된 작업
✅ 9개 Bash 스크립트를 `bin/` 폴더로 이동
✅ 2개 PowerShell 스크립트를 `bin/` 폴더로 이동
✅ 모든 Bash 스크립트에 경로 자동 탐지 추가
✅ `package.json` 경로 업데이트
✅ 실행 권한 부여 (`chmod +x`)
✅ 테스트 완료
✅ `README.md` 업데이트 (Windows 개발자 섹션 추가)

### 개선 효과
- 📁 프로젝트 루트가 깔끔해짐 (11개 스크립트 파일 → bin/ 폴더로 이동)
- 🔧 Bash 스크립트는 어디서든 실행 가능
- 🪟 PowerShell 스크립트는 Windows 전용임을 명확히 구분
- 📋 일관된 디렉토리 구조
- 🎯 관습적인 `bin/` 폴더 사용 (다중 플랫폼 스크립트 포함)

### 플랫폼별 사용 가이드
- **Linux/macOS 개발자**: Bash 스크립트 9개 사용
- **WSL2 개발자**: WSL2 내부에서 Bash 9개, Windows 호스트에서 PowerShell 2개
- **프로덕션 서버**: Bash 스크립트만 사용

### 주의사항
- PowerShell 스크립트는 Linux/macOS 환경에서 사용 불가 (Windows 전용)
- CI/CD 파이프라인에서 스크립트 경로 확인 필요
- WSL2 포트 포워딩은 Windows 재부팅 시 다시 설정 필요

---

**최종 업데이트**: 2025-10-08 (PowerShell 스크립트 추가)
**작성자**: GitHub Copilot
**검토 상태**: ✅ 완료
