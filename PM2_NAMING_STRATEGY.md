# PM2 프로세스 이름 전략

## 📋 **현재 전략**

### **문제점**
- `-dev` 접미사 사용 중
- 하지만 개발(WSL2)과 운영(EC2)이 물리적으로 분리됨
- 같은 포트 사용으로 동시 실행 불가능
- 이름 충돌 가능성 없음

### **해결 방안 3가지**

---

## ✅ **옵션 1: 이름 통일 (권장)** ⭐

### **WSL2 개발 환경**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',  // -dev 제거
      env: { NODE_ENV: 'development' }
    },
    {
      name: 'dailymeal-frontend',  // -dev 제거
      env: { NODE_ENV: 'development' }
    }
  ]
}
```

### **EC2 운영 환경**
```javascript
// ecosystem.config.js (동일)
module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'dailymeal-frontend',
      env: { NODE_ENV: 'production' }
    }
  ]
}
```

### **명령어**
```bash
# WSL2, EC2 모두 동일
pm2 start ecosystem.config.js
pm2 restart dailymeal-backend
pm2 logs dailymeal-backend
```

### **장점**
- ✅ 명령어 통일
- ✅ 설정 단순화
- ✅ 물리적 분리로 혼동 없음

---

## 🏢 **옵션 2: 환경 명시 (명확성)**

### **WSL2**
```javascript
name: 'dailymeal-backend-local'  // 로컬 환경
```

### **EC2**
```javascript
name: 'dailymeal-backend-prod'   // 프로덕션 환경
```

### **Staging 추가 시**
```javascript
name: 'dailymeal-backend-staging'
```

### **장점**
- ✅ 환경이 명확히 구분됨
- ✅ 다중 환경 확장 가능

---

## 📁 **옵션 3: 현재 유지**

### **WSL2**
```javascript
name: 'dailymeal-backend-dev'
```

### **EC2**
```javascript
name: 'dailymeal-backend'
```

### **장점**
- ✅ 현재 작동 중
- ✅ 변경 불필요

### **단점**
- ⚠️ `-dev` 접미사의 실질적 이점 없음
- ⚠️ 명령어 불일치

---

## 🎯 **최종 권장: 옵션 1**

**이유:**
- 개발/운영 서버 물리적 분리
- 같은 포트 사용 (동시 실행 불가능)
- 이름 통일로 명령어 일관성
- 단순하고 명확함

**적용 방법:**
1. WSL2에서 `ecosystem.dev.config.js` 삭제
2. `ecosystem.config.js`를 개발용으로 수정
3. PM2 명령어 단순화

**예외:**
- 나중에 같은 서버에서 개발/운영 동시 실행 필요 시
  → 옵션 2로 변경 (포트도 분리 필요)
