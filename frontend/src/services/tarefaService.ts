import api from "./api";
import { Tarefa, TarefaFormData } from "../types/tarefa";

export const tarefaService = {
  /**
   * Listar todas as tarefas
   * GET /tarefas
   */
  async listar(): Promise<Tarefa[]> {
    try {
      const response = await api.get("/tarefas");
      console.log("✅ Tarefas carregadas:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao listar tarefas:", error);
      throw error;
    }
  },

  /**
   * Buscar tarefas por obra e data
   * GET /tarefas/obra/:obra_id/data/:data
   */
  async buscarPorObraEData(obraId: number, data: string): Promise<Tarefa[]> {
    try {
      const response = await api.get(`/tarefas/obra/${obraId}/data/${data}`);
      console.log(`✅ Tarefas da obra ${obraId} em ${data}:`, response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar tarefas por obra e data:", error);
      throw error;
    }
  },

  /**
   * Criar nova tarefa
   * POST /tarefas
   */
  async criar(data: TarefaFormData): Promise<Tarefa> {
    try {
      console.log("📤 Criando tarefa:", data);
      const response = await api.post("/tarefas", data);
      console.log("✅ Tarefa criada:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao criar tarefa:", error);
      throw error;
    }
  },

  /**
   * Atualizar tarefa
   * PUT /tarefas/:id
   */
  async atualizar(id: number, data: TarefaFormData): Promise<Tarefa> {
    try {
      console.log(`📤 Atualizando tarefa ${id}:`, data);
      const response = await api.put(`/tarefas/${id}`, data);
      console.log("✅ Tarefa atualizada:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao atualizar tarefa:", error);
      throw error;
    }
  },

  /**
   * Deletar tarefa
   * DELETE /tarefas/:id
   */
  async deletar(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deletando tarefa ${id}`);
      await api.delete(`/tarefas/${id}`);
      console.log("✅ Tarefa deletada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao deletar tarefa:", error);
      throw error;
    }
  },
};
