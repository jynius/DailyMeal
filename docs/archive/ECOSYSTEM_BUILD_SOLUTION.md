# ecosystem.config.js 빌드 문제 해결 가이드

## 🚨 **문제 분석**

### **ecosystem.dev.config.js (개발) - 문제 없음** ✅
```javascript
{
  script: 'npm',
  args: 'run dev',  // npm run dev → Next.js Dev Server
}
```
- ✅ 빌드 없이 즉시 시작
- ✅ TypeScript 실시간 컴파일
- ✅ Hot Reload
- **빌드와 무관함!**

---

### **ecosystem.config.js (프로덕션) - 빌드 기회 없음!** ❌
```javascript
{
  script: 'npm',
  args: 'run start',  // npm run start → 빌드된 파일 실행
}
```
- ❌ `npm run start`는 빌드하지 않음
- ❌ `.next/` 폴더가 있어야 함
- ❌ **빌드 기회가 없음!**

**결과:**
```bash
pm2 start ecosystem.config.js
# → Error: Could not find a production build
```

---

## ✅ **해결 방법 3가지**

### **방법 1: 수동 빌드 (현재 권장)** ⭐⭐⭐

#### **장점**
- ✅ 명확하고 제어 가능
- ✅ 빌드 실패 시 PM2 시작 안 함
- ✅ 빌드 시간 확인 가능
- ✅ CI/CD 파이프라인과 잘 맞음

#### **단점**
- ⚠️ 두 단계로 나뉨 (빌드 → 시작)

#### **사용법**
```bash
# 방법 A: 각각 실행
cd frontend && npm run build
cd ../backend && npm run build
cd ..
pm2 start ecosystem.config.js

# 방법 B: 배포 스크립트 사용
./deploy.sh
```

#### **ecosystem.config.js (변경 불필요)**
```javascript
{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start',  // ← 그대로 유지
  // 사전 빌드 필수!
}
```

---

### **방법 2: start:hybrid 사용** ⭐⭐

#### **장점**
- ✅ 한 번에 빌드 + 시작
- ✅ 설정 간단

#### **단점**
- ❌ PM2 재시작할 때마다 빌드 (느림!)
- ❌ 코드 변경 없어도 매번 빌드
- ❌ 불필요한 다운타임

#### **ecosystem.config.js 수정**
```javascript
{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start:hybrid',  // ← build && start
  cwd: './frontend',
}
```

#### **사용법**
```bash
# 빌드 + 시작이 자동으로 됨
pm2 start ecosystem.config.js

# 하지만 재시작할 때도 빌드함 (느림!)
pm2 restart dailymeal-frontend  # ← 30초~1분 소요
```

---

### **방법 3: 별도 빌드 스크립트 + PM2** ⭐⭐⭐⭐

#### **장점**
- ✅ 빌드와 실행 명확히 분리
- ✅ 빌드 실패 시 배포 중단
- ✅ 빌드 한 번, PM2는 계속 재시작 가능
- ✅ 가장 전문적인 방법

#### **단점**
- ⚠️ 스크립트 작성 필요 (이미 있음!)

#### **deploy.sh (이미 존재)**
```bash
#!/bin/bash
set -e  # 에러 시 중단

# 1. 빌드
cd frontend && npm run build
cd ../backend && npm run build

# 2. PM2 시작/재시작
cd ..
if pm2 list | grep -q "dailymeal"; then
    pm2 restart ecosystem.config.js
else
    pm2 start ecosystem.config.js
fi

pm2 save
```

#### **ecosystem.config.js (변경 불필요)**
```javascript
{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start',  // ← 그대로 유지
}
```

#### **사용법**
```bash
# 한 번에 처리
./deploy.sh
```

---

## 📊 **방법 비교**

| 방법 | 빌드 타이밍 | PM2 재시작 속도 | 복잡도 | 권장도 |
|------|------------|----------------|--------|--------|
| **수동 빌드** | 수동 (사전) | ⚡ 빠름 (0.5초) | 낮음 | ⭐⭐⭐ |
| **start:hybrid** | 자동 (매번) | 🐌 느림 (30초~1분) | 매우 낮음 | ⭐⭐ |
| **배포 스크립트** | 자동 (1회) | ⚡ 빠름 (0.5초) | 중간 | ⭐⭐⭐⭐ |

---

## 🎯 **최종 권장: 방법 3 (배포 스크립트)**

### **이유**
1. **빌드는 배포 시 1회만**
   - 코드 변경 시에만 빌드
   - PM2 재시작은 빠름

2. **명확한 프로세스**
   ```
   코드 변경
     ↓
   git pull
     ↓
   ./deploy.sh (빌드 + PM2 재시작)
     ↓
   완료
   ```

3. **실패 시 안전**
   - 빌드 실패 → PM2 시작 안 함
   - 기존 서비스 계속 실행

4. **재시작 빠름**
   ```bash
   # 코드 변경 없이 재시작 (설정 변경 등)
   pm2 restart dailymeal-frontend  # ← 빠름 (빌드 안 함)
   ```

---

## 🚀 **실제 사용 시나리오**

### **시나리오 1: 초기 배포**
```bash
# EC2 접속
ssh ec2-user@43.202.215.27
cd DailyMeal

# 저장소 클론 및 의존성 설치
git clone ...
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 빌드 + PM2 시작
./deploy.sh

# 확인
pm2 list
curl http://localhost:3000
```

---

### **시나리오 2: 코드 업데이트**
```bash
# EC2 접속
cd DailyMeal

# 코드 업데이트
git pull origin main

# 의존성 업데이트 (필요 시)
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 재빌드 + PM2 재시작
./deploy.sh
```

---

### **시나리오 3: 환경변수만 변경**
```bash
# ecosystem.config.js 수정
nano ecosystem.config.js

# PM2 재시작만 (빌드 안 함!)
pm2 restart ecosystem.config.js

# 빠름! (0.5초)
```

---

### **시나리오 4: 긴급 재시작**
```bash
# 빌드 없이 빠른 재시작
pm2 restart dailymeal-frontend  # ← 0.5초
pm2 restart dailymeal-backend   # ← 0.5초
```

---

## 🔧 **deploy.sh 개선 버전**

```bash
#!/bin/bash
# DailyMeal 배포 스크립트

set -e  # 에러 시 중단

echo "🚀 DailyMeal Deployment"
echo "======================"

# 빌드 확인 함수
check_build_required() {
    local dir=$1
    local build_dir=$2
    
    if [ ! -d "$dir/$build_dir" ]; then
        return 0  # 빌드 필요
    fi
    
    # 소스 파일이 빌드보다 최신인지 확인
    if [ -n "$(find $dir/src -newer $dir/$build_dir -print -quit 2>/dev/null)" ]; then
        return 0  # 빌드 필요
    fi
    
    return 1  # 빌드 불필요
}

# Frontend 빌드
echo ""
if check_build_required "frontend" ".next"; then
    echo "🔨 Building Frontend..."
    cd frontend
    npm run build
    cd ..
else
    echo "✅ Frontend build is up to date"
fi

# Backend 빌드
echo ""
if check_build_required "backend" "dist"; then
    echo "🔨 Building Backend..."
    cd backend
    npm run build
    cd ..
else
    echo "✅ Backend build is up to date"
fi

# PM2 시작/재시작
echo ""
echo "🚀 Starting/Restarting PM2..."

if pm2 list | grep -q "dailymeal"; then
    echo "♻️  Restarting..."
    pm2 restart ecosystem.config.js
else
    echo "🆕 Starting..."
    pm2 start ecosystem.config.js
fi

pm2 save

echo ""
echo "✅ Deployment Complete!"
pm2 list
```

---

## 📝 **ecosystem.config.js는 그대로 유지**

```javascript
module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'dist/main.js',  // ← 그대로
      // ... 설정
    },
    {
      name: 'dailymeal-frontend',
      script: 'npm',
      args: 'run start',  // ← 그대로 (start:hybrid 아님!)
      // ... 설정
    }
  ]
};
```

**변경하지 마세요!** 빌드는 `deploy.sh`에서 처리합니다.

---

## ✅ **체크리스트**

### **초기 설정**
- [ ] `deploy.sh` 실행 권한 부여
  ```bash
  chmod +x deploy.sh
  ```

### **배포 프로세스**
- [ ] 코드 변경 후 `git pull`
- [ ] `./deploy.sh` 실행
- [ ] `pm2 list`로 상태 확인
- [ ] 웹사이트 접속 테스트

### **일상 운영**
- [ ] 코드 변경 시: `./deploy.sh`
- [ ] 환경변수 변경 시: `pm2 restart ecosystem.config.js`
- [ ] 긴급 재시작: `pm2 restart all`

---

## 🎉 **결론**

### **당신의 분석이 정확합니다!**
- ✅ `ecosystem.dev.config.js` → 빌드 무관
- ✅ `ecosystem.config.js` → **빌드 기회 없음**

### **해결책**
- ⭐⭐⭐⭐ **배포 스크립트** (`deploy.sh`)
  - 빌드 1회
  - PM2는 빌드된 파일만 실행
  - 재시작 빠름

### **ecosystem.config.js는 변경하지 마세요!**
- `args: 'run start'` 유지
- 빌드는 `deploy.sh`에서 처리

**이제 완벽한 배포 프로세스를 갖추셨습니다!** 🎉
