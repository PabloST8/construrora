import api from "./api";
import type { Despesa } from "../types/despesa";
import type { RelatorioDesepesas } from "../types/apiGo";

export const despesaService = {
  // Criar nova despesa
  async criar(despesa: Despesa): Promise<Despesa> {
    console.log("🚀 Enviando despesa para API:", despesa);
    try {
      const response = await api.post("/despesas", despesa);
      console.log("✅ Resposta da API:", response);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error("💥 Erro na API de despesas:", error);
      console.error("💥 Request que falhou:", error.config?.data);
      throw error;
    }
  },

  // Listar todas as despesas (com filtros opcionais)
  async listar(filtros?: any): Promise<Despesa[]> {
    const response = await api.get("/despesas", { params: filtros });
    return response.data.data || response.data;
  },

  // Buscar despesa por ID
  async buscarPorId(id: number | string): Promise<Despesa> {
    const response = await api.get(`/despesas/${id}`);
    return response.data;
  },

  // Atualizar despesa
  async atualizar(
    id: number | string,
    despesa: Partial<Despesa>
  ): Promise<Despesa> {
    console.log(`🔄 Atualizando despesa ID ${id}:`, despesa);

    try {
      const response = await api.put(`/despesas/${id}`, despesa);
      console.log("✅ Resposta da API de atualização:", response.data);

      // Retornar os dados da resposta ou os dados enviados com o ID
      const dadosAtualizados = response.data.data ||
        response.data || { ...despesa, id };
      console.log("📤 Dados finais da atualização:", dadosAtualizados);

      return dadosAtualizados;
    } catch (error: any) {
      console.error("❌ Erro na API de atualização de despesa:", error);
      console.error("❌ Detalhes do erro:", error.response?.data);
      throw error;
    }
  },

  // Deletar despesa
  async deletar(id: number | string): Promise<void> {
    await api.delete(`/despesas/${id}`);
  },

  // Relatório de despesas por obra
  async relatorioObra(obraId: number): Promise<RelatorioDesepesas> {
    const response = await api.get(`/despesas/relatorio/${obraId}`);
    return response.data;
  },

  // Buscar despesas com filtros
  async buscarComFiltros(filtros: any): Promise<Despesa[]> {
    const response = await api.get("/despesas", { params: filtros });
    return response.data.data || response.data;
  },

  // === LEGACY METHODS (Para compatibilidade) ===
  listar_legacy: async (params?: {
    page?: number;
    limit?: number;
    obra?: string;
    categoria?: string;
    statusPagamento?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    const response = await api.get("/despesas", { params });
    return response.data;
  },

  atualizarPagamento: async (
    id: string,
    statusPagamento: string,
    dataPagamento?: string
  ) => {
    const response = await api.patch(`/despesas/${id}/pagamento`, {
      statusPagamento,
      dataPagamento,
    });
    return response.data;
  },

  buscarPorObra: async (obraId: string): Promise<Despesa[]> => {
    const response = await api.get(`/despesas/obra/${obraId}`);
    return response.data;
  },

  obterResumoCategoria: async (obra?: string) => {
    const response = await api.get("/despesas/resumo/categoria", {
      params: { obra },
    });
    return response.data;
  },

  deletar_legacy: async (id: string) => {
    const response = await api.delete(`/despesas/${id}`);
    return response.data;
  },
};
