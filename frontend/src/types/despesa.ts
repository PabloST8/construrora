export interface Despesa {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obraNome?: string; // Para exibição
  fornecedor_id: number;
  fornecedorId?: number; // Compatibilidade
  fornecedorNome?: string; // Para exibição
  descricao: string;
  categoria:
    | "MATERIAL"
    | "MAO_DE_OBRA"
    | "IMPOSTO"
    | "PARCEIRO"
    | "OUTROS"
    | "Material"
    | "Mão de Obra"
    | "Imposto"
    | "Parceiro"
    | "Outros";
  valor: number;
  data?: string; // Data da despesa
  data_vencimento: string; // Data de vencimento
  dataVencimento?: string; // Compatibilidade
  dataCadastro?: string;
  forma_pagamento:
    | "A_VISTA"
    | "PIX"
    | "BOLETO"
    | "CARTAO"
    | "À Vista"
    | "PIX"
    | "Boleto"
    | "Cartão";
  formaPagamento?: string; // Compatibilidade
  status_pagamento: "PENDENTE" | "PAGO" | "Pendente" | "Pago";
  statusPagamento?: string; // Compatibilidade
  data_pagamento?: string;
  dataPagamento?: string; // Compatibilidade
  responsavel_pagamento?: string;
  responsavelPagamentoId?: number;
  responsavelPagamentoNome?: string; // Para exibição
  observacao?: string;
  observacoes?: string; // Compatibilidade
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}

export interface DiarioObra {
  id?: number;
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obraNome?: string; // Para exibição
  data: string;
  periodo?: "Manhã" | "Tarde" | "Integral" | "manhã" | "tarde" | "integral";
  descricao?: string; // O que foi feito
  atividades_realizadas?: string;
  atividadesRealizadas?: string; // Compatibilidade
  ferramentasUtilizadas?: string;
  quantidadePessoas?: number;
  responsavel_id?: number;
  responsavelExecucaoId?: number; // Compatibilidade
  responsavelExecucaoNome?: string; // Para exibição
  ocorrencias?: string; // Problemas, atrasos
  observacoes?: string;
  aprovado_por_id?: number;
  aprovadoPorId?: number; // Compatibilidade
  status_aprovacao?: "pendente" | "aprovado" | "rejeitado";
  statusAprovacao?:
    | "Pendente"
    | "Aprovado"
    | "Rejeitado"
    | "pendente"
    | "aprovado"
    | "rejeitado"; // Compatibilidade
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}
