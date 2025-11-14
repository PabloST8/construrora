// Types para Ocorrências (OcorrenciaDiaria na API Go)

export type PeriodoOcorrencia = "manha" | "tarde" | "noite" | "integral";
export type TipoOcorrencia =
  | "seguranca"
  | "qualidade"
  | "prazo"
  | "custo"
  | "clima"
  | "ambiental"
  | "trabalhista"
  | "equipamento"
  | "material"
  | "geral";
export type GravidadeOcorrencia = "baixa" | "media" | "alta" | "critica";
export type StatusResolucao =
  | "pendente"
  | "em_tratamento"
  | "em_analise"
  | "resolvida"
  | "nao_aplicavel";

export interface Foto {
  id: number;
  entidade_tipo: string; // metadados, atividade, ocorrencia
  entidade_id: number;
  foto: string; // Base64 (data:image/jpeg;base64,...)
  descricao?: string;
  ordem?: number;
  categoria?: string; // DIARIO, OBRA, OCORRENCIA, ATIVIDADE, SEGURANCA
  largura?: number;
  altura?: number;
  tamanho_bytes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Ocorrencia {
  id: number;
  obra_id: number;
  data: string; // ISO 8601 (YYYY-MM-DD)
  periodo: PeriodoOcorrencia;
  tipo: TipoOcorrencia;
  gravidade: GravidadeOcorrencia;
  descricao: string;
  responsavel_id?: number; // ID da pessoa responsável
  status_resolucao: StatusResolucao;
  acao_tomada?: string;
  fotos?: Foto[]; // Array de fotos relacionadas à ocorrência
  created_at?: string;
  updated_at?: string;
  // Campos dos relacionamentos (quando vem da API com joins)
  obra_nome?: string;
  responsavel_nome?: string;
}

export interface OcorrenciaFormData {
  obra_id: number;
  data: string;
  periodo: PeriodoOcorrencia;
  tipo: TipoOcorrencia;
  gravidade: GravidadeOcorrencia;
  descricao: string;
  responsavel_id?: number;
  status_resolucao: StatusResolucao;
  acao_tomada?: string;
}
