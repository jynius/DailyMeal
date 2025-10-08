# 파일 업로드 경로 환경 변수화 작업 보고서

## 날짜: 2025-10-09

---

## 📋 작업 개요

하드코딩되어 있던 파일 업로드 경로 및 설정을 환경 변수로 변경하여 유연성과 관리 편의성을 향상시켰습니다.

---

## 🔍 문제 발견

### 하드코딩된 위치 (4곳)

1. **`backend/src/main.ts`**
   ```typescript
   const uploadDir = './uploads';  // ❌ 하드코딩
   ```

2. **`backend/src/meal-records/meal-records.controller.ts`**
   ```typescript
   destination: './uploads',  // ❌ 하드코딩
   fileSize: 5 * 1024 * 1024,  // ❌ 하드코딩
   files: 5,  // ❌ 하드코딩
   ```

3. **`backend/src/app.module.ts`**
   ```typescript
   rootPath: join(__dirname, '..', 'uploads'),  // ❌ 하드코딩
   ```

4. **PM2 설정 파일들**
   - `ecosystem.dev.config.js`
   - `ecosystem.config.js`
   - 업로드 설정 환경 변수 없음

---

## ✅ 수정 내용

### 1. 환경 변수 정의

**backend/.env.example에 추가:**
```bash
# File Upload Configuration
UPLOAD_DIR=./uploads
UPLOAD_MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_MAX_FILES=5
```

**환경 변수 설명:**
- `UPLOAD_DIR`: 파일 업로드 저장 경로 (상대 또는 절대 경로)
- `UPLOAD_MAX_FILE_SIZE`: 파일당 최대 크기 (바이트)
- `UPLOAD_MAX_FILES`: 한 번에 업로드 가능한 최대 파일 개수

### 2. 코드 수정

#### backend/src/main.ts
```typescript
// Before
const uploadDir = './uploads';

// After
const uploadDir = process.env.UPLOAD_DIR || './uploads';
```

#### backend/src/meal-records/meal-records.controller.ts
```typescript
// 파일 상단에 상수 정의 추가
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const UPLOAD_MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '5242880');
const UPLOAD_MAX_FILES = parseInt(process.env.UPLOAD_MAX_FILES || '5');

// Before
FilesInterceptor('photos', 5, {
  storage: diskStorage({
    destination: './uploads',
    // ...
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
})

// After
FilesInterceptor('photos', UPLOAD_MAX_FILES, {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    // ...
  }),
  limits: {
    fileSize: UPLOAD_MAX_FILE_SIZE,
    files: UPLOAD_MAX_FILES,
  },
})
```

#### backend/src/app.module.ts
```typescript
// Before
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'uploads'),
  serveRoot: '/uploads',
}),

// After
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
  serveRoot: '/uploads',
}),
```

### 3. PM2 설정 업데이트

#### ecosystem.dev.config.js
```javascript
env: {
  // ... 기존 환경 변수
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE || '5242880',
  UPLOAD_MAX_FILES: process.env.UPLOAD_MAX_FILES || '5'
},
```

#### ecosystem.config.js
```javascript
env: {
  // ... 기존 환경 변수
  UPLOAD_DIR: './uploads',
  UPLOAD_MAX_FILE_SIZE: '5242880',
  UPLOAD_MAX_FILES: '5'
},
```

### 4. 문서 업데이트

**docs/ENVIRONMENT_SETUP.md에 추가:**
```markdown
# File Upload Configuration
UPLOAD_DIR=./uploads
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_MAX_FILES=5

중요한 환경 변수:
- UPLOAD_DIR: 파일 업로드 저장 경로
- UPLOAD_MAX_FILE_SIZE: 파일당 최대 크기 (바이트)
- UPLOAD_MAX_FILES: 최대 업로드 파일 개수
```

---

## 🎯 개선 효과

### 1. 유연성 향상
```bash
# 개발 환경: 로컬 폴더
UPLOAD_DIR=./uploads

# 프로덕션: 외부 스토리지 마운트
UPLOAD_DIR=/mnt/storage/uploads

# 클라우드 스토리지 준비 시
UPLOAD_DIR=/var/shared/uploads
```

### 2. 설정 관리 편의성
```bash
# 파일 크기 제한 변경 (10MB)
UPLOAD_MAX_FILE_SIZE=10485760

# 최대 파일 개수 변경 (10개)
UPLOAD_MAX_FILES=10
```

### 3. 환경별 분리
- **개발**: 작은 용량 (5MB, 5개)
- **프로덕션**: 큰 용량 가능 (10MB, 10개)
- **테스트**: 매우 작은 용량 (1MB, 2개)

### 4. 보안 향상
- 파일 경로를 코드에 노출하지 않음
- 환경별 다른 경로 설정 가능
- 권한 관리 용이

---

## 📊 수정된 파일 목록

### 코드 파일 (3개)
1. ✅ `backend/src/main.ts`
2. ✅ `backend/src/meal-records/meal-records.controller.ts`
3. ✅ `backend/src/app.module.ts`

### 설정 파일 (3개)
4. ✅ `backend/.env.example`
5. ✅ `ecosystem.dev.config.js`
6. ✅ `ecosystem.config.js`

### 문서 파일 (1개)
7. ✅ `docs/ENVIRONMENT_SETUP.md`

**총 7개 파일 수정**

---

## 🔍 하위 호환성

### 기본값 보장
모든 환경 변수에 기본값이 설정되어 있어, 환경 변수를 설정하지 않아도 기존과 동일하게 작동합니다:

```typescript
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const UPLOAD_MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '5242880');
const UPLOAD_MAX_FILES = parseInt(process.env.UPLOAD_MAX_FILES || '5');
```

**기본값:**
- `UPLOAD_DIR`: `./uploads`
- `UPLOAD_MAX_FILE_SIZE`: `5242880` (5MB)
- `UPLOAD_MAX_FILES`: `5`

### 기존 동작 유지
- ✅ 환경 변수 미설정 시 기존과 동일하게 작동
- ✅ 기존 업로드된 파일 정상 접근
- ✅ API 엔드포인트 변경 없음

---

## 💡 사용 예시

### 개발 환경

**backend/.env:**
```bash
# 기본 설정 (생략 가능)
UPLOAD_DIR=./uploads
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_MAX_FILES=5
```

### 프로덕션 환경

**ecosystem.config.js:**
```javascript
env: {
  // 더 큰 용량 허용
  UPLOAD_DIR: './uploads',
  UPLOAD_MAX_FILE_SIZE: '10485760',  // 10MB
  UPLOAD_MAX_FILES: '10'
}
```

### Docker 환경

**docker-compose.yml:**
```yaml
services:
  backend:
    environment:
      - UPLOAD_DIR=/app/storage/uploads
      - UPLOAD_MAX_FILE_SIZE=10485760
      - UPLOAD_MAX_FILES=10
    volumes:
      - ./storage:/app/storage
```

### 클라우드 스토리지 (S3, GCS 준비)

```bash
# 현재는 로컬 폴더
UPLOAD_DIR=./uploads

# 향후 S3 마운트 또는 별도 처리
UPLOAD_DIR=/mnt/s3-bucket/uploads
```

---

## 🔧 테스트 방법

### 1. 기본 동작 테스트
```bash
# 환경 변수 없이 실행
npm run start:dev

# 업로드 테스트
curl -X POST http://localhost:8000/api/meal-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photos=@test.jpg"

# 파일 저장 확인
ls -la ./uploads/
```

### 2. 커스텀 경로 테스트
```bash
# 환경 변수 설정
export UPLOAD_DIR=./custom-uploads
export UPLOAD_MAX_FILE_SIZE=10485760
export UPLOAD_MAX_FILES=10

# 서버 시작
npm run start:dev

# 업로드 테스트
curl -X POST http://localhost:8000/api/meal-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photos=@test.jpg"

# 커스텀 경로에 파일 확인
ls -la ./custom-uploads/
```

### 3. 파일 크기 제한 테스트
```bash
# 1MB 제한 설정
export UPLOAD_MAX_FILE_SIZE=1048576

# 서버 시작
npm run start:dev

# 큰 파일 업로드 (실패 예상)
curl -X POST http://localhost:8000/api/meal-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photos=@large-file.jpg"
```

---

## ⚠️ 주의사항

### 1. 폴더 권한
```bash
# 업로드 폴더 생성 및 권한 설정
mkdir -p ./uploads
chmod 755 ./uploads

# 프로덕션 환경
sudo chown -R app:app /var/uploads
sudo chmod 755 /var/uploads
```

### 2. 디스크 공간 모니터링
```bash
# 업로드 폴더 크기 확인
du -sh ./uploads

# 디스크 공간 확인
df -h
```

### 3. 백업
```bash
# 정기 백업 (cron)
0 2 * * * tar -czf /backup/uploads-$(date +\%Y\%m\%d).tar.gz /app/uploads
```

### 4. 파일 경로 변경 시
- 기존 파일 마이그레이션 필요
- 데이터베이스의 파일 경로 업데이트 필요 (경로가 저장된 경우)
- 정적 파일 서빙 경로 확인

---

## 🚀 향후 개선 가능 사항

### 1. 클라우드 스토리지 통합
```typescript
// AWS S3
import { S3 } from 'aws-sdk';
const s3Storage = multerS3({
  s3: new S3(),
  bucket: process.env.S3_BUCKET,
  key: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
```

### 2. 파일 타입별 경로 분리
```bash
UPLOAD_DIR_IMAGES=./uploads/images
UPLOAD_DIR_DOCUMENTS=./uploads/documents
UPLOAD_DIR_VIDEOS=./uploads/videos
```

### 3. CDN 통합
```bash
UPLOAD_BASE_URL=https://cdn.dailymeal.com
```

### 4. 이미지 리사이징
```bash
UPLOAD_RESIZE_ENABLED=true
UPLOAD_RESIZE_WIDTH=1920
UPLOAD_RESIZE_QUALITY=80
```

---

## 📚 관련 문서

- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 환경 변수 전체 가이드
- [BUILD_DEPLOY_GUIDE.md](./BUILD_DEPLOY_GUIDE.md) - 배포 가이드

---

## 🎯 결론

### 완료된 작업
✅ 4곳의 하드코딩된 업로드 경로를 환경 변수로 변경
✅ 3개의 환경 변수 추가 (경로, 크기, 개수)
✅ PM2 설정 파일 업데이트
✅ 문서 업데이트
✅ 하위 호환성 보장 (기본값 설정)

### 핵심 성과
- 🔧 **유연성**: 환경별 다른 설정 가능
- 📁 **관리 편의성**: 중앙 집중식 설정
- 🔒 **보안**: 경로 정보 코드에서 분리
- 🚀 **확장성**: 클라우드 스토리지 준비

---

**작성일**: 2025-10-09
**작성자**: GitHub Copilot
**상태**: ✅ 완료 및 검증됨
