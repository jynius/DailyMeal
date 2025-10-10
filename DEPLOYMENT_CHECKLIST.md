# 🚀 DailyMeal 배포 체크리스트

## 📋 수정 사항

### ✅ 완료된 작업

1. **환경 변수 설정**
   - ✅ `frontend/.env.production` 생성
   - ✅ `frontend/.env.production.example` 생성 (Git 포함)
   - ✅ `ecosystem.config.js` 정리 (불필요한 NEXT_PUBLIC_* 제거)
   - ✅ `bin/deploy.sh` 수정 (.env.production 체크 로직 추가)

2. **회원가입 버그 수정**
   - ✅ `backend/src/auth/auth.service.ts`: UserSettings 초기화 추가
   - ✅ `backend/src/auth/auth.module.ts`: UserSettings import 추가
   - **문제**: 회원가입 시 UserSettings 미생성 → /profile 페이지 401 오류
   - **해결**: 회원가입 시 UserSettings 자동 생성

3. **HTTPS 인증서 설정 준비**
   - ✅ `bin/setup-caddy.sh` 생성
   - ✅ `docs/CADDY_SETUP_GUIDE.md` 생성
   - ✅ `docs/APP_HTTPS_SETUP.md` 생성

4. **기타**
   - ✅ `docs/ENV_PRODUCTION_GUIDE.md` 생성
   - ✅ `.bak` 파일 삭제
   - ✅ `docs/FILE_CLEANUP_REPORT.md` 생성

---

## 🔄 배포 순서

### 1단계: Git Commit (로컬)

```bash
cd /home/jynius/projects/WebApp/DailyMeal

# 변경 사항 확인
git status

# 파일 추가
git add .

# 커밋
git commit -m "fix: 회원가입 시 UserSettings 초기화 추가 및 환경 변수 설정 개선

- 회원가입 시 UserSettings 자동 생성 (프로필 페이지 오류 수정)
- frontend/.env.production.example 추가
- ecosystem.config.js 정리 (NEXT_PUBLIC_* 제거)
- Caddy 설치 스크립트 및 가이드 추가
- deploy.sh .env.production 체크 로직 추가
- 불필요한 .bak 파일 삭제"

# 푸시
git push origin main
```

---

### 2단계: 서버 배포

```bash
# SSH 접속
ssh ubuntu@www.dailymeal.life

# 프로젝트 디렉토리로 이동
cd ~/DailyMeal

# Git pull
git pull origin main

# .env.production 파일이 없으면 생성
if [ ! -f frontend/.env.production ]; then
    cp frontend/.env.production.example frontend/.env.production
    vi frontend/.env.production  # 실제 키 입력
fi

# 배포 (빌드 + PM2 재시작)
./bin/deploy.sh
```

**예상 시간:** 5-10분

---

### 3단계: Caddy 설치 (서버)

```bash
# 서버에서 계속
cd ~/DailyMeal

# Caddy 설치 및 설정
./bin/setup-caddy.sh
```

**중요:**
- AWS 보안 그룹에서 80, 443 포트 열려있는지 확인
- Let's Encrypt 인증서 발급까지 1-2분 소요

**확인:**
```bash
# Caddy 상태
sudo systemctl status caddy

# HTTPS 테스트
curl -I https://www.dailymeal.life

# 인증서 확인
openssl s_client -connect www.dailymeal.life:443
```

---

### 4단계: 앱 재빌드 (로컬)

```bash
# 로컬에서
cd /home/jynius/projects/WebApp/DailyMeal/app

# 앱 재빌드 (HTTPS 인증서 적용)
eas build --platform android --profile preview
```

**예상 시간:** 15-20분

**빌드 완료 후:**
1. APK 다운로드
2. 앱 설치
3. 공유 링크 테스트
4. **SSL 오류 없이 실행 확인** ✅

---

## ✅ 테스트 체크리스트

### 백엔드 테스트
- [ ] 서버 정상 실행 (pm2 list)
- [ ] API 응답 확인 (curl https://...)
- [ ] **새로 회원가입 후 /profile 접근 → 정상 동작** ⭐

### 프론트엔드 테스트
- [ ] 웹 브라우저에서 HTTPS 접속
- [ ] 로그인/회원가입
- [ ] 프로필 페이지 정상 표시
- [ ] 식사 기록 추가/수정/삭제
- [ ] 카카오 지도 표시 (API 키 적용 확인)

### 앱 테스트
- [ ] APK 다운로드 및 설치
- [ ] 앱 실행 (SSL 오류 없음)
- [ ] 공유 링크 → 앱 열림 (Deep Link)
- [ ] 모든 기능 정상 동작

---

## 🐛 예상 문제 및 해결

### 1. Let's Encrypt 인증서 발급 실패

**증상:**
```
failed to get certificate
challenge failed
```

**해결:**
```bash
# AWS 보안 그룹 확인 (80, 443 포트)
# 방화벽 확인
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Caddy 로그 확인
sudo journalctl -u caddy -f
```

### 2. 프로필 페이지 401 오류 (기존 사용자)

**원인:** 기존 사용자는 UserSettings가 없음

**해결:** 기존 사용자용 마이그레이션 스크립트 실행 (필요시)

### 3. 카카오 지도 표시 안 됨

**원인:** .env.production에 KAKAO_API_KEY 누락

**해결:**
```bash
# 서버에서
vi ~/DailyMeal/frontend/.env.production
# NEXT_PUBLIC_KAKAO_API_KEY=197d152438e3a21af616caac12a6db11 추가

# 재빌드
cd ~/DailyMeal
./bin/deploy.sh
```

---

## 📊 배포 상태

| 단계 | 상태 | 비고 |
|------|------|------|
| Git Commit | ⏳ 대기 | 로컬에서 실행 |
| 서버 배포 | ⏳ 대기 | Git pull + deploy.sh |
| Caddy 설치 | ⏳ 대기 | HTTPS 인증서 |
| 앱 재빌드 | ⏳ 대기 | EAS build |
| 테스트 | ⏳ 대기 | 전체 기능 확인 |

---

**다음 단계:** Git commit 실행! 🚀
