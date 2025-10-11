# DailyMeal Google Play Store 배포 가이드

## 📋 체크리스트

### 1. Google Play Console 준비
- [ ] Google Play Console 개발자 등록 ($25)
- [ ] 신원 인증 완료

### 2. 앱 정보
```
앱 이름: DailyMeal
패키지명: com.dailymeal.app
카테고리: 건강 및 피트니스
버전: 1.0.0
```

### 3. 필수 자료
- [ ] 앱 아이콘 512x512px
- [ ] 스크린샷 최소 2장 (권장 8장)
  - [ ] 피드 화면
  - [ ] 식사 등록 화면
  - [ ] 지도 화면
  - [ ] 프로필 화면
- [ ] 간단한 설명 (80자)
- [ ] 자세한 설명 (4000자)
- [ ] 개인정보 처리방침 URL
- [ ] 이용약관 URL

### 4. 프로덕션 빌드

#### AAB (권장)
```bash
cd app
eas build --platform android --profile production --type app-bundle
```

#### APK
```bash
cd app
eas build --platform android --profile production --type apk
```

### 5. 앱 콘텐츠 설정
- [ ] 콘텐츠 등급 설정
- [ ] 타겟 연령층 선택
- [ ] 광고 포함 여부
- [ ] 앱 내 구매 여부

### 6. 권한 설명
```
CAMERA: 식사 사진 촬영
READ_MEDIA_IMAGES: 갤러리에서 사진 선택
ACCESS_FINE_LOCATION: 식사 장소 기록
ACCESS_COARSE_LOCATION: 식사 장소 기록
```

### 7. 개인정보 처리방침 항목
- 위치 정보 수집 및 사용
- 사진 업로드 및 저장
- 사용자 계정 정보
- 데이터 보관 기간
- 데이터 삭제 요청 방법

### 8. 가격 및 배포
- [ ] 가격: 무료
- [ ] 배포 국가: 대한민국 (또는 전세계)
- [ ] 기기 지원: 스마트폰, 태블릿

## 📱 스크린샷 캡처 가이드

### 권장 해상도
- 전화: 1080 x 1920 (16:9)
- 7인치 태블릿: 1024 x 600
- 10인치 태블릿: 1280 x 800

### 캡처할 화면
1. **피드** - 식사 목록 및 지도
2. **식사 등록** - 사진 선택/촬영 화면
3. **식사 상세** - 사진, 평점, 댓글
4. **프로필** - 내 식사 기록
5. **지도** - 식사 장소 표시

### ADB 스크린샷 명령어
```bash
# 스크린샷 캡처
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/

# 또는 앱에서 직접 캡처 후 다운로드
```

## 🚀 배포 절차

### 1단계: 프로덕션 빌드
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile production
```

### 2단계: Google Play Console
1. https://play.google.com/console 로그인
2. "앱 만들기" 클릭
3. 앱 정보 입력
4. 스토어 등록정보 작성
5. 앱 콘텐츠 설정
6. 가격 및 배포 설정

### 3단계: AAB 업로드
1. "프로덕션" → "새 버전 만들기"
2. EAS Build에서 다운로드한 AAB 업로드
3. 출시 노트 작성
4. 검토 제출

### 4단계: 검토 대기
- 검토 기간: 1~7일
- 이메일로 승인/거부 통지

## 📝 앱 설명 예시

### 간단한 설명 (80자)
```
매일의 식사를 기록하고 공유하세요. 사진, 장소, 평점으로 나만의 맛집 지도 완성!
```

### 자세한 설명 (4000자)
```markdown
# DailyMeal - 매일의 식사 기록

## 🍽️ 소개
DailyMeal은 당신의 소중한 식사 순간을 기록하고 공유하는 앱입니다.

## ✨ 주요 기능
• 📸 식사 사진 등록 - 갤러리 또는 카메라로 즉시 기록
• ⭐ 평점 및 메모 - 맛, 분위기, 서비스를 별점으로 평가
• 📍 장소 기록 - GPS로 자동 위치 저장
• 🗺️ 지도 보기 - 내 식사 장소를 지도에서 한눈에
• 🔔 실시간 피드 - 친구들의 맛집 추천 확인
• 💬 댓글 및 좋아요 - 소통하며 맛집 정보 공유

## 🎯 이런 분께 추천
• 맛집 탐방을 즐기는 분
• 식사 일기를 작성하는 분
• 여행지의 음식 기록을 남기고 싶은 분
• 친구들과 맛집 정보를 공유하고 싶은 분

## 🔒 개인정보 보호
사용자의 데이터는 안전하게 보호되며, 본인만 관리할 수 있습니다.

## 📧 문의
support@dailymeal.life
```

## 🎨 앱 아이콘 및 배너 제작

### 아이콘 요구사항
- 크기: 512 x 512px
- 형식: PNG (32-bit)
- 배경: 투명 불가 (단색 또는 그라데이션)

### 현재 아이콘 위치
```
app/assets/icon.png
```

## 📊 출시 후 체크리스트
- [ ] Play Console에서 설치 수 확인
- [ ] 리뷰 모니터링 및 답변
- [ ] 충돌 보고서 확인
- [ ] 업데이트 계획 수립

## 🔄 업데이트 배포
```bash
# 버전 업데이트
# app.json에서 version 증가

# 새 빌드
eas build --platform android --profile production

# Play Console에서 새 버전 업로드
```

## 📚 참고 자료
- [Google Play Console 가이드](https://support.google.com/googleplay/android-developer)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [앱 스토어 최적화 (ASO)](https://developer.android.com/distribute/best-practices/launch)
