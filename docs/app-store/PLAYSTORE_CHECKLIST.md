# 📱 Play Store 등록 체크리스트

**날짜**: 2025-10-12  
**상태**: 서버 배포 대기 중

## ✅ 완료된 작업

### 1. 앱 빌드
- ✅ Production AAB 생성 (versionCode: 3)
- ✅ 다운로드 링크: https://expo.dev/artifacts/eas/t7mXMNatDbzfSG8gnMjRgs.aab
- ✅ 패키지명: com.dailymeal.app
- ✅ 모든 핵심 기능 테스트 완료

### 2. 앱 아이콘
- ✅ 512x512 PNG 생성: `/app/assets/icon-512x512.png` (11.71 KB)
- ✅ 192x192 PNG 생성: `/frontend/public/icon-192x192.png` (3.42 KB)

### 3. 앱 설명 작성
- ✅ 짧은 설명 (80자): "매일의 식사를 기록하고 공유하세요..."
- ✅ 상세 설명 (4000자): 완성
- ✅ 키워드: ASO 최적화 완료
- ✅ 문서 위치: `/docs/app-store/APP_STORE_DESCRIPTION.md`

### 4. 법적 페이지 작성
- ✅ 개인정보 처리방침: `/frontend/src/app/privacy/page.tsx`
- ✅ 이용약관: `/frontend/src/app/terms/page.tsx`
- ✅ Middleware 공개 설정 완료

### 5. 배포 가이드
- ✅ Play Store 배포 가이드: `/docs/app-store/PLAYSTORE_DEPLOYMENT.md`
- ✅ 앱 빌드 기록: `/docs/app/BUILD_RESULT.md`
- ✅ 디버깅 가이드: `/docs/app/DEBUGGING_GUIDE.md`

### 6. 문서 정리
- ✅ 전체 문서 재구성 (91개 문서, 12개 카테고리)
- ✅ Scripts 정리 완료
- ✅ Shell scripts 정리 완료

## 🔄 진행 중인 작업

### 1. 서버 배포 (Frontend)
```bash
# 서버에서 실행
cd /path/to/DailyMeal
./bin/deploy.sh
```

**배포 후 확인사항:**
- [ ] https://www.dailymeal.life/privacy 접근 가능
- [ ] https://www.dailymeal.life/terms 접근 가능
- [ ] PNG 아이콘 적용 확인

### 2. 스크린샷 촬영
사용자가 직접 촬영 중

**필요한 스크린샷 (2-8개):**
- [ ] 피드 화면 - "친구들의 맛집 추천을 실시간으로 확인하세요"
- [ ] 식사 등록 - "사진 한 장으로 간편하게 기록"
- [ ] 식사 상세 - "평점과 메모로 상세한 기록 작성"
- [ ] 지도 보기 - "내가 방문한 모든 맛집을 한눈에"
- [ ] 프로필 - "나만의 맛집 컬렉션 완성"

**스크린샷 요구사항:**
- 크기: 최소 320px, 최대 3840px
- 형식: PNG 또는 JPEG
- 비율: 16:9 또는 9:16 권장
- 텍스트: 스크린샷에 설명 추가 가능

**촬영 방법 (ADB):**
```bash
cd app
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshots/
```

## ⏭️ 다음 단계

### 1. 서버 배포 확인
```bash
# 로컬에서 확인
curl https://www.dailymeal.life/privacy
curl https://www.dailymeal.life/terms
```

**예상 결과:**
- 200 OK 응답
- HTML 페이지 정상 출력
- 로그인 없이 접근 가능

### 2. Google Play Console 등록

#### A. 개발자 계정
- [x] 개발자 계정 등록 ($25 결제 완료)
- [ ] 신원 확인 완료 (진행 중, 최대 2주 소요)

#### B. 앱 만들기
1. Play Console 접속: https://play.google.com/console
2. "앱 만들기" 클릭
3. 기본 정보 입력:
   - **앱 이름**: DailyMeal
   - **기본 언어**: 한국어
   - **앱 유형**: 앱
   - **무료/유료**: 무료

#### C. 앱 콘텐츠
1. **앱 카테고리**
   - 음식 및 음료

2. **연락처 정보**
   - 이메일: support@dailymeal.life
   - 웹사이트: https://www.dailymeal.life

3. **개인정보처리방침**
   - URL: https://www.dailymeal.life/privacy

4. **서비스 약관** (선택)
   - URL: https://www.dailymeal.life/terms

#### D. 스토어 등록정보

1. **앱 아이콘**
   - 파일: `/app/assets/icon-512x512.png`
   - 크기: 512x512 PNG

2. **피처 그래픽 (Feature Graphic)** - 선택 사항
   - **설명**: 앱 페이지 상단에 표시되는 대형 배너 이미지
   - **크기**: 정확히 1024 x 500 픽셀
   - **형식**: PNG 또는 JPEG (1MB 이하)
   - **필수 여부**: ❌ 선택 사항 (하지만 권장)
   - **제작 도구**: 
     - Canva (템플릿: "Google Play Feature Graphic")
     - Figma, Photoshop, GIMP
   - **내용 제안**:
     - 앱 이름 + 로고
     - 핵심 기능 아이콘 (📸 사진, ⭐ 평점, 📍 지도, 💬 공유)
     - 스크린샷 조합
   - **없으면**: 추후 추가 가능 (첫 출시에 필수 아님)

3. **스크린샷**
   - 최소 2개, 최대 8개
   - 스마트폰 스크린샷

4. **앱 설명**
   ```
   간단한 설명 (80자):
   매일의 식사를 기록하고 공유하세요. 사진, 장소, 평점으로 나만의 맛집 지도 완성!

   자세한 설명 (4000자):
   [docs/app-store/APP_STORE_DESCRIPTION.md 참조]
   ```

#### E. 앱 액세스
- **모든 기능에 제한 없이 액세스 가능**: 예
- (또는 테스트 계정 제공)

#### F. 광고
- **앱에 광고 포함 여부**: 아니요

#### G. 콘텐츠 등급
- 설문조사 작성
- 예상 등급: 전체 이용가 또는 만 3세 이상

#### H. 앱 릴리스

1. **프로덕션 트랙** 선택
2. **새 릴리스 만들기**
3. **앱 번들 업로드**
   - 파일: https://expo.dev/artifacts/eas/t7mXMNatDbzfSG8gnMjRgs.aab
   - versionCode: 3
   - versionName: 1.0.0

4. **출시 노트 작성**
   ```
   v1.0.0 - 첫 출시
   
   • 식사 사진 등록 기능
   • 갤러리/카메라 선택 가능
   • 지도에서 식사 장소 확인
   • 실시간 피드 및 댓글
   • GPS 자동 위치 저장
   • 깔끔한 UI/UX
   ```

5. **검토 제출**

## 📋 필요한 정보 정리

### 앱 정보
- **패키지명**: com.dailymeal.app
- **앱 이름**: DailyMeal
- **버전**: 1.0.0 (versionCode: 3)
- **카테고리**: 음식 및 음료

### 연락처
- **이메일**: support@dailymeal.life
- **개인정보**: privacy@dailymeal.life
- **웹사이트**: https://www.dailymeal.life

### URL
- **개인정보처리방침**: https://www.dailymeal.life/privacy
- **이용약관**: https://www.dailymeal.life/terms
- **AAB 다운로드**: https://expo.dev/artifacts/eas/t7mXMNatDbzfSG8gnMjRgs.aab

### 파일 경로
- **앱 아이콘**: `/app/assets/icon-512x512.png`
- **앱 설명**: `/docs/app-store/APP_STORE_DESCRIPTION.md`
- **배포 가이드**: `/docs/app-store/PLAYSTORE_DEPLOYMENT.md`

## ⚠️ 주의사항

### 1. 법적 페이지 접근 확인
서버 배포 후 반드시 확인:
```bash
# 브라우저 시크릿 모드에서 테스트
https://www.dailymeal.life/privacy
https://www.dailymeal.life/terms
```

**확인사항:**
- [ ] 로그인 없이 접근 가능
- [ ] 페이지가 정상적으로 표시됨
- [ ] 모바일에서도 잘 보임

### 2. 스크린샷 품질
- 실제 콘텐츠 사용 (샘플 데이터 OK)
- 고해상도 이미지
- UI가 깨끗하게 보이도록

### 3. 리뷰 시간
- 첫 리뷰: 1-7일 소요
- 거절 시 수정 후 재제출 가능

### 4. 테스트 트랙 (선택)
첫 출시 전 내부 테스트 가능:
- 내부 테스트: 최대 100명
- 비공개 테스트: 무제한
- 공개 테스트: 무제한

## 📞 문제 발생 시

### 개인정보 페이지 접근 불가
```bash
# 서버에서 확인
cd /path/to/DailyMeal
grep -r "privacy\|terms" frontend/src/middleware.ts
```

### AAB 업로드 오류
- 서명 키 확인
- versionCode 증가 필요
- 패키지명 중복 확인

### 리뷰 거절
- 거절 이유 확인
- 수정 후 재제출
- 일반적 거절 이유:
  - 법적 페이지 접근 불가
  - 스크린샷 불충분
  - 앱 설명 불충분
  - 권한 설명 부족

## ✅ 최종 체크리스트

### 배포 전
- [ ] Frontend 서버 배포 완료
- [ ] https://www.dailymeal.life/privacy 접근 확인
- [ ] https://www.dailymeal.life/terms 접근 확인
- [ ] 스크린샷 2-8개 준비 완료

### Play Console 등록
- [ ] 앱 만들기
- [ ] 앱 아이콘 업로드
- [ ] 스크린샷 업로드
- [ ] 앱 설명 입력
- [ ] 개인정보처리방침 URL 입력
- [ ] AAB 파일 업로드
- [ ] 출시 노트 작성
- [ ] 검토 제출

### 제출 후
- [ ] 리뷰 대기 (1-7일)
- [ ] 승인 알림 확인
- [ ] 앱 스토어에서 확인
- [ ] 사용자 피드백 모니터링

## 🎯 예상 일정

- **지금**: 서버 배포 + 스크린샷 촬영
- **오늘 중**: Play Console 등록 완료
- **1-7일 후**: 리뷰 완료 및 승인
- **승인 즉시**: 앱 스토어 공개

## 📚 참고 문서

- [Play Store 배포 가이드](../docs/app-store/PLAYSTORE_DEPLOYMENT.md)
- [앱 스토어 설명](../docs/app-store/APP_STORE_DESCRIPTION.md)
- [앱 빌드 결과](../docs/app/BUILD_RESULT.md)
- [개인정보 처리방침](https://www.dailymeal.life/privacy)
- [이용약관](https://www.dailymeal.life/terms)
