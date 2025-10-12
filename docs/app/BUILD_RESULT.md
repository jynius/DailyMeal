# 🎉 DailyMeal 앱 빌드 완료!

## 📱 빌드 정보

**빌드 날짜:** 2025-10-11  
**빌드 ID:** bb3d23fd-c407-431e-a342-38ccb9d2f3b6  
**플랫폼:** Android  
**프로필:** Preview (테스트용)  
**SDK 버전:** 54.0.0  
**앱 버전:** 1.0.0  
**버전 코드:** 2  

---

## 📥 APK 다운로드

### 방법 1: 직접 다운로드 (PC/노트북)
```
https://expo.dev/artifacts/eas/p82d7N5LFStT9rRxzzfCc9.apk
```

1. 위 링크를 브라우저에서 열기
2. APK 파일 다운로드
3. 안드로이드 기기로 파일 전송
4. 기기에서 APK 설치

---

### 방법 2: QR 코드 스캔 (안드로이드 기기)

**빌드 페이지:**
```
https://expo.dev/accounts/jynius/projects/dailymeal/builds/bb3d23fd-c407-431e-a342-38ccb9d2f3b6
```

1. 안드로이드 기기에서 위 링크 열기
2. QR 코드 스캔하거나 "Download" 버튼 클릭
3. APK 다운로드
4. 설치 진행

---

### 방법 3: Expo Go 앱 (개발용)
```
exp://u.expo.dev/update/bb3d23fd-c407-431e-a342-38ccb9d2f3b6
```

1. Expo Go 앱 설치 (Google Play Store)
2. 위 링크 열기 또는 QR 코드 스캔
3. 앱 실행

---

## 📲 APK 설치 방법 (안드로이드)

### 1. APK 다운로드
- 위의 다운로드 링크 사용
- 또는 빌드 페이지에서 다운로드

### 2. 알 수 없는 출처 허용
**Android 8.0 이상:**
1. APK 파일 실행 시도
2. "이 출처에서 허용" 팝업 표시
3. "설정" 버튼 클릭
4. "이 출처 허용" 토글 활성화
5. 뒤로 가기 후 다시 설치

**또는 수동 설정:**
1. 설정 → 보안 → 알 수 없는 앱 설치
2. 사용할 브라우저/파일 관리자 선택
3. "이 출처 허용" 활성화

### 3. APK 설치
1. APK 파일 실행
2. "설치" 버튼 클릭
3. 설치 완료 대기
4. "열기" 버튼으로 앱 실행

---

## ✅ 테스트 체크리스트

### 기본 기능
- [ ] 앱 실행 및 웹사이트 로드
- [ ] 회원가입 (새 계정)
- [ ] 로그인
- [ ] 로그아웃

### 식사 기록
- [ ] 식사 추가
- [ ] 사진 촬영/선택
- [ ] 맛집 검색 및 선택
- [ ] 식사 상세 보기
- [ ] 식사 수정
- [ ] 식사 삭제

### 피드
- [ ] 피드 목록 보기
- [ ] 필터 (전체/친구)
- [ ] 무한 스크롤
- [ ] 좋아요/댓글

### 친구
- [ ] 사용자 검색
- [ ] 친구 요청
- [ ] 친구 수락/거절
- [ ] 친구 목록 보기
- [ ] 친구 프로필 보기

### 맛집
- [ ] 맛집 목록 보기
- [ ] 맛집 검색
- [ ] 맛집 상세 정보
- [ ] 맛집 위치 (지도)

### 공유 기능 ⭐ (중요!)
- [ ] 웹에서 공유 링크 생성
- [ ] 카카오톡으로 공유 링크 전송
- [ ] 공유 링크 클릭 시 앱 실행 (`dailymeal://` 스킴)
- [ ] 앱에서 해당 식사 페이지 열림
- [ ] 웹 링크 클릭 시 앱 열림 (App Links)

### 프로필
- [ ] 내 프로필 보기
- [ ] 프로필 수정
- [ ] 다른 사용자 프로필 보기

---

## 🐛 문제 발생 시

### 앱이 실행되지 않음
- 안드로이드 버전 확인 (최소 Android 6.0 이상)
- 저장 공간 확인 (최소 100MB)
- 앱 재설치

### 웹사이트 로딩 실패
- 인터넷 연결 확인
- 서버 상태 확인:
  ```
  https://www.dailymeal.life
  ```
- 방화벽 설정 확인

### Deep Link 동작 안 함
1. 웹에서 공유 링크 생성 확인
2. 링크 형식 확인:
   - `dailymeal://share/meal/[id]`
   - `https://www.dailymeal.life/share/meal/[id]`
3. 앱 재설치 후 재시도

### 로그 확인
```bash
# 안드로이드 기기 연결 후
adb logcat | grep DailyMeal
```

---

## 📊 빌드 히스토리

### 최근 빌드 목록

**빌드 #3 (최신)**
- 날짜: 2025-10-11 00:23
- 버전: 1.0.0 (Build 2)
- 프로필: Preview (APK)
- 다운로드: https://expo.dev/artifacts/eas/p82d7N5LFStT9rRxzzfCc9.apk

**빌드 #2**
- 날짜: 2025-10-08 20:50
- 버전: 1.0.0 (Build 2)
- 프로필: Production (AAB)
- 다운로드: https://expo.dev/artifacts/eas/vamVHv5Tqser2zNWajo96d.aab

**빌드 #1**
- 날짜: 2025-10-08 20:22
- 버전: 1.0.0 (Build 1)
- 프로필: Preview (APK)
- 다운로드: https://expo.dev/artifacts/eas/cDas6RHWRijhb38xeBXxFr.apk

---

## 🔄 다음 빌드

### 새 버전 빌드 방법
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app

# Preview APK
eas build --platform android --profile preview

# Production AAB (Play Store)
eas build --platform android --profile production
```

### 버전 업데이트
`app.json` 파일에서:
```json
{
  "expo": {
    "version": "1.0.1",  // 버전 변경
    ...
  }
}
```

---

## 📱 배포 정보

**패키지 이름:** com.dailymeal.app  
**번들 ID:** com.dailymeal.app  
**최소 Android 버전:** 6.0 (API 23)  
**대상 Android 버전:** 14 (API 34)  
**Expo SDK:** 54.0.0  

---

## 🎯 다음 단계

### 테스트 완료 후

1. **문제 없음** ✅
   - Google Play Store 배포 준비
   - Apple App Store 배포 준비 (iOS)

2. **버그 발견** 🐛
   - 코드 수정
   - 새 빌드 생성
   - 재테스트

3. **기능 추가** 🚀
   - 기능 개발
   - 버전 업데이트 (1.0.1 → 1.1.0)
   - 새 빌드 배포

---

## 🆘 도움말

### EAS 빌드 관리
```bash
# 빌드 목록 확인
eas build:list

# 특정 빌드 정보
eas build:view [BUILD_ID]

# 빌드 로그 확인
eas build:view [BUILD_ID] --logs

# 빌드 취소
eas build:cancel [BUILD_ID]
```

### Expo 프로젝트 정보
```bash
# 프로젝트 정보
eas project:info

# 계정 정보
eas whoami

# 로그아웃
eas logout
```

---

**빌드 완료 시각:** 2025-10-11 00:27:43  
**빌드 소요 시간:** 약 4분 33초  
**상태:** ✅ 성공
