import api from "./api";
import { Obra } from "../types/obra";

export const obraService = {
  listar: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    cliente?: string;
  }) => {
    const response = await api.get("/obras", { params });
    console.log("🔍 Resposta completa da API /obras:", response);
    console.log("🔍 response.data:", response.data);

    // Tenta extrair o array de várias formas possíveis
    const data = response.data.data || response.data;
    console.log("🔍 Data extraído:", data, "É array?", Array.isArray(data));

    // Garantir retorno de array
    return Array.isArray(data) ? data : [];
  },

  buscarPorId: async (id: string): Promise<Obra> => {
    const response = await api.get(`/obras/${id}`);
    return response.data;
  },

  criar: async (obraData: Partial<Obra>) => {
    const response = await api.post("/obras", obraData);
    return response.data.data || response.data;
  },

  atualizar: async (id: string, obraData: Partial<Obra>) => {
    const response = await api.put(`/obras/${id}`, obraData);
    return response.data;
  },

  // ❌ REMOVIDO - API Go NÃO TEM PATCH /obras/:id/status
  // atualizarStatus: async (id: string, status: string) => {...}

  // ❌ REMOVIDO - API Go NÃO TEM GET /obras/status/:status
  // buscarPorStatus: async (status: string) => {...}

  deletar: async (id: string) => {
    const response = await api.delete(`/obras/${id}`);
    return response.data;
  },
};
