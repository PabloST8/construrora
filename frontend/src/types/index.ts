export interface Usuario {
  id: string;
  nomeCompleto: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  tipoPessoa: "FISICA" | "JURIDICA";
  funcao?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  permissoes: "ADMIN" | "ENGENHEIRO" | "FINANCEIRO";
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Empresa {
  id: string;
  nomeCompleto: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  tipoPessoa: "FISICA" | "JURIDICA";
  funcao?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Obra {
  id: string;
  idObra: string;
  nomeObra: string;
  art?: string;
  cliente: Empresa;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  responsavel: Usuario;
  parceiros: Empresa[];
  dataInicio: string;
  dataPrevisaoTermino: string;
  dataTerminoReal?: string;
  orcamentoInicial: number;
  orcamentoAtual: number;
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Despesa {
  id: string;
  idDespesa: string;
  obra: Obra;
  descricao: string;
  categoria: "MATERIAL" | "MAO_DE_OBRA" | "IMPOSTO" | "PARCEIRO" | "OUTROS";
  valor: number;
  dataCadastro: string;
  formaPagamento: "A_VISTA" | "PIX" | "BOLETO" | "CARTAO";
  statusPagamento: "PENDENTE" | "PAGO";
  dataPagamento?: string;
  responsavelPagamento?: Usuario;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiarioObra {
  id: string;
  obra: Obra;
  data: string;
  descricaoAtividade: string;
  ferramentasUtilizadas?: string;
  quantidadePessoas?: number;
  responsavelExecucao: Usuario;
  observacoes?: string;
  fotos?: {
    url: string;
    descricao: string;
  }[];
  clima?: "SOL" | "CHUVA" | "NUBLADO" | "VENTOSO";
  horaInicio?: string;
  horaTermino?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notificacao {
  id: string;
  usuario: Usuario;
  tipo:
    | "PAGAMENTO_PENDENTE"
    | "ORCAMENTO_EXCEDIDO"
    | "PRAZO_VENCIMENTO"
    | "OBRA_CONCLUIDA"
    | "GERAL";
  titulo: string;
  mensagem: string;
  obra?: Obra;
  despesa?: Despesa;
  lida: boolean;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  nomeCompleto: string;
  email: string;
  permissoes: "ADMIN" | "ENGENHEIRO" | "FINANCEIRO";
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegistroUsuario {
  nomeCompleto: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  funcao?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  senha: string;
  permissoes?: "ADMIN" | "ENGENHEIRO" | "FINANCEIRO";
  observacoes?: string;
}
