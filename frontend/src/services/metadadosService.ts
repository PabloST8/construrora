import api from "./api";
import { MetadadosDiario, MetadadosDiarioFormData } from "../types/metadados";

export const metadadosService = {
  /**
   * Listar todos os metadados (usando VIEW consolidada)
   * GET /diarios-consolidado
   */
  async listar(): Promise<MetadadosDiario[]> {
    try {
      const response = await api.get("/diarios-consolidado");
      console.log("✅ Metadados carregados:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao listar metadados:", error);
      throw error;
    }
  },

  /**
   * Buscar metadados por obra (usando VIEW consolidada)
   * GET /diarios-consolidado/obra/:obra_id
   */
  async buscarPorObra(obraId: number): Promise<MetadadosDiario[]> {
    try {
      const response = await api.get(`/diarios-consolidado/obra/${obraId}`);
      console.log(`✅ Metadados da obra ${obraId}:`, response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar metadados por obra:", error);
      throw error;
    }
  },

  /**
   * Buscar metadados por obra e data (usando VIEW consolidada)
   * GET /diarios-consolidado/data/:data
   */
  async buscarPorObraEData(
    obraId: number,
    data: string
  ): Promise<MetadadosDiario | null> {
    try {
      const response = await api.get(`/diarios-consolidado/data/${data}`);
      console.log(`✅ Metadados da obra ${obraId} em ${data}:`, response.data);
      // Filtra os resultados pela obra
      const metadados = response.data.data || [];
      const metadadoObra = metadados.find((m: any) => m.obra_id === obraId);
      return metadadoObra || null;
    } catch (error) {
      console.error("❌ Erro ao buscar metadados por obra e data:", error);
      throw error;
    }
  },

  /**
   * Criar novos metadados
   * POST /diarios-consolidado/metadados
   */
  async criar(data: MetadadosDiarioFormData): Promise<MetadadosDiario> {
    try {
      console.log("📤 Criando metadados:", data);
      const response = await api.post("/diarios-consolidado/metadados", data);
      console.log("✅ Metadados criados:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao criar metadados:", error);
      throw error;
    }
  },

  /**
   * Atualizar metadados
   * PUT /diarios-consolidado/metadados/:id
   */
  async atualizar(
    id: number,
    data: MetadadosDiarioFormData
  ): Promise<MetadadosDiario> {
    try {
      console.log(`📤 Atualizando metadados ${id}:`, data);
      const response = await api.put(
        `/diarios-consolidado/metadados/${id}`,
        data
      );
      console.log("✅ Metadados atualizados:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao atualizar metadados:", error);
      throw error;
    }
  },

  /**
   * Deletar metadados
   * DELETE /diarios-consolidado/metadados/:id
   */
  async deletar(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deletando metadados ${id}`);
      await api.delete(`/diarios-consolidado/metadados/${id}`);
      console.log("✅ Metadados deletados com sucesso");
    } catch (error) {
      console.error("❌ Erro ao deletar metadados:", error);
      throw error;
    }
  },
};
