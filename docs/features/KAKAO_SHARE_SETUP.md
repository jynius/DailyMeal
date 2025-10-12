# 카카오톡 공유 기능 설정 가이드

## 📋 개요

DailyMeal 앱에서 카카오톡 공유 기능을 사용하기 위한 설정 가이드입니다.

## 🔑 1. 카카오 개발자 앱 등록

### 1.1 카카오 개발자 계정 생성
1. https://developers.kakao.com/ 접속
2. 로그인 또는 회원가입
3. 내 애플리케이션 → 애플리케이션 추가하기

### 1.2 앱 생성
- **앱 이름**: DailyMeal
- **사업자명**: (선택사항)

### 1.3 플랫폼 등록
**내 애플리케이션 > 플랫폼 > Web 플랫폼 등록**
- **사이트 도메인**: 
  - 개발: `http://localhost:3000`
  - 프로덕션: `https://yourdomain.com`

## 🔐 2. JavaScript 키 발급

### 2.1 키 복사
1. 내 애플리케이션 선택
2. 앱 키 > **JavaScript 키** 복사

### 2.2 환경 변수 설정

**`/frontend/.env.local` 파일 수정:**

```bash
# 카카오 API 설정
NEXT_PUBLIC_KAKAO_API_KEY =ed3fcb925e66c37de96bac113b142ba7
NEXT_PUBLIC_KAKAO_API_KEY =여기에_복사한_JavaScript_키_붙여넣기
```

**예시:**
```bash
NEXT_PUBLIC_KAKAO_API_KEY =a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## 🔧 3. 도메인 설정

### 3.1 Redirect URI 등록 (선택사항)
카카오 로그인을 사용하는 경우:
- **내 애플리케이션 > 제품 설정 > 카카오 로그인 > Redirect URI**
- 개발: `http://localhost:3000/api/auth/callback/kakao`
- 프로덕션: `https://yourdomain.com/api/auth/callback/kakao`

### 3.2 카카오링크 도메인 등록
- **내 애플리케이션 > 제품 설정 > 카카오링크**
- 개발: `http://localhost:3000`
- 프로덕션: `https://yourdomain.com`

## ✅ 4. 구현 완료 항목

### 4.1 백엔드 (이미 완료)
- ✅ 공유 링크 생성 API
- ✅ 공개 공유 페이지 API
- ✅ 친구 연결 API

### 4.2 프론트엔드 (이미 완료)
- ✅ 카카오 SDK 스크립트 추가 (`layout.tsx`)
- ✅ 카카오 공유 서비스 구현 (`kakao-share.ts`)
- ✅ ShareModal에 카카오톡 공유 통합
- ✅ 자동 초기화 및 에러 핸들링

## 🧪 5. 테스트 방법

### 5.1 로컬 테스트
```bash
# 프론트엔드 재시작
cd frontend
npm run dev
```

### 5.2 카카오톡 공유 테스트
1. http://localhost:3000/feed 접속
2. 아무 식사 카드의 공유 버튼 클릭
3. ShareModal에서 "카카오톡" 버튼 클릭
4. 카카오톡 공유 창이 열리면 성공!

### 5.3 디버깅
**개발자 도구 콘솔 확인:**
```
Kakao SDK initialized  ← 정상
```

**에러 메시지:**
- `카카오 JavaScript 키가 설정되지 않았습니다.` → `.env.local` 확인
- `Kakao SDK가 초기화되지 않았습니다.` → 페이지 새로고침

## 📱 6. 카카오톡 메시지 템플릿

### 6.1 현재 구현된 템플릿
```typescript
{
  objectType: 'feed',
  content: {
    title: '식사 이름 - DailyMeal',
    description: '식사 메모 또는 설명',
    imageUrl: '식사 사진 URL',
    link: {
      mobileWebUrl: 'http://localhost:3000/share/meal/[shareId]?ref=[userId]',
      webUrl: 'http://localhost:3000/share/meal/[shareId]?ref=[userId]',
    },
  },
  buttons: [
    {
      title: '자세히 보기',
      link: {
        mobileWebUrl: '공유 링크',
        webUrl: '공유 링크',
      },
    },
  ],
}
```

### 6.2 메시지 구성 요소
- **제목**: 식사 이름 + "- DailyMeal"
- **설명**: 식사 메모 (없으면 식사 이름)
- **이미지**: 첫 번째 식사 사진
- **링크**: 암호화된 ref 파라미터 포함 (친구 추적용)
- **버튼**: "자세히 보기" CTA

## 🚀 7. 프로덕션 배포 전 체크리스트

### 7.1 환경 변수
- [ ] 프로덕션 `.env.production` 파일에 카카오 키 추가
- [ ] Next.js 빌드 시 환경 변수 포함 확인

### 7.2 카카오 개발자 설정
- [ ] 프로덕션 도메인 등록
- [ ] 카카오링크 도메인 승인 요청
- [ ] 비즈니스 인증 (선택사항, 더 많은 기능 사용 가능)

### 7.3 HTTPS 필수
- [ ] 프로덕션 환경은 HTTPS 필수
- [ ] SSL 인증서 설정 완료

### 7.4 OG 메타 태그 (권장)
카카오톡 공유 시 더 예쁜 미리보기:
- [ ] Open Graph 메타 태그 추가
- [ ] 공유 페이지에 OG 이미지, 제목, 설명 설정

## 📚 8. 추가 기능 아이디어

### 8.1 커스텀 템플릿
- 카카오 개발자 콘솔에서 메시지 템플릿 디자인
- 더 화려한 레이아웃 제공

### 8.2 카카오톡 스토리 공유
```typescript
kakaoShare.shareStory({
  title: '식사 이름',
  description: '식사 설명',
  url: '공유 링크',
  imageUrl: '식사 사진',
})
```

### 8.3 통계 추적
- 카카오톡 공유 횟수
- 공유를 통한 신규 가입 추적
- 가장 많이 공유된 식사 분석

## 🔗 참고 자료

- [카카오 개발자 센터](https://developers.kakao.com/)
- [카카오링크 가이드](https://developers.kakao.com/docs/latest/ko/message/js-link)
- [JavaScript SDK 문서](https://developers.kakao.com/docs/latest/ko/sdk-download/js)
- [메시지 템플릿 빌더](https://developers.kakao.com/tool/message-template-builder)

## ⚠️ 문제 해결

### SDK 로딩 안 됨
```javascript
// 브라우저 콘솔에서 확인
window.Kakao
// undefined → SDK 로딩 실패
// Object → 정상
```

### 공유 버튼 클릭 시 아무 반응 없음
1. 개발자 도구 콘솔 에러 확인
2. 카카오 JavaScript 키 확인
3. 페이지 새로고침 후 재시도

### "OpenAI API 사용" 메시지
- 이전 카카오 스토리 URL 방식에서 발생
- 현재는 SDK 방식으로 변경되어 해결됨

## 📝 설정 완료 후

다음 명령어로 서버 재시작:
```bash
cd /home/jynius/projects/WebApp/DailyMeal
npm run dev:pm2
```

설정이 완료되면 바로 카카오톡 공유가 작동합니다! 🎉
