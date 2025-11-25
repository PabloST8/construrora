// ✅ Tipos para Receita - Match 100% com model Go Receita

export interface Receita {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string; // ✅ PRIORIDADE: Nome da obra (JOIN) - API Go retorna snake_case
  obraNome?: string; // Compatibilidade com camelCase
  descricao: string;
  valor: number;
  data: string; // Data de recebimento (OBRIGATÓRIO no Model Go)
  status?: string; // Status da receita (RECEBIDO, PENDENTE, etc)
  fonte_receita?:
    | "CONTRATO"
    | "PAGAMENTO_CLIENTE"
    | "ADIANTAMENTO"
    | "FINANCIAMENTO"
    | "MEDICAO"
    | "OUTROS";
  fonteReceita?: string; // Compatibilidade
  numero_documento?: string; // Número do contrato, nota fiscal, etc
  numeroDocumento?: string; // Compatibilidade
  responsavel_id?: number;
  responsavelId?: number; // Compatibilidade
  responsavel_nome?: string; // ✅ PRIORIDADE: Nome do responsável (JOIN) - API Go retorna snake_case
  responsavelNome?: string; // Compatibilidade com camelCase
  observacao?: string;
  observacoes?: string; // Compatibilidade
  data_pagamento_programado?: string; // Data programada de recebimento (novo campo)
  dataPagamentoProgramado?: string; // Compatibilidade
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
  // ❌ REMOVIDO: data_recebimento (redundante com 'data')
  // O Model Go tem apenas 'data' para data de recebimento
}

// ✅ Receita com relacionamentos (JOIN)
export interface ReceitaComRelacionamentos extends Receita {
  obraNome: string;
  responsavelNome?: string;
}

// ✅ Relatório de receitas agrupadas
export interface RelatorioReceitas {
  obra_id?: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string;
  obraNome?: string; // Compatibilidade
  fonte_receita?: string;
  fonteReceita?: string; // Compatibilidade
  total_receitas: number;
  totalReceitas?: number; // Compatibilidade
  quantidade_itens: number;
  quantidadeItens?: number; // Compatibilidade
}
