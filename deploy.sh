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

# Manter imagem antiga para cache (não remover)
if docker images -q ${DOCKER_IMAGE} 2>/dev/null | grep -q .; then
    log "📦 Imagem ${DOCKER_IMAGE} existente encontrada - será usada para cache"
else
    log "🆕 Primeira build - sem cache disponível"
fi

# Build da aplicação frontend local (verificação)
log "🔨 Verificando build local..."
# Diretório do frontend
FRONTEND_DIR="frontend"

# Verifica Node e NPM
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale o Node.js (recomenda-se v16/18+)."
    exit 1
fi
if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale o npm (vem com Node.js)."
    exit 1
fi

log "$(node -v) $(npm -v) detectados"

if [ ! -d "${FRONTEND_DIR}" ]; then
    error "Diretório ${FRONTEND_DIR} não encontrado. Abortando build frontend."
    exit 1
fi

cd "${FRONTEND_DIR}"

# Verifica package.json
if [ ! -f "package.json" ]; then
    error "package.json não encontrado no ${FRONTEND_DIR}. Abortando."
    exit 1
fi

# Determina se rodar com --unsafe-perm quando for root (evita erros em containers/roots)
NPM_UNSAFE=""
if [ "$(id -u)" -eq 0 ]; then
    NPM_UNSAFE="--unsafe-perm"
    warning "Executando como root — usando flag $NPM_UNSAFE para instalação npm."
fi

# Instala dependências com cache otimizado
if [ ! -d "node_modules" ] || [ ! -x "node_modules/.bin/react-scripts" ]; then
    log "📦 Dependências do frontend não encontradas — instalando com cache..."
    if [ -f package-lock.json ]; then
        if ! npm ci --no-audit --no-fund --prefer-offline --cache ~/.npm $NPM_UNSAFE; then
            log "npm ci falhou, tentando npm install com cache..."
            if ! npm install --no-audit --no-fund --prefer-offline --cache ~/.npm $NPM_UNSAFE; then
                error "Falha ao instalar dependências do frontend"
                exit 1
            fi
        fi
    else
        if ! npm install --no-audit --no-fund --prefer-offline --cache ~/.npm $NPM_UNSAFE; then
            error "Falha ao instalar dependências do frontend"
            exit 1
        fi
    fi
    log "✅ Dependências do frontend instaladas (com cache)"
else
    log "📦 Dependências do frontend já presentes (cache local)"
fi

# Tenta build via npm run build, com fallback para npx react-scripts build
if npm run build --silent; then
    log "✅ Build local OK (npm run build)"
else
    warning "npm run build falhou — tentando fallback com npx react-scripts build..."
    if npx --yes react-scripts build; then
        log "✅ Build local OK (npx react-scripts build)"
    else
        error "Falha no build local! Verifique os erros acima."
        exit 1
    fi
fi

cd ..

# Build da imagem Docker com cache
log "🐳 Construindo imagem Docker com cache..."
if ! docker build \
    --cache-from ${DOCKER_IMAGE} \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    -t ${DOCKER_IMAGE} .; then
    error "Falha no build Docker!"
    exit 1
fi
log "✅ Imagem Docker criada com cache: ${DOCKER_IMAGE}"

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
echo -e "   🧹 Limpar cache: docker system prune"
echo -e "   📦 Ver imagens: docker images | grep ${DOCKER_IMAGE}"
echo ""
echo -e "${BLUE}💾 INFORMAÇÕES DE CACHE:${NC}"
echo -e "   📁 Cache npm: ~/.npm (dependências)"
echo -e "   🐳 Cache Docker: Camadas reutilizadas automaticamente"
echo -e "   ⚡ Próximos deploys serão mais rápidos!"
echo ""
echo -e "${GREEN}✨ Sistema pronto para uso!${NC}"