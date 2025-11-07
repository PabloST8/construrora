// ✅ Service completo para TODOS os relatórios da API Go
// Endpoints documentados no README: http://92.113.34.172:9090

import api from "./api";

// ============================================
// TIPOS - Match 100% com API Go
// ============================================

/**
 * Relatório Financeiro da Obra
 * GET /relatorios/obra/:obra_id
 */
export interface RelatorioObra {
  obra_id: number;
  obra_nome?: string;
  orcamento_previsto: number;
  gasto_realizado: number;
  receita_total: number;
  saldo_atual: number;
  pagamento_pendente: number;
  status: string;
  percentual_executado: number;
  percentual_lucro: number;
  total_despesas: number;
  total_receitas: number;
}

/**
 * Relatório de Despesas por Categoria
 * GET /relatorios/despesas/:obra_id
 */
export interface RelatorioDespesas {
  obra_id: number;
  obra_nome?: string;
  total_geral: number;
  categorias: Array<{
    categoria: string;
    total: number;
    percentual: number;
    quantidade_itens: number;
  }>;
}

/**
 * Relatório de Pagamentos
 * GET /relatorios/pagamentos/:obra_id?status=PENDENTE
 */
export interface RelatorioPagamentos {
  obra_id: number;
  total_pendente: number;
  total_pago: number;
  pagamentos_em_atraso: number;
  pagamentos: Array<{
    id: number;
    descricao: string;
    valor: number;
    status_pagamento: string;
    forma_pagamento: string;
    data_vencimento: string;
    dias_atraso?: number;
    fornecedor_nome?: string;
  }>;
}

/**
 * Relatório de Materiais
 * GET /relatorios/materiais/:obra_id
 */
export interface RelatorioMateriais {
  total_materiais: number;
  quantidade_itens: number;
  maior_gasto_valor: number;
  maior_gasto_descricao: string;
  materiais: Array<{
    descricao: string;
    valor: number;
    data: string;
    fornecedor?: string;
  }>;
}

/**
 * Relatório de Profissionais/Mão de Obra
 * GET /relatorios/profissionais/:obra_id
 */
export interface RelatorioProfissionais {
  total_mao_de_obra: number;
  quantidade_pagamentos: number;
  maior_pagamento_valor: number;
  maior_pagamento_descricao: string;
  profissionais: Array<{
    descricao: string;
    valor: number;
    data: string;
    responsavel?: string;
  }>;
}

// ============================================
// SERVICE COM TODOS OS ENDPOINTS
// ============================================

export const relatoriosApiGoService = {
  /**
   * 1️⃣ Relatório Financeiro Completo da Obra
   * GET /relatorios/obra/:obra_id
   *
   * Retorna: Orçamento vs Gasto vs Receita, Saldo Atual, Percentual de Lucro
   */
  async obterRelatorioObra(obraId: number): Promise<RelatorioObra> {
    try {
      const response = await api.get(`/relatorios/obra/${obraId}`);
      console.log("🔍 API Response - Relatório Obra:", response.data);
      // Se response.data.data for null, retorna null em vez de {data: null}
      const data =
        response.data.data === null
          ? null
          : response.data.data || response.data;
      console.log("📊 Data extraído:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar relatório da obra:", error);
      throw error;
    }
  },

  /**
   * 2️⃣ Relatório de Despesas por Categoria
   * GET /relatorios/despesas/:obra_id
   *
   * Retorna: Despesas agrupadas por categoria com totais e percentuais
   */
  async obterRelatorioDespesas(obraId: number): Promise<RelatorioDespesas> {
    try {
      const response = await api.get(`/relatorios/despesas/${obraId}`);
      console.log("🔍 API Response - Relatório Despesas:", response.data);
      // Se response.data.data for null, retorna null em vez de {data: null}
      const data =
        response.data.data === null
          ? null
          : response.data.data || response.data;
      console.log("📊 Data extraído - Despesas:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar relatório de despesas:", error);
      throw error;
    }
  },

  /**
   * 3️⃣ Relatório de Pagamentos
   * GET /relatorios/pagamentos/:obra_id?status=PENDENTE
   *
   * Retorna: Status de pagamentos, dias de atraso, formas de pagamento
   */
  async obterRelatorioPagamentos(
    obraId: number,
    status?: "PENDENTE" | "PAGO" | "VENCIDO"
  ): Promise<RelatorioPagamentos> {
    try {
      const params: any = {};
      if (status) params.status = status;

      const response = await api.get(`/relatorios/pagamentos/${obraId}`, {
        params,
      });
      console.log("🔍 API Response - Relatório Pagamentos:", response.data);
      // Se response.data.data for null, retorna null em vez de {data: null}
      const data =
        response.data.data === null
          ? null
          : response.data.data || response.data;
      console.log("📊 Data extraído - Pagamentos:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar relatório de pagamentos:", error);
      throw error;
    }
  },

  /**
   * 4️⃣ Relatório de Materiais
   * GET /relatorios/materiais/:obra_id
   *
   * Retorna: Total gasto em materiais, quantidade de itens, maior gasto
   */
  async obterRelatorioMateriais(obraId: number): Promise<RelatorioMateriais> {
    try {
      const response = await api.get(`/relatorios/materiais/${obraId}`);
      console.log("🔍 API Response - Relatório Materiais:", response.data);
      // Se response.data.data for null, retorna null em vez de {data: null}
      const data =
        response.data.data === null
          ? null
          : response.data.data || response.data;
      console.log("📊 Data extraído - Materiais:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar relatório de materiais:", error);
      throw error;
    }
  },

  /**
   * 5️⃣ Relatório de Profissionais/Mão de Obra
   * GET /relatorios/profissionais/:obra_id
   *
   * Retorna: Total de mão de obra, quantidade de pagamentos, maior pagamento
   */
  async obterRelatorioProfissionais(
    obraId: number
  ): Promise<RelatorioProfissionais> {
    try {
      const response = await api.get(`/relatorios/profissionais/${obraId}`);
      console.log("🔍 API Response - Relatório Profissionais:", response.data);
      // Se response.data.data for null, retorna null em vez de {data: null}
      const data =
        response.data.data === null
          ? null
          : response.data.data || response.data;
      console.log("📊 Data extraído - Profissionais:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar relatório de profissionais:", error);
      throw error;
    }
  },

  /**
   * 🎯 Buscar TODOS os relatórios de uma obra de uma vez
   *
   * Útil para dashboard completo
   */
  async obterTodosRelatoriosObra(obraId: number) {
    try {
      const [obra, despesas, pagamentos, materiais, profissionais] =
        await Promise.all([
          this.obterRelatorioObra(obraId),
          this.obterRelatorioDespesas(obraId),
          this.obterRelatorioPagamentos(obraId),
          this.obterRelatorioMateriais(obraId),
          this.obterRelatorioProfissionais(obraId),
        ]);

      return {
        obra,
        despesas,
        pagamentos,
        materiais,
        profissionais,
      };
    } catch (error) {
      console.error("Erro ao buscar todos os relatórios:", error);
      throw error;
    }
  },
};

export default relatoriosApiGoService;
