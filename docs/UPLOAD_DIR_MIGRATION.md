# 업로드 디렉토리 변경 및 파일 분산 저장 가이드

## 개요
- **기존**: `./uploads` (상대 경로, 단일 폴더에 모든 파일 저장)
- **신규**: `/data/upload` (절대 경로, 날짜/해시별 분산 저장)

## 파일 분산 저장 전략

### 문제점
- 한 폴더에 수천~수만 개의 파일 저장 시 성능 저하
- 파일 검색 속도 감소, 백업/관리 어려움
- 예상 파일 수: 사용자 1000명 × 하루 3끼 × 365일 = **연간 100만+ 파일**

### 해결책

#### 1. 식사 사진: 날짜별 분산
```
/data/upload/meals/YYYY/MM/DD/uuid.jpg

예시:
/data/upload/meals/2025/10/11/abc123.jpg
/data/upload/meals/2025/10/11/def456.jpg
/data/upload/meals/2025/10/12/ghi789.jpg
```
- **장점**: 자동으로 시간순 정렬, 특정 날짜 파일 쉽게 삭제 가능
- **폴더 수**: 연간 365개 (월 30개 × 12)

#### 2. 프로필 사진: 사용자 해시 분산
```
/data/upload/profiles/XX/user-id-timestamp.jpg
(XX = 사용자 ID의 MD5 해시 첫 2자리)

예시:
/data/upload/profiles/3a/user-123-1728648000.jpg
/data/upload/profiles/7f/user-456-1728648100.jpg
```
- **장점**: 256개 폴더로 균등 분산 (00-ff)
- **폴더당 파일 수**: 1만 사용자 ÷ 256 = 약 39개

### 파일 경로 예시

| 타입 | 실제 저장 경로 | DB 저장 URL | 프론트엔드 접근 |
|------|--------------|------------|---------------|
| 식사 사진 | `/data/upload/meals/2025/10/11/abc.jpg` | `/uploads/meals/2025/10/11/abc.jpg` | `/api/uploads/meals/2025/10/11/abc.jpg` |
| 프로필 사진 | `/data/upload/profiles/3a/user-123.jpg` | `/uploads/profiles/3a/user-123.jpg` | `/api/uploads/profiles/3a/user-123.jpg` |

## 변경 사항

### 1. 환경 변수
```bash
# backend/.env
UPLOAD_DIR=/data/upload
```

### 2. 코드 수정
- ✅ `backend/src/common/upload.utils.ts` - 업로드 헬퍼 유틸리티 추가
- ✅ `backend/src/meal-records/meal-records.controller.ts` - 날짜별 폴더 생성
- ✅ `backend/src/users/users.service.ts` - 사용자 해시 폴더 생성
- ✅ `backend/src/users/users.module.ts` - Multer 설정 수정
- ✅ `backend/src/main.ts` - 이미 UPLOAD_DIR 환경 변수 사용 중
- ✅ `backend/src/app.module.ts` - ServeStaticModule 이미 환경 변수 사용 중

### 3. 주요 기능

#### upload.utils.ts
```typescript
// 파일 경로 생성
createUploadPath(filename, {
  uploadDir: '/data/upload',
  category: 'meals',  // 또는 'profiles'
  useDate: true,      // 날짜별 폴더
  useUserHash: true,  // 사용자 해시 폴더
  userId: 'user-123'
})

// 결과
{
  dirPath: '/data/upload/meals/2025/10/11',
  urlPath: '/uploads/meals/2025/10/11/abc.jpg'
}
```

## 서버 설정 (필수)

### 1. 디렉토리 생성
```bash
sudo mkdir -p /data/upload/profiles
```

### 2. 권한 설정
```bash
# PM2로 실행하는 사용자 확인 (보통 ubuntu 또는 현재 사용자)
whoami

# 해당 사용자에게 소유권 부여
sudo chown -R $USER:$USER /data/upload

# 읽기/쓰기 권한 설정
sudo chmod -R 755 /data/upload
```

### 3. 기존 파일 마이그레이션 (선택)
```bash
# 기존 업로드 파일이 있다면 복사
cp -r ~/DailyMeal/backend/uploads/* /data/upload/

# 권한 재설정
sudo chown -R $USER:$USER /data/upload
```

### 4. Nginx 설정 확인
Nginx에서 정적 파일을 직접 서빙하는 경우:
```nginx
location /uploads/ {
    alias /data/upload/;  # 변경된 경로
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

현재는 NestJS의 ServeStaticModule이 처리하므로 별도 설정 불필요.

## 파일 읽기 동작 방식

### 백엔드 (NestJS)
```typescript
// app.module.ts - ServeStaticModule 설정
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
  serveRoot: '/uploads',  // URL 경로
})
```

- **저장**: `/data/upload/profiles/abc123.jpg` (실제 파일)
- **DB 저장**: `/uploads/profiles/abc123.jpg` (URL 경로)
- **서빙**: `http://api.dailymeal.life/uploads/profiles/abc123.jpg`

### 프론트엔드
```typescript
// 프론트엔드에서는 URL만 사용
<img src="/uploads/profiles/abc123.jpg" />

// Nginx가 /api/uploads/* → Backend로 프록시
```

### Nginx 프록시 설정
```nginx
# /api/uploads 요청을 백엔드로 전달
location /api/uploads/ {
    proxy_pass http://localhost:8000/uploads/;
}
```

## 배포 체크리스트

- [ ] 1. 서버에 `/data/upload` 디렉토리 생성
- [ ] 2. 디렉토리 권한 설정 (`chown`, `chmod`)
- [ ] 3. `.env` 파일에 `UPLOAD_DIR=/data/upload` 추가
- [ ] 4. 코드 변경사항 커밋 및 푸시
- [ ] 5. 서버에서 `git pull`
- [ ] 6. 백엔드 재시작: `pm2 restart dailymeal-api`
- [ ] 7. 파일 업로드 테스트 (프로필 사진, 식사 사진)
- [ ] 8. 파일 접근 테스트 (URL로 이미지 로드 확인)

## 트러블슈팅

### 권한 오류
```
Error: EACCES: permission denied, mkdir '/data/upload'
```
**해결**: `sudo chown -R $USER:$USER /data/upload`

### 파일을 찾을 수 없음
```
404 Not Found: /uploads/profiles/xxx.jpg
```
**확인사항**:
1. 파일이 실제로 `/data/upload/profiles/`에 존재하는가?
2. DB에 경로가 `/uploads/profiles/xxx.jpg` 형태로 저장되었는가?
3. ServeStaticModule이 올바르게 설정되었는가?

### Nginx 502 Error
**해결**: PM2 프로세스 상태 확인 및 재시작
```bash
pm2 status
pm2 logs dailymeal-api
pm2 restart dailymeal-api
```

## 장점

1. **데이터 분리**: 애플리케이션 코드와 사용자 데이터 분리
2. **백업 용이**: `/data` 디렉토리만 별도 백업 가능
3. **권한 관리**: 시스템 레벨 권한 관리 가능
4. **확장성**: 필요시 `/data`를 별도 파티션/볼륨으로 마운트 가능
5. **배포 안전**: `git pull` 시 업로드 파일 영향 없음

## 참고

- 파일 경로는 절대 경로(`/data/upload`)로 저장되지만, DB에는 상대 URL(`/uploads/...`)로 저장됨
- URL 경로(`/uploads`)는 변경하지 않으므로 프론트엔드 수정 불필요
- ServeStaticModule이 파일 시스템 경로를 URL로 매핑해줌
