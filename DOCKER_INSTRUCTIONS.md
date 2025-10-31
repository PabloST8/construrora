# 🐳 Como usar o Docker

## 🚀 Build da imagem

```bash
docker build -t gestao-obras .
```

## 🏃 Executar container

```bash
docker run -d -p 6769:6769 --name gestao-obras-app gestao-obras
```

## 📝 Comandos úteis

```bash
# Ver logs
docker logs gestao-obras-app

# Parar container
docker stop gestao-obras-app

# Remover container
docker rm gestao-obras-app

# Acessar shell do container
docker exec -it gestao-obras-app sh
```

## 🌐 Acesso

Após rodar, acesse: **http://localhost:6769**

## 🔧 Rebuild (após mudanças)

```bash
docker stop gestao-obras-app
docker rm gestao-obras-app
docker build -t gestao-obras .
docker run -d -p 6769:6769 --name gestao-obras-app gestao-obras
```
