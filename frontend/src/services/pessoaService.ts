import api from "./api";
import { Pessoa, PessoaFilters } from "../types/pessoa";

export const pessoaService = {
  // Criar nova pessoa
  async criar(pessoa: Pessoa): Promise<{ id: number }> {
    const response = await api.post("/pessoas", pessoa);
    return response.data.data || response.data;
  },

  // Listar todas as pessoas
  async listar(): Promise<Pessoa[]> {
    const response = await api.get("/pessoas");
    return response.data.data || response.data;
  },

  // Buscar pessoa por ID
  async buscarPorId(id: number): Promise<Pessoa> {
    console.log(`🔍 Buscando pessoa por ID: ${id}`);

    try {
      const response = await api.get(`/pessoas/${id}`);
      console.log("✅ Pessoa encontrada:", response.data);

      // Garantir que retornamos os dados corretos
      const pessoa = response.data.data || response.data;
      console.log("📤 Dados da pessoa:", pessoa);

      return pessoa;
    } catch (error: any) {
      console.error(`❌ Erro ao buscar pessoa ID ${id}:`, error);
      console.error("❌ Detalhes do erro:", error.response?.data);
      throw error;
    }
  },

  // Atualizar pessoa
  async atualizar(id: number, pessoa: Pessoa): Promise<Pessoa> {
    console.log(`🔄 Atualizando pessoa ID ${id}:`, pessoa);

    try {
      const response = await api.put(`/pessoas/${id}`, pessoa);
      console.log("✅ Resposta da API de atualização:", response.data);

      // Retornar os dados da resposta ou os dados enviados com o ID
      const dadosAtualizados = response.data.data ||
        response.data || { ...pessoa, id };
      console.log("📤 Dados finais da atualização:", dadosAtualizados);

      return dadosAtualizados;
    } catch (error: any) {
      console.error("❌ Erro na API de atualização:", error);
      console.error("❌ Detalhes do erro:", error.response?.data);
      throw error;
    }
  },

  // Buscar com filtros
  buscarComFiltros: async (filtros: PessoaFilters): Promise<Pessoa[]> => {
    const response = await api.get("/pessoas", { params: filtros });
    return response.data;
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/pessoas/${id}`);
    return response.data;
  },
};
