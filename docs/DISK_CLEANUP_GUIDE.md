# 디스크 용량 정리 가이드

## 🚨 현재 상황
- **디스크 사용률**: 100% (7GB 중 7GB 사용)
- **주요 용량 사용**: node_modules, snap, apt cache

---

## 🧹 즉시 정리 가능 (안전)

### 1. APT 캐시 정리 (약 200MB 확보)
```bash
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y
```

### 2. 저널 로그 정리 (약 50MB 확보)
```bash
# 7일 이상 된 로그 삭제
sudo journalctl --vacuum-time=7d
```

### 3. Snap 이전 버전 정리 (약 200-300MB 확보)
```bash
# Snap 이전 버전 제거 스크립트
sudo snap list --all | awk '/disabled/{print $1, $3}' | while read snapname revision; do
    sudo snap remove "$snapname" --revision="$revision"
done
```

### 4. npm 캐시 정리 (약 50-100MB 확보)
```bash
npm cache clean --force
```

---

## 🔍 프로젝트 정리 (선택적)

### Backend node_modules 재설치 (357MB → 약 300MB)
```bash
cd ~/DailyMeal/backend
rm -rf node_modules
npm install --production  # devDependencies 제외
```

### Frontend .next 캐시 정리 (빌드 후 재생성됨)
```bash
cd ~/DailyMeal/frontend
rm -rf .next/cache
```

### PM2 로그 정리
```bash
pm2 flush  # 모든 PM2 로그 삭제
```

---

## 📊 디스크 사용량 분석 명령어

### 전체 디렉토리 용량
```bash
du -sh /* 2>/dev/null | sort -hr | head -20
```

### 특정 디렉토리 상세 분석
```bash
# Home 디렉토리
du -sh /home/ubuntu/* 2>/dev/null | sort -hr

# 프로젝트 디렉토리
du -sh ~/DailyMeal/* 2>/dev/null | sort -hr

# 숨김 파일 포함
du -sh ~/DailyMeal/{*,.*} 2>/dev/null | sort -hr
```

### 큰 파일 찾기 (100MB 이상)
```bash
sudo find / -type f -size +100M 2>/dev/null | xargs ls -lh
```

---

## 🚀 권장 정리 스크립트

```bash
#!/bin/bash
# disk-cleanup.sh - 안전한 디스크 정리 스크립트

echo "🧹 디스크 정리 시작..."

# 1. APT 캐시 정리
echo "📦 APT 캐시 정리..."
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y

# 2. 저널 로그 정리 (7일 이상)
echo "📝 저널 로그 정리..."
sudo journalctl --vacuum-time=7d

# 3. Snap 이전 버전 정리
echo "📸 Snap 정리..."
sudo snap list --all | awk '/disabled/{print $1, $3}' | while read snapname revision; do
    sudo snap remove "$snapname" --revision="$revision" 2>/dev/null
done

# 4. npm 캐시 정리
echo "📦 npm 캐시 정리..."
npm cache clean --force

# 5. PM2 로그 정리
echo "📋 PM2 로그 정리..."
pm2 flush 2>/dev/null || true

# 6. 시스템 로그 압축
echo "🗜️  시스템 로그 압축..."
sudo find /var/log -type f -name "*.log" -size +10M -exec gzip {} \; 2>/dev/null

echo ""
echo "✅ 정리 완료!"
echo ""
echo "📊 디스크 사용량:"
df -h /
```

---

## ⚠️ 주의사항

### 삭제하면 안 되는 것들
- ❌ `node_modules` (프로덕션 실행 중)
- ❌ `.next` 빌드 폴더 (서비스 실행 중)
- ❌ `/var/lib/postgresql` (데이터베이스)
- ❌ `backend/uploads` (업로드된 이미지)

### 안전하게 삭제 가능
- ✅ `.next/cache` (재생성됨)
- ✅ `npm cache`
- ✅ 오래된 로그 파일
- ✅ APT 캐시
- ✅ Snap 이전 버전

---

## 🎯 장기 해결책

### 1. EBS 볼륨 확장 (AWS)
```bash
# AWS Console에서 볼륨 크기 증가 후:
sudo growpart /dev/nvme0n1 1
sudo resize2fs /dev/nvme0n1p1
```

### 2. Production 의존성만 설치
```bash
# package.json에서 devDependencies 분리
# 프로덕션에서는:
npm install --production
```

### 3. 로그 로테이션 설정
```bash
# /etc/logrotate.d/dailymeal
/home/ubuntu/DailyMeal/*/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### 4. PM2 로그 자동 정리
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dailymeal-backend',
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    // 로그 파일 크기 제한
    max_size: '10M',
    retain: 7  // 7일간 보관
  }]
}
```

---

## 📈 용량 확보 예상치

| 작업 | 예상 확보 용량 |
|------|---------------|
| APT 캐시 정리 | ~200MB |
| Snap 정리 | ~300MB |
| 저널 로그 정리 | ~50MB |
| npm 캐시 정리 | ~100MB |
| PM2 로그 정리 | ~50MB |
| **합계** | **~700MB** |

---

**작성일**: 2025-10-10
**상태**: 디스크 100% 사용 중
**권장**: 즉시 정리 필요
