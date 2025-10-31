# 🏗️ DOCKERFILE SIMPLES - Sistema de Gestão de Obras
# Build e deploy em um só arquivo

FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY frontend/package*.json ./

# Instalar dependências
RUN npm ci --silent

# Copiar código fonte
COPY frontend/ ./

# Criar arquivo .env para produção
RUN echo "REACT_APP_API_URL=http://92.113.34.172:9090" > .env.local && \
    echo "TSC_COMPILE_ON_ERROR=true" >> .env.local && \
    echo "SKIP_PREFLIGHT_CHECK=true" >> .env.local

# Build da aplicação
RUN npm run build

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Expor porta 6769
EXPOSE 6769

# Labels
LABEL maintainer="Sistema de Gestão de Obras"
LABEL version="1.0.0"
LABEL description="Frontend React para gestão de obras"

# Comando para iniciar aplicação na porta 6769
CMD ["serve", "-s", "build", "-l", "6769"]