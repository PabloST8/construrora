import api from "./api";
import { Fornecedor } from "../types/apiGo";

export const fornecedorService = {
  // Criar novo fornecedor
  async criar(fornecedor: Fornecedor): Promise<Fornecedor> {
    const response = await api.post("/fornecedores", fornecedor);
    return response.data.data || response.data;
  },

  // Listar todos os fornecedores
  async listar(): Promise<Fornecedor[]> {
    const response = await api.get("/fornecedores");
    return response.data.data || response.data;
  },

  // Buscar fornecedor por ID
  async buscarPorId(id: number): Promise<Fornecedor> {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },

  // Atualizar fornecedor
  async atualizar(
    id: number,
    fornecedor: Partial<Fornecedor>
  ): Promise<Fornecedor> {
    const response = await api.put(`/fornecedores/${id}`, fornecedor);
    return response.data;
  },

  // Deletar fornecedor
  async deletar(id: number): Promise<void> {
    await api.delete(`/fornecedores/${id}`);
  },
};
