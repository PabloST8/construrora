// ✅ Service para Receitas - API Go (localhost:9090)
import api from "./api";
import { Receita } from "../types/receita";

export interface ReceitaFiltros {
  obra_id?: number;
  fonte_receita?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: number;
}

export const receitaService = {
  /**
   * Lista todas as receitas com filtros opcionais
   * GET /receitas
   */
  async listar(filtros?: ReceitaFiltros): Promise<Receita[]> {
    const response = await api.get("/receitas", { params: filtros });
    return response.data.data || response.data;
  },

  /**
   * Busca receita por ID
   * GET /receitas/:id
   */
  async buscarPorId(id: number): Promise<Receita> {
    const response = await api.get(`/receitas/${id}`);
    return response.data;
  },

  /**
   * Busca receitas por obra
   * GET /receitas/obra/:obra_id
   */
  async buscarPorObra(obraId: number): Promise<Receita[]> {
    const response = await api.get(`/receitas/obra/${obraId}`);
    return response.data.data || response.data;
  },

  /**
   * Cria nova receita
   * POST /receitas
   * 
   * IMPORTANTE: A API Go espera data_recebimento no payload
   */
  async criar(receita: Receita): Promise<{ id: number }> {
    // ✅ Converte data para data_recebimento (formato esperado pela API Go)
    const payload = {
      obra_id: receita.obra_id,
      descricao: receita.descricao,
      valor: receita.valor,
      data_recebimento: receita.data, // ✅ IMPORTANTE: API Go espera data_recebimento
      fonte_receita: receita.fonte_receita || "OUTROS",
      numero_documento: receita.numero_documento || "",
      responsavel_id: receita.responsavel_id || null,
      observacoes: receita.observacao || receita.observacoes || "",
    };

    const response = await api.post("/receitas", payload);
    return response.data.data || response.data;
  },

  /**
   * Atualiza receita existente
   * PUT /receitas/:id
   */
  async atualizar(id: number, receita: Receita): Promise<Receita> {
    // ✅ Converte data para data_recebimento
    const payload = {
      obra_id: receita.obra_id,
      descricao: receita.descricao,
      valor: receita.valor,
      data_recebimento: receita.data, // ✅ IMPORTANTE: API Go espera data_recebimento
      fonte_receita: receita.fonte_receita || "OUTROS",
      numero_documento: receita.numero_documento || "",
      responsavel_id: receita.responsavel_id || null,
      observacoes: receita.observacao || receita.observacoes || "",
    };

    const response = await api.put(`/receitas/${id}`, payload);
    return response.data;
  },

  /**
   * Exclui receita
   * DELETE /receitas/:id
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/receitas/${id}`);
  },

  /**
   * Obtém resumo financeiro de receitas
   * Calcula totais localmente
   */
  async obterResumo(filtros?: ReceitaFiltros) {
    const receitas = await this.listar(filtros);

    const totalReceitas = receitas.reduce(
      (acc, receita) => acc + (receita.valor || 0),
      0
    );

    return {
      total_receitas: totalReceitas,
      quantidade_receitas: receitas.length,
      receitas,
    };
  },
};
