#!/bin/bash
# Caddy 설치 및 설정 스크립트

echo "🚀 Caddy 설치 시작..."

# 1. Caddy 설치
echo "📦 Caddy 패키지 저장소 추가..."
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

echo "📦 Caddy 설치 중..."
sudo apt update
sudo apt install -y caddy

# 2. Caddy 서비스 확인
echo "✅ Caddy 설치 완료!"
caddy version

# 3. Caddyfile 백업
if [ -f /etc/caddy/Caddyfile ]; then
    echo "💾 기존 Caddyfile 백업..."
    sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup
fi

# 4. DailyMeal용 Caddyfile 생성
echo "📝 Caddyfile 생성..."
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
# DailyMeal Caddy 설정
www.dailymeal.life {
    # 로그 설정
    log {
        output file /var/log/caddy/access.log
        format json
    }

    # 프론트엔드 (Next.js) - 기본
    reverse_proxy localhost:3000 {
        # 헤더 설정
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    # API 요청 → 백엔드
    handle /api/* {
        reverse_proxy localhost:8000 {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }

    # 업로드된 파일 → 백엔드
    handle /uploads/* {
        reverse_proxy localhost:8000
    }

    # Socket.IO → 백엔드
    handle /socket.io/* {
        reverse_proxy localhost:8000 {
            # WebSocket 지원
            header_up Connection {http.request.header.Connection}
            header_up Upgrade {http.request.header.Upgrade}
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }
}
EOF

echo "✅ Caddyfile 생성 완료!"

# 5. 로그 디렉토리 생성
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# 6. Caddy 설정 검증
echo "🔍 Caddy 설정 검증..."
sudo caddy validate --config /etc/caddy/Caddyfile

if [ $? -eq 0 ]; then
    echo "✅ Caddyfile 검증 성공!"
else
    echo "❌ Caddyfile 검증 실패!"
    exit 1
fi

# 7. 방화벽 설정
echo "🔥 방화벽 설정..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "✅ 방화벽 설정 완료 (80, 443 포트 열림)"

# 8. Caddy 서비스 시작
echo "🚀 Caddy 서비스 시작..."
sudo systemctl enable caddy
sudo systemctl restart caddy

# 9. 상태 확인
sleep 2
echo ""
echo "📊 Caddy 상태:"
sudo systemctl status caddy --no-pager

echo ""
echo "✅ Caddy 설치 및 설정 완료!"
echo ""
echo "📋 다음 명령어로 확인:"
echo "  - 상태: sudo systemctl status caddy"
echo "  - 로그: sudo journalctl -u caddy -f"
echo "  - 테스트: curl -I https://www.dailymeal.life"
echo ""
echo "⚠️  인증서 발급까지 1-2분 소요됩니다."
