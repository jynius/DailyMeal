# 사진 메타데이터 재처리 스크립트

기존 식사 기록의 사진 파일에서 EXIF 메타데이터(촬영 시간, GPS 위치)를 재추출하여 데이터베이스를 업데이트하는 스크립트입니다.

## 목적

이 기능이 추가되기 전에 업로드된 식사 기록들은 `photoTakenAt`, `latitude`, `longitude` 정보가 DB에 없습니다. 이 스크립트는 서버에 저장된 사진 파일에서 EXIF 정보를 다시 읽어 DB를 업데이트합니다.

## 실행 방법

### 로컬 환경

```bash
# 프로젝트 루트에서
./bin/reprocess-metadata.sh
```

### 운영 서버

```bash
# SSH 접속 후
cd ~/DailyMeal/backend
npx ts-node scripts/reprocess-photo-metadata.ts
```

## 처리 대상

- ✅ `photo` 필드가 NOT NULL인 식사 기록
- ✅ `photoTakenAt` 또는 `latitude`/`longitude`가 NULL인 기록만

**예:**
```sql
SELECT * FROM meal_records 
WHERE photo IS NOT NULL 
  AND (photoTakenAt IS NULL OR latitude IS NULL OR longitude IS NULL);
```

## 처리 과정

1. **DB 조회**: 메타데이터가 없는 식사 기록 검색
2. **파일 확인**: 사진 파일이 서버에 존재하는지 확인
3. **EXIF 추출**: ExifReader로 메타데이터 읽기
   - 촬영 시간: `exif.DateTimeOriginal`
   - GPS 위치: `gps.Latitude`, `gps.Longitude`
4. **유효성 검증**:
   - GPS 좌표가 -90~90 (위도), -180~180 (경도) 범위 내
   - (0, 0) 좌표는 제외 (EXIF 오류로 간주)
5. **DB 업데이트**: 추출된 정보로 레코드 업데이트

## 출력 예시

```
🔄 사진 메타데이터 재처리 시작...

✅ DB 연결 성공

📊 처리 대상: 45개 식사 기록

✅ 업데이트: 삼겹살 (a1b2c3d4) | 촬영시간: 2025-12-15T18:30:00.000Z | GPS: (37.566535, 126.977969)
✅ 업데이트: 김치찌개 (e5f6g7h8) | 촬영시간: 2025-12-14T12:15:00.000Z
⚠️  파일 없음: i9j0k1l2 - uploads/meals/old-photo.jpg
✅ 업데이트: 불고기 (m3n4o5p6) | GPS: (37.487515, 126.825748)

============================================================
📊 재처리 완료:
   - 업데이트: 38개
   - 스킵: 7개
   - 전체: 45개
============================================================

✅ 스크립트 실행 완료
```

## 스킵 사유

다음 경우 업데이트되지 않습니다:

1. **파일 없음**: 사진 파일이 서버에서 삭제됨
2. **EXIF 없음**: 사진에 메타데이터가 없음 (편집된 사진, SNS 다운로드 등)
3. **이미 있음**: DB에 이미 메타데이터가 있는 경우
4. **유효하지 않은 GPS**: 좌표가 범위를 벗어나거나 (0, 0)인 경우

## 주의사항

⚠️ **운영 DB 수정**: 이 스크립트는 운영 데이터베이스를 직접 수정합니다.

✅ **안전 장치**:
- 기존 데이터는 덮어쓰지 않음 (NULL일 때만 업데이트)
- 유효성 검증 후에만 저장
- 트랜잭션 없이 레코드별 개별 업데이트 (일부 실패해도 나머지 계속 진행)

🔒 **권장 사항**:
- 첫 실행 전 DB 백업
- 운영 시간 외 실행 권장
- 로그 확인 후 검증

## 재실행

여러 번 실행해도 안전합니다:
- 이미 메타데이터가 있는 레코드는 건너뜀
- 중복 업데이트 없음

## 의존성

- `exifreader`: EXIF 메타데이터 추출
- `typeorm`: DB 접근
- `ts-node`: TypeScript 실행

모두 `backend/package.json`에 포함되어 있습니다.

## 문제 해결

### "파일 없음" 경고가 많이 나올 때

```bash
# uploads 디렉토리 확인
ls -la backend/uploads/meals/

# 사진 파일과 DB 경로 일치 여부 확인
```

### DB 연결 실패

```bash
# .env 파일 확인
cat backend/.env | grep DB_

# PostgreSQL 접속 테스트
psql -h localhost -U postgres -d dailymeal
```

### EXIF 추출 실패

대부분 사진에 원본 메타데이터가 없는 경우입니다. 스마트폰 설정에서 "위치 태그" 또는 "GPS 태그"가 활성화되어 있는지 확인하세요.

## 참고

- 스크립트 위치: `backend/scripts/reprocess-photo-metadata.ts`
- 실행 래퍼: `bin/reprocess-metadata.sh`
- 관련 엔티티: `backend/src/entities/meal-record.entity.ts`
- EXIF 추출 로직: `backend/src/meal-records/meal-records.service.ts` 의 `extractPhotoMetadata()`
