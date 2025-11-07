// ✅ Service para Fornecedores - API Go (localhost:9090)
import api from "./api";
import { Fornecedor } from "../types/fornecedor";

export const fornecedorService = {
  // ✅ GET /fornecedores - Listar todos os fornecedores
  async listar(): Promise<Fornecedor[]> {
    const response = await api.get("/fornecedores");
    return response.data.data || response.data;
  },

  // ✅ GET /fornecedores/:id - Buscar fornecedor por ID
  async buscarPorId(id: number): Promise<Fornecedor> {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data.data || response.data;
  },

  // ✅ POST /fornecedores - Criar novo fornecedor
  async criar(fornecedor: Fornecedor): Promise<{ id: number }> {
    const response = await api.post("/fornecedores", fornecedor);
    return response.data.data || response.data;
  },

  // ✅ PUT /fornecedores/:id - Atualizar fornecedor
  async atualizar(id: number, fornecedor: Fornecedor): Promise<Fornecedor> {
    const response = await api.put(`/fornecedores/${id}`, fornecedor);
    return response.data.data || response.data;
  },

  // ✅ DELETE /fornecedores/:id - Deletar fornecedor
  async deletar(id: number): Promise<void> {
    await api.delete(`/fornecedores/${id}`);
  },
};
