# 🔧 DailyMeal Scripts

유틸리티 스크립트 모음

## 📜 스크립트 목록

### convert-svg-to-png.js
SVG 파일을 PNG로 변환하는 범용 도구

## 사용법

```bash
node scripts/convert-svg-to-png.js <input-file> [output-file] [size]
```

## 인자

- `input-file` (필수): SVG 또는 PNG 파일 경로
- `output-file` (선택): 출력 파일 경로. 생략 시 입력 파일 덮어쓰기 (백업 자동 생성)
- `size` (선택): 출력 크기. 생략 시 원본 크기 유지
  - 정사각형: `512`
  - 직사각형: `1024x512`

## 예시

### 1. 기본 변환 (덮어쓰기)
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

## 프로젝트에서 사용한 예시

### 앱 아이콘 변환 (512x512)
```bash
node scripts/convert-svg-to-png.js frontend/public/icon-512x512.svg app/assets/icon-512x512.png 512
```

### 작은 아이콘 변환 (192x192)
```bash
node scripts/convert-svg-to-png.js frontend/public/icon-192x192.svg frontend/public/icon-192x192.png 192
```

## 특징

- ✅ SVG → PNG 변환
- ✅ PNG → PNG 크기 조정
- ✅ 자동 백업 (덮어쓰기 시)
- ✅ 투명 배경 유지
- ✅ 파일 크기 및 해상도 출력
- ✅ 정사각형 / 직사각형 지원

## 요구사항

```bash
npm install sharp --save-dev
```
