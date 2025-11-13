-- Script para criar o usuário ADMIN oficial do sistema
-- Execute este script no PostgreSQL antes de remover o sistema de cadastro

-- 1. Deletar usuário admin existente (se houver)
DELETE FROM usuarios WHERE email = 'admin@sistema.com';

-- 2. Criar o usuário ADMIN oficial
-- Senha: Admin@123 (hash bcrypt gerado)
-- IMPORTANTE: A senha será "Admin@123"
INSERT INTO usuarios (
    email,
    nome,
    senha,
    tipo_documento,
    documento,
    telefone,
    perfil_acesso,
    ativo,
    created_at,
    updated_at
) VALUES (
    'admin@sistema.com',
    'Administrador do Sistema',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye7oFqJC5nCkS1yP5l4x7Y8Z9qEH8yZWK', -- Senha: Admin@123
    'CPF',
    '00000000000',
    '(00) 00000-0000',
    'admin',
    true,
    NOW(),
    NOW()
);

-- 3. Verificar se o usuário foi criado
SELECT 
    id,
    email,
    nome,
    perfil_acesso,
    ativo,
    created_at
FROM usuarios 
WHERE email = 'admin@sistema.com';

-- ============================================
-- CREDENCIAIS DO ADMIN:
-- Email: admin@sistema.com
-- Senha: Admin@123
-- Perfil: admin (todas as permissões)
-- ============================================
