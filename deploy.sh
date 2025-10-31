#!/bin/bash

# 🚀 SCRIPT DE DEPLOY - Sistema de Gestão de Obras
# Versão: 1.0.0
# Autor: Sistema de Gestão de Obras

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="gestao-obras"
DOCKER_IMAGE="gestao-obras"
CONTAINER_NAME="gestao-obras-app"
PORT="6769"
API_URL="http://92.113.34.172:9090"

echo -e "${BLUE}🚀 INICIANDO DEPLOY - Sistema de Gestão de Obras${NC}"
echo -e "${BLUE}=================================================${NC}"

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado!"
    echo "Instale o Docker em: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    error "Git não está instalado!"
    exit 1
fi

log "✅ Docker e Git detectados"

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile" ]; then
    error "Dockerfile não encontrado! Execute o script na raiz do projeto."
    exit 1
fi

log "📁 Diretório correto confirmado"

# Parar container existente se estiver rodando
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    warning "Container ${CONTAINER_NAME} já existe. Removendo..."
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    log "🗑️ Container antigo removido"
fi

# Remover imagem antiga se existir
if docker images -q ${DOCKER_IMAGE} 2>/dev/null | grep -q .; then
    warning "Imagem ${DOCKER_IMAGE} já existe. Removendo..."
    docker rmi ${DOCKER_IMAGE} 2>/dev/null || true
    log "🗑️ Imagem antiga removida"
fi

# Build da aplicação frontend local (verificação)
log "🔨 Verificando build local..."
cd frontend
# Se não houver react-scripts instalado localmente, instalar dependências automaticamente
if [ ! -f "node_modules/.bin/react-scripts" ]; then
    log "📦 Dependências do frontend não encontradas — instalando (npm ci || npm install)..."
    if ! (npm ci --no-audit --no-fund || npm install --no-audit --no-fund); then
        error "Falha ao instalar dependências do frontend"
        exit 1
    fi
    log "✅ Dependências do frontend instaladas"
fi
if ! npm run build; then
    error "Falha no build local! Verifique os erros acima."
    exit 1
fi
cd ..
log "✅ Build local OK"

# Build da imagem Docker
log "🐳 Construindo imagem Docker..."
if ! docker build -t ${DOCKER_IMAGE} .; then
    error "Falha no build Docker!"
    exit 1
fi
log "✅ Imagem Docker criada: ${DOCKER_IMAGE}"

# Executar container
log "🚀 Iniciando container..."
if ! docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:${PORT} \
    --restart unless-stopped \
    ${DOCKER_IMAGE}; then
    error "Falha ao iniciar container!"
    exit 1
fi

# Aguardar container subir
log "⏳ Aguardando container inicializar..."
sleep 5

# Verificar se container está rodando
if ! docker ps --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    error "Container não está rodando!"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

log "✅ Container rodando: ${CONTAINER_NAME}"

# Testar se aplicação está respondendo
log "🔍 Testando aplicação..."
if command -v curl &> /dev/null; then
    sleep 3
    if curl -f -s http://localhost:${PORT} > /dev/null; then
        log "✅ Aplicação respondendo em http://localhost:${PORT}"
    else
        warning "Aplicação pode ainda estar inicializando..."
    fi
else
    warning "curl não disponível para teste"
fi

# Informações finais
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}=================================================${NC}"
echo -e "${BLUE}📋 INFORMAÇÕES DO DEPLOY:${NC}"
echo -e "   🐳 Container: ${CONTAINER_NAME}"
echo -e "   🖼️  Imagem: ${DOCKER_IMAGE}"
echo -e "   🌐 URL Local: http://localhost:${PORT}"
echo -e "   🔗 API: ${API_URL}"
echo -e "   📦 Porta: ${PORT}"
echo ""
echo -e "${BLUE}🛠️ COMANDOS ÚTEIS:${NC}"
echo -e "   ▶️  Ver logs: docker logs ${CONTAINER_NAME}"
echo -e "   ⏹️  Parar: docker stop ${CONTAINER_NAME}"
echo -e "   ▶️  Iniciar: docker start ${CONTAINER_NAME}"
echo -e "   🗑️  Remover: docker rm -f ${CONTAINER_NAME}"
echo -e "   📊 Status: docker ps | grep ${CONTAINER_NAME}"
echo ""
echo -e "${GREEN}✨ Sistema pronto para uso!${NC}"