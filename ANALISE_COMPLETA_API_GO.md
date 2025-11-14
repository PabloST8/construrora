# 🔍 Análise Completa da API Go - Sistema OBRA

## 📊 Visão Geral da Arquitetura

### **Tecnologias Principais**

- **Go 1.25** + **Gin Framework** (Router HTTP)
- **PostgreSQL 12** (Banco de dados)
- **JWT** (Autenticação com Access + Refresh tokens)
- **null.v4** (Tipos nullable do Go)
- **Clean Architecture** (Controllers → UseCases → Services → DB)

### **Estrutura de Camadas**

```
cmd/main.go                 → Inicialização do servidor
  ├── Controllers           → Handlers HTTP (Gin)
  ├── UseCases              → Lógica de negócio
  ├── Services              → Acesso ao banco de dados
  └── Models                → Estruturas de dados (structs)
```

---

## 🗂️ Modelos de Dados Completos

### **1. Pessoa (pessoa.go)**

```go
type Pessoa struct {
    ID                  null.Int    // PK
    Nome                null.String // required
    TipoDocumento       null.String // "CPF" ou "CNPJ" (required)
    Documento           null.String // required
    Email               null.String // optional
    Telefone            null.String // optional
    Cargo               null.String // optional
    EnderecoRua         null.String // optional
    EnderecoNumero      null.String // optional
    EnderecoComplemento null.String // optional
    EnderecoBairro      null.String // optional
    EnderecoCidade      null.String // optional
    EnderecoEstado      null.String // optional (2 chars)
    EnderecoCep         null.String // optional
    Ativo               null.Bool   // default: true
    CreatedAt           time.Time
    UpdatedAt           time.Time
}
```

### **2. Obra (obra.go)**

```go
type Obra struct {
    ID              null.Int    // PK
    Nome            null.String // Nome do projeto
    ContratoNumero  null.String // Número do contrato
    ContratanteID   null.Int    // FK → pessoas.id
    Contratada      null.String // Nome da empresa contratada
    ResponsavelID   null.Int    // FK → usuarios.id
    DataInicio      null.String // Formato: "YYYY-MM-DD"
    PrazoDias       null.Int    // Prazo em dias corridos
    DataFimPrevista null.String // Calculado automaticamente
    Orcamento       null.Float  // Valor total do orçamento
    Status          null.String // ex: "em_andamento", "concluida"
    Art             null.String // ART (Anotação de Responsabilidade Técnica)
    Foto            null.String // Base64 encoded image
    EnderecoRua     null.String
    EnderecoNumero  null.String
    EnderecoBairro  null.String
    EnderecoCidade  null.String
    EnderecoEstado  null.String
    EnderecoCep     null.String
    Observacoes     null.String
    Ativo           null.Bool   // default: true
    CreatedAt       null.Time
    UpdatedAt       null.Time
}
```

### **3. Diário de Obra (diario.go)**

```go
type DiarioObra struct {
    ID                   null.Int    // PK
    ObraID               null.Int    // FK → obras.id (required)
    Data                 null.String // "2024-10-08" (required)
    Periodo              null.String // "manha", "tarde", "noite", "integral"
    AtividadesRealizadas null.String // Texto descritivo (required)
    Ocorrencias          null.String // Problemas/eventos do dia
    Observacoes          null.String // Notas gerais
    Foto                 null.String // Base64 encoded image
    ResponsavelID        null.Int    // FK → usuarios.id
    AprovadoPorID        null.Int    // FK → usuarios.id (pode ser NULL)
    StatusAprovacao      null.String // "pendente", "aprovado", "rejeitado"
    CreatedAt            time.Time
    UpdatedAt            null.Time
}
```

### **4. Despesa (despesa.go)**

```go
type Despesa struct {
    ID                   null.Int    // PK
    ObraID               null.Int    // FK → obras.id (required)
    FornecedorID         null.Int    // FK → fornecedores.id (opcional)
    PessoaID             null.Int    // FK → pessoas.id (mão de obra)
    Data                 null.Time   // Data da compra/serviço
    DataVencimento       null.Time   // Data de vencimento do pagamento
    Descricao            null.String // required
    Categoria            null.String // Ver constantes abaixo
    Valor                null.Float  // required
    FormaPagamento       null.String // Ver constantes abaixo
    StatusPagamento      null.String // PENDENTE, PAGO, CANCELADO
    DataPagamento        null.Time   // Quando foi pago
    ResponsavelPagamento null.String // Quem autorizou
    Observacao           null.String
    CreatedAt            time.Time
    UpdatedAt            time.Time
}

// Categorias de despesa (constantes)
MATERIAL, MAO_DE_OBRA, COMBUSTIVEL, ALIMENTACAO,
MATERIAL_ELETRICO, ALUGUEL_EQUIPAMENTO, TRANSPORTE,
IMPOSTO, PARCEIRO, OUTROS

// Formas de pagamento (constantes)
PIX, BOLETO, CARTAO_CREDITO, CARTAO_DEBITO,
TRANSFERENCIA, ESPECIE, CHEQUE
```

### **5. Receita (receita.go)**

```go
type Receita struct {
    ID              null.Int    // PK
    ObraID          null.Int    // FK → obras.id (required)
    Descricao       null.String // required
    Valor           null.Float  // required
    Data            null.Time   // required
    FonteReceita    null.String // Ver constantes abaixo
    NumeroDocumento null.String // Nº do contrato, nota fiscal, etc
    ResponsavelID   null.Int    // FK → usuarios.id
    Observacao      null.String
    Status          null.String
    CreatedAt       time.Time
    UpdatedAt       time.Time
}

// Fontes de receita (constantes)
CONTRATO, PAGAMENTO_CLIENTE, ADIANTAMENTO,
FINANCIAMENTO, MEDICAO, OUTROS
```

### **6. Fornecedor (fornecedor.go)**

```go
type Fornecedor struct {
    ID              null.Int    // PK
    Nome            null.String // required
    TipoDocumento   null.String // CPF ou CNPJ (required)
    Documento       null.String // required
    Email           null.String
    Telefone        null.String
    Endereco        null.String
    Cidade          null.String
    Estado          null.String
    ContatoNome     null.String // Pessoa de contato
    ContatoTelefone null.String
    ContatoEmail    null.String
    Ativo           null.Bool   // default: true
    CreatedAt       time.Time
    UpdatedAt       time.Time
}
```

---

## 🛣️ Rotas da API (Total: 52 endpoints)

### **Autenticação (Públicas - Sem Token)**

```
POST   /login                    → Login (retorna access_token + refresh_token)
POST   /refresh                  → Renovar tokens JWT
POST   /usuarios                 → Cadastrar novo usuário (público)
```

### **Pessoas (Protegidas)**

```
GET    /pessoas                  → Listar todas
GET    /pessoas/:id              → Buscar por ID
POST   /pessoas                  → Criar nova pessoa
PUT    /pessoas/:id              → Atualizar pessoa
DELETE /pessoas/:id              → Deletar pessoa
```

### **Obras (Protegidas)**

```
GET    /obras                    → Listar todas
GET    /obras/:id                → Buscar por ID
POST   /obras                    → Criar nova obra
PUT    /obras/:id                → Atualizar obra
DELETE /obras/:id                → Deletar obra
```

### **Diários de Obra - Sistema Legado (Protegidas)**

```
GET    /diarios                              → Listar todos
GET    /diarios/:id                          → Buscar por ID
GET    /diarios/obra/:id                     → Diários de uma obra
GET    /diarios/:id/relatorio-completo       → Relatório completo
GET    /diarios/relatorio-formatado/:obra_id → Relatório formatado
POST   /diarios                              → Criar novo diário
PUT    /diarios/:id                          → Atualizar diário
DELETE /diarios/:id                          → Deletar diário
```

### **⚡ NOVA ARQUITETURA: Tarefas Realizadas (Protegidas)**

```
POST   /tarefas                         → Criar atividade diária
GET    /tarefas                         → Listar todas atividades
GET    /tarefas/obra/:obra_id/data/:data → Filtrar por obra e data
PUT    /tarefas/:id                     → Atualizar atividade
DELETE /tarefas/:id                     → Deletar atividade
```

### **⚠️ NOVA ARQUITETURA: Ocorrências (Protegidas)**

```
POST   /ocorrencias                         → Criar ocorrência
GET    /ocorrencias                         → Listar todas
GET    /ocorrencias/obra/:obra_id/data/:data → Filtrar por obra e data
GET    /ocorrencias/gravidade/:gravidade    → Filtrar por gravidade
PUT    /ocorrencias/:id                     → Atualizar ocorrência
DELETE /ocorrencias/:id                     → Deletar ocorrência
```

### **📊 NOVA ARQUITETURA: Diário Consolidado (Protegidas)**

```
GET  /diarios-consolidado                → Listar todos diários consolidados
GET  /diarios-consolidado/obra/:obra_id  → Diários de uma obra
GET  /diarios-consolidado/data/:data     → Diários de uma data
POST /diarios-consolidado/metadados      → Criar/atualizar metadados
```

### **👷 Equipe do Diário (Protegidas)**

```
POST   /equipe-diario                  → Adicionar membro à equipe
GET    /equipe-diario/diario/:diario_id → Listar equipe por diário
PUT    /equipe-diario/:id              → Atualizar registro
DELETE /equipe-diario/:id              → Remover membro
```

### **🚜 Equipamentos do Diário (Protegidas)**

```
POST   /equipamento-diario                  → Registrar equipamento
GET    /equipamento-diario/diario/:diario_id → Listar por diário
PUT    /equipamento-diario/:id              → Atualizar registro
DELETE /equipamento-diario/:id              → Remover equipamento
```

### **🧱 Materiais do Diário (Protegidas)**

```
POST   /material-diario                  → Registrar material
GET    /material-diario/diario/:diario_id → Listar por diário
PUT    /material-diario/:id              → Atualizar registro
DELETE /material-diario/:id              → Remover material
```

### **Fornecedores (Protegidas)**

```
GET    /fornecedores     → Listar todos
GET    /fornecedores/:id → Buscar por ID
POST   /fornecedores     → Criar novo
PUT    /fornecedores/:id → Atualizar
DELETE /fornecedores/:id → Deletar
```

### **Despesas (Protegidas)**

```
GET    /despesas                    → Listar todas
GET    /despesas/:id                → Buscar por ID
GET    /despesas/relatorio/:obra_id → Relatório de despesas por obra
POST   /despesas                    → Criar nova
PUT    /despesas/:id                → Atualizar
DELETE /despesas/:id                → Deletar
```

### **Receitas (Protegidas)**

```
GET    /receitas                → Listar todas
GET    /receitas/:id            → Buscar por ID
GET    /receitas/obra/:obra_id  → Receitas de uma obra
POST   /receitas                → Criar nova
PUT    /receitas/:id            → Atualizar
DELETE /receitas/:id            → Deletar
```

### **📊 Relatórios Financeiros (Protegidas)**

```
GET /relatorios/obra/:obra_id           → Relatório financeiro completo
GET /relatorios/despesas/:obra_id       → Despesas por categoria
GET /relatorios/pagamentos/:obra_id     → Status de pagamentos
GET /relatorios/materiais/:obra_id      → Materiais consumidos
GET /relatorios/profissionais/:obra_id  → Mão de obra
```

---

## 🔐 Sistema de Autenticação JWT

### **Fluxo de Autenticação**

```
1. POST /login → { "email": "...", "senha": "..." }
   Resposta: {
       "access_token": "eyJhbGc...",  // Expira em 15 minutos
       "refresh_token": "eyJhbGc..."  // Expira em 7 dias
   }

2. Usar access_token em todas as requisições protegidas:
   Header: Authorization: Bearer <access_token>

3. Quando access_token expirar:
   POST /refresh → { "refresh_token": "..." }
   Resposta: novos tokens
```

### **Middleware de Autenticação**

- **Arquivo**: `internal/auth/middleware.go`
- **Aplicado em**: Todas as rotas dentro de `protected := server.Group("/")`
- **Valida**: Presença, formato e expiração do token JWT

---

## 🏗️ Diferença Entre Sistema Legado vs Nova Arquitetura

### **Sistema Legado (Diários de Obra)**

- **Problema**: Dados denormalizados em uma única tabela `diarios_obra`
- **Limitações**:
  - Campos texto longos (`atividades_realizadas`, `ocorrencias`)
  - Difícil filtrar por tipo de ocorrência ou status de tarefa
  - Sem rastreamento individual de atividades

### **Nova Arquitetura (Normalizada)**

- **Vantagens**:
  - **Tarefas individuais** com status e percentual de conclusão
  - **Ocorrências categorizadas** por tipo e gravidade
  - **Diário consolidado** gerado dinamicamente via VIEW
  - **Queries específicas** (ex: todas as ocorrências críticas)
  - **Histórico detalhado** de cada atividade

### **Estrutura da Nova Arquitetura**

```
atividade_diaria (Tarefas)
  ├── obra_id, data, periodo
  ├── descricao, status, percentual_conclusao
  └── responsavel_id, observacao

ocorrencia_diaria (Ocorrências)
  ├── obra_id, data, periodo
  ├── tipo, gravidade, descricao
  └── status_resolucao, acao_tomada

diario_metadados (Dados complementares)
  ├── obra_id, data, periodo
  ├── foto, observacoes
  └── aprovado_por_id, status_aprovacao

vw_diario_consolidado (View)
  ├── Agrega tarefas e ocorrências dinamicamente
  ├── Conta atividades, ocorrências, equipe, equipamentos
  └── Gera relatório consolidado sob demanda
```

---

## 📦 Dependências do Projeto (go.mod)

```go
require (
    github.com/gin-gonic/gin        // Router HTTP
    github.com/gin-contrib/cors     // CORS middleware
    github.com/lib/pq               // Driver PostgreSQL
    github.com/joho/godotenv        // Variáveis de ambiente
    github.com/golang-jwt/jwt/v4    // Autenticação JWT
    golang.org/x/crypto/bcrypt      // Hash de senhas
    gopkg.in/guregu/null.v4         // Tipos nullable
)
```

---

## ⚙️ Variáveis de Ambiente (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=obras
DB_PASSWORD=7894
DB_NAME=obrasdb
DB_HOST_PORT=5440       # Porta externa do container
API_PORT=9090           # Porta da API
SECRET_KEY_JWT=OBRAS    # Chave secreta para JWT
```

---

## 🔄 Como a API Processa Requisições

### **Exemplo: Criar Despesa**

```
1. Cliente envia:
   POST /despesas
   Header: Authorization: Bearer eyJhbGc...
   Body: {
       "obra_id": 5,
       "descricao": "Cimento CP-II",
       "valor": 1500.00,
       "categoria": "MATERIAL",
       "fornecedor_id": 3
   }

2. Middleware de autenticação:
   - Valida token JWT
   - Injeta email do usuário no contexto

3. Controller (despesa.go):
   - Valida JSON com ShouldBindJSON()
   - Chama UseCase

4. UseCase:
   - Aplica regras de negócio
   - Chama Service

5. Service:
   - Executa query SQL no PostgreSQL
   - Retorna resultado

6. Controller retorna resposta:
   201 Created: {
       "message": "Despesa criada com sucesso",
       "data": { "id": 14, ... }
   }
```

---

## 📊 Estrutura de Resposta da API

### **Sucesso (GET)**

```json
{
    "data": [
        { "id": 1, "nome": "João Silva", ... },
        { "id": 2, "nome": "Maria Santos", ... }
    ]
}
```

### **Sucesso (POST/PUT)**

```json
{
    "message": "Recurso criado com sucesso",
    "data": { "id": 15, ... }
}
```

### **Erro (400/404/500)**

```json
{
  "error": "Descrição do erro",
  "details": "Informações adicionais (opcional)"
}
```

---

## 🎯 Principais Diferenças Frontend (React) vs Backend (Go)

| Aspecto            | Frontend (TypeScript)                    | Backend (Go)                               |
| ------------------ | ---------------------------------------- | ------------------------------------------ |
| **Tipos nullable** | `number \| null`                         | `null.Int`, `null.String`                  |
| **Datas**          | `string` (ISO 8601)                      | `null.Time`, `null.String`                 |
| **Enum**           | `type Status = "pendente" \| "aprovado"` | `const StatusPendente = "PENDENTE"`        |
| **Foto**           | `foto?: string`                          | `Foto null.String` (Base64)                |
| **Naming**         | `camelCase`                              | `PascalCase` (structs), `camelCase` (JSON) |

---

## 🚀 Como Iniciar a API

```bash
# 1. Clonar repositório
git clone https://github.com/MarkHiarley/OBRA.git
cd OBRA

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Subir containers (PostgreSQL + API)
docker compose up -d

# 4. Executar migrations
./run-migrations.sh

# 5. Verificar se API está rodando
curl http://localhost:9090/login
```

---

## 📝 Endpoints Mais Usados pelo Frontend

### **1. Login**

```bash
POST http://localhost:9090/login
Body: { "email": "admin@sistema.com", "senha": "Admin@123" }
```

### **2. Buscar Obras**

```bash
GET http://localhost:9090/obras
Header: Authorization: Bearer <token>
```

### **3. Buscar Tarefas de uma Obra**

```bash
GET http://localhost:9090/tarefas/obra/:obra_id/data/:data
Header: Authorization: Bearer <token>
```

### **4. Buscar Ocorrências**

```bash
GET http://localhost:9090/ocorrencias?obra_id=1
Header: Authorization: Bearer <token>
```

### **5. Buscar Diários de uma Obra**

```bash
GET http://localhost:9090/diarios/obra/:id
Header: Authorization: Bearer <token>
```

### **6. Buscar Equipe de um Diário**

```bash
GET http://localhost:9090/equipe-diario/diario/:diario_id
Header: Authorization: Bearer <token>
```

### **7. Buscar Equipamentos de um Diário**

```bash
GET http://localhost:9090/equipamento-diario/diario/:diario_id
Header: Authorization: Bearer <token>
```

### **8. Buscar Materiais de um Diário**

```bash
GET http://localhost:9090/material-diario/diario/:diario_id
Header: Authorization: Bearer <token>
```

---

## ✅ Checklist de Compatibilidade Frontend/Backend

- ✅ **Tipos TypeScript** alinhados com structs Go
- ✅ **Todos os endpoints** retornam JSON consistente
- ✅ **Autenticação JWT** funcionando (Access + Refresh)
- ✅ **CORS** configurado para aceitar todas as origens (`AllowOrigins: ["*"]`)
- ✅ **Fotos em Base64** suportadas (campos `foto`)
- ✅ **Campos nullable** tratados corretamente (null.v4)
- ✅ **Datas em formato ISO 8601** ou string "YYYY-MM-DD"
- ✅ **Enums traduzidos** corretamente (PENDENTE → Pendente)

---

## 🎓 Principais Aprendizados

1. **API usa arquitetura limpa** (Controller → UseCase → Service)
2. **Todos os campos opcionais** usam `null.Int`, `null.String`, `null.Time`
3. **Nova arquitetura de diários** é totalmente normalizada (tarefas e ocorrências separadas)
4. **Diário consolidado** é gerado dinamicamente via VIEW SQL
5. **Autenticação JWT** protege TODAS as rotas exceto login e cadastro
6. **CORS liberado** para todas as origens (ideal para desenvolvimento)
7. **Servidor roda na porta 9090** por padrão

---

## 📁 Repositório Oficial

**GitHub**: https://github.com/MarkHiarley/OBRA

---

✨ **Documentação gerada automaticamente via análise do código-fonte da API Go** ✨
