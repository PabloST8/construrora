// ✅ Tipos para Receita - Match 100% com model Go Receita

export interface Receita {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obraNome?: string; // Para exibição (JOIN)
  descricao: string;
  valor: number;
  data: string; // Data de recebimento
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
  responsavelNome?: string; // Para exibição (JOIN)
  observacao?: string;
  observacoes?: string; // Compatibilidade
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
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
