# PWA 아이콘 가이드

## 📱 현재 아이콘 구성

DailyMeal PWA는 최대 호환성을 위해 PNG와 SVG 아이콘을 모두 제공합니다.

### 아이콘 파일 목록

```
frontend/public/
├── icon-192x192.png  (1.4KB) - 작은 아이콘 (PNG)
├── icon-192x192.svg  (1.1KB) - 작은 아이콘 (SVG)
├── icon-512x512.png  (1.4KB) - 큰 아이콘 (PNG)
├── icon-512x512.svg  (826B)  - 큰 아이콘 (SVG)
└── favicon.svg       (793B)  - 브라우저 탭 아이콘

frontend/src/app/
└── favicon.ico       (25KB)  - 구형 브라우저용 favicon
```

### manifest.json 설정

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
```

---

## 🎯 각 파일의 역할

### PNG 아이콘 (icon-192x192.png, icon-512x512.png)
**용도:**
- Android 홈 화면 아이콘
- iOS Safari PWA 아이콘 (백업)
- 구형 브라우저 호환성
- Maskable icon 지원 (adaptive icon)

**지원 플랫폼:**
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ Samsung Internet
- ✅ iOS Safari (fallback)
- ✅ 구형 브라우저

### SVG 아이콘 (icon-192x192.svg, icon-512x512.svg)
**용도:**
- 모던 브라우저 PWA 아이콘
- 고해상도 디스플레이 최적화
- 파일 크기 최소화 (벡터)

**지원 플랫폼:**
- ✅ Chrome 93+
- ✅ Edge 93+
- ✅ Opera 79+
- ⚠️ Safari (부분 지원)
- ❌ 구형 Android 브라우저

### favicon.svg & favicon.ico
**용도:**
- 브라우저 탭 아이콘
- 북마크 아이콘
- 브라우저 히스토리

---

## 🔄 아이콘 업데이트 방법

### 1. 디자인 준비
```bash
# 권장 디자인 스펙:
- 최소 크기: 512x512px
- 배경: 투명 또는 단색
- Safe area: 중앙 80% 영역에 주요 콘텐츠 배치
- 형식: SVG (벡터) 또는 고해상도 PNG
```

### 2. PNG 생성
```bash
# ImageMagick 사용 예시
convert icon-source.svg -resize 192x192 icon-192x192.png
convert icon-source.svg -resize 512x512 icon-512x512.png
```

### 3. SVG 최적화
```bash
# SVGO 사용
npm install -g svgo
svgo icon-192x192.svg
svgo icon-512x512.svg
svgo favicon.svg
```

### 4. Favicon 생성
```bash
# favicon.ico 생성 (16x16, 32x32, 48x48 포함)
convert icon-source.svg -resize 16x16 favicon-16.png
convert icon-source.svg -resize 32x32 favicon-32.png
convert icon-source.svg -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

### 5. 파일 배치
```bash
# PNG/SVG → public/
cp icon-*.png frontend/public/
cp icon-*.svg frontend/public/
cp favicon.svg frontend/public/

# ICO → app/
cp favicon.ico frontend/src/app/
```

---

## ✅ 테스트 체크리스트

### Desktop 브라우저
- [ ] Chrome: PWA 설치 시 아이콘 표시 확인
- [ ] Edge: PWA 설치 시 아이콘 표시 확인
- [ ] Firefox: 북마크 아이콘 확인
- [ ] Safari: 브라우저 탭 아이콘 확인

### Mobile 브라우저
- [ ] Android Chrome: "홈 화면에 추가" 시 아이콘 확인
- [ ] Android Samsung Internet: 아이콘 확인
- [ ] iOS Safari: "홈 화면에 추가" 시 아이콘 확인
- [ ] Android Firefox: PWA 설치 확인

### 다양한 화면 크기
- [ ] 저해상도 (1x): 아이콘 선명도 확인
- [ ] 고해상도 (2x, 3x): 아이콘 선명도 확인
- [ ] Retina Display: SVG 벡터 렌더링 확인

---

## 🎨 Maskable Icon 가이드

### Maskable Icon이란?
Android Adaptive Icons를 지원하기 위한 아이콘 형식입니다. 다양한 기기와 런처가 아이콘을 원형, 사각형, 모서리가 둥근 사각형 등 다양한 형태로 마스킹할 수 있습니다.

### Safe Area
```
┌─────────────────────┐
│                     │  ← 여백 (20%)
│   ┌─────────────┐   │
│   │             │   │  ← Safe Area (80%)
│   │   아이콘    │   │     주요 콘텐츠 배치
│   │   콘텐츠    │   │
│   └─────────────┘   │
│                     │  ← 여백 (20%)
└─────────────────────┘
```

### 테스트 도구
- [Maskable.app](https://maskable.app/) - 아이콘이 다양한 형태로 어떻게 보이는지 확인

---

## 📚 참고 자료

### PWA 아이콘 스펙
- [Web App Manifest - Icons](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [Maskable Icons](https://web.dev/maskable-icon/)
- [Favicon Generator](https://realfavicongenerator.net/)

### 브라우저 호환성
- [Can I Use - SVG Favicon](https://caniuse.com/link-icon-svg)
- [Can I Use - Web App Manifest](https://caniuse.com/web-app-manifest)

### 디자인 가이드라인
- [Material Design - Product Icons](https://material.io/design/iconography/product-icons.html)
- [Apple Human Interface Guidelines - App Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)

---

## 🔍 트러블슈팅

### 아이콘이 표시되지 않을 때

**증상 1: Android에서 기본 아이콘으로 표시**
```bash
# 해결 방법:
1. PNG 아이콘이 있는지 확인
2. manifest.json의 icons 배열 확인
3. 캐시 삭제 후 재설치
```

**증상 2: iOS Safari에서 아이콘 안 나옴**
```bash
# 해결 방법:
1. apple-touch-icon 추가 (layout.tsx)
2. PNG 형식 확인 (SVG는 지원 안 됨)
```

**증상 3: 아이콘이 잘려서 보임**
```bash
# 해결 방법:
1. Maskable icon safe area 확인 (중앙 80%)
2. 여백 추가 (최소 20%)
3. maskable.app에서 테스트
```

---

## 📝 현재 상태 요약

✅ **PNG 아이콘**: 192x192, 512x512 (호환성)
✅ **SVG 아이콘**: 192x192, 512x512 (고품질)
✅ **Favicon**: SVG + ICO (브라우저)
✅ **Manifest**: PNG + SVG 모두 등록
✅ **Purpose**: any + maskable 지원

**결론**: 최대 호환성과 고품질을 모두 지원하는 최적 구성입니다! 🎉
