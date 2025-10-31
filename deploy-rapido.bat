@echo off
REM 🚀 DEPLOY RÁPIDO - Sistema de Gestão de Obras
REM Para Windows - Versão Simples

echo 🚀 INICIANDO DEPLOY RÁPIDO...
echo ===============================

REM Verificar se Docker está rodando
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está instalado ou rodando!
    echo Instale o Docker Desktop: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

echo ✅ Docker detectado

REM Parar container se existir
echo 🛑 Parando container anterior...
docker stop gestao-obras-app >nul 2>&1
docker rm gestao-obras-app >nul 2>&1

REM Remover imagem antiga
echo 🗑️ Removendo imagem antiga...
docker rmi gestao-obras >nul 2>&1

REM Build local para verificar
echo 🔨 Verificando build local...
cd frontend
call npm run build
if errorlevel 1 (
    echo ❌ Erro no build local!
    pause
    exit /b 1
)
cd ..

echo ✅ Build local OK

REM Build Docker
echo 🐳 Construindo imagem Docker...
docker build -t gestao-obras .
if errorlevel 1 (
    echo ❌ Erro no build Docker!
    pause
    exit /b 1
)

echo ✅ Imagem Docker criada

REM Executar container
echo 🚀 Iniciando aplicação...
docker run -d --name gestao-obras-app -p 6769:6769 --restart unless-stopped gestao-obras
if errorlevel 1 (
    echo ❌ Erro ao iniciar container!
    pause
    exit /b 1
)

echo ⏳ Aguardando aplicação inicializar...
timeout /t 8 /nobreak >nul

REM Verificar se está rodando
docker ps | findstr gestao-obras-app >nul
if errorlevel 1 (
    echo ❌ Container não está rodando!
    echo Logs do container:
    docker logs gestao-obras-app
    pause
    exit /b 1
)

echo.
echo ================================================
echo 🎉 DEPLOY CONCLUÍDO COM SUCESSO!
echo ================================================
echo.
echo 📋 INFORMAÇÕES:
echo    🌐 URL: http://localhost:6769
echo    🔗 API: http://92.113.34.172:9090
echo    🐳 Container: gestao-obras-app
echo.
echo 🛠️ COMANDOS ÚTEIS:
echo    Ver logs: docker logs gestao-obras-app
echo    Parar: docker stop gestao-obras-app
echo    Iniciar: docker start gestao-obras-app
echo.
echo ✨ Abra http://localhost:6769 no seu navegador!
echo.

REM Abrir navegador automaticamente
start http://localhost:6769

pause