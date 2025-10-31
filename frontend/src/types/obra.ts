export interface Obra {
  id?: number;
  nome: string;
  contrato_numero: string;
  contratoNumero?: string; // ✅ COMPATIBILIDADE
  contratante_id: number;
  responsavel_id: number;
  responsavelNome?: string; // ✅ ADICIONAR CAMPO
  contratanteNome?: string; // ✅ ADICIONAR CAMPO
  data_inicio: string;
  dataInicio?: string; // ✅ COMPATIBILIDADE
  prazo_dias: number;
  prazoDias?: number; // ✅ COMPATIBILIDADE
  data_fim_prevista: string;
  orcamento: number;
  status:
    | "planejamento"
    | "em_andamento"
    | "pausada"
    | "concluida"
    | "cancelada";
  descricao?: string; // ✅ ADICIONAR CAMPO FALTANTE
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
}

// Interface para compatibilidade com frontend antigo
export interface ObraLegacy {
  id?: number;
  nome: string;
  contratoNumero?: string;
  contratanteId?: number;
  contratanteNome?: string;
  responsavelId?: number;
  responsavelNome?: string;
  dataInicio?: string;
  dataTerminoPrevista?: string;
  dataInicioReal?: string; // ✅ ADICIONAR CAMPO FALTANTE
  prazoDias?: number;
  orcamento?: number;
  valorTotal?: number;
  valorUtilizado?: number;
  saldoObra?: number;
  tipoObra?: string;
  situacao?: string;
  status?: string;
  descricao?: string;
  enderecoRua?: string;
  enderecoNumero?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  observacoes?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ObraFinanceiro {
  orcamentoEstimado: number;
  valorTotal: number;
  valorUtilizado: number;
  saldoObra: number;
  aditivos?: Aditivo[];
}

export interface Aditivo {
  id?: number;
  valor: number;
  data: string;
}

export interface Despesa {
  id?: number;
  obraId: number;
  categoria: string;
  fornecedor: string;
  pagoPor: string;
  status: string;
  dataPagamento: string;
  valor: number;
  descricao?: string;
  situacao?: string;
}

export interface FolhaPagamento {
  id?: number;
  obraId: number;
  funcionario: string;
  diasTrabalhados: number;
  pagoPor: string;
  periodoReferencia: string;
  status: string;
  dataPagamento: string;
  valorDiaria: number;
  valor: number;
  descricao?: string;
}

export type TipoObra =
  | "Manutenção"
  | "Construção"
  | "Reforma"
  | "Infraestrutura";
export type SituacaoObra =
  | "Em andamento"
  | "Pausada"
  | "Concluída"
  | "Cancelada";
