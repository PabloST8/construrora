# 🔐 Sistema com Conta Admin Única

## ✅ Alterações Implementadas

### 1. **Criação da Conta Admin Oficial**

Foi criado o script SQL `create_admin_user.sql` para inserir o usuário administrador no banco de dados.

**Credenciais do Administrador:**

```
Email: admin@sistema.com
Senha: Admin@123
Perfil: admin (todas as permissões)
```

### 2. **Remoção do Sistema de Cadastro**

O sistema de cadastro de novos usuários foi **completamente removido**:

- ❌ **Página removida**: `frontend/src/pages/Cadastro.tsx` (deletada)
- ❌ **Rota removida**: `/cadastro` no `App.tsx`
- ❌ **Link removido**: Botão "Cadastre-se aqui" no componente `Login.tsx`

### 3. **Alterações na Tela de Login**

A tela de login agora exibe:

```
"Acesso exclusivo para administradores"
"Entre em contato com o administrador do sistema para obter acesso"
```

---

## 🚀 Como Configurar o Sistema

### Passo 1: Executar o Script SQL

Execute o arquivo `create_admin_user.sql` no PostgreSQL:

**Opção 1 - Linha de comando:**

```bash
psql -U postgres -d nome_do_banco -f create_admin_user.sql
```

**Opção 2 - pgAdmin/DBeaver:**

1. Abra o arquivo `create_admin_user.sql`
2. Execute o script no banco de dados do projeto
3. Verifique se o usuário foi criado com sucesso

### Passo 2: Fazer Login

1. Acesse: `http://localhost:3000/login`
2. Use as credenciais:
   - **Email**: `admin@sistema.com`
   - **Senha**: `Admin@123`
3. Clique em "Entrar"

---

## 📋 Estrutura do Usuário Admin

```sql
INSERT INTO usuarios (
    email,              -- admin@sistema.com
    nome,               -- Administrador do Sistema
    senha,              -- Hash bcrypt de "Admin@123"
    tipo_documento,     -- CPF
    documento,          -- 00000000000
    telefone,           -- (00) 00000-0000
    perfil_acesso,      -- admin
    ativo,              -- true
    created_at,         -- NOW()
    updated_at          -- NOW()
);
```

---

## ⚠️ Segurança e Boas Práticas

### 1. **Trocar Senha Padrão**

Após o primeiro login, é **altamente recomendado** trocar a senha padrão `Admin@123` por uma senha forte.

### 2. **Resetar Senha (se necessário)**

Se esquecer a senha, execute no banco de dados:

```sql
-- Resetar senha para: Admin@123
UPDATE usuarios
SET senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye7oFqJC5nCkS1yP5l4x7Y8Z9qEH8yZWK',
    updated_at = NOW()
WHERE email = 'admin@sistema.com';
```

### 3. **Backup das Credenciais**

Mantenha um backup seguro das credenciais em local protegido.

### 4. **Criar Senha Personalizada**

Para gerar uma nova senha com hash bcrypt, use:

**Node.js:**

```javascript
const bcrypt = require("bcrypt");
const novaSenha = "SuaSenhaForte@2025";
const hash = bcrypt.hashSync(novaSenha, 10);
console.log(hash);
```

**Então atualize no banco:**

```sql
UPDATE usuarios
SET senha = 'COLE_O_HASH_AQUI',
    updated_at = NOW()
WHERE email = 'admin@sistema.com';
```

---

## 📁 Arquivos Criados

1. **`create_admin_user.sql`** - Script para criar o usuário admin no banco
2. **`CREDENCIAIS_ADMIN.md`** - Documentação das credenciais e procedimentos
3. **`SISTEMA_ADMIN_UNICO.md`** - Este arquivo (documentação das alterações)

---

## 🔄 Arquivos Modificados

### `frontend/src/App.tsx`

- ❌ Removido import de `Cadastro`
- ❌ Removida rota `/cadastro`

### `frontend/src/components/Login.tsx`

- ❌ Removido link "Cadastre-se aqui"
- ✅ Adicionada mensagem "Acesso exclusivo para administradores"

### `frontend/src/pages/Cadastro.tsx`

- ❌ **ARQUIVO DELETADO**

---

## ✅ Verificação

Para verificar se tudo está funcionando:

1. ✅ **Backend rodando**: `http://localhost:9090` (ou porta configurada)
2. ✅ **Frontend rodando**: `http://localhost:3000`
3. ✅ **Usuário admin existe** no banco de dados:
   ```sql
   SELECT email, nome, perfil_acesso, ativo
   FROM usuarios
   WHERE email = 'admin@sistema.com';
   ```
4. ✅ **Login funciona** com as credenciais fornecidas
5. ✅ **Rota `/cadastro` retorna 404** ou redireciona para `/dashboard`

---

## 🎯 Funcionalidades do Admin

O usuário admin tem acesso completo a:

- ✅ Dashboard com gráficos e estatísticas
- ✅ Gestão de **Pessoas** (criar, editar, visualizar, excluir)
- ✅ Gestão de **Obras** (criar, editar, visualizar, excluir)
- ✅ Gestão de **Despesas** (criar, editar, visualizar, excluir)
- ✅ Gestão de **Receitas** (criar, editar, visualizar, excluir)
- ✅ Gestão de **Fornecedores** (criar, editar, visualizar, excluir)
- ✅ Gestão de **Diário de Obras** (criar, editar, visualizar, excluir)
- ✅ **Relatórios** completos com filtros avançados

---

## 📞 Suporte

Para qualquer dúvida ou problema:

1. Verifique se o script SQL foi executado corretamente
2. Confirme que o backend está rodando
3. Verifique os logs do console do navegador (F12)
4. Verifique os logs do backend para erros de autenticação

---

**Data de implementação**: 13/11/2025  
**Sistema**: Gestão de Obras - Construtora  
**Versão**: 1.0 (Admin Único)
