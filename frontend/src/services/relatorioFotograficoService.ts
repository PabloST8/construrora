import api from "./api";

export interface CabecalhoEmpresa {
  nome_empresa: string;
  logotipo: string | null;
}

export interface ResumoObra {
  nome_obra: string;
  localizacao: string;
  contrato_numero: string;
  lote: string | null;
  descricao_breve: string | null;
  foto_obra: string | null;
}

export interface FotoRelatorio {
  id: number;
  url: string;
  titulo_legenda: string;
  data: string;
  observacao: string;
}

export interface RelatorioFotografico {
  cabecalho_empresa: CabecalhoEmpresa;
  resumo_obra: ResumoObra;
  fotos: FotoRelatorio[];
}

export const relatorioFotograficoService = {
  async obterRelatorioFotografico(
    obraId: number
  ): Promise<RelatorioFotografico> {
    try {
      const [obraResponse, diariosResponse] = await Promise.all([
        api.get(`/obras/${obraId}`),
        api.get(`/diarios/obra/${obraId}`),
      ]);

      const obra = obraResponse.data.data || obraResponse.data;
      const diarios = diariosResponse.data.data || diariosResponse.data || [];

      const fotos: FotoRelatorio[] = [];

      if (Array.isArray(diarios)) {
        diarios.forEach((diario: any) => {
          if (diario.foto) {
            fotos.push({
              id: diario.id,
              url: diario.foto,
              titulo_legenda: `Foto do diário - ${this.formatarData(
                diario.data
              )}`,
              data: diario.data || new Date().toISOString().split("T")[0],
              observacao:
                diario.atividades_realizadas ||
                diario.observacoes ||
                "Sem observações",
            });
          }
        });
      }

      const localizacao = [
        obra.endereco_rua,
        obra.endereco_numero,
        obra.endereco_bairro,
        obra.endereco_cidade,
        obra.endereco_estado,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        cabecalho_empresa: {
          nome_empresa: "EMPRESA CONSTRUTORA",
          logotipo: null,
        },
        resumo_obra: {
          nome_obra: obra.nome || "Obra sem nome",
          localizacao: localizacao || "Localização não informada",
          contrato_numero: obra.contrato_numero || "N/A",
          lote: null,
          descricao_breve: obra.observacoes || null,
          foto_obra: obra.foto || null,
        },
        fotos: fotos,
      };
    } catch (error: any) {
      console.error("Erro ao buscar relatório fotográfico:", error);
      throw error;
    }
  },

  formatarData(dataStr: string): string {
    if (!dataStr) return "Data não informada";
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  },
};

export default relatorioFotograficoService;
