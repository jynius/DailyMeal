# 🚀 Caddy로 DailyMeal HTTPS 설정 가이드

## 📋 Caddy 선택 이유

- ✅ **자동 HTTPS**: Let's Encrypt 인증서 자동 발급 및 갱신
- ✅ **간단한 설정**: 2줄이면 HTTPS 완료
- ✅ **HTTP/2, HTTP/3** 자동 지원
- ✅ **WebSocket** 지원 (Socket.IO)
- ✅ **리버스 프록시** 내장

---

## 🔧 설치 및 설정

### 자동 설치 (권장)

```bash
# 서버에서 실행
cd /home/jynius/projects/WebApp/DailyMeal
./bin/setup-caddy.sh
```

### 수동 설치

#### 1단계: Caddy 설치

```bash
# 패키지 저장소 추가
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Caddy 설치
sudo apt update
sudo apt install caddy

# 버전 확인
caddy version
```

#### 2단계: Caddyfile 설정

```bash
sudo vi /etc/caddy/Caddyfile
```

**내용:**
```
www.dailymeal.life {
    # 로그
    log {
        output file /var/log/caddy/access.log
        format json
    }

    # 프론트엔드 (Next.js)
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    # API → 백엔드
    handle /api/* {
        reverse_proxy localhost:8000
    }

    # 업로드 파일 → 백엔드
    handle /uploads/* {
        reverse_proxy localhost:8000
    }

    # Socket.IO → 백엔드
    handle /socket.io/* {
        reverse_proxy localhost:8000 {
            header_up Connection {http.request.header.Connection}
            header_up Upgrade {http.request.header.Upgrade}
        }
    }
}
```

#### 3단계: 방화벽 설정

```bash
# 80, 443 포트 열기
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

#### 4단계: Caddy 시작

```bash
# 로그 디렉토리 생성
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# 설정 검증
sudo caddy validate --config /etc/caddy/Caddyfile

# 서비스 시작
sudo systemctl enable caddy
sudo systemctl restart caddy

# 상태 확인
sudo systemctl status caddy
```

---

## 🔍 동작 확인

### 1. 서비스 상태
```bash
sudo systemctl status caddy
```

### 2. 로그 확인
```bash
# 실시간 로그
sudo journalctl -u caddy -f

# 최근 로그
sudo journalctl -u caddy -n 50
```

### 3. HTTPS 테스트
```bash
# 헤더 확인
curl -I https://www.dailymeal.life

# 인증서 확인
openssl s_client -connect www.dailymeal.life:443 -showcerts
```

### 4. 브라우저 테스트
- https://www.dailymeal.life
- 자물쇠 아이콘 확인
- 인증서 정보 확인 (Let's Encrypt)

---

## 📱 앱 테스트

### 1. 앱 재빌드 (인증서 적용 후)

```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile preview
```

### 2. APK 다운로드 및 설치

### 3. SSL 오류 없이 실행 확인
- 공유 링크 클릭
- 앱 자동 실행
- "SSL error" 없이 정상 로드

---

## 🛠️ 관리 명령어

### 서비스 관리
```bash
# 시작
sudo systemctl start caddy

# 중지
sudo systemctl stop caddy

# 재시작
sudo systemctl restart caddy

# 재로드 (다운타임 없이 설정 적용)
sudo systemctl reload caddy

# 상태 확인
sudo systemctl status caddy
```

### 설정 관리
```bash
# 설정 검증
sudo caddy validate --config /etc/caddy/Caddyfile

# 설정 포맷팅
sudo caddy fmt --overwrite /etc/caddy/Caddyfile

# 설정 적용 (재로드)
sudo systemctl reload caddy
```

### 로그 확인
```bash
# Caddy 시스템 로그
sudo journalctl -u caddy -f

# 액세스 로그
sudo tail -f /var/log/caddy/access.log

# 로그 검색
sudo journalctl -u caddy | grep error
```

### 인증서 관리
```bash
# 인증서 위치 확인
sudo ls -la /var/lib/caddy/.local/share/caddy/certificates/

# 인증서 상세 정보
sudo openssl x509 -in /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/ec2-*.crt -text -noout

# 인증서 만료일 확인
sudo openssl x509 -in /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/ec2-*.crt -enddate -noout
```

---

## ⚠️ 문제 해결

### 인증서 발급 실패

**증상:**
```
failed to get certificate
challenge failed
```

**원인 및 해결:**

1. **80 포트가 열려 있지 않음**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw reload
   ```

2. **AWS 보안 그룹 설정**
   - EC2 보안 그룹에서 80, 443 포트 인바운드 규칙 추가

3. **다른 웹서버가 80 포트 사용 중**
   ```bash
   # Nginx 중지
   sudo systemctl stop nginx
   sudo systemctl disable nginx
   
   # Caddy 재시작
   sudo systemctl restart caddy
   ```

4. **EC2 DNS로 인증서 발급 불가**
   - EC2 도메인은 Let's Encrypt가 거부할 수 있음
   - 해결: 커스텀 도메인 사용

### Caddy 시작 실패

```bash
# 로그 확인
sudo journalctl -u caddy -n 50

# 설정 검증
sudo caddy validate --config /etc/caddy/Caddyfile

# 포트 사용 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### SSL 인증서 갱신 문제

```bash
# 인증서 강제 갱신
sudo systemctl stop caddy
sudo rm -rf /var/lib/caddy/.local/share/caddy/certificates/
sudo systemctl start caddy

# 로그 확인
sudo journalctl -u caddy -f
```

---

## 📊 Caddy vs 다른 옵션

| 기능 | Caddy | Nginx + Certbot | Cloudflare Tunnel |
|------|-------|-----------------|-------------------|
| **설정 복잡도** | ⭐ 매우 쉬움 | ⭐⭐⭐ 복잡 | ⭐⭐ 중간 |
| **자동 HTTPS** | ✅ 자동 | ❌ 수동 | ✅ 자동 |
| **인증서 갱신** | ✅ 자동 | ⚠️ Cron 필요 | ✅ 자동 |
| **도메인 필요** | ✅ 권장 | ✅ 필수 | ❌ 선택 |
| **성능** | 🚀 빠름 | 🚀 매우 빠름 | ⚡ 약간 느림 |
| **WebSocket** | ✅ 지원 | ✅ 지원 | ✅ 지원 |
| **HTTP/3** | ✅ 지원 | ⚠️ 추가 설정 | ✅ 지원 |

---

## 🎯 다음 단계

1. ✅ Caddy 설치 및 설정
2. ✅ HTTPS 인증서 자동 발급 (1-2분 소요)
3. ✅ 브라우저에서 HTTPS 접속 테스트
4. ✅ 앱 재빌드 (`eas build`)
5. ✅ 앱에서 SSL 오류 없이 실행 확인

---

## 💡 팁

### PM2 프로세스 자동 시작
```bash
# PM2 프로세스는 그대로 유지
# Caddy가 80, 443 포트만 사용하고 3000, 8000은 localhost로 연결
pm2 list
```

### 개발 환경에서 테스트
```bash
# 로컬에서 개발 서버 실행
npm run dev

# Caddy는 프로덕션 서버에서만 사용
```

### 커스텀 도메인 추가 (나중에)
```
# Caddyfile
dailymeal.app, www.dailymeal.app {
    reverse_proxy localhost:3000
    # ... 나머지 설정
}
```

---

**설치 준비 완료!**

서버에서 다음 명령어 실행:
```bash
cd /home/jynius/projects/WebApp/DailyMeal
./bin/setup-caddy.sh
```

설치 완료 후:
```bash
# HTTPS 확인
curl -I https://www.dailymeal.life
```
