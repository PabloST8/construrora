// ✅ Ajustado para match com model Go Usuario
export interface Usuario {
  id?: number;
  email: string;
  nome: string;
  senha?: string; // Usado apenas no cadastro
  tipo_documento: "CPF" | "CNPJ";
  tipoDocumento?: "CPF" | "CNPJ"; // Compatibilidade
  documento: string;
  telefone?: string;
  perfil_acesso: "admin" | "gestor" | "usuario";
  perfilAcesso?: string; // Compatibilidade
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Ajustado para match com model Go Pessoa (usada como empresa/contratante)
export interface Empresa {
  id?: number;
  nome: string;
  tipo: "CPF" | "CNPJ"; // ✅ Match EXATO com Model Go (json:"tipo")
  documento: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Ajustado para match com model Go Obra
export interface Obra {
  id?: number;
  nome: string;
  contrato_numero: string;
  contratoNumero?: string; // Compatibilidade
  contratante_id: number;
  contratanteId?: number; // Compatibilidade
  contratanteNome?: string; // Para exibição
  responsavel_id?: number;
  responsavelId?: number; // Compatibilidade
  responsavelNome?: string; // Para exibição
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
  art?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  observacoes?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}

// ✅ Ajustado 100% para match com model Go Despesa
export interface Despesa {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obraNome?: string;
  fornecedor_id?: number;
  fornecedorId?: number; // Compatibilidade
  fornecedorNome?: string;
  data?: string; // ✅ Data da despesa/compra (opcional - Model Go aceita)
  data_vencimento?: string; // ✅ Data de vencimento do pagamento (PRINCIPAL)
  dataVencimento?: string; // Compatibilidade
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
    | "OUTROS"; // ✅ 10 opções (Model Go)
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
  status_pagamento?: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO"; // ✅ 4 opções (Model Go - incluído VENCIDO)
  statusPagamento?: string; // Compatibilidade
  data_pagamento?: string;
  dataPagamento?: string; // Compatibilidade
  responsavel_pagamento?: string;
  responsavelPagamento?: string; // Compatibilidade
  observacao?: string; // ✅ Match Model Go
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
  obraNome?: string;
  data: string;
  periodo?: "manha" | "tarde" | "noite" | "integral";
  atividades_realizadas: string;
  atividadesRealizadas?: string; // Compatibilidade
  ocorrencias?: string;
  observacoes?: string;
  foto?: string; // ✅ Base64 encoded image (match Model Go)
  clima?: "ENSOLARADO" | "NUBLADO" | "CHUVOSO" | "VENTOSO" | "OUTROS"; // ✅ NOVO (Model Go)
  progresso_percentual?: number; // ✅ NOVO (Model Go)
  responsavel_id?: number;
  responsavelId?: number; // Compatibilidade
  responsavelNome?: string;
  aprovado_por_id?: number;
  aprovadoPorId?: number; // Compatibilidade
  status_aprovacao?: "pendente" | "aprovado" | "rejeitado";
  statusAprovacao?: string; // Compatibilidade
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Ajustado 100% para match com model Go Receita
export interface Receita {
  id?: number;
  obra_id: number;
  obraId?: number; // Compatibilidade
  obra_nome?: string; // Para exibição (JOIN)
  obraNome?: string; // Compatibilidade
  descricao: string;
  valor: number;
  data: string; // Data de recebimento (backend espera data_recebimento)
  data_recebimento?: string; // Compatibilidade
  dataRecebimento?: string; // Compatibilidade
  fonte_receita:
    | "CONTRATO"
    | "PAGAMENTO_CLIENTE"
    | "ADIANTAMENTO"
    | "FINANCIAMENTO"
    | "MEDICAO"
    | "OUTROS";
  fonteReceita?: string; // Compatibilidade
  numero_documento?: string;
  numeroDocumento?: string; // Compatibilidade
  responsavel_id?: number;
  responsavelId?: number; // Compatibilidade
  responsavel_nome?: string; // Para exibição (JOIN)
  responsavelNome?: string; // Compatibilidade
  observacao?: string;
  observacoes?: string; // Compatibilidade
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}

// ✅ Removida interface Notificacao (não está na API Go)

export interface AuthUser {
  id?: number;
  nome: string;
  email: string;
  perfil_acesso: "admin" | "gestor" | "usuario";
}

// ✅ Match com API Go /login
export interface LoginCredentials {
  email: string;
  senha: string;
}

// ✅ Resposta de login JWT
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

// ✅ Refresh token request
export interface RefreshTokenRequest {
  refresh_token: string;
}

// ✅ Ajustado para cadastro de usuário na API Go
export interface RegistroUsuario {
  email: string;
  nome: string;
  senha: string;
  tipo_documento: "CPF" | "CNPJ";
  documento: string;
  telefone?: string;
  perfil_acesso?: "admin" | "gestor" | "usuario";
  ativo?: boolean;
}
