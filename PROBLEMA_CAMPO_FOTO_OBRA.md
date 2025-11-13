# 🚨 PROBLEMA: Campo `foto` de Obra NÃO está sendo retornado pela API

## 📋 Resumo do Problema

**Data:** 13/11/2025  
**Módulo:** Obras  
**Endpoint:** `GET /obras/:id`  
**Campo Problemático:** `foto`

**Sintoma:**

- ✅ Cadastro de obra com foto funciona (POST /obras retorna sucesso)
- ❌ Ao buscar obra (GET /obras/:id), o campo `foto` **não vem na resposta JSON**
- ❌ Modal de edição e visualização ficam sem a foto

---

## 🔍 Evidências (Console Logs)

### Resposta da API GET /obras/61

```json
{
  "id": 61,
  "nome": "Casa Do Pablo",
  "contrato_numero": "123",
  "contratante_id": 68,
  "responsavel_id": 68,
  "data_inicio": "2025-11-13T00:00:00Z",
  "prazo_dias": 16,
  "data_fim_prevista": "2025-11-29T00:00:00Z",
  "orcamento": 122222,
  "status": "planejamento",
  "art": "1231231",
  "endereco_rua": "Rua Adauto Damasceno Vasconcelos",
  "endereco_numero": "262",
  "endereco_bairro": "Santo Antônio",
  "endereco_cidade": "Tianguá",
  "endereco_estado": "CE",
  "endereco_cep": "62324-100",
  "observacoes": "sla carai ",
  "ativo": true,
  "created_at": "2025-11-13T18:45:59.115959Z",
  "updated_at": null
}
```

### Logs de Diagnóstico

```
📡 Resposta da API /obras/:id: { ... }
📸 Campo 'foto' na resposta: AUSENTE/NULL  ❌
📸 [VISUALIZAR] Foto recebida da API: NÃO (null/undefined)  ❌
📋 [VISUALIZAR] Tamanho da foto: N/A
```

**Conclusão:** O campo `foto` **não existe na resposta JSON** ou está vindo como `null`.

---

## ✅ Frontend Está Correto

O frontend **está preparado** para receber e exibir a foto:

### 1. Serviço (`obraService.ts`)

```typescript
buscarPorId: async (id: string): Promise<Obra> => {
  const response = await api.get(`/obras/${id}`);
  return response.data;  // ✅ Retorna dados completos
},
```

### 2. Modal de Visualização (`BuscarObra.tsx`)

```tsx
{
  /* Foto */
}
{
  obraVisualizando.foto && (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        📷 Foto da Obra
      </Typography>
      <img
        src={obraVisualizando.foto}
        alt="Foto da Obra"
        style={{ maxWidth: "100%", borderRadius: "8px" }}
      />
    </Box>
  );
}
```

### 3. Modal de Edição (`BuscarObra.tsx`)

```tsx
{
  /* Foto Upload */
}
<FotoUpload
  foto={obraEditando.foto || ""}
  onFotoChange={(foto) => handleCampoChange("foto", foto || "")}
/>;
```

### 4. Type Definition (`types/obra.ts`)

```typescript
export interface Obra {
  id?: number;
  nome: string;
  // ... outros campos
  foto?: string; // ✅ Campo definido
  created_at?: string;
  updated_at?: string;
}
```

---

## 🔧 Verificações Necessárias no Backend Go

### 1. ✅ Verificar se a Coluna `foto` Existe na Tabela

```sql
-- PostgreSQL
\d obras;

-- Ou
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'obras' AND column_name = 'foto';
```

**Resultado esperado:**

```
 column_name | data_type | character_maximum_length
-------------+-----------+-------------------------
 foto        | text      |
```

**Se não existir:**

```sql
ALTER TABLE obras ADD COLUMN foto TEXT;
```

---

### 2. ✅ Verificar o Struct `Obra` no Model

**Arquivo:** `models/obra.go`

```go
type Obra struct {
    ID                uint           `gorm:"primaryKey" json:"id"`
    Nome              string         `json:"nome"`
    ContratoNumero    string         `json:"contrato_numero"`
    ContratanteID     uint           `json:"contratante_id"`
    ResponsavelID     uint           `json:"responsavel_id"`
    DataInicio        time.Time      `json:"data_inicio"`
    PrazoDias         int            `json:"prazo_dias"`
    DataFimPrevista   time.Time      `json:"data_fim_prevista"`
    Orcamento         float64        `json:"orcamento"`
    Status            string         `json:"status"`
    Art               string         `json:"art"`
    EnderecoRua       string         `json:"endereco_rua"`
    EnderecoNumero    string         `json:"endereco_numero"`
    EnderecoBairro    string         `json:"endereco_bairro"`
    EnderecoCidade    string         `json:"endereco_cidade"`
    EnderecoEstado    string         `json:"endereco_estado"`
    EnderecoCEP       string         `json:"endereco_cep"`
    Observacoes       string         `json:"observacoes"`
    Ativo             bool           `json:"ativo"`

    Foto              string         `json:"foto"`  // ⚠️ VERIFICAR SE EXISTE

    CreatedAt         time.Time      `json:"created_at"`
    UpdatedAt         *time.Time     `json:"updated_at"`
}
```

**❗ Ação:** Certificar que o campo `Foto` existe com a tag `json:"foto"`.

---

### 3. ✅ Verificar Handler GET /obras/:id

**Arquivo:** `handlers/obra_handler.go` (ou similar)

#### Verificar se está usando `.Select()` que omite `foto`:

```go
// ❌ PROBLEMA: Select específico pode omitir "foto"
func GetObraPorID(c *gin.Context) {
    var obra models.Obra

    db.Model(&models.Obra{}).
       Select("id, nome, contrato_numero, ..., observacoes, ativo").  // ❌ foto NÃO está aqui
       Where("id = ?", c.Param("id")).
       First(&obra)

    c.JSON(200, obra)
}
```

#### ✅ CORREÇÃO 1: Remover `.Select()` e usar `.Find()`:

```go
// ✅ SOLUÇÃO 1: Find seleciona TODAS as colunas
func GetObraPorID(c *gin.Context) {
    var obra models.Obra

    if err := db.Where("id = ?", c.Param("id")).First(&obra).Error; err != nil {
        c.JSON(404, gin.H{"error": "Obra não encontrada"})
        return
    }

    c.JSON(200, obra)
}
```

#### ✅ CORREÇÃO 2: Adicionar `foto` no `.Select()`:

```go
// ✅ SOLUÇÃO 2: Incluir "foto" no Select
func GetObraPorID(c *gin.Context) {
    var obra models.Obra

    db.Model(&models.Obra{}).
       Select("id, nome, contrato_numero, responsavel_id, ..., foto, created_at, updated_at").
       Where("id = ?", c.Param("id")).
       First(&obra)

    c.JSON(200, obra)
}
```

---

### 4. ✅ Verificar Handler POST /obras (Criação)

**Verificar se o campo `foto` está sendo salvo:**

```go
// ❌ PROBLEMA: Struct de request não tem campo Foto
type CriarObraRequest struct {
    Nome              string    `json:"nome" binding:"required"`
    ContratoNumero    string    `json:"contrato_numero"`
    // ... outros campos
    Observacoes       string    `json:"observacoes"`
    // Foto está faltando ❌
}

func CriarObra(c *gin.Context) {
    var request CriarObraRequest
    c.ShouldBindJSON(&request)

    obra := models.Obra{
        Nome:           request.Nome,
        ContratoNumero: request.ContratoNumero,
        // ... outros campos
        // Foto NÃO está sendo atribuído ❌
    }

    db.Create(&obra)
}
```

#### ✅ CORREÇÃO:

```go
// ✅ SOLUÇÃO: Adicionar campo Foto no request e no model
type CriarObraRequest struct {
    Nome              string    `json:"nome" binding:"required"`
    ContratoNumero    string    `json:"contrato_numero"`
    // ... outros campos
    Foto              string    `json:"foto"`  // ✅ Adicionar campo
}

func CriarObra(c *gin.Context) {
    var request CriarObraRequest
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    obra := models.Obra{
        Nome:           request.Nome,
        ContratoNumero: request.ContratoNumero,
        // ... outros campos
        Foto:           request.Foto,  // ✅ Atribuir foto
    }

    if err := db.Create(&obra).Error; err != nil {
        c.JSON(500, gin.H{"error": "Erro ao criar obra"})
        return
    }

    c.JSON(201, obra)
}
```

---

### 5. ✅ Verificar Handler PUT /obras/:id (Atualização)

```go
// ✅ SOLUÇÃO: Incluir campo Foto no struct de atualização
type AtualizarObraRequest struct {
    Nome              *string   `json:"nome"`
    ContratoNumero    *string   `json:"contrato_numero"`
    // ... outros campos
    Foto              *string   `json:"foto"`  // ✅ Adicionar
}

func AtualizarObra(c *gin.Context) {
    var obra models.Obra
    db.Where("id = ?", c.Param("id")).First(&obra)

    var request AtualizarObraRequest
    c.ShouldBindJSON(&request)

    updates := make(map[string]interface{})

    if request.Nome != nil {
        updates["nome"] = *request.Nome
    }
    // ... outros campos
    if request.Foto != nil {
        updates["foto"] = *request.Foto  // ✅ Permitir atualizar foto
    }

    db.Model(&obra).Updates(updates)

    c.JSON(200, obra)
}
```

---

### 6. ✅ Verificar AutoMigrate

**Arquivo:** `main.go` ou `database/database.go`

```go
// ✅ Garantir que AutoMigrate está rodando
func InitDatabase() {
    // ... conexão com DB

    db.AutoMigrate(
        &models.Usuario{},
        &models.Pessoa{},
        &models.Obra{},      // ✅ Certifique-se de que está aqui
        &models.Despesa{},
        &models.Receita{},
        &models.Fornecedor{},
        &models.DiarioObra{},
    )
}
```

**Se não rodou AutoMigrate:**

```sql
-- Adicionar coluna manualmente
ALTER TABLE obras ADD COLUMN foto TEXT;
```

---

### 7. ✅ Verificar Dados no Banco

```sql
-- Verificar se foto foi salva na obra ID 61
SELECT
    id,
    nome,
    CASE
        WHEN foto IS NULL THEN '❌ NULL'
        WHEN foto = '' THEN '⚠️ VAZIO'
        ELSE CONCAT('✅ TEM FOTO (', LENGTH(foto), ' bytes)')
    END as status_foto,
    LEFT(foto, 50) as primeiros_50_chars
FROM obras
WHERE id = 61;
```

**Resultado esperado:**

```
 id |     nome        |        status_foto         |   primeiros_50_chars
----+-----------------+----------------------------+------------------------
 61 | Casa Do Pablo   | ✅ TEM FOTO (45678 bytes)  | data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...
```

**Se retornar NULL:**

- Foto **não foi salva** → Problema no handler POST/PUT
- Verificar logs do backend durante criação

---

## 🧪 Teste com cURL

### 1. Criar obra com foto

```bash
curl -X POST http://localhost:9090/obras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "nome": "Teste Foto",
    "contrato_numero": "TESTE-001",
    "contratante_id": 68,
    "responsavel_id": 68,
    "data_inicio": "2025-11-13T00:00:00Z",
    "data_fim_prevista": "2025-11-29T00:00:00Z",
    "prazo_dias": 16,
    "orcamento": 50000,
    "status": "planejamento",
    "foto": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Resposta esperada:**

```json
{
  "id": 62,
  "nome": "Teste Foto",
  "foto": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  ...
}
```

### 2. Buscar obra

```bash
curl -X GET http://localhost:9090/obras/62 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta esperada:**

```json
{
  "id": 62,
  "nome": "Teste Foto",
  "foto": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  ...
}
```

---

## 📊 Checklist de Verificação

### Backend Go

- [ ] Coluna `foto TEXT` existe na tabela `obras`
- [ ] Struct `Obra` tem campo `Foto string json:"foto"`
- [ ] Handler GET /obras/:id retorna campo `foto` (não usa `.Select()` que omite foto)
- [ ] Handler POST /obras salva campo `foto` no banco
- [ ] Handler PUT /obras/:id permite atualizar campo `foto`
- [ ] AutoMigrate incluiu model `Obra`
- [ ] Dados de teste: `SELECT foto FROM obras WHERE id = 61` retorna valor

### Banco de Dados

- [ ] `DESCRIBE obras;` mostra coluna `foto TEXT`
- [ ] `SELECT foto FROM obras WHERE id = 61;` retorna string base64 ou NULL

---

## 🎯 Solução Rápida

### Opção 1: Remover `.Select()` do Handler GET

```go
// Antes (problemático)
db.Model(&models.Obra{}).Select("id, nome, ...").Where("id = ?", id).First(&obra)

// Depois (correto)
db.Where("id = ?", id).First(&obra)
```

### Opção 2: Adicionar `foto` no `.Select()`

```go
db.Model(&models.Obra{}).
   Select("id, nome, contrato_numero, ..., foto, created_at, updated_at").
   Where("id = ?", id).
   First(&obra)
```

### Opção 3: Verificar se coluna existe

```sql
ALTER TABLE obras ADD COLUMN foto TEXT;
```

---

## 📧 Logs de Debug Recomendados

Adicionar logs no handler para debug:

```go
func GetObraPorID(c *gin.Context) {
    var obra models.Obra

    if err := db.Where("id = ?", c.Param("id")).First(&obra).Error; err != nil {
        log.Printf("❌ Erro ao buscar obra: %v", err)
        c.JSON(404, gin.H{"error": "Obra não encontrada"})
        return
    }

    // 🔍 DEBUG
    log.Printf("📸 Obra ID %d | Foto presente: %t | Tamanho: %d bytes",
        obra.ID,
        obra.Foto != "",
        len(obra.Foto))

    c.JSON(200, obra)
}
```

---

## 🔗 Problema Relacionado

Este é o **MESMO PROBLEMA** do Fornecedor (campos `contato_nome`, `contato_telefone`, `contato_email`):

- ✅ Frontend envia dados corretamente
- ❌ Backend não retorna os campos na resposta

**Documentação relacionada:** `PROBLEMA_CAMPOS_CONTATO_FORNECEDOR.md`

---

**Prioridade:** 🔴 ALTA  
**Impacto:** Usuários não conseguem visualizar/editar fotos de obras  
**Próximo passo:** Verificar handler GET /obras/:id e model Obra no backend Go
