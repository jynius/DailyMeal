# Next.js Build & Deploy 가이드

## 🎯 **핵심 요약**

**`npm run start`는 빌드하지 않습니다!**

프로덕션 배포 전에 **반드시 `npm run build`를 먼저 실행**해야 합니다.

---

## 📦 **Next.js 명령어 이해**

### **개발 vs 프로덕션**

| 명령어 | 용도 | 빌드 | 최적화 | HMR | 속도 |
|--------|------|------|--------|-----|------|
| `npm run dev` | 개발 | ❌ 실시간 | ❌ | ✅ | 🐌 느림 |
| `npm run build` | 빌드만 | ✅ 사전 | ✅ | ❌ | - |
| `npm run start` | 프로덕션 | ❌ 필요 | ✅ | ❌ | ⚡ 빠름 |

---

## 🔄 **Next.js 라이프사이클**

### **개발 환경 (WSL2)**
```
npm run dev
  ↓
Next.js Dev Server 시작
  ↓ (실시간)
TypeScript/JSX 컴파일
  ↓
브라우저에 전송
  ↓ (파일 변경 시)
자동 재컴파일 (HMR)
```

### **프로덕션 환경 (EC2)**
```
1. npm run build
  ↓
TypeScript → JavaScript
JSX → React.createElement
코드 최적화 (Minify)
번들링 & Tree Shaking
정적 페이지 생성 (SSG)
  ↓
.next/ 폴더 생성
  
2. npm run start
  ↓
.next/ 폴더 읽기
  ↓
최적화된 서버 시작
  ↓
빠른 응답 (Pre-built)
```

---

## 🚨 **현재 ecosystem.config.js 문제**

### **문제점**
```javascript
{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start',  // ← 빌드 없이 시작
}
```

**PM2 실행 시:**
```bash
pm2 start ecosystem.config.js

# 에러 발생!
Error: Could not find a production build in the '.next' directory.
Try building your app with 'next build' before starting the production server.
```

### **원인**
- `.next/` 폴더가 없음
- 빌드를 먼저 실행하지 않음

---

## ✅ **올바른 배포 프로세스**

### **방법 1: 수동 빌드 (권장)** ⭐

#### **단계별 실행**
```bash
# 1. 프론트엔드 빌드
cd /home/jynius/projects/WebApp/DailyMeal/frontend
npm run build

# 2. 백엔드 빌드
cd ../backend
npm run build

# 3. PM2 시작
cd ..
pm2 start ecosystem.config.js

# 4. 확인
pm2 list
pm2 logs dailymeal-frontend
```

#### **빌드 출력 (성공 시)**
```
Route (app)                              Size     First Load JS
┌ ○ /                                   165 B          87.3 kB
├ ○ /add                                142 B          87.3 kB
├ ○ /feed                               142 B          87.3 kB
└ ○ /profile                            142 B          87.3 kB
+ First Load JS shared by all           87.2 kB
  ├ chunks/framework-[hash].js          45.0 kB
  ├ chunks/main-[hash].js               27.5 kB
  └ other shared chunks                 14.7 kB

○  (Static)  prerendered as static content
```

---

### **방법 2: 배포 스크립트 사용**

#### **deploy.sh**
```bash
#!/bin/bash
set -e  # 에러 시 중단

echo "🚀 DailyMeal Deployment Script"
echo "================================"

# 프론트엔드 빌드
echo ""
echo "🔨 Building Frontend..."
cd frontend
npm run build

# 백엔드 빌드
echo ""
echo "🔨 Building Backend..."
cd ../backend
npm run build

# PM2 시작/재시작
echo ""
echo "🚀 Starting/Restarting PM2..."
cd ..

if pm2 list | grep -q "dailymeal"; then
    echo "♻️  Restarting existing processes..."
    pm2 restart ecosystem.config.js
else
    echo "🆕 Starting new processes..."
    pm2 start ecosystem.config.js
fi

# 저장 및 확인
pm2 save
echo ""
echo "✅ Deployment Complete!"
pm2 list
```

#### **사용법**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### **방법 3: 빌드 확인 스크립트**

**check-build.sh** (이미 생성됨)
```bash
./check-build.sh
```

**동작:**
1. `.next/` 폴더 존재 확인
2. 없으면 자동 빌드
3. 있으면 재빌드 여부 확인
4. 백엔드 빌드 확인
5. PM2 시작

---

## 📁 **빌드 결과 구조**

### **Frontend (.next/)**
```
frontend/.next/
├── BUILD_ID              # 빌드 ID
├── cache/                # 캐시
├── server/               # 서버 사이드 코드
│   ├── app/              # App Router 페이지
│   │   ├── page.js
│   │   ├── add/
│   │   └── feed/
│   └── chunks/           # 공유 청크
├── static/               # 정적 파일
│   ├── chunks/
│   ├── css/
│   └── media/
└── standalone/           # (optional) 독립 실행 파일
```

### **Backend (dist/)**
```
backend/dist/
├── main.js               # 엔트리 포인트
├── app.module.js
├── app.controller.js
├── auth/
├── meal-records/
└── restaurants/
```

---

## 🔄 **코드 변경 시 배포**

### **프론트엔드 변경**
```bash
cd frontend
npm run build          # 새로 빌드
pm2 restart dailymeal-frontend
pm2 logs dailymeal-frontend  # 확인
```

### **백엔드 변경**
```bash
cd backend
npm run build          # 새로 빌드
pm2 restart dailymeal-backend
pm2 logs dailymeal-backend  # 확인
```

### **둘 다 변경**
```bash
./deploy.sh  # 배포 스크립트 사용
```

---

## ⚙️ **ecosystem.config.js 최적화**

### **현재 (변경 불필요)**
```javascript
{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start',  // ✅ 올바름
  // 사전 빌드 필수!
}
```

### **대안 1: start:hybrid (비추천)**
```javascript
{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start:hybrid',  // build && start
  // ❌ PM2 재시작할 때마다 빌드 (느림)
}
```

### **대안 2: 빌드 스크립트 별도 실행 (권장)**
```bash
# 빌드는 배포 스크립트에서
./deploy.sh

# PM2는 빌드된 파일만 실행
pm2 start ecosystem.config.js
```

---

## 📊 **빌드 시간 비교**

| 프로젝트 | 빌드 시간 | 시작 시간 |
|---------|----------|----------|
| **Frontend (dev)** | 0초 (즉시) | 3-5초 |
| **Frontend (build)** | 30-60초 | 0.5초 |
| **Backend (dev)** | 0초 (즉시) | 3-5초 |
| **Backend (build)** | 10-20초 | 0.5초 |

**결론:** 빌드는 느리지만, 실행은 매우 빠름!

---

## 🚀 **EC2 배포 워크플로우**

### **초기 배포**
```bash
# EC2 접속
ssh ec2-user@43.202.215.27

# 저장소 클론
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal

# 의존성 설치
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 빌드
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# PM2 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **업데이트 배포**
```bash
# EC2 접속
ssh ec2-user@43.202.215.27
cd DailyMeal

# 코드 업데이트
git pull origin main

# 의존성 업데이트 (필요 시)
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 빌드 & 재시작
./deploy.sh
```

---

## ✅ **체크리스트**

### **배포 전**
- [ ] 코드 변경사항 커밋
- [ ] Git push 완료
- [ ] EC2 접속 가능

### **빌드**
- [ ] `cd frontend && npm run build` 성공
- [ ] `cd backend && npm run build` 성공
- [ ] `.next/` 폴더 생성 확인
- [ ] `dist/` 폴더 생성 확인

### **PM2 시작**
- [ ] `pm2 start ecosystem.config.js` 성공
- [ ] `pm2 list` - 모두 online 상태
- [ ] `pm2 logs` - 에러 없음

### **테스트**
- [ ] `curl http://localhost:3000` 응답 확인
- [ ] `curl http://localhost:8000/api-docs` 응답 확인
- [ ] 외부에서 웹사이트 접속 테스트
- [ ] API 호출 테스트

---

## 🐛 **문제 해결**

### **에러: Could not find a production build**
```bash
Error: Could not find a production build in the '.next' directory.
```

**해결:**
```bash
cd frontend
npm run build
pm2 restart dailymeal-frontend
```

---

### **에러: Module not found**
```bash
Error: Cannot find module 'xxx'
```

**해결:**
```bash
cd frontend  # 또는 backend
npm install
npm run build
pm2 restart dailymeal-frontend
```

---

### **에러: Port already in use**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**해결:**
```bash
pm2 delete dailymeal-frontend
pm2 start ecosystem.config.js
```

---

## 📚 **참고 명령어**

### **빌드 관련**
```bash
# 프론트엔드 빌드
cd frontend && npm run build

# 백엔드 빌드
cd backend && npm run build

# 빌드 결과 확인
ls -la frontend/.next
ls -la backend/dist

# 빌드 캐시 삭제
rm -rf frontend/.next
rm -rf backend/dist
```

### **PM2 관련**
```bash
# 시작
pm2 start ecosystem.config.js

# 재시작
pm2 restart dailymeal-frontend
pm2 restart dailymeal-backend

# 중지
pm2 stop dailymeal-frontend

# 삭제
pm2 delete dailymeal-frontend

# 로그
pm2 logs dailymeal-frontend --lines 100

# 모니터링
pm2 monit
```

---

## 🎉 **최종 정리**

### **핵심 원칙**
1. **개발**: `npm run dev` (빌드 불필요)
2. **프로덕션**: `npm run build` → `npm run start`
3. **PM2**: 빌드된 파일만 실행

### **배포 순서**
```
1. npm run build (Frontend)
   ↓
2. npm run build (Backend)
   ↓
3. pm2 start ecosystem.config.js
   ↓
4. 테스트 및 확인
```

### **편의 스크립트**
```bash
# 한 번에 처리
./deploy.sh

# 또는 빌드 확인 후 처리
./check-build.sh
```

**이제 올바른 빌드 프로세스를 이해하셨습니다!** ✅
