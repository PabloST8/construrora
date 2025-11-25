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
   * Lista receitas pendentes (status a_receber)
   * GET /receitas/pendentes
   */
  async listarPendentes(): Promise<Receita[]> {
    const response = await api.get("/receitas/pendentes");
    return response.data.data || response.data;
  },

  /**
   * Busca receita por ID
   * GET /receitas/:id
   */
  async buscarPorId(id: number): Promise<Receita> {
    const response = await api.get(`/receitas/${id}`);
    // ✅ Verificar se vem dentro de .data
    return response.data.data || response.data;
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
   * ✅ ATUALIZADO: API Go usa apenas campo 'data' (sem data_recebimento)
   */
  async criar(receita: Receita): Promise<{ id: number }> {
    // ✅ Converter data para ISO 8601 completo
    const dataISO = receita.data.includes("T")
      ? receita.data
      : `${receita.data}T00:00:00Z`;

    // ✅ Payload correto para API Go (9 campos do modelo Receita)
    const payload = {
      obra_id: receita.obra_id,
      descricao: receita.descricao,
      valor: receita.valor,
      data: dataISO, // ✅ Formato ISO 8601 completo (campo de data único)
      status: receita.status || "a_receber",
      fonte_receita: receita.fonte_receita || "OUTROS",
      numero_documento: receita.numero_documento || "",
      responsavel_id: receita.responsavel_id || null,
      observacao: receita.observacao || "",
    };

    const response = await api.post("/receitas", payload);
    return response.data.data || response.data;
  },

  /**
   * Atualiza receita existente
   * PUT /receitas/:id
   *
   * ✅ ATUALIZADO: API Go usa apenas campo 'data' (sem data_recebimento)
   */
  async atualizar(id: number, receita: Receita): Promise<Receita> {
    // ✅ Converter data para ISO 8601 completo
    const dataISO = receita.data.includes("T")
      ? receita.data
      : `${receita.data}T00:00:00Z`;

    // ✅ Payload correto para API Go (9 campos do modelo Receita)
    const payload = {
      obra_id: receita.obra_id,
      descricao: receita.descricao,
      valor: receita.valor,
      data: dataISO, // ✅ Formato ISO 8601 completo (campo de data único)
      status: receita.status || "a_receber",
      fonte_receita: receita.fonte_receita || "OUTROS",
      numero_documento: receita.numero_documento || "",
      responsavel_id: receita.responsavel_id || null,
      observacao: receita.observacao || "",
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
