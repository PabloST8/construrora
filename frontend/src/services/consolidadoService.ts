import api from "./api";
import { DiarioConsolidado, RelatorioFormatado } from "../types/consolidado";

export const consolidadoService = {
  /**
   * Buscar diário consolidado por obra
   * GET /diarios-consolidado/obra/:obra_id
   * Retorna VIEW agregada com todas as atividades, ocorrências e metadados
   */
  async buscarPorObra(obraId: number): Promise<DiarioConsolidado[]> {
    try {
      const response = await api.get(`/diarios-consolidado/obra/${obraId}`);
      console.log(`✅ Diário consolidado da obra ${obraId}:`, response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar diário consolidado:", error);
      throw error;
    }
  },

  /**
   * Buscar diário consolidado por obra e período
   * GET /diarios-consolidado/obra/:obra_id/periodo
   * Query params: data_inicio, data_fim
   */
  async buscarPorPeriodo(
    obraId: number,
    dataInicio: string,
    dataFim: string
  ): Promise<DiarioConsolidado[]> {
    try {
      const response = await api.get(
        `/diarios-consolidado/obra/${obraId}/periodo`,
        {
          params: { data_inicio: dataInicio, data_fim: dataFim },
        }
      );
      console.log(
        `✅ Diário consolidado da obra ${obraId} (${dataInicio} - ${dataFim}):`,
        response.data
      );
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar diário consolidado por período:", error);
      throw error;
    }
  },

  /**
   * Buscar relatório formatado para impressão/PDF
   * GET /diarios/relatorio-formatado/:obra_id
   * Retorna JSON formatado pronto para gerar PDF
   */
  async buscarRelatorioFormatado(obraId: number): Promise<RelatorioFormatado> {
    try {
      const response = await api.get(`/diarios/relatorio-formatado/${obraId}`);
      console.log(`✅ Relatório formatado da obra ${obraId}:`, response.data);

      // Garantir que arrays nunca sejam null
      const relatorio = response.data.data || response.data;
      return {
        ...relatorio,
        tarefas_realizadas: relatorio.tarefas_realizadas || [],
        ocorrencias: relatorio.ocorrencias || [],
        equipe_envolvida: relatorio.equipe_envolvida || [],
        equipamentos_utilizados: relatorio.equipamentos_utilizados || [],
        materiais_utilizados: relatorio.materiais_utilizados || [],
        fotos: relatorio.fotos || [],
      };
    } catch (error) {
      console.error("❌ Erro ao buscar relatório formatado:", error);
      throw error;
    }
  },
};
