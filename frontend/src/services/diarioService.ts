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

  // ✅ Buscar diários por obra (ENDPOINT CORRETO: /diarios/obra/:id)
  async buscarPorObra(obraId: number): Promise<DiarioObra[]> {
    const response = await api.get(`/diarios/obra/${obraId}`); // ✅ CORRIGIDO
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

  // ❌ REMOVIDO - API Go NÃO TEM upload separado de fotos
  // Foto deve ir como BASE64 no JSON do diário

  // ✅ NOVO - Converter arquivo para base64
  async converterFotoParaBase64(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(arquivo);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  // Deletar diário
  async deletar(id: number): Promise<void> {
    await api.delete(`/diarios/${id}`);
  },

  // ❌ MÉTODOS LEGADOS REMOVIDOS - API Go não tem esses endpoints
  // - GET /diarios/estatisticas/:obraId
  // - GET /diarios/resumo/mensal/:obraId/:ano/:mes
};
