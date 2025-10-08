# ecosystem.config.js 사용 가이드

## 🎯 **핵심 답변**

`ecosystem.config.js`는 **PM2 명령어**에서 사용하는 **설정 파일**입니다.

---

## 📋 **ecosystem.config.js란?**

### **정의**
PM2 프로세스 관리자의 **애플리케이션 설정 파일**

### **역할**
- 어떤 애플리케이션을 실행할지
- 어떤 명령어로 실행할지
- 어떤 환경변수를 사용할지
- 로그 파일 위치
- 재시작 정책
- 메모리 제한 등

---

## 🔧 **PM2란?**

### **Process Manager 2**
Node.js 애플리케이션을 **데몬(백그라운드)**으로 실행하고 관리하는 도구

### **주요 기능**
- ✅ 백그라운드 실행 (터미널 종료해도 계속 실행)
- ✅ 자동 재시작 (크래시 시)
- ✅ 로그 관리
- ✅ 클러스터 모드 (멀티 프로세스)
- ✅ 모니터링

---

## 📝 **사용 시점과 명령어**

### **1. 개발 환경 (WSL2)**

#### **방법 A: npm 스크립트**
```bash
# package.json의 dev:pm2 스크립트 실행
npm run dev:pm2

# 내부적으로 실행되는 것
./start-pm2.sh
  ↓
pm2 start ecosystem.dev.config.js  # ← 여기서 참조!
```

#### **방법 B: 직접 실행**
```bash
# PM2 명령어로 직접 시작
pm2 start ecosystem.dev.config.js  # ← 개발용 설정 파일

# 또는
pm2 start ecosystem.config.js      # ← 프로덕션용 설정 파일
```

---

### **2. 프로덕션 환경 (EC2)**

#### **방법 A: 배포 스크립트**
```bash
# 배포 스크립트 실행
./deploy.sh

# 내부에서 실행되는 것
npm run build (frontend, backend)
  ↓
pm2 start ecosystem.config.js      # ← 여기서 참조!
```

#### **방법 B: 직접 실행**
```bash
# 빌드 후
cd frontend && npm run build
cd ../backend && npm run build

# PM2 시작
pm2 start ecosystem.config.js      # ← 프로덕션용 설정 파일
```

---

## 🗂️ **설정 파일 종류**

### **ecosystem.dev.config.js (개발용)**
```javascript
{
  name: 'dailymeal-backend-dev',
  script: 'npm',
  args: 'run start:dev',  // TypeScript watch 모드
  watch: true,            // 파일 변경 감지
  env: {
    NODE_ENV: 'development',
    NEXT_PUBLIC_API_URL: 'http://localhost:8000'
  }
}
```

**사용:**
```bash
pm2 start ecosystem.dev.config.js
```

---

### **ecosystem.config.js (프로덕션용)**
```javascript
{
  name: 'dailymeal-backend',
  script: 'dist/main.js',  // 빌드된 파일 직접 실행
  watch: false,            // 파일 변경 감지 안 함
  env: {
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_URL: '/api'
  }
}
```

**사용:**
```bash
pm2 start ecosystem.config.js
```

---

## 🔄 **실행 흐름 상세**

### **개발 환경 시작**

```bash
# 명령어 입력
npm run dev:pm2

# 1. package.json 스크립트 실행
"dev:pm2": "./start-pm2.sh"

# 2. start-pm2.sh 실행
#!/bin/bash
cd backend && npm install
cd frontend && npm install
pm2 delete ecosystem.dev.config.js  # 기존 중지
pm2 start ecosystem.dev.config.js   # ← 여기서 참조!

# 3. PM2가 ecosystem.dev.config.js 읽기
{
  apps: [
    { name: 'dailymeal-backend-dev', ... },
    { name: 'dailymeal-frontend-dev', ... }
  ]
}

# 4. PM2가 각 앱 시작
pm2 → npm run start:dev (Backend)
pm2 → npm run dev (Frontend)

# 5. 백그라운드 실행
터미널 종료해도 계속 실행 ✅
```

---

### **프로덕션 배포**

```bash
# 명령어 입력 (EC2에서)
pm2 start ecosystem.config.js

# 1. PM2가 ecosystem.config.js 읽기
{
  apps: [
    { name: 'dailymeal-backend', script: 'dist/main.js', ... },
    { name: 'dailymeal-frontend', script: 'npm', args: 'run start', ... }
  ]
}

# 2. PM2가 각 앱 시작
pm2 → node dist/main.js (Backend)
pm2 → npm run start (Frontend)

# 3. 백그라운드 실행
SSH 연결 끊어도 계속 실행 ✅
```

---

## 📊 **PM2 주요 명령어**

### **시작/중지**
```bash
# 시작
pm2 start ecosystem.config.js
pm2 start ecosystem.dev.config.js

# 재시작
pm2 restart all                    # 모든 프로세스
pm2 restart dailymeal-backend      # 특정 프로세스

# 중지
pm2 stop all
pm2 stop dailymeal-backend

# 삭제
pm2 delete all
pm2 delete dailymeal-backend
```

### **상태 확인**
```bash
# 프로세스 목록
pm2 list

# 실시간 모니터링
pm2 monit

# 로그 확인
pm2 logs                           # 모든 로그
pm2 logs dailymeal-backend         # 특정 로그
pm2 logs --lines 100               # 마지막 100줄
```

### **저장/복원**
```bash
# 현재 프로세스 상태 저장
pm2 save

# 부팅 시 자동 시작 설정
pm2 startup
# → 출력된 명령어 복사해서 실행

# 저장된 프로세스 복원
pm2 resurrect
```

---

## 🎯 **실제 사용 시나리오**

### **시나리오 1: 로컬 개발 시작**

```bash
# WSL2에서
cd /home/jynius/projects/WebApp/DailyMeal

# 방법 1: npm 스크립트 (권장)
npm run dev:pm2

# 방법 2: 직접 실행
pm2 start ecosystem.dev.config.js

# 확인
pm2 list
pm2 logs

# 브라우저 접속
http://localhost:3000
```

---

### **시나리오 2: EC2 프로덕션 배포**

```bash
# EC2에 SSH 접속
ssh ec2-user@43.202.215.27

# 저장소 업데이트
cd DailyMeal
git pull origin main

# 빌드
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# PM2 시작 (ecosystem.config.js 참조!)
pm2 start ecosystem.config.js

# 또는 재시작 (이미 실행 중인 경우)
pm2 restart ecosystem.config.js

# 확인
pm2 list
pm2 logs

# 외부 접속 테스트
https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
```

---

### **시나리오 3: 업데이트 배포**

```bash
# EC2에서
cd DailyMeal

# 1. 코드 업데이트
git pull origin main

# 2. 의존성 업데이트 (필요 시)
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 3. 빌드
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# 4. PM2 재시작 (ecosystem.config.js 다시 읽음!)
pm2 restart ecosystem.config.js

# 또는 개별 재시작
pm2 restart dailymeal-backend
pm2 restart dailymeal-frontend
```

---

## 🔍 **ecosystem.config.js vs ecosystem.dev.config.js**

| 항목 | ecosystem.dev.config.js | ecosystem.config.js |
|------|-------------------------|---------------------|
| **환경** | 개발 (WSL2) | 프로덕션 (EC2) |
| **NODE_ENV** | development | production |
| **Backend Script** | `npm run start:dev` | `node dist/main.js` |
| **Frontend Script** | `npm run dev` | `npm run start` |
| **Watch 모드** | ✅ 활성화 | ❌ 비활성화 |
| **사전 빌드** | ❌ 불필요 | ✅ 필수 |
| **Hot Reload** | ✅ | ❌ |
| **프로세스 이름** | `-dev` 접미사 | 접미사 없음 |

---

## 📁 **파일 위치**

```
DailyMeal/
├── ecosystem.config.js          # ← 프로덕션용
├── ecosystem.dev.config.js      # ← 개발용
├── package.json                 # npm 스크립트
├── start-pm2.sh                 # 개발 서버 시작 스크립트
├── deploy.sh                    # 배포 스크립트
└── check-build.sh               # 빌드 확인 스크립트
```

**PM2 명령어는 현재 디렉토리에서 설정 파일을 찾습니다.**

---

## ⚙️ **설정 파일 구조**

```javascript
module.exports = {
  apps: [  // ← 여러 앱을 배열로 정의
    {
      // 앱 1: 백엔드
      name: 'dailymeal-backend',        // PM2 프로세스 이름
      script: 'dist/main.js',           // 실행할 파일/명령어
      cwd: './backend',                 // 작업 디렉토리
      env: {                            // 환경변수
        NODE_ENV: 'production',
        PORT: 8000
      },
      instances: 1,                     // 프로세스 개수
      exec_mode: 'fork',                // 실행 모드
      watch: false,                     // 파일 변경 감시
      max_memory_restart: '1G',         // 메모리 제한
      error_file: './logs/error.log',   // 에러 로그
      out_file: './logs/out.log',       // 출력 로그
      autorestart: true,                // 자동 재시작
      max_restarts: 10,                 // 최대 재시작 횟수
      min_uptime: '10s'                 // 최소 실행 시간
    },
    {
      // 앱 2: 프론트엔드
      name: 'dailymeal-frontend',
      script: 'npm',
      args: 'run start',
      cwd: './frontend',
      // ... 동일한 설정
    }
  ]
}
```

---

## 🎓 **핵심 정리**

### **언제?**
1. **개발**: `npm run dev:pm2` 실행 시
2. **프로덕션**: `pm2 start ecosystem.config.js` 실행 시
3. **배포**: `./deploy.sh` 실행 시 내부적으로 호출
4. **재시작**: `pm2 restart ecosystem.config.js` 실행 시

### **어떤 명령어?**
```bash
pm2 start ecosystem.config.js       # 시작
pm2 restart ecosystem.config.js     # 재시작
pm2 reload ecosystem.config.js      # 무중단 재시작
pm2 delete ecosystem.config.js      # 중지 및 삭제
```

### **무엇을 참조?**
- 실행할 앱 목록 (`apps` 배열)
- 각 앱의 설정
  - 이름, 스크립트, 경로
  - 환경변수
  - 로그 파일 위치
  - 재시작 정책

### **왜 필요?**
- ✅ 백그라운드 실행
- ✅ 자동 재시작
- ✅ 로그 관리
- ✅ 여러 앱 한 번에 관리
- ✅ 일관된 배포 프로세스

---

## 🎉 **최종 요약**

**`ecosystem.config.js`는:**
- PM2의 설정 파일
- `pm2 start ecosystem.config.js` 명령어로 참조
- 애플리케이션 실행 방법을 정의
- 개발/프로덕션 환경별로 다른 파일 사용

**실제 사용:**
```bash
# 개발 (WSL2)
npm run dev:pm2
# → pm2 start ecosystem.dev.config.js

# 프로덕션 (EC2)
pm2 start ecosystem.config.js
```

**이제 PM2와 ecosystem.config.js의 관계를 완벽히 이해하셨습니다!** ✅
