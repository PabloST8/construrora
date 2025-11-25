import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { obraService } from "../services/obraService";
import relatorioFotograficoService, {
  RelatorioFotografico as RelatorioFotograficoType,
} from "../services/relatorioFotograficoService";

interface Obra {
  id: number;
  nome: string;
}

const RelatorioFotografico: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<RelatorioFotograficoType | null>(
    null
  );

  useEffect(() => {
    carregarObras();
  }, []);

  const carregarObras = async () => {
    try {
      const data: any = await obraService.listar();
      const obrasArray = Array.isArray(data) ? data : data?.data || [];
      setObras(obrasArray);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
      toast.error("Erro ao carregar obras");
    }
  };

  const gerarRelatorio = async () => {
    if (!obraSelecionada) {
      toast.warning("Selecione uma obra primeiro");
      return;
    }

    setLoading(true);
    try {
      const resultado =
        await relatorioFotograficoService.obterRelatorioFotografico(
          Number(obraSelecionada)
        );
      setRelatorio(resultado);

      if (resultado.fotos.length === 0) {
        toast.info("Nenhuma foto encontrada para esta obra");
      } else {
        toast.success(`${resultado.fotos.length} foto(s) carregada(s)`);
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório fotográfico");
    } finally {
      setLoading(false);
    }
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const formatarData = (dataStr: string) => {
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }} className="no-print">
        <Typography variant="h4" gutterBottom sx={{ color: "#d32f2f", mb: 3 }}>
          Relatório Fotográfico
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Box sx={{ flexBasis: { xs: "100%", md: "50%" }, px: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Selecione a Obra</InputLabel>
              <Select
                value={obraSelecionada}
                onChange={(e) => setObraSelecionada(e.target.value as any)}
                label="Selecione a Obra"
              >
                <MenuItem value="">Selecione...</MenuItem>
                {obras.map((obra) => (
                  <MenuItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flexBasis: { xs: "100%", md: "25%" }, px: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={gerarRelatorio}
              disabled={!obraSelecionada || loading}
              sx={{ height: 56 }}
            >
              {loading ? <CircularProgress size={24} /> : "Gerar Relatório"}
            </Button>
          </Box>

          {relatorio && (
            <Box sx={{ flexBasis: { xs: "100%", md: "25%" }, px: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={imprimirRelatorio}
                sx={{ height: 56 }}
              >
                Imprimir
              </Button>
            </Box>
          )}
        </Grid>
      </Paper>

      {relatorio && (
        <Paper sx={{ p: 4 }} id="relatorio-print">
          {/* Cabeçalho da Empresa */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#d32f2f" }}
            >
              {relatorio.cabecalho_empresa.nome_empresa}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          {/* Dados da Obra */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", mb: 2, color: "#333" }}
            >
              Dados da Obra
            </Typography>

            {/* Foto de Capa da Obra */}
            {relatorio.resumo_obra.foto_obra && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Card sx={{ maxWidth: 600, mx: "auto" }}>
                  <CardMedia
                    component="img"
                    image={relatorio.resumo_obra.foto_obra}
                    alt="Foto da Obra"
                    sx={{ height: 400, objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Foto de Capa da Obra
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body1">
                  <strong>Nome da Obra:</strong>{" "}
                  {relatorio.resumo_obra.nome_obra}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  <strong>Localização:</strong>{" "}
                  {relatorio.resumo_obra.localizacao}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  <strong>Contrato Nº:</strong>{" "}
                  {relatorio.resumo_obra.contrato_numero}
                </Typography>
              </Box>
              {relatorio.resumo_obra.descricao_breve && (
                <Box>
                  <Typography variant="body1">
                    <strong>Descrição:</strong>{" "}
                    {relatorio.resumo_obra.descricao_breve}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Fotos dos Diários */}
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", mb: 3, color: "#333" }}
            >
              Registro Fotográfico ({relatorio.fotos.length} foto
              {relatorio.fotos.length !== 1 ? "s" : ""})
            </Typography>

            {relatorio.fotos.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography variant="body1" color="text.secondary">
                  Nenhuma foto encontrada nos diários de obra
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {relatorio.fotos.map((foto, index) => (
                  <Box
                    key={foto.id}
                    sx={{
                      flexBasis: {
                        xs: "100%",
                        sm: "calc(50% - 12px)",
                        md: "calc(33.333% - 16px)",
                      },
                    }}
                  >
                    <Card>
                      <CardMedia
                        component="img"
                        image={foto.url}
                        alt={foto.titulo_legenda}
                        sx={{ height: 250, objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {foto.titulo_legenda}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Data: {formatarData(foto.data)}
                        </Typography>
                        {foto.observacao && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {foto.observacao}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Rodapé */}
          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: "1px solid #ddd",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Relatório Fotográfico gerado em{" "}
              {new Date().toLocaleDateString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </Typography>
          </Box>
        </Paper>
      )}

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            #relatorio-print {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default RelatorioFotografico;
