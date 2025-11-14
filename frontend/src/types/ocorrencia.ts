// Types para Ocorrências

export type PeriodoOcorrencia = "manha" | "tarde" | "integral";
export type TipoOcorrencia =
  | "seguranca"
  | "qualidade"
  | "prazo"
  | "custo"
  | "clima"
  | "outro";
export type GravidadeOcorrencia = "baixa" | "media" | "alta";
export type StatusResolucao =
  | "pendente"
  | "em_analise"
  | "resolvida"
  | "nao_aplicavel";

export interface Foto {
  id: number;
  entidade_tipo: string;
  entidade_id: number;
  foto: string; // Base64
  descricao?: string;
  created_at?: string;
}

export interface Ocorrencia {
  id: number;
  obra_id: number;
  data: string; // ISO 8601
  periodo: PeriodoOcorrencia;
  tipo: TipoOcorrencia;
  gravidade: GravidadeOcorrencia;
  descricao: string;
  status_resolucao: StatusResolucao;
  acao_tomada?: string;
  fotos?: Foto[]; // Fotos associadas via foto_diario (polimorphic)
  created_at?: string;
  updated_at?: string;
}

export interface OcorrenciaFormData {
  obra_id: number;
  data: string;
  periodo: PeriodoOcorrencia;
  tipo: TipoOcorrencia;
  gravidade: GravidadeOcorrencia;
  descricao: string;
  status_resolucao: StatusResolucao;
  acao_tomada?: string;
}
