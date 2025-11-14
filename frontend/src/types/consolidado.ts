/**
 * Tipos TypeScript para Diário Consolidado
 * VIEW que agrega: atividades + ocorrências + metadados
 */

import { Tarefa } from "./tarefa";
import { Ocorrencia } from "./ocorrencia";
import { MetadadosDiario, Foto } from "./metadados";

export interface DiarioConsolidado {
  obra_id: number;
  data: string;
  periodo: string;
  atividades: Tarefa[];
  ocorrencias: Ocorrencia[];
  metadados: MetadadosDiario;
  total_atividades: number;
  total_ocorrencias: number;
  total_fotos: number;
}

export interface RelatorioFormatado {
  informacoes_obra: {
    id: number;
    titulo: string;
    contratante: string;
    endereco: string;
  };
  data_relatorio: string;
  periodo: string;
  tarefas_realizadas: Array<{
    descricao: string;
    status: string;
    percentual_conclusao: number;
    responsavel?: string;
  }>;
  ocorrencias: Array<{
    tipo: string;
    gravidade: string;
    descricao: string;
    status_resolucao: string;
    acao_tomada?: string;
  }>;
  equipe_envolvida: string[];
  equipamentos_utilizados: string[];
  materiais_utilizados: string[];
  observacoes_gerais?: string;
  responsavel_diario?: string;
  status_aprovacao: string;
  aprovado_por?: string;
  fotos: Foto[];
  created_at: string;
}
