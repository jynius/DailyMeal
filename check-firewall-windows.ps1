# Windows 방화벽 및 네트워크 확인 스크립트
# PowerShell에서 실행

Write-Host "🔍 DailyMeal 방화벽 상태 확인" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# WSL2 IP 확인
$wslIp = (wsl hostname -I).trim()
Write-Host "📡 WSL2 IP: $wslIp`n" -ForegroundColor Yellow

# 1. 방화벽 규칙 확인
Write-Host "1️⃣ 방화벽 규칙 확인" -ForegroundColor Green
Write-Host "-------------------"
$firewallRules = Get-NetFirewallRule | Where-Object {
    $_.DisplayName -like "*WSL*" -or 
    $_.DisplayName -like "*Next*" -or 
    $_.DisplayName -like "*Backend*" -or 
    $_.DisplayName -like "*Expo*"
}

if ($firewallRules.Count -gt 0) {
    $firewallRules | Format-Table DisplayName, Enabled, Direction, Action -AutoSize
} else {
    Write-Host "  ❌ DailyMeal 관련 방화벽 규칙이 없습니다." -ForegroundColor Red
    Write-Host "  다음 명령으로 규칙을 추가하세요:" -ForegroundColor Yellow
    Write-Host "  New-NetFirewallRule -DisplayName 'WSL Next.js Dev' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow"
}
Write-Host ""

# 2. 포트 연결 테스트
Write-Host "2️⃣ 포트 연결 테스트" -ForegroundColor Green
Write-Host "-------------------"

# 포트 3000 (Next.js)
Write-Host "  📌 포트 3000 (Next.js):" -ForegroundColor Cyan
$test3000 = Test-NetConnection -ComputerName $wslIp -Port 3000 -WarningAction SilentlyContinue
if ($test3000.TcpTestSucceeded) {
    Write-Host "    ✅ 연결 성공" -ForegroundColor Green
} else {
    Write-Host "    ❌ 연결 실패 - 서버가 실행 중인지 확인하세요" -ForegroundColor Red
}

# 포트 8000 (NestJS)
Write-Host "  📌 포트 8000 (NestJS):" -ForegroundColor Cyan
$test8000 = Test-NetConnection -ComputerName $wslIp -Port 8000 -WarningAction SilentlyContinue
if ($test8000.TcpTestSucceeded) {
    Write-Host "    ✅ 연결 성공" -ForegroundColor Green
} else {
    Write-Host "    ❌ 연결 실패 - 서버가 실행 중인지 확인하세요" -ForegroundColor Red
}

# 포트 8081 (Expo)
Write-Host "  📌 포트 8081 (Expo Metro):" -ForegroundColor Cyan
$test8081 = Test-NetConnection -ComputerName $wslIp -Port 8081 -WarningAction SilentlyContinue
if ($test8081.TcpTestSucceeded) {
    Write-Host "    ✅ 연결 성공" -ForegroundColor Green
} else {
    Write-Host "    ❌ 연결 실패 - Expo가 실행 중인지 확인하세요" -ForegroundColor Red
}
Write-Host ""

# 3. HTTP 응답 테스트
Write-Host "3️⃣ HTTP 응답 테스트" -ForegroundColor Green
Write-Host "-------------------"

try {
    Write-Host "  📌 Next.js (http://${wslIp}:3000):" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://${wslIp}:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "    ✅ HTTP $($response.StatusCode) - 정상 응답" -ForegroundColor Green
} catch {
    Write-Host "    ❌ 응답 없음 - 서버 상태를 확인하세요" -ForegroundColor Red
}

try {
    Write-Host "  📌 NestJS (http://${wslIp}:8000):" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://${wslIp}:8000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "    ✅ HTTP $($response.StatusCode) - 정상 응답" -ForegroundColor Green
} catch {
    Write-Host "    ❌ 응답 없음 - 서버 상태를 확인하세요" -ForegroundColor Red
}
Write-Host ""

# 4. 포트 포워딩 확인
Write-Host "4️⃣ 포트 포워딩 설정" -ForegroundColor Green
Write-Host "-------------------"
$portProxy = netsh interface portproxy show all
if ($portProxy) {
    Write-Host $portProxy
} else {
    Write-Host "  ⚠️  포트 포워딩 설정이 없습니다." -ForegroundColor Yellow
}
Write-Host ""

# 요약
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📱 스마트폰에서 테스트:" -ForegroundColor Yellow
Write-Host "  1. PC와 스마트폰을 같은 Wi-Fi에 연결"
Write-Host "  2. 브라우저에서 접속: http://${wslIp}:3000"
Write-Host ""
Write-Host "🔧 문제 해결:" -ForegroundColor Yellow
Write-Host "  - 연결 실패 시: 방화벽 규칙 추가 필요"
Write-Host "  - 응답 없음: WSL에서 서버 실행 확인"
Write-Host "============================================" -ForegroundColor Cyan
