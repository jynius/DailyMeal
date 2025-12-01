# 카카오 로컬 API 설정 가이드

## 🔑 API 키 발급 방법

### 1. 카카오 개발자 계정 생성
https://developers.kakao.com/ 접속 → 로그인

### 2. 애플리케이션 생성
- "내 애플리케이션" 메뉴 클릭
- "애플리케이션 추가하기" 클릭
- 앱 이름: DailyMeal (또는 원하는 이름)
- 사업자명: 개인/회사명

### 3. REST API 키 확인
- 앱 선택 → "앱 키" 탭
- "REST API 키" 복사

### 4. 플랫폼 등록 (필수)
- "플랫폼" 탭 → "Web 플랫폼 등록"
- 사이트 도메인:
  - 개발: `http://localhost:8000`
  - 운영: `https://api.dailymeal.life`

## 📝 환경 변수 설정

```bash
# backend/.env 파일에 추가
KAKAO_REST_API_KEY=your_actual_rest_api_key_here
```

## 🧪 테스트

```bash
# 카카오 API 직접 테스트
curl -v -X GET "https://dapi.kakao.com/v2/local/search/keyword.json" \
  -H "Authorization: KakaoAK YOUR_REST_API_KEY" \
  --data-urlencode "query=맛집" \
  --data-urlencode "x=127.027" \
  --data-urlencode "y=37.498"

# 기대 응답: 강남역 주변 맛집 리스트
```

## 🎯 DailyMeal 적용 결과

### 동작 흐름
1. **사용자 개인 추천 시도** (친구/인기/협업)
2. **Fallback**: 커뮤니티 전체 인기 맛집
3. **카카오 API**: 실제 맛집 데이터 (운영 환경)

### API 호출 조건
- 사용자 데이터 없음
- 커뮤니티 데이터도 없음 (완전한 cold start)
- `KAKAO_REST_API_KEY` 환경 변수 설정됨

### 로그 확인
```bash
pm2 logs dailymeal-backend --lines 50

# 예상 로그:
# [RecommendationService] No recommendations found, using fallback for user xxx
# [RecommendationService] Using Kakao Local API for user xxx
```

## 📊 API 제한

- **무료 할당량**: 하루 30만 건
- **속도 제한**: 없음
- **비용**: 무료
- **데이터**: 전국 POI 데이터

## ⚠️ 주의사항

### 1. API 키 보안
```bash
# ❌ 절대 커밋하지 말 것
git add backend/.env  # 금지!

# ✅ .gitignore 확인
backend/.env
backend/.env.local
```

### 2. 운영 환경 배포
```bash
# AWS Secrets Manager 또는 환경 변수로 주입
aws secretsmanager create-secret \
  --name dailymeal/kakao-api-key \
  --secret-string "your_key_here"
```

### 3. API 키 없을 때
- 로그에 경고 메시지: "KAKAO_REST_API_KEY not configured"
- 빈 배열 반환 (에러 없음)
- 프론트엔드에서 "추천이 없습니다" 표시

## 📚 카카오 로컬 API 문서

- **공식 가이드**: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- **키워드 검색**: https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
- **좌표 검색**: https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category

## 🔧 문제 해결

### "KAKAO_REST_API_KEY not configured" 로그
```bash
# 1. .env 파일 확인
cat backend/.env | grep KAKAO

# 2. 환경 변수 재로드
pm2 restart dailymeal-backend --update-env
```

### API 호출 실패 (401 Unauthorized)
- API 키가 올바른지 확인
- 플랫폼 등록 확인 (developers.kakao.com)

### API 호출 실패 (429 Too Many Requests)
- 일일 할당량 초과 (30만 건)
- 다음날 자정 리셋

---

**설정 완료 시간**: ~5분  
**비용**: 무료  
**필수 여부**: 선택 (없어도 작동, 있으면 품질 향상)
