# 🔍 Teste de Funcionalidade do Login

## ⚠️ **PROBLEMA IDENTIFICADO**

O modelo `LoginUser` no backend Go está incorreto:

```go
// ❌ ERRADO - Campos opcionais
type LoginUser struct {
	Email null.String `json:"email,omitempty"`
	Senha null.String `json:"senha,omitempty"`
}
```

Isso permite que login seja feito **sem email ou senha**, causando falhas silenciosas.

---

## ✅ **SOLUÇÃO - Corrigir o Modelo Go**

### 1. **Localizar o arquivo**

Encontre: `backend/internal/models/login.go` (ou similar)

### 2. **Substituir o código**

**Antes (ERRADO):**

```go
package models

import "gopkg.in/guregu/null.v4"

type LoginUser struct {
	Email null.String `json:"email,omitempty"`
	Senha null.String `json:"senha,omitempty"`
}
```

**Depois (CORRETO):**

```go
package models

type LoginUser struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required,min=6"`
}
```

### 3. **Recompilar o backend**

```bash
# Parar containers
docker compose down

# Rebuild
docker compose up -d --build

# Verificar logs
docker logs api_obras -f
```

---

## 🧪 **Como Testar o Login**

### **1. Testar com CURL**

```bash
# 1. Login com credenciais do admin
curl -X POST http://localhost:9090/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "senha": "Admin@123"
  }'
```

**Resposta esperada (SUCESSO):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta esperada (ERRO - credenciais inválidas):**

```json
{
  "error": "credenciais inválidas"
}
```

### **2. Testar no Frontend**

1. Acesse `http://localhost:3000/login`
2. Digite:
   - **Email**: `admin@sistema.com`
   - **Senha**: `Admin@123`
3. Clique em "Entrar"

**Comportamento esperado:**

- ✅ Login bem-sucedido → Redirecionado para `/dashboard`
- ❌ Login falhou → Mensagem de erro exibida

### **3. Testar credenciais inválidas**

```bash
# Senha errada
curl -X POST http://localhost:9090/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "senha": "senhaerrada"
  }'

# Email inexistente
curl -X POST http://localhost:9090/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "naoexiste@sistema.com",
    "senha": "qualquercoisa"
  }'
```

Ambos devem retornar:

```json
{
  "error": "credenciais inválidas"
}
```

### **4. Testar campos vazios (DEVE FALHAR)**

```bash
# Email vazio
curl -X POST http://localhost:9090/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "",
    "senha": "Admin@123"
  }'

# Senha vazia
curl -X POST http://localhost:9090/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "senha": ""
  }'
```

**Resposta esperada (após correção):**

```json
{
  "error": "Key: 'LoginUser.Email' Error:Field validation for 'Email' failed on the 'required' tag"
}
```

---

## 🔐 **Verificar Token JWT**

### **1. Decodificar o access_token**

Copie o `access_token` recebido e cole em: https://jwt.io

**Payload esperado:**

```json
{
  "email": "admin@sistema.com",
  "exp": 1699999999 // Timestamp de expiração (15 min depois)
}
```

### **2. Testar renovação de token**

```bash
# Use o refresh_token recebido no login
curl -X POST http://localhost:9090/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Resposta esperada:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **3. Testar rota protegida**

```bash
# Listar pessoas (requer token)
curl -X GET http://localhost:9090/pessoas \
  -H "Authorization: Bearer <access_token>"
```

**Resposta esperada (SUCESSO):**

```json
{
  "data": [...]
}
```

**Resposta esperada (SEM TOKEN):**

```json
{
  "error": "Token não fornecido"
}
```

---

## 📋 **Checklist de Verificação**

Execute os testes na ordem:

- [ ] **1. Usuário admin existe no banco**

  ```sql
  SELECT email, nome, perfil_acesso, ativo
  FROM usuarios
  WHERE email = 'admin@sistema.com';
  ```

- [ ] **2. Senha do admin está criptografada (bcrypt)**

  ```sql
  SELECT senha FROM usuarios WHERE email = 'admin@sistema.com';
  -- Deve retornar hash bcrypt: $2a$10$...
  ```

- [ ] **3. Modelo LoginUser corrigido no backend**

  ```go
  // Deve ter campos obrigatórios, não null.String
  type LoginUser struct {
      Email string `json:"email" binding:"required,email"`
      Senha string `json:"senha" binding:"required,min=6"`
  }
  ```

- [ ] **4. Backend compilado e rodando**

  ```bash
  docker logs api_obras -f
  # Deve exibir: "Listening and serving HTTP on :9090"
  ```

- [ ] **5. Login via CURL funciona**

  ```bash
  curl -X POST http://localhost:9090/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@sistema.com", "senha": "Admin@123"}'
  ```

- [ ] **6. Login via frontend funciona**

  - Acesse http://localhost:3000/login
  - Faça login com admin@sistema.com / Admin@123
  - Deve redirecionar para /dashboard

- [ ] **7. Renovação de token funciona**

  ```bash
  curl -X POST http://localhost:9090/refresh \
    -H "Content-Type: application/json" \
    -d '{"refresh_token": "<refresh_token>"}'
  ```

- [ ] **8. Rotas protegidas exigem token**

  ```bash
  curl -X GET http://localhost:9090/pessoas
  # Deve retornar: {"error": "Token não fornecido"}

  curl -X GET http://localhost:9090/pessoas \
    -H "Authorization: Bearer <access_token>"
  # Deve retornar: {"data": [...]}
  ```

---

## 🐛 **Problemas Comuns e Soluções**

### **Problema 1: Login retorna 200 OK mas sem tokens**

**Causa**: Modelo `LoginUser` usando `null.String` permite campos vazios

**Solução**: Corrigir modelo para usar `string` com `binding:"required"`

---

### **Problema 2: "credenciais inválidas" com senha correta**

**Causa**: Senha no banco não está em bcrypt

**Solução**:

```sql
-- Resetar senha para Admin@123
UPDATE usuarios
SET senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye7oFqJC5nCkS1yP5l4x7Y8Z9qEH8yZWK',
    updated_at = NOW()
WHERE email = 'admin@sistema.com';
```

---

### **Problema 3: "Token não fornecido" mesmo enviando header**

**Causa**: Header Authorization malformado

**Solução**: Verificar formato

```bash
# ❌ ERRADO
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ✅ CERTO
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Problema 4: Token expira imediatamente**

**Causa**: Configuração de tempo inválida no backend

**Solução**: Verificar `.env`

```bash
SECRET_KEY_JWT=OBRAS
# Verificar se a chave está configurada corretamente
```

---

## 📊 **Status Esperado do Sistema**

Após a correção, todos os testes devem retornar:

| Teste                             | Esperado              | Status    |
| --------------------------------- | --------------------- | --------- |
| Login com credenciais válidas     | 200 OK + tokens       | ⏳ Testar |
| Login com credenciais inválidas   | 401 Unauthorized      | ⏳ Testar |
| Login com campos vazios           | 400 Bad Request       | ⏳ Testar |
| Renovação de token                | 200 OK + novos tokens | ⏳ Testar |
| Rota protegida sem token          | 401 Unauthorized      | ⏳ Testar |
| Rota protegida com token válido   | 200 OK + dados        | ⏳ Testar |
| Rota protegida com token expirado | 401 Unauthorized      | ⏳ Testar |

---

**Data de criação**: 13/11/2025  
**Autor**: Sistema de Verificação  
**Versão**: 1.0
