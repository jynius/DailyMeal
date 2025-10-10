# 📋 프로덕션 환경 변수 설정 가이드

## 🚀 서버 배포 시 필요한 설정

### 1. `.env.production` 파일 생성

**첫 배포 시 한 번만 실행:**

```bash
# 서버에서
cd /home/jynius/projects/WebApp/DailyMeal/frontend

# example 파일 복사
cp .env.production.example .env.production

# 실제 값으로 수정
vi .env.production
```

### 2. `.env.production` 내용

```bash
# 프로덕션 환경 설정
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=https://www.dailymeal.life

# 카카오 API 설정 (실제 키로 변경)
NEXT_PUBLIC_KAKAO_API_KEY=197d152438e3a21af616caac12a6db11
```

---

## 🔐 환경 변수 관리 원칙

### Git에 포함되는 파일
- ✅ `.env.production.example` (템플릿)
- ✅ `.env.local.example` (템플릿)

### Git에 포함 안 되는 파일 (.gitignore)
- ❌ `.env`
- ❌ `.env.*` (except *.example)
- ❌ `.env.production` ← **서버에서 직접 생성**
- ❌ `.env.local` ← **로컬에서 직접 생성**

---

## 📦 배포 프로세스

### 초기 서버 설정 (1회)
```bash
# 1. Git clone
cd ~
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal

# 2. 환경 변수 파일 생성
cp frontend/.env.production.example frontend/.env.production
vi frontend/.env.production  # 실제 키 입력

# 3. 배포
./bin/deploy.sh
```

### 이후 배포 (업데이트)
```bash
# 1. Git pull
cd ~/DailyMeal
git pull origin main

# 2. 배포 (.env.production은 유지됨)
./bin/deploy.sh
```

---

## 🔧 환경 변수 종류

### Frontend (Next.js)
**빌드 시점:** `.env.production` 파일에서 로드
- `NEXT_PUBLIC_API_URL`: API 엔드포인트
- `NEXT_PUBLIC_SITE_URL`: 사이트 URL
- `NEXT_PUBLIC_KAKAO_API_KEY`: 카카오 JavaScript 키

**런타임:** `ecosystem.config.js`에서 로드
- `NODE_ENV`: 실행 모드
- `PORT`: 서버 포트

### Backend (NestJS)
**런타임:** `ecosystem.config.js`에서 로드
- `JWT_SECRET`: JWT 비밀키
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `ENCRYPTION_KEY`: 암호화 키
- 기타 백엔드 설정

---

## 🛠️ 문제 해결

### "카카오 지도 API 키가 설정되지 않음" 오류
```bash
# 1. .env.production 파일 확인
cat frontend/.env.production

# 2. NEXT_PUBLIC_KAKAO_API_KEY 값 확인
# 값이 없거나 'your_kakao_javascript_key_here'인 경우:

# 3. 실제 키로 수정
vi frontend/.env.production

# 4. 재빌드
./bin/deploy.sh
```

### `.env.production` 파일이 없을 때
```bash
# deploy.sh가 자동으로 안내 메시지 출력:
# ⚠️  .env.production이 없습니다.
# 📝 .env.production.example을 복사하세요:
#     cp frontend/.env.production.example frontend/.env.production
#     vi frontend/.env.production
```

---

## 📝 체크리스트

배포 전 확인 사항:

- [ ] `frontend/.env.production` 파일 존재
- [ ] `NEXT_PUBLIC_KAKAO_API_KEY`에 실제 키 입력
- [ ] `NEXT_PUBLIC_SITE_URL`이 실제 도메인으로 설정
- [ ] Git에 `.env.production` 파일이 커밋되지 않았는지 확인

---

**중요:** `.env.production` 파일은 Git에 커밋하지 마세요! 
민감한 정보가 포함되어 있으므로 서버에서만 관리합니다.
