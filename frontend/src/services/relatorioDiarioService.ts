// Service para Relatório de Diário de Obras - API Go
import api from "./api";

// ============================================
// TIPOS - Match 100% com API Go
// ============================================

export interface InformacoesObra {
  titulo: string;
  numero_contrato: string;
  contratante: string;
  prazo_obra: string;
  tempo_decorrido: string;
  contratada: string;
  responsavel_tecnico: string;
  registro_profissional: string;
}

export interface TarefaRealizada {
  descricao: string;
  data: string;
}

export interface Ocorrencia {
  descricao: string;
  tipo: string; // "INCIDENTE", "OBSERVACAO", "PROBLEMA"
}

export interface EquipeMembro {
  codigo: string;
  descricao: string;
  quantidade_utilizada: number;
}

export interface EquipamentoUtilizado {
  codigo: string;
  descricao: string;
  quantidade_utilizada: number;
}

export interface MaterialUtilizado {
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  fornecedor?: string;
  valor_unitario?: number;
  valor_total?: number;
}

export interface FotoInfo {
  id: number;
  url: string;
  descricao?: string;
  timestamp: string;
  local_foto?: string;
  categoria: string;
}

export interface ResponsavelInfo {
  nome: string;
  cargo: string;
  documento: string;
  empresa: string;
}

export interface DiarioRelatorioCompleto {
  informacoes_obra: InformacoesObra;
  tarefas_realizadas: TarefaRealizada[];
  ocorrencias: Ocorrencia[];
  equipe_envolvida: EquipeMembro[];
  equipamentos_utilizados: EquipamentoUtilizado[];
  materiais_utilizados: MaterialUtilizado[];
  fotos: FotoInfo[];
  responsavel_empresa: ResponsavelInfo;
  responsavel_prefeitura: ResponsavelInfo;
}

// ============================================
// SERVICE
// ============================================

export const relatorioDiarioService = {
  /**
   * Buscar relatório formatado de diário de obra
   * GET /diarios/relatorio-formatado/:obra_id
   */
  async obterRelatorioFormatado(
    obraId: number
  ): Promise<DiarioRelatorioCompleto> {
    try {
      const response = await api.get(`/diarios/relatorio-formatado/${obraId}`);
      console.log("📊 Relatório de Diário recebido:", response.data);

      const data = response.data.data || response.data;

      // Garantir que arrays nunca sejam null
      return {
        ...data,
        tarefas_realizadas: data.tarefas_realizadas || [],
        ocorrencias: data.ocorrencias || [],
        equipe_envolvida: data.equipe_envolvida || [],
        equipamentos_utilizados: data.equipamentos_utilizados || [],
        materiais_utilizados: data.materiais_utilizados || [],
        fotos: data.fotos || [],
      };
    } catch (error: any) {
      console.error("❌ Erro ao buscar relatório de diário:", error);
      throw error;
    }
  },
};

export default relatorioDiarioService;
