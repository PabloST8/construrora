export interface Despesa {
  id?: number;
  obraId: number;
  obraNome?: string; // Para exibição
  descricao: string;
  categoria: "Material" | "Mão de Obra" | "Imposto" | "Parceiro" | "Outros";
  valor: number;
  dataCadastro?: string;
  formaPagamento: "À Vista" | "PIX" | "Boleto" | "Cartão";
  statusPagamento: "Pendente" | "Pago";
  dataPagamento?: string;
  responsavelPagamentoId?: number;
  responsavelPagamentoNome?: string; // Para exibição
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
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
