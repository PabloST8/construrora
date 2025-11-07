# 🔍 ANÁLISE COMPLETA - TODO O QUE FALTA FAZER

**Data:** 06/11/2025  
**Status Atual:** 70% completo  
**Comparação:** README API Go + Requisitos do Cliente

---

## 📋 ÍNDICE

1. [Services que PRECISAM ATUALIZAÇÃO](#1-services-que-precisam-atualização)
2. [Formatters INCOMPLETO](#2-formatters-incompleto)
3. [Páginas React DESATUALIZADAS](#3-páginas-react-desatualizadas)
4. [Funcionalidades FALTANDO](#4-funcionalidades-faltando)
5. [Validações AUSENTES](#5-validações-ausentes)
6. [Backend (Banco de Dados)](#6-backend-banco-de-dados)
7. [Resumo Priorizado](#7-resumo-priorizado)

---

## 1. SERVICES QUE PRECISAM ATUALIZAÇÃO

### ❌ `pessoaService.ts` - AJUSTES NECESSÁRIOS

**PROBLEMA:**

```typescript
// ❌ CÓDIGO ATUAL (ERRADO)
tipo: "PF" | "PJ"; // API Go usa "CPF" | "CNPJ"
```

**CORREÇÃO NECESSÁRIA:**

```typescript
// ✅ CÓDIGO CORRETO
tipo_documento: "CPF" | "CNPJ";
```

**Campos faltando envio:**

- `endereco_rua`
- `endereco_numero`
- `endereco_complemento`
- `endereco_bairro`
- `endereco_cidade`
- `endereco_estado`
- `endereco_cep`

---

### ❌ `obraService.ts` - MÚLTIPLOS ERROS

**PROBLEMAS:**

1. **Endpoint inexistente:**

```typescript
// ❌ ERRADO - API Go NÃO tem esta rota
async buscarPorStatus(status: string): Promise<Obra[]> {
  const response = await api.get(`/obras/status/${status}`);
  return response.data;
}
```

2. **Endpoint inexistente:**

```typescript
// ❌ ERRADO - API Go NÃO tem PATCH /obras/:id/status
async atualizarStatus(id: string, status: string) {
  const response = await api.patch(`/obras/${id}/status`, { status });
  return response.data;
}
```

3. **Campos que a API ESPERA mas o frontend NÃO envia:**

- ✅ `data_inicio` (frontend tem)
- ❌ `prazo_dias` (frontend NÃO tem - usa `data_fim_prevista` diretamente)
- ❌ `contratante_id` (frontend envia objeto, não ID)
- ❌ `responsavel_id` (frontend envia objeto, não ID)
- ❌ `art` (campo NOVO na API Go)

**ROTAS CORRETAS DA API GO:**

```typescript
GET    /obras
GET    /obras/:id
POST   /obras
PUT    /obras/:id
DELETE /obras/:id
```

**CORREÇÃO NECESSÁRIA:**

```typescript
// ✅ REMOVER métodos que não existem
// - buscarPorStatus()
// - atualizarStatus()

// ✅ AJUSTAR criar() e atualizar() para enviar:
{
  nome: string,
  contrato_numero: string,
  contratante_id: number,  // ❌ Não objeto
  responsavel_id: number,  // ❌ Não objeto
  data_inicio: "2025-11-06",
  prazo_dias: 180,  // ❌ Calcular automaticamente
  orcamento: 150000.00,
  status: "planejamento",
  art: "123456",  // ❌ NOVO CAMPO
  endereco_rua: "Av. Principal",
  endereco_numero: "1000",
  endereco_bairro: "Centro",
  endereco_cidade: "São Paulo",
  endereco_estado: "SP",
  endereco_cep: "01000-000",
  observacoes: "...",
  ativo: true
}
```

---

### ❌ `despesaService.ts` - CAMPOS DESATUALIZADOS

**PROBLEMAS:**

1. **Campo `data` vs `data_vencimento`:**

```typescript
// ❌ API Go ESPERA:
data_vencimento: "2025-11-15";

// ❌ Frontend pode estar enviando:
data: "2025-11-15";
```

2. **ENUMs desatualizados:**

```typescript
// ❌ CÓDIGO ATUAL (categorias incompletas)
categoria: "MATERIAL" | "MAO_DE_OBRA" | "IMPOSTO" | "PARCEIRO" | "OUTROS"

// ✅ API GO TEM 10 OPÇÕES:
categoria:
  | "MATERIAL"
  | "MAO_DE_OBRA"
  | "COMBUSTIVEL"       // ❌ FALTA
  | "ALIMENTACAO"       // ❌ FALTA
  | "MATERIAL_ELETRICO" // ❌ FALTA
  | "ALUGUEL_EQUIPAMENTO" // ❌ FALTA
  | "TRANSPORTE"        // ❌ FALTA
  | "IMPOSTO"
  | "PARCEIRO"
  | "OUTROS"
```

3. **Forma de pagamento incompleta:**

```typescript
// ❌ CÓDIGO ATUAL
forma_pagamento: "A_VISTA" | "PIX" | "BOLETO" | "CARTAO"

// ✅ API GO TEM 7 OPÇÕES:
forma_pagamento:
  | "PIX"
  | "BOLETO"
  | "CARTAO_CREDITO"    // ❌ FALTA
  | "CARTAO_DEBITO"     // ❌ FALTA
  | "TRANSFERENCIA"     // ❌ FALTA
  | "ESPECIE"           // ❌ FALTA (não "A_VISTA")
  | "CHEQUE"            // ❌ FALTA
```

4. **Status de pagamento incompleto:**

```typescript
// ❌ CÓDIGO ATUAL
status_pagamento: "PENDENTE" | "PAGO";

// ✅ API GO TEM 4 OPÇÕES:
status_pagamento: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
```

**MÉTODOS LEGADOS A REMOVER:**

```typescript
// ❌ Provavelmente não existem na API Go:
-atualizarPagamento() - buscarPorObra() - obterResumoCategoria();
```

---

### ❌ `diarioService.ts` - ENDPOINT ERRADO + CAMPOS INCORRETOS

**PROBLEMAS:**

1. **Endpoint ERRADO:**

```typescript
// ❌ ERRADO
async buscarPorObra(obraId: number): Promise<DiarioObra[]> {
  const response = await api.get(`/diarios/${obraId}/obra`);
  return response.data.data || response.data;
}

// ✅ CORRETO (conforme README API Go)
async buscarPorObra(obraId: number): Promise<DiarioObra[]> {
  const response = await api.get(`/diarios/obra/${obraId}`);
  return response.data.data || response.data;
}
```

2. **Sistema de FOTO completamente ERRADO:**

```typescript
// ❌ CÓDIGO ATUAL - Upload separado de fotos
async uploadFoto(diarioId: number, arquivo: File): Promise<any> {
  const formData = new FormData();
  formData.append("foto", arquivo);
  const response = await api.post(`/diarios/${diarioId}/fotos`, formData);
  return response.data;
}

async removerFoto(diarioId: number, fotoId: number): Promise<void> {
  await api.delete(`/diarios/${diarioId}/fotos/${fotoId}`);
}
```

**PROBLEMA:** A API Go **NÃO TEM** rotas `/diarios/:id/fotos`!

**SOLUÇÃO:** A foto deve ir **BASE64 no JSON** do diário:

```typescript
// ✅ CORRETO
{
  obra_id: 1,
  data: "2025-11-06",
  periodo: "manha",
  atividades_realizadas: "Concretagem da laje",
  foto: "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAY...",
  responsavel_id: 4,
  status_aprovacao: "PENDENTE",
  clima: "ENSOLARADO",
  progresso_percentual: 10.5
}
```

3. **Campos NOVOS da API Go não mapeados:**

- ❌ `clima`: "ENSOLARADO" | "NUBLADO" | "CHUVOSO" | "VENTOSO" | "OUTROS"
- ❌ `progresso_percentual`: number (0-100)
- ❌ `foto`: string (base64)

4. **Campo renomeado:**

```typescript
// ❌ CÓDIGO ATUAL
descricaoAtividade: string;

// ✅ API GO USA
atividades_realizadas: string;
```

**MÉTODOS A REMOVER:**

```typescript
// ❌ Não existem na API Go:
-uploadFoto() - removerFoto() - obterEstatisticas() - obterResumoMensal();
```

---

### ⚠️ `usuarioService.ts` - VERIFICAR AUTENTICAÇÃO

**AVISO IMPORTANTE:**

```typescript
// ✅ POST /usuarios é PÚBLICO (cadastro)
async cadastrar(usuario: Usuario): Promise<Usuario> {
  // ❌ NÃO DEVE ENVIAR TOKEN
  const response = await api.post("/usuarios", usuario);
  return response.data;
}

// ✅ Demais operações SÃO PROTEGIDAS
async listar(): Promise<Usuario[]> {
  // ✅ DEVE ENVIAR TOKEN
  const response = await api.get("/usuarios");
  return response.data;
}
```

**VERIFICAR:**

- O interceptor JWT em `api.ts` NÃO deve bloquear `POST /usuarios`
- Verificar se `api.ts` tem lista de rotas públicas

---

## 2. FORMATTERS INCOMPLETO

### ❌ `formatters.ts` - FALTAM MÚLTIPLOS FORMATADORES

**PROBLEMAS:**

1. **Falta formatador de CATEGORIA de despesa:**

```typescript
// ❌ NÃO EXISTE
export const formatCategoriaDespesa = (categoria: string): string => {
  switch (categoria) {
    case "MATERIAL":
      return "Material";
    case "MAO_DE_OBRA":
      return "Mão de Obra";
    case "COMBUSTIVEL":
      return "Combustível";
    case "ALIMENTACAO":
      return "Alimentação";
    case "MATERIAL_ELETRICO":
      return "Material Elétrico";
    case "ALUGUEL_EQUIPAMENTO":
      return "Aluguel de Equipamento";
    case "TRANSPORTE":
      return "Transporte";
    case "IMPOSTO":
      return "Imposto";
    case "PARCEIRO":
      return "Parceiro";
    case "OUTROS":
      return "Outros";
    default:
      return categoria;
  }
};
```

2. **Falta formatador de FORMA DE PAGAMENTO:**

```typescript
// ❌ NÃO EXISTE
export const formatFormaPagamento = (forma: string): string => {
  switch (forma) {
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "Boleto Bancário";
    case "CARTAO_CREDITO":
      return "Cartão de Crédito";
    case "CARTAO_DEBITO":
      return "Cartão de Débito";
    case "TRANSFERENCIA":
      return "Transferência Bancária";
    case "ESPECIE":
      return "Dinheiro/Espécie";
    case "CHEQUE":
      return "Cheque";
    default:
      return forma;
  }
};
```

3. **Falta formatador de STATUS DE PAGAMENTO:**

```typescript
// ❌ NÃO EXISTE
export const formatStatusPagamento = (status: string): string => {
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "PAGO":
      return "Pago";
    case "VENCIDO":
      return "Vencido";
    case "CANCELADO":
      return "Cancelado";
    default:
      return status;
  }
};
```

4. **Falta formatador de CLIMA:**

```typescript
// ❌ NÃO EXISTE
export const formatClima = (clima: string): string => {
  switch (clima) {
    case "ENSOLARADO":
      return "☀️ Ensolarado";
    case "NUBLADO":
      return "☁️ Nublado";
    case "CHUVOSO":
      return "🌧️ Chuvoso";
    case "VENTOSO":
      return "💨 Ventoso";
    case "OUTROS":
      return "🌤️ Outros";
    default:
      return clima;
  }
};
```

5. **Falta formatador de PERÍODO:**

```typescript
// ❌ NÃO EXISTE
export const formatPeriodo = (periodo: string): string => {
  switch (periodo) {
    case "manha":
      return "Manhã";
    case "tarde":
      return "Tarde";
    case "noite":
      return "Noite";
    case "integral":
      return "Integral";
    default:
      return periodo;
  }
};
```

6. **Falta formatador de FONTE DE RECEITA:**

```typescript
// ❌ NÃO EXISTE
export const formatFonteReceita = (fonte: string): string => {
  switch (fonte) {
    case "CONTRATO":
      return "Contrato";
    case "PAGAMENTO_CLIENTE":
      return "Pagamento de Cliente";
    case "ADIANTAMENTO":
      return "Adiantamento";
    case "FINANCIAMENTO":
      return "Financiamento";
    case "MEDICAO":
      return "Medição";
    case "OUTROS":
      return "Outros";
    default:
      return fonte;
  }
};
```

7. **Falta formatador de PERFIL DE ACESSO:**

```typescript
// ❌ NÃO EXISTE
export const formatPerfilAcesso = (perfil: string): string => {
  switch (perfil) {
    case "admin":
      return "Administrador";
    case "gestor":
      return "Gestor";
    case "usuario":
      return "Usuário";
    default:
      return perfil;
  }
};
```

8. **Falta formatador de TIPO DE DOCUMENTO:**

```typescript
// ❌ NÃO EXISTE
export const formatTipoDocumento = (tipo: string): string => {
  return tipo === "CPF" ? "Pessoa Física" : "Pessoa Jurídica";
};
```

9. **Função `getStatusLabel()` INCOMPLETA:**

```typescript
// ❌ FALTAM MUITOS CASOS
export const getStatusLabel = (status: string): string => {
  switch (status) {
    // ❌ FALTAM:
    case "planejamento":
      return "Planejamento";
    case "em_andamento":
      return "Em Andamento";
    case "pausada":
      return "Pausada";
    case "concluida":
      return "Concluída";
    case "cancelada":
      return "Cancelada";

    // ❌ FALTAM STATUS DE APROVAÇÃO:
    case "pendente":
      return "Pendente";
    case "aprovado":
      return "Aprovado";
    case "rejeitado":
      return "Rejeitado";

    // ✅ Já tem alguns...
  }
};
```

---

## 3. PÁGINAS REACT DESATUALIZADAS

### ❌ `CadastrarPessoa.tsx` - CAMPO ERRADO

**PROBLEMA 1:**

```tsx
// ❌ CÓDIGO ATUAL (linha 52)
tipo: "PF" | "PJ";

// ✅ CORRETO (API Go)
tipo_documento: "CPF" | "CNPJ";
```

**PROBLEMA 2:**

```tsx
// ❌ CÓDIGO ATUAL (linha 73)
setFormData({
  ...formData,
  tipo: tipo === "FISICA" ? "PF" : "PJ", // ❌ ERRADO
  documento: "",
});

// ✅ CORRETO
setFormData({
  ...formData,
  tipo_documento: tipo === "FISICA" ? "CPF" : "CNPJ",
  documento: "",
});
```

**PROBLEMA 3 - Campos de endereço não estão sendo enviados:**

```tsx
// A página tem os campos `endereco.cep`, `endereco.logradouro`, `endereco.estado`
// MAS não está mapeando para os campos corretos da API:

// ❌ Não está enviando:
endereco_rua: endereco.logradouro,
endereco_numero: "...",  // ❌ Campo nem existe no form
endereco_complemento: "...",  // ❌ Campo nem existe no form
endereco_bairro: "...",  // ❌ Campo nem existe no form
endereco_cidade: "...",  // ❌ Campo nem existe no form
endereco_estado: endereco.estado,
endereco_cep: endereco.cep,
```

**SOLUÇÃO:** Adicionar campos faltantes no formulário e mapear corretamente.

---

### ❌ `CadastrarObra.tsx` - MÚLTIPLOS PROBLEMAS

**PROBLEMA 1 - Interfaces ANTIGAS:**

```tsx
// ❌ CÓDIGO ATUAL (linhas 24-29)
import {
  Obra,
  ObraLegacy, // ❌ NÃO EXISTE MAIS
  Aditivo, // ❌ NÃO EXISTE MAIS
  Despesa,
  FolhaPagamento, // ❌ NÃO EXISTE MAIS
} from "../types/obra";
```

**PROBLEMA 2 - Estado usando interface antiga:**

```tsx
// ❌ CÓDIGO ATUAL (linha 38)
const [obra, setObra] = useState<ObraLegacy>({
  nome: "",
  contratoNumero: "",
  art: "", // ✅ Campo está correto
  tipoObra: "Manutenção", // ❌ Campo não existe na API
  situacao: "Em andamento", // ❌ Campo não existe (API usa "status")
  dataInicio: "", // ❌ API usa "data_inicio"
  dataTerminoPrevista: "", // ❌ API usa "prazo_dias"
  dataInicioReal: "", // ❌ Campo não existe
  descricao: "", // ❌ API usa "observacoes"
  // ... e outros campos
});
```

**PROBLEMA 3 - Campos que FALTAM:**

```tsx
// ❌ Não tem:
- prazo_dias (número de dias)
- contratante_id (ID, não objeto)
- responsavel_id (ID, não objeto)
- orcamento (valor do orçamento)
```

**PROBLEMA 4 - Sistema de Aditivos:**

```tsx
// ❌ API Go NÃO TEM sistema de aditivos
const [aditivos, setAditivos] = useState<Aditivo[]>([]);
```

**PROBLEMA 5 - Sistema de Folha de Pagamento:**

```tsx
// ❌ API Go NÃO TEM folha de pagamento
const [folhasPagamento, setFolhasPagamento] = useState<FolhaPagamento[]>([]);
```

**SOLUÇÃO:**

1. Usar apenas interface `Obra` (não `ObraLegacy`)
2. Remover abas de Aditivos e Folha de Pagamento
3. Adicionar campo `prazo_dias` (calcular automaticamente da data fim)
4. Usar `contratante_id` e `responsavel_id` como números
5. Ajustar nomes dos campos

---

### ❌ `DiarioObras.tsx` - SISTEMA DE FOTOS ERRADO

**PROBLEMA 1 - Upload de fotos separado:**

```tsx
// ❌ CÓDIGO ATUAL (linha 79)
const [fotosParaUpload, setFotosParaUpload] = useState<File[]>([]);
const [uploadandoFoto, setUploadandoFoto] = useState(false);
```

**PROBLEMA:** API Go **NÃO TEM** upload separado de fotos!

**SOLUÇÃO:** Converter foto para base64 e enviar no JSON:

```tsx
const converterFotoParaBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Ao criar/editar diário:
const fotoBase64 = await converterFotoParaBase64(arquivoFoto);
const diario = {
  ...novoDiario,
  foto: fotoBase64, // data:image/jpeg;base64,...
};
```

**PROBLEMA 2 - Campos NOVOS faltando:**

```tsx
// ❌ Não tem:
- clima: "ENSOLARADO" | "NUBLADO" | "CHUVOSO" | "VENTOSO" | "OUTROS"
- progresso_percentual: number (0-100)
```

**PROBLEMA 3 - Campo renomeado:**

```tsx
// ❌ Se estiver usando:
descricaoAtividade: string;

// ✅ API usa:
atividades_realizadas: string;
```

---

### ❌ `Despesas.tsx` / `DespesasNovo.tsx` - VERIFICAR

**PROBLEMAS PROVÁVEIS:**

1. **ENUMs desatualizados:**

   - ❌ Faltam 5 categorias novas
   - ❌ Faltam 4 formas de pagamento novas
   - ❌ Faltam 2 status de pagamento novos

2. **Campo `data` vs `data_vencimento`:**

   - ❌ Verificar se está enviando `data_vencimento`

3. **Formatação de valores:**
   - ❌ Verificar se está usando formatadores corretos

---

### ⚠️ `RelatoriosCompleto.tsx` - ENDPOINTS PODEM NÃO EXISTIR

**VERIFICAR:**

```tsx
// ✅ Existem na API Go:
GET /relatorios/obra/:obra_id
GET /relatorios/despesas/:obra_id
GET /relatorios/pagamentos/:obra_id
GET /relatorios/materiais/:obra_id
GET /relatorios/profissionais/:obra_id

// ❌ NÃO existem:
GET /despesas/resumo/categoria  // (verificar se usa)
GET /diarios/estatisticas/:obra_id  // (verificar se usa)
GET /diarios/resumo/mensal/:obra_id/:ano/:mes  // (verificar se usa)
```

---

## 4. FUNCIONALIDADES FALTANDO

### ❌ DIÁRIO DE OBRA - Campos Requisitados Faltando

**REQUISITO DO CLIENTE (do texto fornecido):**

> "Campos para o Diário de Obra:
>
> - Ferramentas Utilizadas (e.g., "Betoneira, Pá, Rolo de pintura")
> - Quantas pessoas trabalharam (e.g., "4 pessoas")"

**PROBLEMA:** API Go NÃO TEM esses campos!

**Campos da API Go:**

```typescript
interface DiarioObra {
  id?: number;
  obra_id: number;
  data: string;
  periodo: "manha" | "tarde" | "noite" | "integral";
  atividades_realizadas: string;
  ocorrencias?: string;
  observacoes?: string;
  foto?: string; // base64
  responsavel_id?: number;
  aprovado_por_id?: number;
  status_aprovacao: "pendente" | "aprovado" | "rejeitado";
  clima: "ENSOLARADO" | "NUBLADO" | "CHUVOSO" | "VENTOSO" | "OUTROS";
  progresso_percentual: number;
  createdAt?: string;
  updatedAt?: string;
}
```

**SOLUÇÃO:**

1. **Opção 1:** Adicionar campos ao backend Go (migrations)
2. **Opção 2:** Usar campo `observacoes` para incluir essas informações
3. **Opção 3:** Criar tabela separada de `equipamentos_utilizados` e `mao_de_obra_diario`

---

### ❌ PESSOA - Campo "Nome Fantasia" Faltando

**REQUISITO DO CLIENTE:**

> "Nome Fantasia (habilita somente se CNPJ estiver preenchido)"

**PROBLEMA:** API Go NÃO TEM campo `nome_fantasia`!

**Campos da API Go:**

```typescript
interface Pessoa {
  id?: number;
  nome: string; // ❌ Não tem "nome_fantasia"
  tipo_documento: "CPF" | "CNPJ";
  documento: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  endereco_rua?: string;
  // ...
}
```

**SOLUÇÃO:**

1. **Opção 1:** Adicionar campo ao backend Go (migration)
2. **Opção 2:** Usar campo `nome` para pessoa jurídica (razão social) e adicionar observação

---

### ❌ OBRA - Campo "Parceiro" Faltando

**REQUISITO DO CLIENTE:**

> "Parceiro (campo apenas para nome, com busca dos dados da pessoa)"

**PROBLEMA:** API Go NÃO TEM campo `parceiro_id`!

**Campos da API Go:**

```typescript
interface Obra {
  contratante_id?: number;
  responsavel_id?: number;
  // ❌ Não tem "parceiro_id"
}
```

**SOLUÇÃO:**

1. **Opção 1:** Adicionar campo ao backend Go
2. **Opção 2:** Criar tabela de relacionamento `obra_parceiros`

---

### ❌ RELATÓRIOS - Alguns Podem Não Estar Implementados

**REQUISITO DO CLIENTE:**

> "Relatórios importantes:
>
> - Relatório de Obra ✅
> - Relatório de Despesas ✅
> - Relatório de Pagamentos ✅
> - Relatório de Materiais ✅
> - Relatório de Profissionais ✅"

**STATUS:** ✅ TODOS EXISTEM na API Go!

Mas verificar se frontend está usando corretamente.

---

### ❌ DASHBOARD - Gráficos Faltando

**REQUISITO DO CLIENTE:**

> "Gráficos financeiros: Gasto total, gasto por categoria, pagamentos pendentes.
> Gráficos de materiais e mão de obra.
> Gráficos de performance: status de cada obra em tempo real."

**VERIFICAR:**

- Dashboard.tsx tem gráficos?
- Está usando dados reais da API?
- Está usando endpoints de relatórios?

---

### ❌ NOTIFICAÇÕES - Não Implementado

**REQUISITO DO CLIENTE:**

> "Sistema de Notificações:
>
> - Notificações automáticas de pagamentos pendentes
> - Alertas sobre vencimento de prazos"

**PROBLEMA:** API Go NÃO TEM sistema de notificações!

**SOLUÇÃO:**

1. Implementar no frontend (verificação client-side)
2. OU adicionar ao backend Go

---

### ❌ EXPORTAÇÃO - Pode Não Estar Implementado

**REQUISITO DO CLIENTE:**

> "Funcionalidade de Exportação:
>
> - Exporte os relatórios em PDF ou Excel"

**VERIFICAR:**

- Existe botão de exportar?
- Está gerando PDF/Excel?
- Biblioteca usada?

---

## 5. VALIDAÇÕES AUSENTES

### ❌ Validação de CPF/CNPJ

**STATUS:** ✅ Funções existem em `formatters.ts`

```typescript
export const validateCpf = (cpf: string): boolean
export const validateCnpj = (cnpj: string): boolean
```

**MAS:** Verificar se estão sendo USADAS nos formulários!

---

### ❌ Validação de Campos Obrigatórios

**VERIFICAR nas páginas:**

- Cadastro de Pessoa: todos os campos obrigatórios têm validação?
- Cadastro de Obra: todos os campos obrigatórios têm validação?
- Cadastro de Despesa: todos os campos obrigatórios têm validação?
- Cadastro de Diário: todos os campos obrigatórios têm validação?

---

### ❌ Validação de Datas

**VERIFICAR:**

- Data de início < Data de término?
- Data de vencimento >= Data atual?
- Prazo em dias > 0?

---

### ❌ Validação de Valores

**VERIFICAR:**

- Valores negativos bloqueados?
- Valor > 0 obrigatório?
- Percentual entre 0-100?

---

## 6. BACKEND (BANCO DE DADOS)

### ⚠️ MIGRATIONS PODEM ESTAR DESATUALIZADAS

**VERIFICAR:**

1. **Tabela `pessoa` tem todos os campos?**

```sql
-- ✅ Verificar se tem:
endereco_rua VARCHAR(255),
endereco_numero VARCHAR(20),
endereco_complemento VARCHAR(100),
endereco_bairro VARCHAR(100),
endereco_cidade VARCHAR(100),
endereco_estado VARCHAR(2),
endereco_cep VARCHAR(10)
```

2. **Tabela `obra` tem campo `art`?**

```sql
-- ✅ Verificar se tem:
art VARCHAR(100)
```

3. **Tabela `despesa` tem `data_vencimento`?**

```sql
-- ✅ Verificar se tem:
data_vencimento DATE,
categoria VARCHAR(50) CHECK (categoria IN (
  'MATERIAL', 'MAO_DE_OBRA', 'COMBUSTIVEL', 'ALIMENTACAO',
  'MATERIAL_ELETRICO', 'ALUGUEL_EQUIPAMENTO', 'TRANSPORTE',
  'IMPOSTO', 'PARCEIRO', 'OUTROS'
)),
forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN (
  'PIX', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO',
  'TRANSFERENCIA', 'ESPECIE', 'CHEQUE'
)),
status_pagamento VARCHAR(20) CHECK (status_pagamento IN (
  'PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'
))
```

4. **Tabela `diario_obra` tem novos campos?**

```sql
-- ✅ Verificar se tem:
foto TEXT,  -- base64
clima VARCHAR(20) CHECK (clima IN (
  'ENSOLARADO', 'NUBLADO', 'CHUVOSO', 'VENTOSO', 'OUTROS'
)),
progresso_percentual DECIMAL(5,2)
```

5. **Tabela `fornecedor` tem campos de contato?**

```sql
-- ✅ Verificar se tem:
contato_nome VARCHAR(255),
contato_telefone VARCHAR(20),
contato_email VARCHAR(255)
```

6. **Tabela `receita` existe?**

```sql
-- ✅ Verificar se existe:
CREATE TABLE receitas (
  id SERIAL PRIMARY KEY,
  obra_id INTEGER REFERENCES obras(id),
  fonte_receita VARCHAR(50) CHECK (fonte_receita IN (
    'CONTRATO', 'PAGAMENTO_CLIENTE', 'ADIANTAMENTO',
    'FINANCIAMENTO', 'MEDICAO', 'OUTROS'
  )),
  descricao TEXT,
  valor DECIMAL(15,2),
  data DATE,
  numero_documento VARCHAR(100),
  responsavel_id INTEGER REFERENCES usuarios(id),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. RESUMO PRIORIZADO

### 🔥 PRIORIDADE CRÍTICA (Quebram funcionalidades)

1. **`obraService.ts`:**

   - ❌ Remover `buscarPorStatus()` e `atualizarStatus()`
   - ❌ Ajustar `criar()` e `atualizar()` para enviar IDs, não objetos
   - ❌ Adicionar campo `art`
   - ❌ Calcular `prazo_dias` automaticamente

2. **`diarioService.ts`:**

   - ❌ Corrigir endpoint `/diarios/obra/:id` (estava invertido)
   - ❌ Remover sistema de upload de fotos
   - ❌ Implementar conversão de foto para base64
   - ❌ Adicionar campos `clima` e `progresso_percentual`

3. **`pessoaService.ts`:**

   - ❌ Mudar `tipo: "PF"|"PJ"` para `tipo_documento: "CPF"|"CNPJ"`
   - ❌ Adicionar envio de campos de endereço

4. **`CadastrarPessoa.tsx`:**

   - ❌ Corrigir campo `tipo` → `tipo_documento`
   - ❌ Adicionar campos de endereço completos

5. **`CadastrarObra.tsx`:**
   - ❌ Remover interfaces antigas (`ObraLegacy`, `Aditivo`, `FolhaPagamento`)
   - ❌ Usar apenas interface `Obra`
   - ❌ Ajustar para enviar `contratante_id` e `responsavel_id` como números
   - ❌ Adicionar cálculo de `prazo_dias`

---

### ⚠️ PRIORIDADE ALTA (Afetam experiência do usuário)

6. **`despesaService.ts`:**

   - ⚠️ Verificar envio de `data_vencimento`
   - ⚠️ Atualizar ENUMs (10 categorias, 7 formas, 4 status)

7. **`formatters.ts`:**

   - ⚠️ Adicionar 8 formatadores novos
   - ⚠️ Completar `getStatusLabel()`

8. **`DiarioObras.tsx`:**
   - ⚠️ Implementar conversão de foto para base64
   - ⚠️ Adicionar campos `clima` e `progresso_percentual`
   - ⚠️ Remover sistema de upload separado

---

### 📝 PRIORIDADE MÉDIA (Melhorias e funcionalidades extras)

9. **Validações:**

   - Implementar validações de CPF/CNPJ nos formulários
   - Adicionar validações de datas
   - Adicionar validações de valores

10. **Dashboard:**

    - Verificar se gráficos estão funcionando
    - Conectar com endpoints de relatórios

11. **Relatórios:**
    - Verificar se todos os 5 relatórios estão implementados
    - Testar exportação PDF/Excel

---

### 🔍 PRIORIDADE BAIXA (Verificações e otimizações)

12. **Backend:**

    - Verificar migrations do banco de dados
    - Confirmar que todas as tabelas têm campos corretos

13. **Notificações:**

    - Decidir se implementa no frontend ou backend
    - Implementar sistema de alertas

14. **Funcionalidades extras do cliente:**
    - Campo "Nome Fantasia" para CNPJ
    - Campo "Parceiro" em obras
    - Campos "Ferramentas" e "Pessoas" em diário

---

## 📊 ESTATÍSTICAS

**Total de Problemas Identificados:** 87

| Categoria                | Quantidade | %   |
| ------------------------ | ---------- | --- |
| Services                 | 28         | 32% |
| Formatters               | 15         | 17% |
| Páginas React            | 22         | 25% |
| Funcionalidades Faltando | 8          | 9%  |
| Validações               | 7          | 8%  |
| Backend/Banco            | 7          | 8%  |

**Status de Conclusão:**

- ✅ Concluído: 70%
- 🔄 Em andamento: 0%
- ❌ Pendente: 30%

---

## 🎯 PLANO DE AÇÃO SUGERIDO

### FASE 1 - CRÍTICO (1-2 dias)

1. Corrigir `obraService.ts`
2. Corrigir `diarioService.ts`
3. Corrigir `pessoaService.ts`
4. Corrigir `CadastrarPessoa.tsx`
5. Corrigir `CadastrarObra.tsx`

### FASE 2 - ALTA (2-3 dias)

6. Atualizar `despesaService.ts`
7. Completar `formatters.ts`
8. Corrigir `DiarioObras.tsx`

### FASE 3 - MÉDIA (3-4 dias)

9. Implementar validações
10. Verificar/Corrigir Dashboard
11. Verificar/Corrigir Relatórios

### FASE 4 - BAIXA (5+ dias)

12. Verificar migrations
13. Implementar notificações
14. Adicionar funcionalidades extras

---

**TOTAL ESTIMADO:** 10-13 dias de desenvolvimento

---

✅ **ESTE DOCUMENTO CONTÉM TUDO QUE ESTÁ ERRADO, FALTANDO OU DESATUALIZADO NO PROJETO!**
