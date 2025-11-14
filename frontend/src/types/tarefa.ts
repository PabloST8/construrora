// Types para Tarefas Realizadas (AtividadeDiaria na API Go)

export type PeriodoTarefa = "manha" | "tarde" | "noite" | "integral";
export type StatusTarefa =
  | "planejada"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export interface Foto {
  id: number;
  entidade_tipo: string; // metadados, atividade, ocorrencia
  entidade_id: number;
  foto: string; // Base64 (data:image/jpeg;base64,...)
  descricao?: string;
  ordem?: number; // Ordem de exibição (0 = primeira)
  categoria?: string; // DIARIO, OBRA, OCORRENCIA, ATIVIDADE, SEGURANCA
  largura?: number;
  altura?: number;
  tamanho_bytes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tarefa {
  id: number;
  obra_id: number;
  data: string; // ISO 8601 (YYYY-MM-DD)
  periodo: PeriodoTarefa;
  descricao: string;
  responsavel_id?: number; // ID da pessoa responsável
  status: StatusTarefa;
  percentual_conclusao?: number; // 0-100
  observacao?: string;
  fotos?: Foto[]; // Array de fotos relacionadas à atividade
  created_at?: string;
  updated_at?: string;
  // Campos dos relacionamentos (quando vem da API com joins)
  obra_nome?: string;
  responsavel_nome?: string;
}

export interface TarefaFormData {
  obra_id: number;
  data: string;
  periodo: PeriodoTarefa;
  descricao: string;
  responsavel_id?: number;
  status: StatusTarefa;
  percentual_conclusao?: number;
  observacao?: string;
  fotos?: Foto[]; // Array de fotos para enviar ao criar/atualizar
}
