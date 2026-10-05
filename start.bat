@echo off
FOR /F "tokens=*" %%g IN ('powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi, Ethernet -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress"') do (SET HOST_IP=%%g)

echo HOST_IP=%HOST_IP% > .env
echo Levantando contenedores con la IP detectada: %HOST_IP%

docker compose up -d