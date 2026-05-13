# Запустите от имени администратора (ПКМ → PowerShell → «Запуск от имени администратора»):
#   cd <корень projectBeton-main>
#   .\scripts\open-dev-ports-windows.ps1
#
# Разрешает входящие TCP 4000 (Angular dev) и 3000 (API) для частной, доменной и общедоступной сети.

$ErrorActionPreference = 'Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Нужны права администратора. Закройте окно и запустите скрипт снова «от имени администратора».' -ForegroundColor Yellow
    exit 1
}

foreach ($port in @(4000, 3000)) {
    $name = "ProjectBeton dev TCP $port"
    Remove-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName $name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port -Profile Private,Domain,Public | Out-Null
    Write-Host "Правило брандмауэра: $name" -ForegroundColor Green
}
Write-Host 'Готово. Профили сети: частный, доменный, общедоступный.'
