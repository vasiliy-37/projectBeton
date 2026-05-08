param(
    [switch]$BuildClient = $true
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root 'projectBeton-server'
$clientDir = Join-Path $root 'projectBeton-client'

if (-not (Test-Path $serverDir)) {
    throw "Backend folder not found: $serverDir"
}
if (-not (Test-Path $clientDir)) {
    throw "Client folder not found: $clientDir"
}

# Start backend in a separate terminal window.
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-Command',
    "Set-Location '$serverDir'; npm start"
)

# Start SSR client in a separate terminal window.
if ($BuildClient) {
    $clientCommand = "Set-Location '$clientDir'; npm run build; `$env:API_ORIGIN='http://127.0.0.1:3000'; `$env:NG_ALLOWED_HOSTS='localhost,127.0.0.1'; npm run serve:ssr:projectBeton-client"
} else {
    $clientCommand = "Set-Location '$clientDir'; `$env:API_ORIGIN='http://127.0.0.1:3000'; `$env:NG_ALLOWED_HOSTS='localhost,127.0.0.1'; npm run serve:ssr:projectBeton-client"
}

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-Command',
    $clientCommand
)

Write-Host 'Project start commands launched.'
Write-Host 'Сайт (открывать в браузере): http://localhost:4000'
Write-Host 'API (только /api/*): http://localhost:3000 — GET страниц перенаправляет на :4000'
Write-Host 'С телефона по Wi-Fi добавьте свой IP в NG_ALLOWED_HOSTS в команде SSR (см. server.ts).'
