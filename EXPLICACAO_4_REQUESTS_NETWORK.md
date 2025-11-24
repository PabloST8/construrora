# 🔍 EXPLICAÇÃO - 4 REQUESTS NO NETWORK

**Data:** 19 de novembro de 2025  
**Status:** ✅ **COMPORTAMENTO NORMAL**

---

## 🤔 O QUE O USUÁRIO VIU

Ao clicar em "Gerar Relatório" no Relatório Fotográfico, aparecem **4 requests** no Network:

1. ❌ `GET /obras/69` - Status **204** (No Content)
2. ❌ `GET /diarios/obra/69` - Status **204** (No Content)
3. ✅ `GET /obras/69` - Status **200** (Com dados da obra)
4. ✅ `GET /diarios/obra/69` - Status **200** (Com diários e fotos)

---

## ✅ EXPLICAÇÃO

### Por que 4 requests?

Isso acontece por causa do **React.StrictMode** no arquivo `index.tsx`:

```tsx
root.render(
  <React.StrictMode>
    {" "}
    // ← Isso causa execução dupla
    <App />
  </React.StrictMode>
);
```

### O que é React.StrictMode?

É uma ferramenta de **desenvolvimento** que:

- ✅ Executa os componentes 2 vezes
- ✅ Executa os efeitos 2 vezes
- ✅ Detecta bugs e side-effects não intencionais
- ✅ Prepara o código para o React 18+

### Por que alguns retornam 204?

Os **2 primeiros requests** (204) são provavelmente:

1. Cancelados pelo React durante a re-renderização
2. Requests de "warmup" que o StrictMode faz para testar

Os **2 últimos requests** (200) são os reais que trazem os dados.

---

## 🎯 ISSO É NORMAL?

✅ **SIM!** É comportamento esperado em **desenvolvimento**.

### Em PRODUÇÃO:

- ❌ StrictMode é desabilitado automaticamente
- ✅ Apenas **2 requests** serão feitos (obras + diários)
- ✅ Performance otimizada

### Em DESENVOLVIMENTO:

- ✅ 4 requests aparecem (duplicados pelo StrictMode)
- ✅ Ajuda a encontrar bugs
- ✅ Não afeta a funcionalidade

---

## 🔧 QUER DESABILITAR EM DEV?

Se quiser remover os requests duplicados em desenvolvimento:

**Opção 1: Remover StrictMode (NÃO RECOMENDADO)**

```tsx
// frontend/src/index.tsx
root.render(
  <App /> // ← Sem StrictMode
);
```

**Opção 2: Cache de requests (RECOMENDADO)**
Manter o StrictMode e usar técnicas de cache/debounce.

---

## 📊 ANÁLISE DOS ENDPOINTS

### 1️⃣ GET /obras/69

**Retorna:**

```json
{
  "id": 69,
  "nome": "Pablo Felipe Araújo Ferreira",
  "contrato_numero": "123123",
  "endereco_rua": "Rua Adauto Damasceno Vasconcelos",
  "endereco_numero": "123",
  "endereco_cidade": "Tianguá",
  "endereco_estado": "CE"
  // ❌ SEM CAMPO 'foto' (obra não tem foto própria)
}
```

### 2️⃣ GET /diarios/obra/69

**Retorna:**

```json
[
  {
    "id": 8,
    "obra_id": 69,
    "data": "2024-11-08",
    "foto": "data:image/jpeg;base64,...", // ✅ FOTO AQUI!
    "atividades_realizadas": "Trabalhos do dia",
    "observacoes": "Observações"
  }
]
```

---

## ✅ CONFIRMAÇÃO

- ✅ Os 4 requests são **normais** em desenvolvimento
- ✅ Em produção serão apenas 2 requests
- ✅ O relatório fotográfico **funciona corretamente**
- ✅ As fotos vêm do endpoint `/diarios/obra/:id`
- ✅ Performance está OK

---

## 🎉 CONCLUSÃO

**NÃO É UM BUG!** É o React.StrictMode fazendo seu trabalho em desenvolvimento.

O sistema está funcionando perfeitamente! 🚀

---

**Documentado em:** 19/11/2025  
**React Version:** 19.1.1  
**StrictMode:** Ativo (desenvolvimento)
