import api from "./api";
import { Ocorrencia, OcorrenciaFormData } from "../types/ocorrencia";

export const ocorrenciaService = {
  /**
   * Listar todas as ocorrências
   * GET /ocorrencias
   */
  async listar(): Promise<Ocorrencia[]> {
    try {
      const response = await api.get("/ocorrencias");
      console.log("✅ Ocorrências carregadas:", response.data);
      console.log(
        "📊 Dados brutos da API:",
        JSON.stringify(response.data, null, 2)
      );

      const ocorrencias = response.data.data || [];
      if (ocorrencias.length > 0) {
        console.log("🔍 Primeira ocorrência completa:", ocorrencias[0]);
        console.log("📸 Fotos da primeira ocorrência:", ocorrencias[0]?.fotos);
      }

      return ocorrencias;
    } catch (error) {
      console.error("❌ Erro ao listar ocorrências:", error);
      throw error;
    }
  },

  /**
   * Buscar ocorrências por obra e data
   * GET /ocorrencias/obra/:obra_id/data/:data
   */
  async buscarPorObraEData(
    obraId: number,
    data: string
  ): Promise<Ocorrencia[]> {
    try {
      // ✅ FIX DEFINITIVO: Enviar data diretamente no formato YYYY-MM-DD
      // A API Go espera formato: "2025-11-14" (sem conversão de timezone)
      console.log(`🔍 Buscando ocorrências: obra=${obraId}, data=${data}`);

      const response = await api.get(
        `/ocorrencias/obra/${obraId}/data/${data}`
      );
      console.log(
        `✅ Ocorrências da obra ${obraId} em ${data}:`,
        response.data
      );
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar ocorrências por obra e data:", error);
      throw error;
    }
  },

  /**
   * Buscar ocorrências por gravidade
   * GET /ocorrencias/gravidade/:gravidade
   */
  async buscarPorGravidade(
    gravidade: "baixa" | "media" | "alta"
  ): Promise<Ocorrencia[]> {
    try {
      const response = await api.get(`/ocorrencias/gravidade/${gravidade}`);
      console.log(`✅ Ocorrências com gravidade ${gravidade}:`, response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar ocorrências por gravidade:", error);
      throw error;
    }
  },

  /**
   * Criar nova ocorrência
   * POST /ocorrencias
   */
  async criar(data: OcorrenciaFormData): Promise<Ocorrencia> {
    try {
      console.log("📤 Criando ocorrência:", data);
      const response = await api.post("/ocorrencias", data);
      console.log("✅ Ocorrência criada:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao criar ocorrência:", error);
      throw error;
    }
  },

  /**
   * Atualizar ocorrência
   * PUT /ocorrencias/:id
   */
  async atualizar(id: number, data: OcorrenciaFormData): Promise<Ocorrencia> {
    try {
      console.log(`📤 Atualizando ocorrência ${id}:`, data);
      const response = await api.put(`/ocorrencias/${id}`, data);
      console.log("✅ Ocorrência atualizada:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao atualizar ocorrência:", error);
      throw error;
    }
  },

  /**
   * Deletar ocorrência
   * DELETE /ocorrencias/:id
   */
  async deletar(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deletando ocorrência ${id}`);
      await api.delete(`/ocorrencias/${id}`);
      console.log("✅ Ocorrência deletada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao deletar ocorrência:", error);
      throw error;
    }
  },
};
