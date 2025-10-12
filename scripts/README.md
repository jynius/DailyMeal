# 🔧 DailyMeal Scripts

유틸리티 스크립트 모음

## 📜 스크립트 목록

### 1. convert-svg-to-png.js
SVG 파일을 PNG로 변환하는 범용 도구 (Node.js)

#### 사용법

```bash
node scripts/convert-svg-to-png.js <input-file> [output-file] [size]
```

#### 인자

- `input-file` (필수): SVG 또는 PNG 파일 경로
- `output-file` (선택): 출력 파일 경로. 생략 시 입력 파일 덮어쓰기 (백업 자동 생성)
- `size` (선택): 출력 크기. 생략 시 원본 크기 유지
  - 정사각형: `512`
  - 직사각형: `1024x512`

#### 예시

**기본 변환 (덮어쓰기)**
```bash
node scripts/convert-svg-to-png.js frontend/public/icon.svg
```
- 입력: `icon.svg`
- 출력: `icon.svg` → `icon.png`로 변환
- 백업: `icon.svg.backup` 자동 생성

### 2. 새 파일로 저장
```bash
node scripts/convert-svg-to-png.js frontend/public/icon.svg app/assets/icon.png
```
- 입력: `icon.svg`
- 출력: `icon.png` (새 파일)
- 백업: 생성 안 됨

### 3. 크기 조정하여 변환
```bash
node scripts/convert-svg-to-png.js frontend/public/icon.svg app/assets/icon-512.png 512
```
- 입력: `icon.svg`
- 출력: `icon-512.png` (512x512)
- 크기: 512x512 정사각형

### 4. 직사각형 크기로 변환
```bash
node scripts/convert-svg-to-png.js banner.svg banner-wide.png 1920x1080
```
- 입력: `banner.svg`
- 출력: `banner-wide.png` (1920x1080)
- 크기: 1920x1080 직사각형

#### 프로젝트에서 사용한 예시

**앱 아이콘 변환 (512x512)**
```bash
node scripts/convert-svg-to-png.js frontend/public/icon-512x512.svg app/assets/icon-512x512.png 512
```

**작은 아이콘 변환 (192x192)**
```bash
node scripts/convert-svg-to-png.js frontend/public/icon-192x192.svg frontend/public/icon-192x192.png 192
```

#### 특징

- ✅ SVG → PNG 변환
- ✅ PNG → PNG 크기 조정
- ✅ 자동 백업 (덮어쓰기 시)
- ✅ 투명 배경 유지
- ✅ 파일 크기 및 해상도 출력
- ✅ 정사각형 / 직사각형 지원

#### 요구사항

```bash
npm install sharp --save-dev
```

---

### 2. migrate-console-to-logger.sh
Frontend의 `console.*` 호출을 Logger 시스템으로 마이그레이션하는 헬퍼 스크립트 (Bash)

#### 사용법

```bash
# 전체 프로젝트에서 console 사용 찾기
./scripts/migrate-console-to-logger.sh

# 특정 파일에서 console 사용 찾기
./scripts/migrate-console-to-logger.sh frontend/src/app/profile/page.tsx
```

#### 기능

- ✅ Frontend 전체에서 `console.*` 사용 찾기
- ✅ 파일별 console 호출 개수 표시
- ✅ 특정 파일의 console 위치 라인 번호 표시
- ✅ Logger 마이그레이션 팁 제공

#### 출력 예시

```
🔍 Frontend Logger Migration Helper
====================================

📊 Total console calls found: 15

📁 Files with console calls:
----------------------------
  [3] frontend/src/app/profile/page.tsx
  [5] frontend/src/components/MealCard.tsx
  [7] frontend/src/lib/api/client.ts

💡 Migration Tips:
----------------------------
1. Add import: import { createLogger } from '@/lib/logger'
2. Create logger: const log = createLogger('ComponentName')
3. Replace: console.log → log.info
4. Replace: console.error → log.error
5. Replace: console.warn → log.warn
```

#### 상세 문서

Logger 시스템에 대한 자세한 정보는 다음 문서를 참조하세요:
- [Frontend Logger 시스템](../docs/frontend/LOGGER_README.md) - Logger 사용 가이드
- [Logger 시스템 요약](../docs/archive/LOGGER_SYSTEM_SUMMARY.md) - 구현 상세

---

## 📚 추가 참고 자료
