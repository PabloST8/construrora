# 🚀 SCRIPT DE DEPLOY - Sistema de Gestão de Obras (Windows)
# Versão: 1.0.0
# Autor: Sistema de Gestão de Obras

param(
    [switch]$Force,
    [string]$Port = "6769",
    [string]$ImageName = "gestao-obras",
    [string]$ContainerName = "gestao-obras-app"
)

# Configurações
$ErrorActionPreference = "Stop"
$API_URL = "http://92.113.34.172:9090"

# Cores para output
function Write-Success { param($Message) Write-Host "[✅] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[❌] $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "[⚠️] $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "[ℹ️] $Message" -ForegroundColor Cyan }

Write-Host "🚀 INICIANDO DEPLOY - Sistema de Gestão de Obras" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

try {
    # Verificar se Docker está instalado
    Write-Info "Verificando Docker..."
    $null = docker --version
    Write-Success "Docker detectado"
} catch {
    Write-Error "Docker não está instalado!"
    Write-Host "Instale o Docker em: https://docs.docker.com/desktop/windows/"
    exit 1
}

# Verificar se estamos no diretório correto
if (-not (Test-Path "Dockerfile")) {
    Write-Error "Dockerfile não encontrado! Execute o script na raiz do projeto."
    exit 1
}
Write-Success "Diretório correto confirmado"

# Verificar container existente
$existingContainer = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }
if ($existingContainer) {
    Write-Warning "Container $ContainerName já existe. Removendo..."
    try {
        docker stop $ContainerName 2>$null
        docker rm $ContainerName 2>$null
        Write-Success "Container antigo removido"
    } catch {
        Write-Warning "Falha ao remover container (pode não estar rodando)"
    }
}

# Verificar imagem existente
$existingImage = docker images -q $ImageName 2>$null
if ($existingImage) {
    Write-Warning "Imagem $ImageName já existe. Removendo..."
    try {
        docker rmi $ImageName 2>$null
        Write-Success "Imagem antiga removida"
    } catch {
        Write-Warning "Falha ao remover imagem (pode estar em uso)"
    }
}

# Build da aplicação frontend local (verificação)
Write-Info "🔨 Verificando build local..."
Push-Location frontend
try {
    npm run build
    Write-Success "Build local OK"
} catch {
    Write-Error "Falha no build local! Verifique os erros acima."
    exit 1
} finally {
    Pop-Location
}

# Build da imagem Docker
Write-Info "🐳 Construindo imagem Docker..."
try {
    docker build -t $ImageName .
    Write-Success "Imagem Docker criada: $ImageName"
} catch {
    Write-Error "Falha no build Docker!"
    exit 1
}

# Executar container
Write-Info "🚀 Iniciando container..."
try {
    docker run -d --name $ContainerName -p "${Port}:${Port}" --restart unless-stopped $ImageName
    Write-Success "Container iniciado: $ContainerName"
} catch {
    Write-Error "Falha ao iniciar container!"
    exit 1
}

# Aguardar container subir
Write-Info "⏳ Aguardando container inicializar..."
Start-Sleep -Seconds 5

# Verificar se container está rodando
$runningContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }
if (-not $runningContainer) {
    Write-Error "Container não está rodando!"
    Write-Host "Logs do container:"
    docker logs $ContainerName
    exit 1
}

Write-Success "Container rodando: $ContainerName"

# Testar se aplicação está respondendo
Write-Info "🔍 Testando aplicação..."
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Aplicação respondendo em http://localhost:$Port"
    }
} catch {
    Write-Warning "Aplicação pode ainda estar inicializando..."
}

# Informações finais
Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 INFORMAÇÕES DO DEPLOY:" -ForegroundColor Blue
Write-Host "   🐳 Container: $ContainerName"
Write-Host "   🖼️  Imagem: $ImageName"
Write-Host "   🌐 URL Local: http://localhost:$Port"
Write-Host "   🔗 API: $API_URL"
Write-Host "   📦 Porta: $Port"
Write-Host ""
Write-Host "🛠️ COMANDOS ÚTEIS:" -ForegroundColor Blue
Write-Host "   ▶️  Ver logs: docker logs $ContainerName"
Write-Host "   ⏹️  Parar: docker stop $ContainerName"
Write-Host "   ▶️  Iniciar: docker start $ContainerName"
Write-Host "   🗑️  Remover: docker rm -f $ContainerName"
Write-Host "   📊 Status: docker ps | findstr $ContainerName"
Write-Host ""
Write-Host "✨ Sistema pronto para uso!" -ForegroundColor Green