import api from "./api";

export const dashboardService = {
  obterDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },

  obterEstatisticasObras: async () => {
    const response = await api.get("/dashboard/obras/estatisticas");
    return response.data;
  },

  obterEstatisticasFinanceiro: async (periodo = 30) => {
    const response = await api.get("/dashboard/financeiro/estatisticas", {
      params: { periodo },
    });
    return response.data;
  },

  obterEstatisticasProdutividade: async (periodo = 30) => {
    const response = await api.get("/dashboard/produtividade/estatisticas", {
      params: { periodo },
    });
    return response.data;
  },
};
