# 카카오맵 API 401 Unauthorized 해결 가이드

## 🚨 문제 상황

```
GET http://dapi.kakao.com/v2/maps/sdk.js?appkey=9a51447...&autoload=false
net::ERR_ABORTED 401 (Unauthorized)
```

## 원인

카카오맵 **JavaScript API 키**는 **도메인 등록이 필수**입니다. API 키만 발급받고 사용 도메인을 등록하지 않으면 401 에러가 발생합니다.

## ✅ 해결 방법

### 1단계: 카카오 개발자 콘솔 접속

1. **카카오 개발자 콘솔** 접속: https://developers.kakao.com
2. 로그인 후 **내 애플리케이션** 선택
3. 해당 앱 선택 (또는 새로 만들기)

### 2단계: Web 플랫폼 등록

1. 왼쪽 메뉴에서 **앱 설정** → **플랫폼** 선택
2. **Web 플랫폼 등록** 버튼 클릭
3. **사이트 도메인** 입력:

   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```

   **프로덕션 도메인도 추가** (배포시):
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

4. **저장** 클릭

### 3단계: JavaScript 키 확인

1. 왼쪽 메뉴에서 **앱 설정** → **앱 키** 선택
2. **JavaScript 키** 복사
3. `.env.local` 파일에 추가:

   ```bash
   NEXT_PUBLIC_KAKAO_API_KEY =your_javascript_key_here
   ```

### 4단계: 활성화 대기 및 재시작

1. **5~10분 대기** (API 키 활성화 시간)
2. **PM2 재시작**:

   ```bash
   pm2 restart ecosystem.dev.config.js --update-env
   ```

3. 또는 **개발 서버 재시작**:

   ```bash
   cd frontend
   npm run dev
   ```

## 🔍 확인 방법

### 브라우저 Console에서 확인

```javascript
// 1. API 키 확인
console.log(process.env.NEXT_PUBLIC_KAKAO_API_KEY )

// 2. 카카오맵 로드 여부 확인
console.log(window.kakao?.maps ? 'Loaded' : 'Not Loaded')
```

### 네트워크 탭에서 확인

1. F12 → Network 탭
2. 페이지 새로고침
3. `dapi.kakao.com` 요청 확인
4. **Status 200** = 성공 ✅
5. **Status 401** = 도메인 미등록 ❌

## 💡 주의사항

### JavaScript 키 vs REST API 키

| 구분 | JavaScript 키 | REST API 키 |
|------|--------------|-------------|
| **용도** | 브라우저에서 직접 사용 | 서버에서 API 호출 |
| **도메인 등록** | 필수 ✅ | 불필요 |
| **노출** | 공개 가능 (도메인으로 제한) | 비공개 (서버 환경변수) |
| **사용처** | `<script src="...">` | `fetch()` 등 서버 요청 |

DailyMeal은 **JavaScript 키**를 사용하므로 **반드시 도메인 등록** 필요!

### 환경별 도메인 설정

**개발 환경:**
```
http://localhost:3000
http://127.0.0.1:3000
```

**프로덕션 환경:**
```
https://dailymeal.com
https://www.dailymeal.com
```

**프리뷰 환경 (Vercel 등):**
```
https://dailymeal-preview.vercel.app
https://*.vercel.app    # 와일드카드는 지원 안 됨 (각각 등록 필요)
```

## 🎯 현재 프로젝트 설정

### .env.local 파일
```bash
# frontend/.env.local
NEXT_PUBLIC_KAKAO_API_KEY =9a51447dcf94f75c12430b8439214e87
```

### 등록할 도메인
```
http://localhost:3000
http://127.0.0.1:3000
```

### API 키 확인 URL
https://developers.kakao.com/console/app/{YOUR_APP_ID}/config/platform

## 🔧 대체 방법 (임시)

API 키 없이도 앱이 작동하도록 **더미 지도**를 표시합니다:

```tsx
// frontend/src/components/kakao-map.tsx 수정됨
if (error) {
  return (
    <div className="더미 지도 UI">
      <MapPin />
      <p>카카오 지도 API 키 설정이 필요합니다</p>
      <p>설정 방법: developers.kakao.com</p>
    </div>
  )
}
```

이렇게 하면:
- ✅ API 키 없어도 앱이 크래시하지 않음
- ✅ 사용자에게 설정 가이드 표시
- ✅ 음식점 목록은 정상 작동

## 📝 체크리스트

- [ ] 카카오 개발자 콘솔에 로그인
- [ ] Web 플랫폼에 `localhost:3000` 등록
- [ ] JavaScript 키 복사
- [ ] `.env.local`에 키 추가
- [ ] PM2 재시작 (5~10분 후)
- [ ] 브라우저에서 지도 확인

## 🆘 문제 지속시

### 1. API 키 활성화 시간 부족
- 도메인 등록 후 **최대 10분** 대기
- 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

### 2. 도메인 오타
- `http://localhost:3000` (정확히 입력)
- 포트 번호 확인 (3000인지 8000인지)

### 3. 다른 API 키 사용 중
- **JavaScript 키**인지 확인 (REST API 키 아님)
- 앱 키 페이지에서 재확인

### 4. 브라우저 문제
- 시크릿 모드로 테스트
- 다른 브라우저로 테스트
- 개발자 도구 Console 에러 확인

---

**작성일**: 2025-10-09
**상태**: ✅ 해결 가이드
**업데이트**: 더미 지도 UI 추가
