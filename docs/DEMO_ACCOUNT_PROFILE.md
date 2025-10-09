# 데모 계정 프로필 테스트 가이드

## ✅ 데모 계정 프로필 확인 방법

### 방법 1: 브라우저에서 테스트

1. **로그인 상태 확인**
   - 데모 계정으로 로그인되어 있는지 확인
   - 로그인 안 되어 있으면 "데모 계정으로 체험하기" 클릭

2. **프로필 페이지 접속**
   - 하단 네비게이션에서 "프로필" 탭 클릭
   - 또는 URL: `http://localhost:3000/profile`

3. **예상 결과**
   ```
   사용자명: 데모 사용자
   이메일: demo@dailymeal.com
   통계:
     - 총 리뷰: X개
     - 방문 식당: X개
     - 친구: X명
   ```

### 방법 2: 브라우저 콘솔에서 API 직접 호출

**F12 → Console:**
```javascript
// 1. 토큰 확인
const token = localStorage.getItem('token')
console.log('Token exists:', !!token)

// 2. 프로필 API 호출
fetch('http://localhost:8000/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Profile:', data))
.catch(err => console.error('Error:', err))
```

**예상 응답:**
```json
{
  "id": "7c6728a8-16a4-407e-ab3d-ba213abcfe2d",
  "username": "데모 사용자",
  "email": "demo@dailymeal.com",
  "profileImage": null,
  "bio": null,
  "stats": {
    "totalReviews": 10,
    "restaurantCount": 8,
    "friendCount": 0
  }
}
```

## 🔧 프로필이 안 보이는 경우

### 문제 1: "프로필을 불러올 수 없습니다" 에러

**원인:**
- 로그인 안 됨
- 토큰 만료

**해결:**
```javascript
// 브라우저 콘솔에서
localStorage.removeItem('token')
location.href = '/'
// 다시 데모 계정으로 로그인
```

### 문제 2: 통계가 0으로 표시됨

**원인:**
- 데모 계정으로 아직 식사를 추가하지 않음

**해결:**
1. 하단 "+" 버튼 클릭
2. 테스트 식사 몇 개 추가
3. 프로필 페이지 새로고침

## 📊 데모 계정 초기 데이터 확인

백엔드 로그에서 확인:
```bash
npx pm2 logs dailymeal-backend --lines 50 --nostream | grep "demo@dailymeal.com"
```

또는 데이터베이스 직접 확인 (예정):
```bash
cd backend
# DB 조회 스크립트 실행
```

## ✅ 프로필 페이지 기능

데모 계정으로 다음 기능들을 사용할 수 있습니다:

1. **프로필 보기** ✅
   - 사용자 정보
   - 통계 (리뷰, 식당, 친구)

2. **프로필 편집** ✅
   - 이름 변경
   - 자기소개(Bio) 작성
   - 프로필 이미지 업로드

3. **통계 확인** ✅
   - 총 리뷰 수
   - 방문한 식당 수
   - 친구 수

4. **설정** ✅
   - 알림 설정
   - 개인정보 설정
   - 위치 설정

## 🎯 즉시 테스트

### 단계 1: 프로필 페이지 열기
```
1. 데모 계정으로 로그인
2. 하단 탭에서 "프로필" 클릭
3. 프로필 정보가 로딩되는지 확인
```

### 단계 2: 편집 모드 테스트
```
1. "수정" 버튼 클릭
2. 이름 또는 Bio 변경
3. "저장" 버튼 클릭
4. 변경사항이 저장되는지 확인
```

### 단계 3: 통계 확인
```
1. 통계 섹션 확인
2. 리뷰 수가 맞는지 확인
3. (식사를 추가했다면) 숫자가 증가하는지 확인
```

## 📝 결론

**데모 계정의 프로필은 정상적으로 불러올 수 있습니다!**

프로필 API:
- ✅ 엔드포인트: `GET /users/me`
- ✅ 인증: JWT 토큰 필요
- ✅ 응답: 사용자 정보 + 통계

**바로 테스트해보세요:**
1. http://localhost:3000/profile 접속
2. 프로필 정보 확인

문제가 있다면 브라우저 콘솔 로그를 확인해주세요!
