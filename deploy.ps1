$ErrorActionPreference = "Stop"

$Server = "31.97.147.114"
$RemoteName = "production"
$RemoteRepository = "deploy@${Server}:/var/repo/idoso-seguro.git"
$ApplicationUrl = "http://${Server}:8085"
$ApplicationDirectory = "/var/www/idoso-seguro"

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)

    & git @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "O comando Git falhou: git $($Arguments -join ' ')"
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY - IDOSO SEGURO+ MANAUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    throw "Execute este script dentro da pasta do projeto."
}

$existingRemote = git remote get-url $RemoteName 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Configurando repositorio de producao..." -ForegroundColor Yellow
    Invoke-Git remote add $RemoteName $RemoteRepository
}
elseif ($existingRemote.Trim() -ne $RemoteRepository) {
    throw "O remote production aponta para outro endereco: $existingRemote"
}

Write-Host "[1/4] Preparando arquivos..." -ForegroundColor Green
Invoke-Git add --all

& git diff --cached --quiet
$hasChanges = $LASTEXITCODE -ne 0

if ($hasChanges) {
    $message = Read-Host "Mensagem do commit"

    if ([string]::IsNullOrWhiteSpace($message)) {
        $message = "deploy: atualizacao $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }

    Invoke-Git commit -m $message
}
else {
    Write-Host "Nenhuma alteracao nova para commit." -ForegroundColor Yellow
}

$localRevision = (git rev-parse HEAD).Trim()

if ($LASTEXITCODE -ne 0) {
    throw "Nao foi possivel identificar o commit local."
}

Write-Host "[2/4] Enviando codigo para a VPS..." -ForegroundColor Green
Invoke-Git push $RemoteName main

Write-Host "[3/4] Confirmando revisao implantada..." -ForegroundColor Green
$remoteRevision = (& ssh "deploy@$Server" "cat '$ApplicationDirectory/.deployed-revision' 2>/dev/null").Trim()

if ($LASTEXITCODE -ne 0 -or $remoteRevision -ne $localRevision) {
    throw "O codigo foi enviado, mas o servidor nao confirmou o deploy do commit $localRevision."
}

Write-Host "[4/4] Testando aplicacao..." -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$ApplicationUrl/api/health" -UseBasicParsing -TimeoutSec 15

if ($response.StatusCode -ne 200) {
    throw "A aplicacao respondeu com HTTP $($response.StatusCode)."
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY CONCLUIDO COM SUCESSO" -ForegroundColor Green
Write-Host "Aplicacao: $ApplicationUrl" -ForegroundColor Cyan
Write-Host "Commit: $localRevision" -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor Cyan
