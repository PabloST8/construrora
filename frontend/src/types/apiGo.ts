// Interface para Usuários da API Go
export interface Usuario {
  id?: number;
  email: string;
  nome: string;
  senha?: string; // Só para criação
  tipo_documento: "CPF" | "CNPJ";
  documento: string;
  telefone?: string;
  perfil_acesso: "admin" | "gestor" | "usuario";
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Fornecedores da API Go
export interface Fornecedor {
  id?: number;
  nome: string;
  tipo_documento: "CPF" | "CNPJ";
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface para Diário de Obra da API Go
export interface DiarioObra {
  id?: number;
  obra_id: number;
  data: string;
  periodo: "manhã" | "tarde" | "integral";
  atividades_realizadas: string;
  ocorrencias?: string;
  observacoes?: string;
  responsavel_id?: number;
  aprovado_por_id?: number;
  status_aprovacao: "pendente" | "aprovado" | "rejeitado";
  fotos?: Array<{
    id?: number;
    nome: string;
    url: string;
    descricao?: string;
    data_upload?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Despesas da API Go
export interface Despesa {
  id?: number;
  obra_id: number;
  fornecedor_id?: number;
  descricao: string;
  categoria:
    | "MATERIAL"
    | "MAO_DE_OBRA"
    | "TRANSPORTE"
    | "EQUIPAMENTO"
    | "ALIMENTACAO"
    | "OUTROS";
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento:
    | "PIX"
    | "BOLETO"
    | "CARTAO_CREDITO"
    | "CARTAO_DEBITO"
    | "TRANSFERENCIA"
    | "DINHEIRO"
    | "CHEQUE";
  status_pagamento: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para Relatório de Despesas
export interface RelatorioDesepesas {
  obra_id: number;
  totais_por_categoria: Record<string, number>;
  total_geral: number;
  despesas: Array<{
    id: number;
    descricao: string;
    categoria: string;
    valor: number;
    fornecedor: string;
    status_pagamento: string;
    data_vencimento?: string;
    data_pagamento?: string;
  }>;
}
