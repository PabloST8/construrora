# 🔐 Credenciais do Administrador

## Conta Oficial do Sistema

**IMPORTANTE**: Este sistema possui apenas UMA conta de administrador com todas as permissões.

### Credenciais de Acesso:

```
Email:    admin@sistema.com
Senha:    Admin@123
Perfil:   Administrador (todas as permissões)
```

---

## Como Configurar a Conta Admin

### 1. Executar o Script SQL

Execute o script `create_admin_user.sql` no PostgreSQL:

```bash
psql -U seu_usuario -d nome_do_banco -f create_admin_user.sql
```

**OU** execute manualmente no pgAdmin/DBeaver:

```sql
-- Criar usuário admin
INSERT INTO usuarios (
    email, nome, senha, tipo_documento, documento,
    telefone, perfil_acesso, ativo, created_at, updated_at
) VALUES (
    'admin@sistema.com',
    'Administrador do Sistema',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye7oFqJC5nCkS1yP5l4x7Y8Z9qEH8yZWK',
    'CPF', '00000000000', '(00) 00000-0000',
    'admin', true, NOW(), NOW()
);
```

### 2. Fazer Login

Acesse o sistema em: `http://localhost:3000/login`

Use as credenciais acima para fazer login.

---

## ⚠️ Notas Importantes

- **Não há sistema de cadastro**: Apenas o admin pode acessar o sistema
- **Trocar senha**: Recomenda-se alterar a senha padrão após o primeiro login
- **Backup**: Mantenha um backup seguro das credenciais
- **Perfil Admin**: Tem acesso completo a todas as funcionalidades do sistema

---

## 🔄 Como Resetar a Senha do Admin

Se esquecer a senha, execute no banco de dados:

```sql
-- Resetar senha para: Admin@123
UPDATE usuarios
SET senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye7oFqJC5nCkS1yP5l4x7Y8Z9qEH8yZWK',
    updated_at = NOW()
WHERE email = 'admin@sistema.com';
```

---

**Data de criação**: 13/11/2025  
**Sistema**: Gestão de Obras - Construtora
