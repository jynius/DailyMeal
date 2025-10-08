# WSL2 포트 포워딩 스크립트
# PowerShell 관리자 권한으로 실행

$wslIp = (wsl hostname -I).trim()
Write-Host "WSL2 IP: $wslIp"

# 기존 포트 포워딩 제거
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=8000 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=0.0.0.0

# 새 포트 포워딩 추가
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=$wslIp

Write-Host "포트 포워딩 완료!"
Write-Host ""
Write-Host "현재 포트 포워딩 목록:"
netsh interface portproxy show all
