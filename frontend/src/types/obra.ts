// ✅ Ajustado 100% para match com model Go Obra
export interface Obra {
  id?: number;
  nome: string;
  contrato_numero: string;
  contratoNumero?: string; // Compatibilidade
  contratante_id: number;
  contratanteId?: number; // Compatibilidade
  contratanteNome?: string; // Para exibição (JOIN)
  responsavel_id?: number;
  responsavelId?: number; // Compatibilidade
  responsavelNome?: string; // Para exibição (JOIN)
  data_inicio: string;
  dataInicio?: string; // Compatibilidade
  prazo_dias: number;
  prazoDias?: number; // Compatibilidade
  data_fim_prevista?: string;
  dataFimPrevista?: string; // Compatibilidade
  orcamento?: number;
  status:
    | "planejamento"
    | "em_andamento"
    | "pausada"
    | "concluida"
    | "cancelada";
  art?: string; // ✅ Campo ART da API Go
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  foto?: string; // Base64 da foto da obra
  observacoes?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}

// ✅ Removidas interfaces antigas não usadas na API Go
// (ObraLegacy, ObraFinanceiro, Aditivo, Despesa, FolhaPagamento)
// As despesas agora têm arquivo próprio: despesa.ts
