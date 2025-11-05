# 🏗️ DOCKERFILE OTIMIZADO COM CACHE - Sistema de Gestão de Obras
# Multi-stage build com cache otimizado

FROM node:18-alpine as build-stage

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas package.json primeiro (para cache das dependências)
COPY frontend/package*.json ./

# Instalar dependências (esta camada será cached se package.json não mudar)
RUN npm ci --silent --cache /tmp/.npm

# Copiar código fonte (só invalida cache se código mudar)
COPY frontend/ ./

# Criar arquivo .env para produção
RUN echo "REACT_APP_API_URL=https://api.construtora.codxis.com.br/" > .env.local && \
    echo "TSC_COMPILE_ON_ERROR=true" >> .env.local && \
    echo "SKIP_PREFLIGHT_CHECK=true" >> .env.local

# Build da aplicação (cache baseado no código fonte)
RUN npm run build

# Stage de produção (mais leve)
FROM node:18-alpine as production-stage

WORKDIR /app

# Instalar serve globalmente (cached)
RUN npm install -g serve

# Copiar apenas o build da etapa anterior
COPY --from=build-stage /app/build ./build

# Expor porta 6769
EXPOSE 6769

# Labels
LABEL maintainer="Sistema de Gestão de Obras"
LABEL version="1.0.0"
LABEL description="Frontend React para gestão de obras"

# Comando para iniciar aplicação na porta 6769
CMD ["serve", "-s", "build", "-l", "6769"]