# 🧪 GUIA DE TESTE - Upload de Fotos em Tarefas

## ✅ Pré-requisitos

1. **Backend rodando** na porta 9090
2. **Frontend rodando** na porta 3000
3. **Usuário logado** (admin@sistema.com / Admin@123)
4. **Pelo menos 1 obra cadastrada**

---

## 🔬 TESTE 1: Criar Tarefa com Foto

### Passos:

1. **Navegar** para "Tarefas Realizadas"

   ```
   http://localhost:3000/tarefas-realizadas
   ```

2. **Clicar** no botão **"Nova Tarefa"** (verde, ícone +)

3. **Preencher** os campos obrigatórios:

   - **Obra**: Selecionar da lista
   - **Data**: Escolher data no calendário
   - **Descrição**: "Teste de upload de foto"

4. **Preencher** campos opcionais:

   - **Período**: "Manhã" / "Tarde" / "Integral"
   - **Responsável**: Selecionar pessoa da lista (se houver)
   - **Status**: "Em Andamento"
   - **% Conclusão**: 50
   - **Observação**: "Teste funcional"

5. **Upload de Foto**:

   - Clicar em **"Escolher Arquivo"**
   - Selecionar uma imagem (JPG/PNG, max 5MB)
   - Verificar se o **preview aparece** (Avatar circular)

6. **Clicar** em **"Salvar"**

### ✅ Resultado Esperado:

- Toast verde: **"Tarefa criada com sucesso!"**
- Modal fecha automaticamente
- Lista de tarefas atualiza com nova tarefa

### 🔍 Verificação no Console:

```javascript
📤 Criando tarefa: {
  obra_id: 1,
  data: "2025-01-15",
  periodo: "manha",
  descricao: "Teste de upload de foto",
  responsavel_id: 2,
  status: "em_andamento",
  percentual_conclusao: 50,
  observacao: "Teste funcional",
  fotos: [
    {
      id: 0,
      entidade_tipo: "atividade",
      entidade_id: 0,
      foto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      descricao: "Foto da atividade",
      ordem: 0,
      categoria: "ATIVIDADE"
    }
  ]
}

✅ Tarefa criada: {
  data: {
    id: 15,
    obra_id: 1,
    data: "2025-01-15",
    periodo: "manha",
    descricao: "Teste de upload de foto",
    fotos: [
      {
        id: 42,
        entidade_tipo: "atividade",
        entidade_id: 15,
        foto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        created_at: "2025-01-15T10:30:00Z"
      }
    ]
  },
  message: "Atividade criada com sucesso"
}
```

### ❌ Possíveis Erros:

**Erro 1**: "Preencha obra e descrição"

- **Causa**: Campos obrigatórios vazios
- **Solução**: Preencher obra_id e descrição

**Erro 2**: "Erro ao salvar tarefa"

- **Causa**: API não respondeu ou foto muito grande
- **Solução**: Verificar console do backend + tamanho da imagem

**Erro 3**: "401 Unauthorized"

- **Causa**: Token JWT expirado
- **Solução**: Fazer logout e login novamente

---

## 🔬 TESTE 2: Editar Tarefa e Adicionar Foto

### Passos:

1. **Localizar** uma tarefa sem foto na lista

2. **Clicar** no botão **✏️ (laranja)** na linha da tarefa

3. **Verificar** se o modal abre com dados pré-preenchidos

4. **Upload de Foto**:

   - Clicar em **"Escolher Arquivo"**
   - Selecionar uma imagem
   - Verificar preview

5. **Clicar** em **"Salvar"**

### ✅ Resultado Esperado:

- Toast verde: **"Tarefa atualizada com sucesso!"**
- Modal fecha
- Lista atualiza

### 🔍 Verificação no Console:

```javascript
📤 Atualizando tarefa 15: {
  obra_id: 1,
  data: "2025-01-15",
  periodo: "manha",
  descricao: "Teste de upload de foto",
  fotos: [
    {
      id: 0,
      entidade_tipo: "atividade",
      entidade_id: 15,
      foto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      descricao: "Foto da atividade",
      ordem: 0,
      categoria: "ATIVIDADE"
    }
  ]
}

✅ Tarefa atualizada: { data: {...}, message: "Atividade atualizada com sucesso" }
```

---

## 🔬 TESTE 3: Editar Tarefa que JÁ TEM Foto

### Passos:

1. **Clicar** em **✏️** em uma tarefa que já tem foto

2. **Verificar** se a foto existente aparece no preview

3. **Opção A**: Trocar a foto

   - Selecionar nova imagem
   - Preview atualiza
   - Salvar

4. **Opção B**: Remover a foto
   - Clicar no **X** vermelho no preview
   - Foto some
   - Salvar

### ✅ Resultado Esperado:

- **Opção A**: Foto antiga substituída pela nova
- **Opção B**: Tarefa fica sem foto (fotos = [])

---

## 🔬 TESTE 4: Visualizar Tarefa com Foto

### Passos:

1. **Clicar** no botão **👁️ (azul)** em uma tarefa com foto

2. **Verificar** modal de visualização

### ⏳ Status Atual:

**PENDENTE** - Modal de visualização ainda **não exibe fotos**

**Próxima Implementação**:

```tsx
{
  tarefaSelecionada?.fotos && tarefaSelecionada.fotos.length > 0 && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
        📸 Fotos:
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        {tarefaSelecionada.fotos.map((foto, index) => (
          <Card key={foto.id || index} sx={{ width: 200 }}>
            <CardMedia
              component="img"
              height="150"
              image={foto.foto}
              alt={`Foto ${index + 1}`}
            />
          </Card>
        ))}
      </Box>
    </Box>
  );
}
```

---

## 🔬 TESTE 5: Validação de Tamanho de Arquivo

### Passos:

1. **Tentar** fazer upload de uma imagem **> 5MB**

### ✅ Resultado Esperado:

- Toast vermelho: **"Arquivo muito grande. Máximo 5MB."**
- Upload cancelado
- Preview não aparece

---

## 🔬 TESTE 6: Validação de Tipo de Arquivo

### Passos:

1. **Tentar** fazer upload de um arquivo **.pdf** ou **.txt**

### ✅ Resultado Esperado:

- Toast vermelho: **"Apenas imagens são permitidas (JPG, PNG, GIF)"**
- Upload cancelado

---

## 🔬 TESTE 7: Criar Tarefa SEM Foto

### Passos:

1. **Criar nova tarefa** preenchendo apenas campos obrigatórios
2. **NÃO fazer upload** de foto
3. **Salvar**

### ✅ Resultado Esperado:

- Tarefa criada normalmente
- Campo `fotos` **não é enviado** para API (ou enviado como `undefined`)
- Console não mostra campo `fotos` no payload

### 🔍 Verificação no Console:

```javascript
📤 Criando tarefa: {
  obra_id: 1,
  data: "2025-01-15",
  periodo: "manha",
  descricao: "Tarefa sem foto",
  status: "planejada"
  // ✅ Campo 'fotos' NÃO aparece aqui
}
```

---

## 🐛 DEBUGGING - Checklist

Se o upload **não funcionar**, verificar:

### Frontend (Console do Navegador - F12)

- [ ] Foto foi convertida para Base64? (console mostra `data:image/jpeg;base64,...`)
- [ ] Estado `fotoBase64` foi atualizado? (React DevTools)
- [ ] Função `handleSalvar` está sendo chamada?
- [ ] Payload da requisição inclui campo `fotos`? (Network → Payload)
- [ ] Algum erro 400/500 na API? (Network → Response)

### Backend (Logs do Go)

- [ ] Requisição POST `/tarefas` chegou?
- [ ] Campo `fotos` está no body da requisição?
- [ ] Erro de validação no backend?
- [ ] Foto foi salva no banco de dados?
- [ ] Tamanho do Base64 está causando timeout?

### Banco de Dados (PostgreSQL)

```sql
-- Verificar se foto foi salva
SELECT id, entidade_tipo, entidade_id,
       LEFT(foto, 50) AS foto_preview,
       LENGTH(foto) AS foto_size
FROM fotos
WHERE entidade_tipo = 'atividade'
ORDER BY created_at DESC
LIMIT 5;
```

**Resultado esperado**: Linha com `entidade_tipo = 'atividade'` e `foto_size > 1000`

---

## 📊 Critérios de Sucesso

| Teste                               | Status  | Observações            |
| ----------------------------------- | ------- | ---------------------- |
| 1. Criar tarefa com foto            | ✅ / ❌ |                        |
| 2. Editar tarefa e adicionar foto   | ✅ / ❌ |                        |
| 3. Editar tarefa com foto existente | ✅ / ❌ |                        |
| 4. Visualizar tarefa com foto       | ⏳      | Pendente implementação |
| 5. Validação de tamanho             | ✅ / ❌ | Max 5MB                |
| 6. Validação de tipo                | ✅ / ❌ | Somente imagens        |
| 7. Criar tarefa sem foto            | ✅ / ❌ | Campo opcional         |

---

## 🎯 Conclusão

**Upload de fotos em Tarefas** está **funcionando** se:

1. ✅ Foto é enviada no payload da requisição
2. ✅ API retorna `fotos: [{ id, foto, ... }]` na resposta
3. ✅ Console mostra "Tarefa criada com sucesso"
4. ✅ Banco de dados tem registro na tabela `fotos`

**Próximos passos**:

1. Implementar visualização de fotos no modal 👁️
2. Adicionar galeria de fotos na tabela principal
3. Permitir múltiplas fotos por tarefa

---

**Última atualização**: 15/01/2025  
**Autor**: GitHub Copilot
