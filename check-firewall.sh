#!/bin/bash
# 방화벽 상태 확인 스크립트

echo "🔍 DailyMeal 방화벽 및 네트워크 연결 테스트"
echo "=============================================="
echo ""

# WSL2 IP 확인
WSL_IP=$(hostname -I | awk '{print $1}')
WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')

echo "📡 네트워크 정보:"
echo "  - WSL2 IP: $WSL_IP"
echo "  - Windows 호스트 IP: $WINDOWS_IP"
echo ""

# 포트별 테스트
echo "🔌 포트 연결 테스트:"
echo ""

# 포트 3000 (Next.js)
echo "1️⃣ Next.js 프론트엔드 (포트 3000)"
if nc -zv localhost 3000 2>&1 | grep -q "succeeded\|open"; then
    echo "  ✅ localhost:3000 - 서비스 실행 중"
else
    echo "  ❌ localhost:3000 - 서비스 미실행"
fi

if nc -zv $WSL_IP 3000 2>&1 | grep -q "succeeded\|open"; then
    echo "  ✅ $WSL_IP:3000 - WSL IP 접근 가능"
else
    echo "  ❌ $WSL_IP:3000 - WSL IP 접근 불가"
fi

# HTTP 응답 확인
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ HTTP 응답: $HTTP_CODE (정상)"
else
    echo "  ⚠️  HTTP 응답: $HTTP_CODE"
fi
echo ""

# 포트 8000 (NestJS)
echo "2️⃣ NestJS 백엔드 (포트 8000)"
if nc -zv localhost 8000 2>&1 | grep -q "succeeded\|open"; then
    echo "  ✅ localhost:8000 - 서비스 실행 중"
else
    echo "  ❌ localhost:8000 - 서비스 미실행"
fi

if nc -zv $WSL_IP 8000 2>&1 | grep -q "succeeded\|open"; then
    echo "  ✅ $WSL_IP:8000 - WSL IP 접근 가능"
else
    echo "  ❌ $WSL_IP:8000 - WSL IP 접근 불가"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ HTTP 응답: $HTTP_CODE (정상)"
else
    echo "  ⚠️  HTTP 응답: $HTTP_CODE"
fi
echo ""

# 포트 8081 (Expo)
echo "3️⃣ Expo Metro Bundler (포트 8081)"
if nc -zv localhost 8081 2>&1 | grep -q "succeeded\|open"; then
    echo "  ✅ localhost:8081 - 서비스 실행 중"
else
    echo "  ❌ localhost:8081 - 서비스 미실행"
fi

if nc -zv $WSL_IP 8081 2>&1 | grep -q "succeeded\|open"; then
    echo "  ✅ $WSL_IP:8081 - WSL IP 접근 가능"
else
    echo "  ❌ $WSL_IP:8081 - WSL IP 접근 불가"
fi
echo ""

echo "=============================================="
echo ""
echo "📱 스마트폰에서 테스트하기:"
echo "  1. PC와 스마트폰이 같은 Wi-Fi에 연결되어 있는지 확인"
echo "  2. 스마트폰 브라우저에서 접속:"
echo "     - http://$WSL_IP:3000 (프론트엔드)"
echo "     - http://$WSL_IP:8000 (백엔드)"
echo ""
echo "🖥️ Windows에서 테스트하기 (PowerShell):"
echo "  curl http://$WSL_IP:3000"
echo "  curl http://$WSL_IP:8000"
echo ""
