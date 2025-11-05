import api from "./api";
import { DiarioObra } from "../types/apiGo";

export const diarioService = {
  // === NOVOS MÉTODOS API GO ===
  // Criar novo diário
  async criar(diario: DiarioObra): Promise<DiarioObra> {
    const response = await api.post("/diarios", diario);
    return response.data.data || response.data;
  },

  // Listar todos os diários
  async listar(): Promise<DiarioObra[]> {
    const response = await api.get("/diarios");
    return response.data.data || response.data;
  },

  // Buscar diário por ID
  async buscarPorId(id: number): Promise<DiarioObra> {
    const response = await api.get(`/diarios/${id}`);
    return response.data;
  },

  // Buscar diários por obra
  async buscarPorObra(obraId: number): Promise<DiarioObra[]> {
    const response = await api.get(`/diarios/${obraId}/obra`);
    return response.data.data || response.data;
  },

  // Atualizar diário
  async atualizar(
    id: number,
    diario: Partial<DiarioObra>
  ): Promise<DiarioObra> {
    console.log(`📝 Atualizando diário ID ${id}:`, diario);
    const response = await api.put(`/diarios/${id}`, diario);
    console.log(`✅ Diário ${id} atualizado com sucesso:`, response.data);
    return response.data;
  },

  // Upload de fotos para diário
  async uploadFoto(
    diarioId: number,
    arquivo: File,
    descricao?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("foto", arquivo);
    if (descricao) {
      formData.append("descricao", descricao);
    }

    console.log(
      `📷 Fazendo upload de foto para diário ${diarioId}:`,
      arquivo.name
    );
    const response = await api.post(`/diarios/${diarioId}/fotos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(`✅ Foto enviada com sucesso:`, response.data);
    return response.data;
  },

  // Remover foto do diário
  async removerFoto(diarioId: number, fotoId: number): Promise<void> {
    console.log(`🗑️ Removendo foto ${fotoId} do diário ${diarioId}`);
    await api.delete(`/diarios/${diarioId}/fotos/${fotoId}`);
    console.log(`✅ Foto ${fotoId} removida com sucesso`);
  },

  // Deletar diário
  async deletar(id: number): Promise<void> {
    await api.delete(`/diarios/${id}`);
  },

  // === MÉTODOS LEGACY (Para compatibilidade) ===
  listar_legacy: async (params?: {
    page?: number;
    limit?: number;
    obra?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    const response = await api.get("/diarios", { params });
    return response.data.data || response.data;
  },

  buscarPorId_legacy: async (id: string) => {
    const response = await api.get(`/diarios/${id}`);
    return response.data;
  },

  buscarPorObra_legacy: async (obraId: string) => {
    const response = await api.get(`/diarios/${obraId}/obra`);
    return response.data.data || response.data;
  },

  criar_legacy: async (diarioData: any) => {
    const response = await api.post("/diarios", diarioData);
    return response.data.data || response.data;
  },

  atualizar_legacy: async (id: string, diarioData: any) => {
    const response = await api.put(`/diarios/${id}`, diarioData);
    return response.data;
  },

  obterEstatisticas: async (obraId: string) => {
    const response = await api.get(`/diarios/estatisticas/${obraId}`);
    return response.data;
  },

  obterResumoMensal: async (obraId: string, ano: number, mes: number) => {
    const response = await api.get(
      `/diarios/resumo/mensal/${obraId}/${ano}/${mes}`
    );
    return response.data;
  },

  deletar_legacy: async (id: string) => {
    const response = await api.delete(`/diarios/${id}`);
    return response.data;
  },
};
