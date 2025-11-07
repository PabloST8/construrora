// ✅ Tipos para Relatórios - Match 100% com models Go de Relatórios

// ===== Relatório de Obra =====
export interface RelatorioObra {
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string;
  obraNome?: string; // Compatibilidade
  orcamento_previsto?: number;
  orcamentoPrevisto?: number; // Compatibilidade
  gasto_realizado?: number;
  gastoRealizado?: number; // Compatibilidade
  receita_total?: number;
  receitaTotal?: number; // Compatibilidade
  saldo_atual?: number;
  saldoAtual?: number; // Compatibilidade
  pagamento_pendente?: number;
  pagamentoPendente?: number; // Compatibilidade
  status?: string;
  percentual_executado?: number;
  percentualExecutado?: number; // Compatibilidade
  percentual_lucro?: number;
  percentualLucro?: number; // Compatibilidade
  total_despesas?: number;
  totalDespesas?: number; // Compatibilidade
  total_receitas?: number;
  totalReceitas?: number; // Compatibilidade
  status_financeiro?: "LUCRO" | "PREJUIZO" | "EQUILIBRADO";
  statusFinanceiro?: string; // Compatibilidade
}

// ===== Relatório Financeiro por Categoria =====
export interface RelatorioFinanceiroPorCategoria {
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string;
  obraNome?: string; // Compatibilidade
  categoria?: string;
  total_gasto?: number;
  totalGasto?: number; // Compatibilidade
  quantidade_itens?: number;
  quantidadeItens?: number; // Compatibilidade
  percentual_total?: number;
  percentualTotal?: number; // Compatibilidade
}

// ===== Relatório de Pagamentos =====
export interface RelatorioPagamentos {
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string;
  obraNome?: string; // Compatibilidade
  despesa_id?: number;
  despesaId?: number; // Compatibilidade
  descricao?: string;
  valor?: number;
  status_pagamento?: string;
  statusPagamento?: string; // Compatibilidade
  data_vencimento?: string;
  dataVencimento?: string; // Compatibilidade
  data_pagamento?: string;
  dataPagamento?: string; // Compatibilidade
  dias_atraso?: number;
  diasAtraso?: number; // Compatibilidade
  forma_pagamento?: string;
  formaPagamento?: string; // Compatibilidade
  responsavel_pagamento?: string;
  responsavelPagamento?: string; // Compatibilidade
}

// ===== Relatório de Materiais =====
export interface RelatorioMateriais {
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string;
  obraNome?: string; // Compatibilidade
  total_materiais?: number;
  totalMateriais?: number; // Compatibilidade
  quantidade_itens?: number;
  quantidadeItens?: number; // Compatibilidade
  maior_gasto_descricao?: string;
  maiorGastoDescricao?: string; // Compatibilidade
  maior_gasto_valor?: number;
  maiorGastoValor?: number; // Compatibilidade
}

// ===== Relatório de Profissionais (Mão de Obra) =====
export interface RelatorioProfissionais {
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string;
  obraNome?: string; // Compatibilidade
  total_mao_de_obra?: number;
  totalMaoDeObra?: number; // Compatibilidade
  quantidade_pagamentos?: number;
  quantidadePagamentos?: number; // Compatibilidade
  maior_pagamento_descricao?: string;
  maiorPagamentoDescricao?: string; // Compatibilidade
  maior_pagamento_valor?: number;
  maiorPagamentoValor?: number; // Compatibilidade
}
