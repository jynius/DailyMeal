# 브랜치 설정 가이드

DailyMeal 프로젝트의 새로운 브랜치 전략을 설정하는 방법입니다.

## 🌳 브랜치 생성

현재 `main` 브랜치에서 새로운 브랜치들을 생성합니다:

```bash
# 현재 main 브랜치에서 시작
git checkout main
git pull origin main

# dev 브랜치 생성 및 푸시
git checkout -b dev
git push -u origin dev

# prod 브랜치 생성 및 푸시  
git checkout -b prod
git push -u origin prod

# 다시 main으로 돌아가기
git checkout main
```

## 🔧 GitHub 저장소 설정

### 1. 기본 브랜치 설정 (선택)
- GitHub Repository → Settings → General → Default branch
- 필요시 `main`으로 설정 (이미 설정되어 있을 것)

### 2. 브랜치 보호 규칙 (권장)
GitHub Repository → Settings → Branches에서:

#### `main` 브랜치 보호
```
☑️ Require a pull request before merging
☑️ Require review from code owners (선택)
☑️ Restrict pushes that create files larger than 100MB
```

#### `prod` 브랜치 보호 (중요!)
```  
☑️ Require a pull request before merging
☑️ Require review from code owners
☑️ Require status checks to pass before merging
☑️ Require branches to be up to date before merging
☑️ Restrict pushes that create files larger than 100MB
```

## 🚀 워크플로우 사용법

### 개발 단계
```bash
# 1. 기능 개발
git checkout main
git checkout -b feature/new-feature
# ... 개발 작업 ...
git commit -m "feat: 새로운 기능 추가"

# 2. main에 PR 생성 및 머지
git push origin feature/new-feature
# GitHub에서 PR 생성 → main 브랜치로 머지
```

### 스테이징 배포
```bash
# 3. dev 브랜치로 배포 (자동 배포 트리거)
git checkout dev
git merge main  # 또는 git rebase main
git push origin dev
# → GitHub Actions가 자동으로 스테이징 서버에 배포
```

### 프로덕션 배포  
```bash
# 4. 스테이징 테스트 완료 후 프로덕션 배포
git checkout prod
git merge dev  # 또는 특정 커밋 선택
git push origin prod  
# → GitHub Actions가 자동으로 프로덕션 서버에 배포
```

## 📊 브랜치별 역할

| 브랜치 | 역할 | 자동 배포 | 사용자 |
|--------|------|-----------|--------|
| `main` | 🔧 소스 코드 관리 | ❌ | 개발팀 |
| `dev` | 🧪 스테이징 환경 | ✅ | 개발팀, QA팀 |
| `prod` | 🚀 프로덕션 환경 | ✅ | 관리자만 |

## ⚠️ 주의사항

1. **`prod` 브랜치는 신중하게** - 실제 운영 서버에 바로 배포됩니다
2. **충분한 테스트** - `dev`에서 완전히 테스트 후 `prod`로 배포
3. **브랜치 보호** - `prod` 브랜치는 PR 리뷰 필수로 설정
4. **롤백 준비** - 문제 발생시 이전 커밋으로 빠른 롤백

## 🔧 트러블슈팅

### 브랜치 동기화 문제
```bash
# 모든 브랜치 최신화
git fetch --all
git checkout main && git pull origin main
git checkout dev && git pull origin dev  
git checkout prod && git pull origin prod
```

### GitHub Actions 실패시
1. GitHub Actions 탭에서 로그 확인
2. Variables/Secrets 설정 재확인
3. 서버 상태 및 권한 확인