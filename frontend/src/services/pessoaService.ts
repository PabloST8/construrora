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
    const response = await api.get(`/pessoas/${id}`);
    return response.data;
  },

  // Atualizar pessoa
  async atualizar(id: number, pessoa: Pessoa): Promise<Pessoa> {
    const response = await api.put(`/pessoas/${id}`, pessoa);
    return response.data;
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
