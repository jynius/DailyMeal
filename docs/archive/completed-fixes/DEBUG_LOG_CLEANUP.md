# 디버그 로그 정리 완료

## 작업 일자
2025-11-14

## 작업 내용

### 1. Backend
- ✅ `backend/src/meal-records/meal-records.service.ts`의 `console.error`를 NestJS `Logger`로 변경
- Logger 인스턴스를 클래스에 추가하여 일관된 로깅 처리

### 2. Frontend
- ✅ 모든 `console.log` 디버깅 로그 제거
- ✅ 대부분의 `console.error` 제거 (이미 toast나 alert로 사용자에게 알림)
- 정리된 파일:
  - `app/(main)/page.tsx` - WebView 감지, 링크 클릭 로그 제거
  - `app/(detail)/meal/[id]/page.tsx` - 식사 조회 에러 로그 제거
  - `app/(detail)/meal/[id]/evaluate/page.tsx` - 평가 저장 로그 제거
  - `app/(main)/restaurant/page.tsx` - 맛집 목록 조회 로그 제거
  - `app/(main)/settings/page.tsx` - 설정 관련 로그 제거
  - `app/(main)/profile/page.tsx` - 프로필 관련 로그 제거
  - `app/(main)/statistics/page.tsx` - 통계 로그 제거
  - `app/(public)/share/meal/[shareId]/page.tsx` - 공유 식사 로그 제거
  - `app/error.tsx` - 전역 에러 로그 제거

### 3. Mobile App
- ✅ 불필요한 Alert 제거:
  - 카카오톡 설치 필요 Alert → console.warn으로 변경
  - 카카오톡 오류 Alert → console.error로 변경
  - 카메라 권한 Alert은 유지 (필수 사용자 피드백)
  - 사진 선택 Alert은 유지 (필수 UI)
  
- ⚠️ `app/App.js`의 43개 console.log/warn 중 일부만 정리
- ⚠️ `app/utils/url-handler.js`의 13개 console.log/warn은 대부분 유지
  - 이유: 디버깅에 매우 유용하며, 프로덕션 빌드 시 자동 제거 가능

## 남은 로그

### App (React Native)
개발 환경에서 유용한 디버깅 로그들이 남아있습니다:
- WebView 통신 로그 (message 송수신)
- Intent URL 처리 로그
- 카카오톡 앱 연동 로그
- Pull-to-Refresh 로그
- Deep Link 처리 로그

### 프로덕션 빌드 시 권장사항
```bash
# Babel plugin을 사용하여 console 자동 제거
npm install --save-dev babel-plugin-transform-remove-console

# babel.config.js에 추가
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // 프로덕션 빌드시 console 제거
    process.env.NODE_ENV === 'production' && 
      ['transform-remove-console', { exclude: ['error', 'warn'] }]
  ].filter(Boolean),
}
```

## 로그 정책

### Backend
- ✅ `Logger` 사용 (NestJS 권장)
- ❌ `console.*` 직접 사용 금지

### Frontend
- ✅ 에러는 toast/alert로 사용자에게 알림
- ❌ `console.log` 디버깅 코드 제거
- ⚠️ `console.error`는 필요한 경우만 사용 (주로 catch 블록에서 제거)

### Mobile App
- ✅ 개발: console.log 활용 (디버깅 편의)
- ✅ 프로덕션: Babel plugin으로 자동 제거
- ❌ 불필요한 Alert 제거 (필수 피드백만 유지)

## 테스트 필요
1. Backend 로그가 정상적으로 출력되는지 확인
2. Frontend에서 에러 발생 시 toast가 정상 표시되는지 확인
3. Mobile App에서 카메라 권한 요청이 정상 동작하는지 확인
4. 카카오톡 공유 기능이 정상 동작하는지 확인 (로그만 제거, 기능 유지)
