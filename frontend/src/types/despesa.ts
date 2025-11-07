// ✅ Ajustado 100% para match com model Go Despesa
export interface Despesa {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obraNome?: string; // Para exibição (JOIN)
  fornecedor_id?: number;
  fornecedorId?: number; // Compatibilidade
  fornecedorNome?: string; // Para exibição (JOIN)
  data?: string; // Data da despesa/compra
  data_vencimento?: string; // Data de vencimento do pagamento
  dataVencimento?: string; // Compatibilidade
  dataCadastro?: string; // Compatibilidade (igual a data)
  descricao: string;
  categoria?:
    | "MATERIAL"
    | "MAO_DE_OBRA"
    | "COMBUSTIVEL"
    | "ALIMENTACAO"
    | "MATERIAL_ELETRICO"
    | "ALUGUEL_EQUIPAMENTO"
    | "TRANSPORTE"
    | "IMPOSTO"
    | "PARCEIRO"
    | "OUTROS";
  valor: number;
  forma_pagamento?:
    | "PIX"
    | "BOLETO"
    | "CARTAO_CREDITO"
    | "CARTAO_DEBITO"
    | "TRANSFERENCIA"
    | "ESPECIE"
    | "CHEQUE"; // ✅ 7 opções (Model Go)
  formaPagamento?: string; // Compatibilidade
  status_pagamento?: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO"; // ✅ 4 opções (Model Go)
  statusPagamento?: string; // Compatibilidade
  data_pagamento?: string;
  dataPagamento?: string; // Compatibilidade
  responsavel_pagamento?: string;
  responsavelPagamento?: string; // Compatibilidade
  responsavelPagamentoId?: number;
  responsavelPagamentoNome?: string;
  observacao?: string;
  observacoes?: string; // Compatibilidade
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}

// ✅ Ajustado 100% para match com model Go DiarioObra
export interface DiarioObra {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obraNome?: string; // Para exibição (JOIN)
  data: string; // "2024-10-08"
  periodo?: "manha" | "tarde" | "noite" | "integral";
  atividades_realizadas: string;
  atividadesRealizadas?: string; // Compatibilidade
  descricao?: string; // Compatibilidade (igual a atividades_realizadas)
  ocorrencias?: string; // Problemas, atrasos
  observacoes?: string;
  foto?: string; // Base64 encoded image
  responsavel_id?: number;
  responsavelId?: number; // Compatibilidade
  responsavelExecucaoId?: number; // Compatibilidade
  responsavelNome?: string; // Para exibição (JOIN)
  responsavelExecucaoNome?: string; // Compatibilidade
  aprovado_por_id?: number;
  aprovadoPorId?: number; // Compatibilidade
  status_aprovacao?: "pendente" | "aprovado" | "rejeitado";
  statusAprovacao?: string; // Compatibilidade
  clima?: "ENSOLARADO" | "NUBLADO" | "CHUVOSO" | "VENTOSO" | "OUTROS";
  progresso_percentual?: number;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade

  // ✅ Campos removidos (não existem na API Go)
  // ferramentasUtilizadas?: string;
  // quantidadePessoas?: number;
}
