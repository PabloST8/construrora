/**
 * Tipos TypeScript para Metadados do Diário
 * Relacionamento: diario_metadados 1:N com foto_diario (polimórfico)
 */

export enum PeriodoMetadados {
  MANHA = "manha",
  TARDE = "tarde",
  INTEGRAL = "integral",
}

export enum StatusAprovacao {
  PENDENTE = "pendente",
  APROVADO = "aprovado",
  REJEITADO = "rejeitado",
}

export interface Foto {
  id?: number;
  foto: string; // Base64
  descricao?: string;
  ordem: number;
  categoria: "DIARIO" | "ATIVIDADE" | "OCORRENCIA" | "SEGURANCA";
  largura?: number;
  altura?: number;
  tamanho_bytes?: number;
}

export interface MetadadosDiario {
  id: number;
  obra_id: number;
  data: string; // ISO 8601
  periodo: PeriodoMetadados;
  observacoes?: string;
  responsavel_id?: number;
  aprovado_por_id?: number;
  status_aprovacao: StatusAprovacao;
  fotos?: Foto[];
  created_at?: string;
  updated_at?: string;
}

export interface MetadadosDiarioFormData {
  obra_id: number;
  data: string;
  periodo: PeriodoMetadados;
  observacoes?: string;
  responsavel_id?: number;
  aprovado_por_id?: number;
  status_aprovacao: StatusAprovacao;
  fotos?: Foto[];
}
