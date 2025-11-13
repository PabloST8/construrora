# 🐛 PROBLEMA: Campos de Contato do Fornecedor não salvam

**Data:** 13/11/2025  
**Status:** 🔴 PROBLEMA IDENTIFICADO NO BACKEND GO

---

## 📋 DESCRIÇÃO DO PROBLEMA

Ao cadastrar um fornecedor preenchendo os campos de contato (`contato_nome`, `contato_telefone`, `contato_email`), eles **não são salvos** no banco de dados.

### Evidências:

**Frontend ENVIA:**

```json
{
  "contato_nome": "Pablo Felipe Araújo Ferreira",
  "contato_telefone": "88994464373",
  "contato_email": "pablo.moon.star@gmail.com"
}
```

**Backend RETORNA:**

```json
{
  "contato_nome": null,
  "contato_telefone": null,
  "contato_email": null
}
```

---

## 🔍 ANÁLISE

### 1. Frontend está CORRETO ✅

**Payload enviado:**

```typescript
const dadosFornecedor: Fornecedor = {
  nome: formData.nome,
  tipo_documento: formData.tipo_documento,
  documento: removerMascara(formData.documento),
  email: formData.email,
  telefone: removerMascara(formData.telefone || ""),
  endereco: formData.endereco,
  cidade: formData.cidade,
  estado: formData.estado,
  contato_nome: formData.contato_nome || "", // ✅ ENVIANDO
  contato_telefone: removerMascara(formData.contato_telefone || ""), // ✅ ENVIANDO
  contato_email: formData.contato_email || "", // ✅ ENVIANDO
  ativo: Boolean(formData.ativo),
};
```

### 2. Model Go tem os campos ✅

```go
type Fornecedor struct {
    ID              uint        `gorm:"primaryKey" json:"id"`
    Nome            string      `json:"nome"`
    TipoDocumento   string      `json:"tipo_documento"`
    Documento       string      `json:"documento"`
    Email           null.String `json:"email"`
    Telefone        null.String `json:"telefone"`
    Endereco        null.String `json:"endereco"`
    Cidade          null.String `json:"cidade"`
    Estado          null.String `json:"estado"`
    ContatoNome     null.String `json:"contato_nome"`      // ✅ EXISTE
    ContatoTelefone null.String `json:"contato_telefone"`  // ✅ EXISTE
    ContatoEmail    null.String `json:"contato_email"`     // ✅ EXISTE
    Ativo           null.Bool   `json:"ativo"`
    CreatedAt       time.Time   `json:"created_at"`
    UpdatedAt       time.Time   `json:"updated_at"`
}
```

### 3. Problema está no HANDLER do Backend 🔴

O handler Go **não está lendo/salvando** os campos de contato do JSON recebido.

Possíveis causas:

- Handler usa struct diferente do Model (sem campos de contato)
- Campos não estão sendo bindados corretamente
- Validação está bloqueando campos vazios
- Migration do banco não criou as colunas

---

## 🛠️ SOLUÇÃO

### Verificar no Backend Go:

#### 1. **Handler de Criação** (POST /fornecedores)

```go
// ❌ ERRADO - Usando struct incompleto
type CreateFornecedorRequest struct {
    Nome          string `json:"nome"`
    TipoDocumento string `json:"tipo_documento"`
    Documento     string `json:"documento"`
    // ❌ FALTAM contato_nome, contato_telefone, contato_email
}

// ✅ CORRETO - Usar o Model completo
func CreateFornecedor(c *gin.Context) {
    var fornecedor models.Fornecedor
    if err := c.ShouldBindJSON(&fornecedor); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // ✅ SALVA TODOS OS CAMPOS (incluindo contato_*)
    if err := db.Create(&fornecedor).Error; err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(201, fornecedor)
}
```

#### 2. **Handler de Atualização** (PUT /fornecedores/:id)

```go
// ✅ CORRETO
func UpdateFornecedor(c *gin.Context) {
    id := c.Param("id")
    var fornecedor models.Fornecedor

    if err := db.First(&fornecedor, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Fornecedor não encontrado"})
        return
    }

    // ✅ Bind JSON completo (incluindo contato_*)
    if err := c.ShouldBindJSON(&fornecedor); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // ✅ SALVA TODOS OS CAMPOS
    if err := db.Save(&fornecedor).Error; err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, fornecedor)
}
```

#### 3. **Migration do Banco de Dados**

Verificar se as colunas existem:

```sql
-- Verificar estrutura da tabela
DESCRIBE fornecedores;

-- OU

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'fornecedores';
```

Se as colunas **não existirem**, criar migration:

```go
// Migration para adicionar campos de contato
db.AutoMigrate(&models.Fornecedor{})

// OU

db.Exec(`
    ALTER TABLE fornecedores
    ADD COLUMN contato_nome VARCHAR(255),
    ADD COLUMN contato_telefone VARCHAR(20),
    ADD COLUMN contato_email VARCHAR(255)
`)
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Verificar se colunas `contato_nome`, `contato_telefone`, `contato_email` existem na tabela `fornecedores`
- [ ] Verificar se handler POST /fornecedores está usando struct completo (não DTO limitado)
- [ ] Verificar se handler PUT /fornecedores/:id está fazendo bind de todos os campos
- [ ] Verificar se há validações bloqueando campos vazios
- [ ] Testar envio via Postman/Insomnia para isolar problema do frontend
- [ ] Adicionar logs no backend para ver JSON recebido

---

## 🧪 TESTE COM CURL

```bash
# Criar fornecedor com dados de contato
curl -X POST http://localhost:9090/fornecedores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Fornecedor",
    "tipo_documento": "CNPJ",
    "documento": "12345678000199",
    "email": "teste@email.com",
    "telefone": "1199998888",
    "contato_nome": "João Silva",
    "contato_telefone": "1188887777",
    "contato_email": "joao@email.com",
    "ativo": true
  }'
```

Se retornar:

```json
{
  "contato_nome": null,
  "contato_telefone": null,
  "contato_email": null
}
```

→ **Problema confirmado no backend**

---

## 📝 LOGS ÚTEIS

Adicionar no handler Go:

```go
func CreateFornecedor(c *gin.Context) {
    var fornecedor models.Fornecedor

    // ✅ Log do JSON recebido
    jsonData, _ := c.GetRawData()
    log.Println("📥 JSON recebido:", string(jsonData))

    // Re-alimentar o body (foi consumido acima)
    c.Request.Body = io.NopCloser(bytes.NewBuffer(jsonData))

    if err := c.ShouldBindJSON(&fornecedor); err != nil {
        log.Println("❌ Erro no bind:", err)
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // ✅ Log do struct bindado
    log.Printf("📦 Fornecedor bindado: %+v\n", fornecedor)

    if err := db.Create(&fornecedor).Error; err != nil {
        log.Println("❌ Erro ao salvar:", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // ✅ Log do fornecedor salvo
    log.Printf("✅ Fornecedor salvo: %+v\n", fornecedor)

    c.JSON(201, fornecedor)
}
```

---

## 🎯 CONCLUSÃO

**Problema:** Backend Go não está salvando campos `contato_nome`, `contato_telefone`, `contato_email`  
**Causa Provável:** Handler usando struct incompleto ou migration faltando  
**Solução:** Corrigir backend Go conforme exemplos acima  
**Status Frontend:** ✅ Funcionando corretamente (envia dados)

---

**Última atualização:** 13/11/2025
