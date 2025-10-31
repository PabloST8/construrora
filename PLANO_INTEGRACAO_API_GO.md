# 🔧 PLANO DE INTEGRAÇÃO COMPLETA - API GO + FRONTEND REACT

## 📊 **STATUS ATUAL**

### ✅ **CONCLUÍDO**

- [x] **API Go já está rodando** em `http://92.113.34.172:9090`
- [x] Interfaces TypeScript criadas para API Go
- [x] Serviços criados para novos módulos (usuário, fornecedor)
- [x] Serviços atualizados (despesa, diário)
- [x] URL da API configurada corretamente
- [x] Sistema de autenticação JWT compatível

### 🔄 **EM PROGRESSO**

- [ ] Testes de conexão com API externa
- [ ] Ajustes nos componentes React
- [ ] Validações de formulários

---

## 🎯 **O QUE FALTA FAZER**

### **1. TESTAR CONEXÃO COM API EXTERNA (Prioridade ALTA)**

#### **A. Verificar se API está funcionando**

```bash
# Testar endpoints básicos:
curl http://92.113.34.172:9090/pessoas

# Se não funcionar, verificar CORS
# A API pode precisar configurar CORS para o frontend React
```

#### **B. Criar Usuário Inicial (se necessário)**

```bash
# Criar primeiro usuário via API externa
curl -X POST http://92.113.34.172:9090/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@obra.com",
    "nome": "Administrador",
    "senha": "admin123",
    "tipo_documento": "CPF",
    "documento": "111.222.333-44",
    "perfil_acesso": "admin",
    "ativo": true
  }'
```

### **2. FRONTEND - AJUSTES DE COMPONENTES (Prioridade ALTA)**

#### **A. Atualizar Cadastro de Pessoas**

- [ ] Ajustar campo `tipo_documento` (CPF/CNPJ)
- [ ] Remover campos de endereço aninhados
- [ ] Validar documento conforme tipo

#### **B. Atualizar Cadastro de Obras**

- [ ] Adicionar campo `contrato_numero`
- [ ] Ajustar seleção de `contratante_id` e `responsavel_id`
- [ ] Implementar cálculo automático de `data_fim_prevista`
- [ ] Ajustar status para enum da API Go

#### **C. Criar Páginas de Novos Módulos**

- [ ] **Página de Usuários**: CRUD completo
- [ ] **Página de Fornecedores**: CRUD completo
- [ ] **Atualizar Despesas**: Integrar com fornecedores
- [ ] **Atualizar Diário**: Novos campos da API Go

### **3. VALIDAÇÕES E CONVERSÕES (Prioridade MÉDIA)**

#### **A. Criar Funções de Conversão**

```typescript
// Converter dados do frontend para API Go
export const converterPessoaParaAPI = (pessoa: PessoaLegacy): Pessoa => {
  return {
    nome: pessoa.nomeCompleto,
    tipo_documento: pessoa.tipoPessoa === "FISICA" ? "CPF" : "CNPJ",
    documento: pessoa.cpfCnpj,
    email: pessoa.contato?.email,
    telefone: pessoa.contato?.telefone,
    cargo: pessoa.funcao,
    ativo: pessoa.ativo ?? true,
  };
};
```

#### **B. Criar Validações de Formulário**

- [ ] Validação CPF/CNPJ conforme tipo_documento
- [ ] Validação de e-mail
- [ ] Validação de datas (início <= fim)
- [ ] Validação de valores monetários

### **4. COMPONENTES DE UI (Prioridade MÉDIA)**

#### **A. Melhorar Seletores**

- [ ] **Select de Pessoas**: Para contratante_id
- [ ] **Select de Usuários**: Para responsavel_id
- [ ] **Select de Fornecedores**: Para despesas
- [ ] **Select de Obras**: Para diários

#### **B. Melhorar Formulários**

- [ ] **Máscaras de Input**: CPF, CNPJ, telefone, CEP
- [ ] **DatePickers**: Para datas de início/fim
- [ ] **NumberInputs**: Para valores monetários
- [ ] **Select com Enum**: Para status, categoria, etc.

### **5. AUTENTICAÇÃO E SEGURANÇA (Prioridade ALTA)**

#### **A. Testar Fluxo de Login**

- [ ] Login com usuário criado
- [ ] Renovação automática de token
- [ ] Logout e limpeza de dados
- [ ] Redirecionamento automático

#### **B. Proteção de Rotas**

- [ ] Verificar todas as rotas protegidas
- [ ] Testar acesso sem token
- [ ] Testar token expirado

### **6. DASHBOARD E RELATÓRIOS (Prioridade BAIXA)**

#### **A. Integrar Dashboard**

- [ ] Buscar dados reais da API Go
- [ ] Gráficos com dados de obras
- [ ] Estatísticas de despesas
- [ ] Resumo de diários

#### **B. Criar Relatórios**

- [ ] Relatório de despesas por obra
- [ ] Relatório de atividades por período
- [ ] Exportação em PDF/Excel

---

## 🚀 **ORDEM DE EXECUÇÃO RECOMENDADA**

### **SEMANA 1: Conexão + Autenticação**

1. ✅ API Go rodando em servidor externo
2. 🔄 Testar conexão e CORS
3. ✅ Criar usuário inicial
4. ✅ Testar endpoints básicos
5. ✅ Configurar autenticação JWT

### **SEMANA 2: Módulos Principais**

1. 🔄 Ajustar módulo Pessoas
2. 🔄 Ajustar módulo Obras
3. 🔄 Testar CRUD completo
4. 🔄 Validações de formulário

### **SEMANA 3: Novos Módulos**

1. ⏳ Criar página de Usuários
2. ⏳ Criar página de Fornecedores
3. ⏳ Integrar Despesas com Fornecedores
4. ⏳ Atualizar Diário de Obras

### **SEMANA 4: Finalização**

1. ⏳ Dashboard com dados reais
2. ⏳ Relatórios e exportação
3. ⏳ Testes de integração
4. ⏳ Documentação final

---

## 📝 **COMANDOS ÚTEIS**

### **Testar API Go Externa**

```bash
# Verificar se API está rodando
curl http://92.113.34.172:9090/pessoas

# Login
curl -X POST http://92.113.34.172:9090/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@obra.com", "senha": "admin123"}'

# Usar token nas requisições
curl -X GET http://92.113.34.172:9090/obras \
  -H "Authorization: Bearer <seu_token>"
```

### **Executar Frontend**

```bash
cd frontend
npm start
# Acesse: http://localhost:3000
```

### **Build de Produção**

```bash
cd frontend
npm run build
# Resultado em: frontend/build/
```

---

## ⚠️ **POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **Problema 1: CORS**

**Erro**: `Access to fetch blocked by CORS policy`
**Solução**: Configurar CORS na API Go

### **Problema 2: Campos Incompatíveis**

**Erro**: `Campo 'nomeCompleto' não existe na API`
**Solução**: Usar funções de conversão

### **Problema 3: Tipos TypeScript**

**Erro**: `Type 'string' is not assignable to type 'number'`
**Solução**: Ajustar interfaces e fazer cast quando necessário

### **Problema 4: Autenticação**

**Erro**: `Token inválido ou expirado`
**Solução**: Verificar interceptor e renovação automática

---

## 🎯 **RESULTADO FINAL ESPERADO**

### **Frontend React**

- ✅ Interface moderna e responsiva
- ✅ Autenticação JWT funcional
- ✅ CRUD completo para todos os módulos
- ✅ Validações e máscaras de input
- ✅ Dashboard com dados reais
- ✅ Relatórios exportáveis

### **API Go**

- ✅ Performance superior
- ✅ Autenticação JWT segura
- ✅ Endpoints RESTful completos
- ✅ Validações no backend
- ✅ Migrations organizadas
- ✅ Dockerização

### **Integração**

- ✅ Comunicação fluida entre frontend e backend
- ✅ Tratamento de erros adequado
- ✅ Performance otimizada
- ✅ Experiência de usuário consistente

---

## 📞 **PRÓXIMOS PASSOS IMEDIATOS**

1. **Configurar API Go**: Seguir documentação e executar localmente
2. **Criar usuário inicial**: Para ter acesso ao sistema
3. **Ajustar campos de Pessoa**: Primeira integração funcional
4. **Testar autenticação**: Login/logout completo
5. **Implementar CRUD de Obras**: Segunda integração
6. **Continuar com demais módulos**: Incremental

**Tempo estimado para integração completa: 2-4 semanas**
