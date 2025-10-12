# 📐 피처 그래픽 제작 가이드

Play Store용 Feature Graphic (1024x500) 제작 가이드

## 📱 피처 그래픽이란?

Google Play Store 앱 페이지 상단에 표시되는 **대형 배너 이미지**입니다.

### 표시 위치
```
┌──────────────────────────────────────────┐
│                                          │
│      🍽️ DailyMeal                       │ ← 피처 그래픽
│  매일의 식사를 기록하고 공유하세요         │   (1024x500)
│                                          │
└──────────────────────────────────────────┘
     📱 앱 아이콘  DailyMeal
     ⭐⭐⭐⭐⭐ 4.5 (123)
     [설치] 버튼
```

### 요구사항
- **크기**: 정확히 1024 x 500 픽셀
- **형식**: PNG 또는 JPEG
- **용량**: 1MB 이하
- **필수 여부**: ❌ 선택 사항 (하지만 **권장**)

### 효과
- ✅ 앱이 더 전문적으로 보임
- ✅ 검색 결과에서 눈에 잘 띔
- ✅ 브랜드 이미지 강화
- ✅ 다운로드율 증가

## 🎨 디자인 옵션

### 옵션 1: 심플 로고 + 텍스트
```
┌──────────────────────────────────────────┐
│                                          │
│        🍽️  DailyMeal                    │
│     매일의 식사를 기록하고 공유하세요       │
│                                          │
└──────────────────────────────────────────┘
```
**장점**: 제작 쉬움, 깔끔함  
**단점**: 정보량 적음

---

### 옵션 2: 핵심 기능 아이콘
```
┌──────────────────────────────────────────┐
│   📸      ⭐      📍      💬              │
│  사진    평점    지도    공유              │
│                                          │
│          DailyMeal                       │
└──────────────────────────────────────────┘
```
**장점**: 기능 명확, 직관적  
**단점**: 아이콘 품질 중요

---

### 옵션 3: 스크린샷 조합 (추천 ⭐)
```
┌──────────────────────────────────────────┐
│  [피드]  [등록]  [지도]  [프로필]         │
│   📱     📱     📱     📱                 │
│            DailyMeal                     │
└──────────────────────────────────────────┘
```
**장점**: 실제 UI 보여줌, 신뢰도 높음  
**단점**: 스크린샷 필요

---

### 옵션 4: 그라데이션 + 로고 (간단)
```
┌──────────────────────────────────────────┐
│  [파란색 → 보라색 그라데이션 배경]         │
│                                          │
│        🍽️ DailyMeal                     │
│                                          │
└──────────────────────────────────────────┘
```
**장점**: 빠르게 제작 가능  
**단점**: 차별화 어려움

## 🛠️ 제작 방법

### 방법 1: Canva (가장 쉬움, 추천)

1. **Canva 접속**: https://www.canva.com
2. **템플릿 검색**: "Google Play Feature Graphic" 또는 "1024x500"
3. **디자인 편집**:
   - 텍스트: "DailyMeal", "매일의 식사 기록"
   - 아이콘: 🍽️ 추가
   - 색상: #2563eb (브랜드 블루)
4. **다운로드**: PNG, 1024x500

**무료 템플릿 예시**:
- "App Banner"
- "Feature Graphic"
- "Play Store Banner"

---

### 방법 2: Figma (디자이너용)

1. 새 프레임 생성: 1024 x 500px
2. 배경 색상: #2563eb
3. 텍스트 추가:
   - 제목: "DailyMeal" (72pt, Bold)
   - 부제: "매일의 식사 기록" (36pt)
4. 아이콘/이미지 배치
5. Export: PNG, 1x

---

### 방법 3: ImageMagick (CLI, 개발자용)

```bash
# 간단한 텍스트 배너
convert -size 1024x500 xc:'#2563eb' \
  -font Arial-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0-30 'DailyMeal' \
  -font Arial -pointsize 40 -fill white \
  -gravity center -annotate +0+50 '매일의 식사를 기록하고 공유하세요' \
  feature-graphic.png
```

설치:
```bash
# Ubuntu/Debian
sudo apt install imagemagick

# macOS
brew install imagemagick
```

---

### 방법 4: 스크린샷 조합 (Node.js + Sharp)

```javascript
// scripts/create-feature-graphic.js
const sharp = require('sharp');

async function createFeatureGraphic() {
  const width = 1024;
  const height = 500;
  
  // 배경 생성
  const background = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 37, g: 99, b: 235, alpha: 1 } // #2563eb
    }
  }).png().toBuffer();
  
  // 스크린샷 4개 배치 (가정)
  const screenshots = [
    'screenshot1.png',
    'screenshot2.png',
    'screenshot3.png',
    'screenshot4.png'
  ];
  
  // TODO: 스크린샷 리사이즈 및 배치
  
  await sharp(background)
    .toFile('feature-graphic.png');
}

createFeatureGraphic();
```

## 📐 디자인 가이드라인

### 텍스트
- **최소화**: 이미지 위주로
- **가독성**: 큰 폰트 사용 (최소 36pt)
- **대비**: 배경과 명확한 대비
- **언어**: 한국어 또는 영어

### 색상
- **브랜드 컬러**: #2563eb (파란색)
- **보조 색상**: 흰색, 회색
- **그라데이션**: 파란색 → 보라색 OK

### 이미지
- **고해상도**: 선명하게
- **스크린샷**: 최신 버전 UI
- **아이콘**: 벡터 이미지 권장

### 레이아웃
- **중앙 정렬**: 로고/텍스트
- **여백**: 충분한 패딩
- **균형**: 좌우 대칭

## ✅ 체크리스트

제작 전:
- [ ] 브랜드 컬러 확인 (#2563eb)
- [ ] 앱 로고 준비 (SVG 또는 고해상도 PNG)
- [ ] 스크린샷 준비 (선택)

제작 중:
- [ ] 크기 정확히 1024x500
- [ ] 텍스트 가독성 확인
- [ ] 색상 대비 확인
- [ ] 모바일에서 미리보기

제작 후:
- [ ] 파일 크기 1MB 이하 확인
- [ ] PNG 또는 JPEG 형식
- [ ] 투명 배경 제거 (불필요)

업로드:
- [ ] Play Console에서 미리보기
- [ ] 다양한 기기에서 확인

## 🎯 DailyMeal용 추천 디자인

### 추천 1: 핵심 기능 4개
```
[파란색 그라데이션 배경]

    📸        ⭐        📍        💬
   사진      평점      지도      공유

         🍽️ DailyMeal
     매일의 식사를 기록하고 공유하세요
```

### 추천 2: 스크린샷 + 로고
```
[흰색 배경]

[피드 화면] [등록 화면] [지도 화면] [프로필]
   📱          📱         📱         📱

         🍽️ DailyMeal
```

### 추천 3: 심플 & 클린
```
[파란색 배경 #2563eb]



         🍽️ DailyMeal
     매일의 식사를 기록하고 공유하세요


```

## 📦 제작 완료 후

1. **파일 저장**: `feature-graphic.png` 또는 `feature-graphic.jpg`
2. **위치**: `/app/assets/` 또는 `/docs/app-store/`
3. **업로드**: Play Console → 그래픽 애셋
4. **미리보기**: Play Console에서 확인

## 💡 팁

- **급하면**: 나중에 추가해도 됨 (선택 사항)
- **템플릿**: Canva에서 5분이면 제작 가능
- **업데이트**: 언제든 변경 가능
- **A/B 테스트**: 여러 버전 제작 후 테스트

## 📚 참고 링크

- Google Play 그래픽 가이드: https://support.google.com/googleplay/android-developer/answer/9866151
- Canva Feature Graphic 템플릿: https://www.canva.com/
- App Mockup Generator: https://www.appmockup.com/

## 🚫 주의사항

- ❌ 저작권 있는 이미지 사용 금지
- ❌ 오해의 소지가 있는 내용 금지
- ❌ 경쟁사 언급 금지
- ❌ 가격/할인 정보 표시 금지 (Play 정책)
- ✅ 심플하고 명확하게!
