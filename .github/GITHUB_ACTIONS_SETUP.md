# GitHub Actions 환경 설정 가이드

DailyMeal 프로젝트의 CI/CD를 위해 다음 GitHub Variables와 Secrets를 설정해야 합니다.

## 🔑 Secrets (민감한 정보)

GitHub Repository → Settings → Secrets and variables → Actions → **Secrets** 탭에서 추가:

### SSH 인증 정보
- **`EC2_PRIVATE_KEY`**: EC2 서버 접속용 SSH 개인키 🔐
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  (여기에 개인키 내용 전체 복사)
  -----END OPENSSH PRIVATE KEY-----
  ```

## 📋 Variables (일반 설정값)

GitHub Repository → Settings → Secrets and variables → Actions → **Variables** 탭에서 추가:

### 서버 정보
- **`EC2_HOST`**: EC2 서버의 IP 주소 또는 도메인
  ```
  예: 123.456.789.012 또는 dailymeal.com
  ```

- **`EC2_USERNAME`**: EC2 서버 사용자명
  ```  
  예: ubuntu (Ubuntu 서버의 경우)
  예: ec2-user (Amazon Linux의 경우)
  ```

### 도메인 정보
- **`DOMAIN_URL`**: 프로덕션 도메인 (HTTPS 포함)
  ```
  예: https://dailymeal.com
  예: http://dailymeal.com (SSL 미적용 시)
  ```

- **`STAGING_DOMAIN_URL`**: 개발/테스트 도메인 (선택)
  ```
  예: https://dev.dailymeal.com
  예: http://dev.dailymeal.com
  ```

## 🛠️ SSH 키 생성 방법

로컬에서 SSH 키페어를 생성했다면:

```bash
# 공개키를 EC2 서버에 추가
cat dailymeal-deploy-key.pub >> ~/.ssh/authorized_keys

# 개인키 내용을 GitHub Secret EC2_PRIVATE_KEY에 복사
cat dailymeal-deploy-key
```

## 🎯 설정 위치

1. **Secrets 설정**: Repository → Settings → Secrets and variables → Actions → **Secrets** 탭
   - `EC2_PRIVATE_KEY` 추가

2. **Variables 설정**: Repository → Settings → Secrets and variables → Actions → **Variables** 탭  
   - `EC2_HOST`, `EC2_USERNAME`, `DOMAIN_URL` 추가

## 🌳 브랜치 전략

| 브랜치 | 환경 | 자동 배포 | 서버 경로 | 포트 |
|--------|------|-----------|-----------|------|
| `main` | 개발 | ❌ | - | - |
| `dev` | 스테이징 | ✅ | `/home/ubuntu/DailyMeal-staging` | 8001, 3001 |
| `prod` | 프로덕션 | ✅ | `/home/ubuntu/DailyMeal` | 8000, 3000 |

## ✅ 설정 확인

모든 Variables와 Secrets 설정 후:

1. **스테이징 테스트**: `dev` 브랜치에 커밋 push
2. **프로덕션 배포**: `prod` 브랜치에 커밋 push  
3. GitHub Actions 탭에서 워크플로우 실행 확인
4. 성공 시 서버에서 `pm2 list`로 앱 상태 확인

## 🔧 트러블슈팅

- **SSH 연결 실패**: `EC2_PRIVATE_KEY` 형식 확인 (개행문자 포함)
- **권한 오류**: EC2 서버에서 `chmod 600 ~/.ssh/authorized_keys` 실행
- **빌드 실패**: 로컬에서 `npm run build:hybrid` 테스트 후 push