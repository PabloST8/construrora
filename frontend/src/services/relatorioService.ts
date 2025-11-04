import api from "./api";
import type { Despesa } from "../types/despesa";

export interface RelatorioFinanceiro {
  totalDespesas: number;
  totalPago: number;
  totalPendente: number;
  despesasPorCategoria: Record<string, number>;
  despesasPorMes: Record<string, number>;
}

export interface RelatorioDespesasObra {
  obraId: number;
  obraNome?: string;
  despesas: Despesa[];
  resumo: {
    total: number;
    pago: number;
    pendente: number;
    quantidade: number;
  };
}

export const relatorioService = {
  // Função de teste para verificar autenticação
  async testarAutenticacao(): Promise<boolean> {
    try {
      console.log("🔍 Testando autenticação...");
      const token = localStorage.getItem("access_token");
      console.log("🔍 Token encontrado:", token ? "SIM" : "NÃO");

      // Tenta um endpoint simples primeiro
      await api.get("/obras");
      console.log("✅ Teste de autenticação bem-sucedido");
      return true;
    } catch (error: any) {
      console.error(
        "❌ Teste de autenticação falhou:",
        error.response?.status,
        error.message
      );
      return false;
    }
  },

  // Relatório de despesas por obra (endpoint descoberto na API)
  async despesasPorObra(obraId: number): Promise<RelatorioDespesasObra> {
    try {
      // Usar o endpoint geral com filtro - que sabemos que funciona
      console.log(
        `🔍 Buscando despesas para obra ${obraId} via endpoint geral`
      );
      const response = await api.get(`/despesas`, {
        params: { obra_id: obraId },
      });
      console.log("🔍 Despesas por obra (endpoint geral):", response);

      const data = response.data.data || response.data;
      console.log("🔍 Data do endpoint geral:", data);

      if (Array.isArray(data)) {
        return this.processarDespesas(obraId, data);
      }
    } catch (error) {
      console.error("🔍 Endpoint geral falhou:", error);
    }

    // Fallback: tentar endpoint específico (mas sabemos que retorna agregado)
    try {
      console.log(`🔍 Tentando endpoint específico como fallback`);
      const response = await api.get(`/despesas/relatorio/${obraId}`);
      console.log("🔍 Relatório específico (agregado):", response);

      const data = response.data.data || response.data;

      // Se for agregado, criar estrutura com dados do resumo
      if (data && !Array.isArray(data) && data.total_despesas !== undefined) {
        console.log("🔍 Dados agregados detectados, criando estrutura");
        return {
          obraId,
          despesas: [], // Não temos despesas individuais
          resumo: {
            total: Number(data.total_despesas) || 0,
            pago: 0, // Não temos essa info no agregado
            pendente: Number(data.total_despesas) || 0,
            quantidade: Number(data.quantidade_itens) || 0,
          },
        };
      }
    } catch (error) {
      console.error("🔍 Endpoint específico também falhou:", error);
    }

    // Fallback final: retorna estrutura vazia
    return {
      obraId,
      despesas: [],
      resumo: {
        total: 0,
        pago: 0,
        pendente: 0,
        quantidade: 0,
      },
    };
  },

  // Função auxiliar para processar array de despesas
  processarDespesas(obraId: number, despesas: any[]): RelatorioDespesasObra {
    console.log(
      "🔍 Processando",
      despesas.length,
      "despesas para obra",
      obraId
    );

    // Filtrar apenas despesas da obra específica (caso o endpoint geral retorne todas)
    const despesasObra = despesas.filter(
      (d) =>
        Number(d.obra_id) === Number(obraId) ||
        Number(d.obraId) === Number(obraId)
    );

    console.log("🔍 Despesas filtradas para obra:", despesasObra.length);
    console.log("🔍 Primeira despesa (para debug):", despesasObra[0]);

    const total = despesasObra.reduce(
      (acc, d) => acc + (Number(d.valor) || 0),
      0
    );
    const pago = despesasObra
      .filter(
        (d) => d.status_pagamento === "PAGO" || d.statusPagamento === "Pago"
      )
      .reduce((acc, d) => acc + (Number(d.valor) || 0), 0);

    const resultado = {
      obraId,
      despesas: despesasObra,
      resumo: {
        total,
        pago,
        pendente: total - pago,
        quantidade: despesasObra.length,
      },
    };

    console.log("🔍 Resultado final processado:", resultado);
    return resultado;
  },

  // Relatório financeiro geral
  async relatorioFinanceiro(filtros?: {
    dataInicio?: string;
    dataFim?: string;
    obraId?: number;
  }): Promise<RelatorioFinanceiro> {
    console.log("🔍 Gerando relatório financeiro com filtros:", filtros);

    try {
      // Primeiro tenta o endpoint específico de relatórios
      const response = await api.get("/relatorios/financeiro", {
        params: filtros,
      });
      console.log(
        "✅ Endpoint /relatorios/financeiro funcionou:",
        response.data
      );
      return response.data.data || response.data;
    } catch (error: any) {
      console.log(
        "⚠️ Endpoint /relatorios/financeiro falhou:",
        error.response?.status
      );

      // Se endpoint não existir, calculamos localmente usando filtros
      console.log("🔄 Calculando relatório localmente com filtros...");

      // Preparar parâmetros para o endpoint de despesas
      const params: any = {};
      if (filtros?.dataInicio) {
        params.data_inicio = filtros.dataInicio;
      }
      if (filtros?.dataFim) {
        params.data_fim = filtros.dataFim;
      }
      if (filtros?.obraId) {
        params.obra_id = filtros.obraId;
      }

      console.log("🔍 Parâmetros para buscar despesas:", params);

      // Buscar todas as despesas com os filtros aplicados
      try {
        const despesasResponse = await api.get("/despesas", { params });
        console.log("🔍 Resposta das despesas:", despesasResponse.data);

        const despesas = despesasResponse.data.data || despesasResponse.data;

        if (!Array.isArray(despesas)) {
          console.error("❌ Formato de dados inválido:", despesas);
          throw new Error("Formato de dados inválido");
        }

        console.log(`🔍 Processando ${despesas.length} despesas encontradas`);
        console.log("🔍 Primeira despesa (para debug):", despesas[0]);

        const total = despesas.reduce(
          (acc: number, d: any) => acc + (Number(d.valor) || 0),
          0
        );
        const pago = despesas
          .filter(
            (d: any) =>
              d.status_pagamento === "PAGO" || d.statusPagamento === "Pago"
          )
          .reduce((acc: number, d: any) => acc + (Number(d.valor) || 0), 0);

        const categorias: Record<string, number> = {};
        const meses: Record<string, number> = {};

        despesas.forEach((d: any) => {
          const valor = Number(d.valor) || 0;

          // Agrupar por categoria
          const cat = d.categoria || "Outros";
          categorias[cat] = (categorias[cat] || 0) + valor;

          // Agrupar por mês (se tiver data)
          if (d.data_vencimento || d.dataVencimento) {
            const data = new Date(d.data_vencimento || d.dataVencimento);
            if (!isNaN(data.getTime())) {
              const mesAno = `${(data.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${data.getFullYear()}`;
              meses[mesAno] = (meses[mesAno] || 0) + valor;
            }
          }
        });

        const resultado = {
          totalDespesas: total,
          totalPago: pago,
          totalPendente: total - pago,
          despesasPorCategoria: categorias,
          despesasPorMes: meses,
        };

        console.log("✅ Relatório financeiro calculado:", resultado);
        return resultado;
      } catch (despesasError: any) {
        console.error("❌ Erro ao buscar despesas com filtros:", despesasError);

        // Se for erro 401, pode ser problema de autenticação
        if (despesasError.response?.status === 401) {
          console.error("🔐 Erro de autenticação - token pode ter expirado");
          throw new Error("Erro de autenticação. Faça login novamente.");
        }

        // Se houver filtros e der erro, tenta sem filtros
        if (Object.keys(params).length > 0) {
          console.log("🔄 Tentando buscar sem filtros...");
          try {
            const despesasResponse = await api.get("/despesas");
            console.log(
              "🔍 Resposta das despesas (sem filtros):",
              despesasResponse.data
            );

            const todasDespesas =
              despesasResponse.data.data || despesasResponse.data;

            if (!Array.isArray(todasDespesas)) {
              throw new Error("Formato de dados inválido");
            }

            // Aplicar filtros manualmente no frontend
            let despesasFiltradas = todasDespesas;

            if (filtros?.obraId) {
              despesasFiltradas = despesasFiltradas.filter(
                (d) =>
                  Number(d.obra_id) === Number(filtros.obraId) ||
                  Number(d.obraId) === Number(filtros.obraId)
              );
            }

            if (filtros?.dataInicio) {
              despesasFiltradas = despesasFiltradas.filter((d) => {
                const dataDesp = new Date(
                  d.data_vencimento || d.dataVencimento || d.data
                );
                const dataIni = new Date(filtros.dataInicio!);
                return dataDesp >= dataIni;
              });
            }

            if (filtros?.dataFim) {
              despesasFiltradas = despesasFiltradas.filter((d) => {
                const dataDesp = new Date(
                  d.data_vencimento || d.dataVencimento || d.data
                );
                const dataFinal = new Date(filtros.dataFim!);
                return dataDesp <= dataFinal;
              });
            }

            console.log(
              `🔍 Aplicando filtros no frontend: ${todasDespesas.length} → ${despesasFiltradas.length} despesas`
            );

            // Processar as despesas filtradas
            const total = despesasFiltradas.reduce(
              (acc: number, d: any) => acc + (Number(d.valor) || 0),
              0
            );
            const pago = despesasFiltradas
              .filter(
                (d: any) =>
                  d.status_pagamento === "PAGO" || d.statusPagamento === "Pago"
              )
              .reduce((acc: number, d: any) => acc + (Number(d.valor) || 0), 0);

            const categorias: Record<string, number> = {};
            const meses: Record<string, number> = {};

            despesasFiltradas.forEach((d: any) => {
              const valor = Number(d.valor) || 0;

              // Agrupar por categoria
              const cat = d.categoria || "Outros";
              categorias[cat] = (categorias[cat] || 0) + valor;

              // Agrupar por mês (se tiver data)
              if (d.data_vencimento || d.dataVencimento) {
                const data = new Date(d.data_vencimento || d.dataVencimento);
                if (!isNaN(data.getTime())) {
                  const mesAno = `${(data.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${data.getFullYear()}`;
                  meses[mesAno] = (meses[mesAno] || 0) + valor;
                }
              }
            });

            const resultado = {
              totalDespesas: total,
              totalPago: pago,
              totalPendente: total - pago,
              despesasPorCategoria: categorias,
              despesasPorMes: meses,
            };

            console.log(
              "✅ Relatório financeiro calculado com filtros manuais:",
              resultado
            );
            return resultado;
          } catch (fallbackError) {
            console.error(
              "❌ Erro também ao buscar sem filtros:",
              fallbackError
            );
            throw new Error(
              "Erro ao buscar dados de despesas. Verifique sua conexão."
            );
          }
        }

        // Para outros erros, re-lança o erro
        throw new Error(
          "Erro ao aplicar filtros no relatório. Tente sem filtros."
        );
      }
    }
  },

  // Relatório de obras
  async relatorioObras(filtros?: {
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    try {
      const response = await api.get("/relatorios/obras", { params: filtros });
      return response.data.data || response.data;
    } catch (error) {
      console.warn("Endpoint /relatorios/obras não encontrado");
      throw error;
    }
  },

  // Exportar relatório (se disponível)
  async exportarRelatorio(
    tipo: string,
    formato: "pdf" | "excel",
    filtros?: any
  ) {
    try {
      const response = await api.get(`/relatorios/exportar/${tipo}`, {
        params: { ...filtros, formato },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.warn("Endpoint de exportação não encontrado");
      throw error;
    }
  },
};
