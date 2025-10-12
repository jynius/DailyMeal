# 프로덕션 배포 스크립트 정리 완료 ✅

## 📋 **정리 내역**

### 1️⃣ **배포 스크립트 통합**

#### **변경 전**
```
deploy.sh           (334줄, 복잡한 리소스 모니터링)
deploy-simple.sh    (60줄, 간단 명료)
```

#### **변경 후**
```
deploy.sh           (deploy-simple.sh로 교체) ✅
deploy.sh.backup    (기존 deploy.sh 백업)
```

#### **선택 이유**
- ✅ 간단하고 읽기 쉬움
- ✅ 핵심 기능만 포함 (빌드 + PM2 시작)
- ✅ 디버깅 용이
- ✅ 유지보수 편리

---

### 2️⃣ **package.json 스크립트 정리**

#### **frontend/package.json**

**제거된 스크립트:**
```json
"start:hybrid": "npm run build && npm run start"  ❌ 삭제됨
```

**이유:**
- ecosystem.config.js에서 사용하지 않음
- deploy.sh에서 빌드를 별도 처리
- PM2 재시작 시 불필요한 빌드 방지

**남은 스크립트:**
```json
{
  "dev": "npx next dev -H 0.0.0.0",      // 개발 서버
  "build": "npx next build",              // 프로덕션 빌드
  "start": "npx next start -H 0.0.0.0",  // 프로덕션 실행 (PM2용)
  "lint": "eslint"                        // 린트 검사
}
```

---

#### **루트 package.json**

**제거된 스크립트:**
```json
"start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",  ❌
"start:frontend": "cd frontend && npm start",                                   ❌
"start:backend": "cd backend && npm run start:prod"                             ❌
```

**이유:**
- PM2로 프로세스 관리 (ecosystem.config.js)
- concurrently 사용 불필요
- 개발은 `npm run dev` 또는 `npm run dev:pm2`
- 프로덕션은 `npm run deploy`

**남은 스크립트:**
```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",  // 개발 (로컬)
  "dev:pm2": "./start-pm2.sh",                    // 개발 (PM2)
  "dev:backend": "cd backend && npm run start:dev",
  "dev:frontend": "cd frontend && npm run dev",
  "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
  "build:all": "cd frontend && npm run build && cd ../backend && npm run build",
  "deploy": "./deploy.sh",                        // 프로덕션 배포 ⭐
  "setup": "./dev-setup.sh",
  "stop": "./stop-pm2.sh all",
  "stop:dev": "./stop-pm2.sh dev",
  "stop:prod": "./stop-pm2.sh prod",
  "lint:all": "cd frontend && npm run lint && cd ../backend && npm run lint"
}
```

---

## 🚀 **새로운 배포 프로세스**

### **deploy.sh 내용**
```bash
#!/bin/bash

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 DailyMeal 간단 배포 시작..."

# 1. 기존 PM2 프로세스 중지
pm2 stop all || true
pm2 delete all || true

# 2. 백엔드 의존성 설치 및 빌드
cd backend
npm install --production=false
npm run build
cd ..

# 3. 프론트엔드 의존성 설치 및 빌드
cd frontend
npm install --production=false

# 기존 .next 디렉토리 제거
rm -rf .next

# Next.js 빌드 실행
npm run build

# 빌드 결과 확인
if [ -d ".next" ]; then
    echo "✅ 프론트엔드 빌드 성공!"
else
    echo "❌ 프론트엔드 빌드 실패!"
    exit 1
fi
cd ..

# 4. PM2로 서비스 시작
pm2 start ecosystem.config.js

# 5. PM2 상태 확인
pm2 list
pm2 logs --lines 20

echo "✅ 배포 완료!"
```

---

## 📊 **사용 시나리오**

### **개발 환경**

#### **방법 1: Concurrently (터미널 직접 확인)**
```bash
npm run dev
# → Backend: http://localhost:8000
# → Frontend: http://localhost:3000
```

#### **방법 2: PM2 (백그라운드 실행)**
```bash
npm run dev:pm2
# 또는
./start-pm2.sh

# 로그 확인
pm2 logs

# 중지
npm run stop:dev
```

---

### **프로덕션 환경**

#### **초기 배포**
```bash
# EC2 접속
ssh ec2-user@43.202.215.27
cd DailyMeal

# 의존성 설치 (최초 1회)
npm run install:all

# 배포 (빌드 + PM2 시작)
npm run deploy
```

#### **코드 업데이트**
```bash
# EC2 접속
cd DailyMeal

# 코드 업데이트
git pull origin main

# 재배포 (재빌드 + PM2 재시작)
npm run deploy
```

#### **빠른 재시작 (환경변수 변경 등)**
```bash
# ecosystem.config.js 수정
nano ecosystem.config.js

# PM2만 재시작 (빌드 없음)
pm2 restart ecosystem.config.js
# 또는
pm2 restart all
```

---

## ✅ **체크리스트**

### **완료된 작업**
- [x] deploy-simple.sh → deploy.sh로 교체
- [x] 기존 deploy.sh를 deploy.sh.backup으로 백업
- [x] frontend/package.json에서 `start:hybrid` 제거
- [x] 루트 package.json에서 불필요한 `start*` 스크립트 제거
- [x] deploy.sh 실행 권한 부여 (`chmod +x`)

### **권장 후속 작업**
- [ ] EC2에서 배포 테스트
  ```bash
  ssh ec2-user@43.202.215.27
  cd DailyMeal
  git pull
  npm run deploy
  ```

- [ ] deploy.sh.backup 보관 또는 삭제 결정
  ```bash
  # 필요 없으면
  rm deploy.sh.backup
  
  # 또는 deprecated로 이동
  mv deploy.sh.backup deprecated/
  ```

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "chore: simplify deployment scripts and remove unused npm scripts"
  git push origin main
  ```

---

## 📖 **스크립트 참조표**

| 명령어 | 용도 | 환경 |
|--------|------|------|
| `npm run dev` | 개발 서버 시작 (Concurrently) | 개발 |
| `npm run dev:pm2` | 개발 서버 시작 (PM2) | 개발 |
| `npm run deploy` | 빌드 + PM2 시작/재시작 | 프로덕션 |
| `npm run build:all` | 수동 빌드만 실행 | 양쪽 |
| `npm run install:all` | 모든 의존성 설치 | 양쪽 |
| `npm run stop` | 모든 PM2 프로세스 중지 | 양쪽 |
| `npm run stop:dev` | 개발 PM2 프로세스 중지 | 개발 |
| `npm run stop:prod` | 프로덕션 PM2 프로세스 중지 | 프로덕션 |
| `pm2 restart all` | PM2 빠른 재시작 (빌드 없음) | 프로덕션 |

---

## 🎉 **정리 완료!**

### **변경 요약**
1. ✅ **배포 스크립트**: deploy-simple.sh → deploy.sh (간단하고 명확)
2. ✅ **Frontend**: `start:hybrid` 제거 (불필요)
3. ✅ **루트**: `start`, `start:frontend`, `start:backend` 제거 (PM2로 대체)

### **핵심 포인트**
- 🎯 **개발**: `npm run dev` 또는 `npm run dev:pm2`
- 🚀 **배포**: `npm run deploy` (빌드 포함)
- ⚡ **재시작**: `pm2 restart all` (빌드 제외)

**이제 프로덕션 배포 프로세스가 명확하고 간단해졌습니다!** 🎊
