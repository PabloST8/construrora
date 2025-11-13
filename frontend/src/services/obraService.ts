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

    // Tenta extrair o array de várias formas possíveis
    const data = response.data.data || response.data;

    // Garantir retorno de array
    return Array.isArray(data) ? data : [];
  },

  buscarPorId: async (id: string): Promise<Obra> => {
    const response = await api.get(`/obras/${id}`);

    // 🔍 DEBUG: Verificar resposta completa da API
    console.log(
      "📡 Resposta da API /obras/:id:",
      JSON.stringify(response.data, null, 2)
    );
    console.log(
      "📸 Campo 'foto' na resposta:",
      response.data.foto ? "PRESENTE" : "AUSENTE/NULL"
    );

    return response.data;
  },

  criar: async (obraData: Partial<Obra>) => {
    // ✅ Converter datas para ISO 8601 antes de enviar
    const payload = {
      ...obraData,
      data_inicio: obraData.data_inicio
        ? obraData.data_inicio.includes("T")
          ? obraData.data_inicio
          : `${obraData.data_inicio}T00:00:00Z`
        : undefined,
      data_fim_prevista: obraData.data_fim_prevista
        ? obraData.data_fim_prevista.includes("T")
          ? obraData.data_fim_prevista
          : `${obraData.data_fim_prevista}T00:00:00Z`
        : undefined,
    };

    const response = await api.post("/obras", payload);
    return response.data.data || response.data;
  },

  atualizar: async (id: string, obraData: Partial<Obra>) => {
    // ✅ Converter datas para ISO 8601 antes de enviar
    const payload = {
      ...obraData,
      data_inicio: obraData.data_inicio
        ? obraData.data_inicio.includes("T")
          ? obraData.data_inicio
          : `${obraData.data_inicio}T00:00:00Z`
        : null, // ✅ null ao invés de undefined
      data_fim_prevista: obraData.data_fim_prevista
        ? obraData.data_fim_prevista.includes("T")
          ? obraData.data_fim_prevista
          : `${obraData.data_fim_prevista}T00:00:00Z`
        : null, // ✅ null ao invés de undefined
    };

    const response = await api.put(`/obras/${id}`, payload);
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
