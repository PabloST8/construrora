// Types para Tarefas Realizadas

export type PeriodoTarefa = "manha" | "tarde" | "integral";
export type StatusTarefa =
  | "planejada"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export interface Foto {
  id: number;
  entidade_tipo: string;
  entidade_id: number;
  foto: string; // Base64
  descricao?: string;
  created_at?: string;
}

export interface Tarefa {
  id: number;
  obra_id: number;
  data: string; // ISO 8601
  periodo: PeriodoTarefa;
  descricao: string;
  status: StatusTarefa;
  percentual_conclusao: number; // 0-100
  observacao?: string;
  fotos?: Foto[]; // Fotos associadas via foto_diario (polimorphic)
  created_at?: string;
  updated_at?: string;
}

export interface TarefaFormData {
  obra_id: number;
  data: string;
  periodo: PeriodoTarefa;
  descricao: string;
  status: StatusTarefa;
  percentual_conclusao: number;
  observacao?: string;
}
