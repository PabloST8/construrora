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

// ✅ Interface para Diário de Obra 100% match com Model Go
export interface DiarioObra {
  id?: number;
  obra_id: number;
  data: string;
  periodo?: "manha" | "tarde" | "noite" | "integral"; // ✅ Match Model Go (sem acento)
  atividades_realizadas: string;
  ocorrencias?: string;
  observacoes?: string;
  foto?: string; // ✅ Base64 encoded image (Model Go)
  clima?: "ENSOLARADO" | "NUBLADO" | "CHUVOSO" | "VENTOSO" | "OUTROS"; // ✅ NOVO
  progresso_percentual?: number; // ✅ NOVO
  responsavel_id?: number;
  aprovado_por_id?: number;
  status_aprovacao?: "pendente" | "aprovado" | "rejeitado";
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface para Despesas 100% match com Model Go
export interface Despesa {
  id?: number;
  obra_id: number;
  fornecedor_id?: number;
  data?: string; // ✅ Data da despesa/compra (opcional)
  data_vencimento?: string; // ✅ Data de vencimento (PRINCIPAL)
  descricao: string;
  categoria?:
    | "MATERIAL"
    | "MAO_DE_OBRA"
    | "COMBUSTIVEL" // ✅ NOVO
    | "ALIMENTACAO"
    | "MATERIAL_ELETRICO" // ✅ NOVO
    | "ALUGUEL_EQUIPAMENTO" // ✅ NOVO
    | "TRANSPORTE"
    | "IMPOSTO" // ✅ NOVO
    | "PARCEIRO" // ✅ NOVO
    | "OUTROS";
  valor: number;
  forma_pagamento?:
    | "PIX"
    | "BOLETO"
    | "CARTAO_CREDITO"
    | "CARTAO_DEBITO"
    | "TRANSFERENCIA"
    | "ESPECIE" // ✅ Match Model Go (não "DINHEIRO")
    | "CHEQUE";
  status_pagamento?: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
  data_pagamento?: string;
  responsavel_pagamento?: string; // ✅ Match Model Go
  observacao?: string; // ✅ Match Model Go (não "observacoes")
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
