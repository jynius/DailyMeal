# 🌐 도메인 변경 체크리스트

## 📋 변경할 도메인

**기존:** `www.dailymeal.life`  
**새 도메인:** `dailymeal.app` (예시)

---

## 📝 변경이 필요한 파일 목록

### 1️⃣ **서버 설정 파일**

#### `/etc/caddy/Caddyfile`
```bash
# 변경 전
www.dailymeal.life {

# 변경 후
dailymeal.app, www.dailymeal.app {
```

**명령어:**
```bash
sudo nano /etc/caddy/Caddyfile
# 도메인 변경 후
sudo systemctl restart caddy
```

---

#### `/etc/nginx/sites-available/dailymeal` (있는 경우)
```bash
# 변경 전
server_name ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com;

# 변경 후
server_name dailymeal.app www.dailymeal.app;
```

**명령어:**
```bash
sudo nano /etc/nginx/sites-available/dailymeal
# 있다면
sudo nano /etc/nginx/sites-available/dailymeal-ssl
# 도메인 변경 후
sudo nginx -t
sudo systemctl reload nginx
```

---

#### `ecosystem.config.js`
```javascript
// 변경 전
FRONTEND_URL: 'https://www.dailymeal.life',
API_BASE_URL: 'https://www.dailymeal.life/api',

// 변경 후
FRONTEND_URL: 'https://dailymeal.app',
API_BASE_URL: 'https://dailymeal.app/api',
```

**경로:** `/home/ubuntu/DailyMeal/ecosystem.config.js`

---

#### `frontend/.env.production`
```bash
# 변경 전
NEXT_PUBLIC_SITE_URL=https://www.dailymeal.life

# 변경 후
NEXT_PUBLIC_SITE_URL=https://dailymeal.app
```

**경로:** `/home/ubuntu/DailyMeal/frontend/.env.production`

---

### 2️⃣ **앱 설정 파일**

#### `app/app.json`
```json
{
  "expo": {
    "extra": {
      "productionWebUrl": "https://dailymeal.app"
    },
    "ios": {
      "associatedDomains": [
        "applinks:dailymeal.app",
        "applinks:www.dailymeal.app"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "data": [
            {
              "scheme": "https",
              "host": "dailymeal.app",
              "pathPrefix": "/share"
            }
          ]
        }
      ]
    }
  }
}
```

**경로:** `/home/jynius/projects/WebApp/DailyMeal/app/app.json`

---

### 3️⃣ **문서 파일 (선택 사항)**

- `README.md`
- `docs/*.md`
- `DEPLOYMENT_CHECKLIST.md`

---

## 🚀 변경 스크립트

도메인이 정해지면 이 스크립트로 한 번에 변경:

```bash
#!/bin/bash
# 도메인 변경 스크립트

OLD_DOMAIN="www.dailymeal.life"
NEW_DOMAIN="dailymeal.app"  # 여기에 새 도메인 입력

echo "🔄 도메인 변경: $OLD_DOMAIN → $NEW_DOMAIN"

# 1. ecosystem.config.js
echo "📝 ecosystem.config.js 변경..."
sed -i "s|$OLD_DOMAIN|$NEW_DOMAIN|g" ~/DailyMeal/ecosystem.config.js

# 2. frontend/.env.production
echo "📝 .env.production 변경..."
sed -i "s|$OLD_DOMAIN|$NEW_DOMAIN|g" ~/DailyMeal/frontend/.env.production

# 3. app/app.json
echo "📝 app.json 변경..."
sed -i "s|$OLD_DOMAIN|$NEW_DOMAIN|g" ~/DailyMeal/app/app.json

# 4. Caddyfile
echo "📝 Caddyfile 변경..."
sudo sed -i "s|$OLD_DOMAIN|$NEW_DOMAIN|g" /etc/caddy/Caddyfile

# 5. Nginx 설정 (있는 경우)
if [ -f "/etc/nginx/sites-available/dailymeal" ]; then
  echo "📝 Nginx dailymeal 변경..."
  sudo sed -i "s|ec2-43-202-215-27\.ap-northeast-2\.compute\.amazonaws\.com|$NEW_DOMAIN|g" /etc/nginx/sites-available/dailymeal
fi

if [ -f "/etc/nginx/sites-available/dailymeal-ssl" ]; then
  echo "📝 Nginx dailymeal-ssl 변경..."
  sudo sed -i "s|ec2-43-202-215-27\.ap-northeast-2\.compute\.amazonaws\.com|$NEW_DOMAIN|g" /etc/nginx/sites-available/dailymeal-ssl
fi

echo "✅ 도메인 변경 완료!"
echo ""
echo "📋 다음 단계:"
if [ -f "/etc/caddy/Caddyfile" ]; then
  echo "  1. sudo systemctl restart caddy"
fi
if [ -f "/etc/nginx/sites-available/dailymeal" ]; then
  echo "  1. sudo nginx -t && sudo systemctl reload nginx"
fi
echo "  2. cd ~/DailyMeal && ./bin/deploy.sh"
echo "  3. cd app && eas build --platform android --profile preview"
```

**사용 방법:**
```bash
# 1. 스크립트 저장
nano ~/change-domain.sh

# 2. NEW_DOMAIN 수정
# NEW_DOMAIN="실제-도메인.app"

# 3. 실행 권한
chmod +x ~/change-domain.sh

# 4. 실행
./change-domain.sh
```

---

## 📊 변경 순서

### 단계 1: 도메인 구매 및 DNS 설정
```bash
1. 가비아/Namecheap에서 도메인 구매
2. DNS A 레코드 설정
   - @ → 탄력적 IP
   - www → 탄력적 IP
3. DNS 전파 대기 (5분~1시간)
```

### 단계 2: 설정 파일 변경 (서버)
```bash
# 스크립트 사용 또는 수동 변경
./change-domain.sh

# 또는 수동:
# 1. ecosystem.config.js
# 2. frontend/.env.production
# 3. /etc/caddy/Caddyfile
```

### 단계 3: 서비스 재시작
```bash
# Caddy 재시작
sudo systemctl restart caddy

# 프론트엔드 재빌드 & PM2 재시작
cd ~/DailyMeal
./bin/deploy.sh
```

### 단계 4: 앱 설정 변경 (로컬)
```bash
# app/app.json 수정
cd /home/jynius/projects/WebApp/DailyMeal/app
nano app.json
# productionWebUrl, associatedDomains, intentFilters 변경
```

### 단계 5: 앱 재빌드
```bash
cd /home/jynius/projects/WebApp/DailyMeal/app
eas build --platform android --profile preview
```

---

## ✅ 확인 사항

### DNS 전파 확인
```bash
# 로컬에서
nslookup dailymeal.app
dig dailymeal.app

# 결과에 탄력적 IP가 나와야 함
```

### HTTPS 확인
```bash
# 서버에서
curl -I https://dailymeal.app

# 200 OK 및 자물쇠 아이콘 확인
```

### 앱 테스트
```bash
# 공유 링크 생성 후 클릭
# dailymeal://share/meal/xxx
# https://dailymeal.app/share/meal/xxx

# 앱이 자동으로 열리는지 확인
```

---

## 🎯 요약

**변경 필요 파일:**
1. ✅ `/etc/caddy/Caddyfile` (서버)
2. ✅ `ecosystem.config.js` (서버)
3. ✅ `frontend/.env.production` (서버)
4. ✅ `app/app.json` (로컬)

**변경 후 작업:**
1. ✅ Caddy 재시작
2. ✅ 프론트엔드 재빌드 (`./bin/deploy.sh`)
3. ✅ 앱 재빌드 (`eas build`)

---

**도메인이 정해지면 알려주세요! 스크립트를 실행 가능한 상태로 만들어드리겠습니다.** 🚀
