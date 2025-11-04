import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  Assessment,
  PictureAsPdf,
  GetApp,
  Construction,
  BarChart,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  relatorioService,
  RelatorioFinanceiro,
  RelatorioDespesasObra,
} from "../services/relatorioService";
import { obraService } from "../services/obraService";
import { Obra } from "../types/obra";

// Componente para Gráfico Simples (substituto temporário)
const SimpleChart: React.FC<{
  data: Record<string, number>;
  title: string;
}> = ({ data, title }) => {
  const maxValue = Math.max(...Object.values(data));

  return (
    <Card sx={{ height: "100%", mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {Object.entries(data).map(([key, value], index) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">{key}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  R${" "}
                  {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: 8,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${(value / maxValue) * 100}%`,
                    height: "100%",
                    backgroundColor: `hsl(${index * 45}, 70%, 50%)`,
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const Relatorios: React.FC = () => {
  const [tabAtiva, setTabAtiva] = useState(0);
  const [loading, setLoading] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);

  // Estados para Relatório Financeiro
  const [relatorioFinanceiro, setRelatorioFinanceiro] =
    useState<RelatorioFinanceiro | null>(null);
  const [filtrosFinanceiro, setFiltrosFinanceiro] = useState({
    dataInicio: "",
    dataFim: "",
    obraId: "",
  });

  // Estados para Relatório de Obra
  const [relatorioDespesasObra, setRelatorioDespesasObra] =
    useState<RelatorioDespesasObra | null>(null);
  const [obraSelecionada, setObraSelecionada] = useState<string>("");

  useEffect(() => {
    carregarObras();
    carregarRelatorioFinanceiro();
  }, []);

  const carregarObras = async () => {
    try {
      const response = await obraService.listar();
      const obrasData = Array.isArray(response)
        ? response
        : (response as any)?.data || [];
      setObras(obrasData);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
    }
  };

  const carregarRelatorioFinanceiro = async () => {
    setLoading(true);
    try {
      const filtros = {
        ...(filtrosFinanceiro.dataInicio && {
          dataInicio: filtrosFinanceiro.dataInicio,
        }),
        ...(filtrosFinanceiro.dataFim && {
          dataFim: filtrosFinanceiro.dataFim,
        }),
        ...(filtrosFinanceiro.obraId && {
          obraId: parseInt(filtrosFinanceiro.obraId),
        }),
      };

      const relatorio = await relatorioService.relatorioFinanceiro(filtros);
      setRelatorioFinanceiro(relatorio);
    } catch (error) {
      console.error("Erro ao carregar relatório financeiro:", error);
      toast.error("Erro ao carregar relatório financeiro");
    } finally {
      setLoading(false);
    }
  };

  const carregarRelatorioDespesasObra = async (obraId: number) => {
    setLoading(true);
    try {
      const relatorio = await relatorioService.despesasPorObra(obraId);
      setRelatorioDespesasObra(relatorio);
    } catch (error) {
      console.error("Erro ao carregar relatório de despesas:", error);
      toast.error("Erro ao carregar relatório de despesas da obra");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarRelatorio = async (
    tipo: string,
    formato: "pdf" | "excel"
  ) => {
    try {
      setLoading(true);
      const blob = await relatorioService.exportarRelatorio(
        tipo,
        formato,
        filtrosFinanceiro
      );

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${tipo}_${new Date().getTime()}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Relatório ${formato.toUpperCase()} baixado com sucesso!`);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Funcionalidade de exportação não disponível");
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Relatório Financeiro Geral
  const renderRelatorioFinanceiro = () => (
    <Box>
      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Data Início"
            type="date"
            value={filtrosFinanceiro.dataInicio}
            onChange={(e) =>
              setFiltrosFinanceiro({
                ...filtrosFinanceiro,
                dataInicio: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Data Fim"
            type="date"
            value={filtrosFinanceiro.dataFim}
            onChange={(e) =>
              setFiltrosFinanceiro({
                ...filtrosFinanceiro,
                dataFim: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Obra</InputLabel>
            <Select
              value={filtrosFinanceiro.obraId}
              onChange={(e) =>
                setFiltrosFinanceiro({
                  ...filtrosFinanceiro,
                  obraId: e.target.value,
                })
              }
            >
              <MenuItem value="">Todas as obras</MenuItem>
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id?.toString()}>
                  {obra.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={carregarRelatorioFinanceiro}
            disabled={loading}
            sx={{ height: 56 }}
          >
            {loading ? <CircularProgress size={24} /> : "Atualizar"}
          </Button>
        </Box>
      </Paper>

      {/* Cards de Resumo */}
      {relatorioFinanceiro && (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Card sx={{ bgcolor: "#e3f2fd", flex: 1, minWidth: 250 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AttachMoney sx={{ color: "#1976d2", mr: 1 }} />
                  <Typography variant="h6">Total de Despesas</Typography>
                </Box>
                <Typography variant="h4" color="#1976d2">
                  R${" "}
                  {relatorioFinanceiro.totalDespesas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#e8f5e8", flex: 1, minWidth: 250 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TrendingUp sx={{ color: "#4caf50", mr: 1 }} />
                  <Typography variant="h6">Total Pago</Typography>
                </Box>
                <Typography variant="h4" color="#4caf50">
                  R${" "}
                  {relatorioFinanceiro.totalPago.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#fce4ec", flex: 1, minWidth: 250 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Assessment sx={{ color: "#e91e63", mr: 1 }} />
                  <Typography variant="h6">Total Pendente</Typography>
                </Box>
                <Typography variant="h4" color="#e91e63">
                  R${" "}
                  {relatorioFinanceiro.totalPendente.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Gráficos */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 400 }}>
              <SimpleChart
                data={relatorioFinanceiro.despesasPorCategoria}
                title="Despesas por Categoria"
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo Percentual
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography>Pago</Typography>
                      <Typography fontWeight="bold" color="success.main">
                        {(
                          (relatorioFinanceiro.totalPago /
                            relatorioFinanceiro.totalDespesas) *
                          100
                        ).toFixed(1)}
                        %
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography>Pendente</Typography>
                      <Typography fontWeight="bold" color="error.main">
                        {(
                          (relatorioFinanceiro.totalPendente /
                            relatorioFinanceiro.totalDespesas) *
                          100
                        ).toFixed(1)}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Botões de Exportação */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Exportar Relatório
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={() => handleExportarRelatorio("financeiro", "pdf")}
                disabled={loading}
              >
                Exportar PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<GetApp />}
                onClick={() => handleExportarRelatorio("financeiro", "excel")}
                disabled={loading}
              >
                Exportar Excel
              </Button>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );

  // Tab 2: Relatório de Despesas por Obra
  const renderRelatorioDespesasObra = () => (
    <Box>
      {/* Seleção de Obra */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Selecionar Obra para Relatório
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <FormControl sx={{ minWidth: 400 }}>
            <InputLabel>Obra</InputLabel>
            <Select
              value={obraSelecionada}
              onChange={(e) => setObraSelecionada(e.target.value)}
            >
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id?.toString()}>
                  {obra.nome} - {obra.endereco_rua || "Sem endereço"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() =>
              carregarRelatorioDespesasObra(parseInt(obraSelecionada))
            }
            disabled={!obraSelecionada || loading}
            sx={{ height: 56 }}
          >
            {loading ? <CircularProgress size={24} /> : "Gerar Relatório"}
          </Button>
        </Box>
      </Paper>

      {/* Resultado do Relatório */}
      {relatorioDespesasObra && (
        <>
          {/* Resumo da Obra */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {relatorioDespesasObra.obraNome ||
                `Obra ID: ${relatorioDespesasObra.obraId}`}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ textAlign: "center", minWidth: 120 }}>
                <Typography variant="h4" color="primary">
                  {relatorioDespesasObra.resumo.quantidade}
                </Typography>
                <Typography variant="body2">Despesas</Typography>
              </Box>
              <Box sx={{ textAlign: "center", minWidth: 120 }}>
                <Typography variant="h4" color="info.main">
                  R${" "}
                  {relatorioDespesasObra.resumo.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="body2">Total</Typography>
              </Box>
              <Box sx={{ textAlign: "center", minWidth: 120 }}>
                <Typography variant="h4" color="success.main">
                  R${" "}
                  {relatorioDespesasObra.resumo.pago.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="body2">Pago</Typography>
              </Box>
              <Box sx={{ textAlign: "center", minWidth: 120 }}>
                <Typography variant="h4" color="error.main">
                  R${" "}
                  {relatorioDespesasObra.resumo.pendente.toLocaleString(
                    "pt-BR",
                    { minimumFractionDigits: 2 }
                  )}
                </Typography>
                <Typography variant="body2">Pendente</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Tabela de Despesas */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Fornecedor</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatorioDespesasObra.despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell>
                      {despesa.data
                        ? new Date(despesa.data).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell>{despesa.descricao}</TableCell>
                    <TableCell>{despesa.categoria}</TableCell>
                    <TableCell>
                      {(despesa as any).fornecedorNome || "N/A"}
                    </TableCell>
                    <TableCell>
                      R${" "}
                      {(despesa.valor || 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          despesa.status_pagamento ||
                          (despesa as any).statusPagamento
                        }
                        color={
                          (despesa.status_pagamento ||
                            (despesa as any).statusPagamento) === "PAGO" ||
                          (despesa.status_pagamento ||
                            (despesa as any).statusPagamento) === "Pago"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <BarChart sx={{ mr: 1 }} />
        Relatórios
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabAtiva}
          onChange={(_, newValue) => setTabAtiva(newValue)}
        >
          <Tab label="Relatório Financeiro" icon={<AttachMoney />} />
          <Tab label="Despesas por Obra" icon={<Construction />} />
        </Tabs>
      </Box>

      {tabAtiva === 0 && renderRelatorioFinanceiro()}
      {tabAtiva === 1 && renderRelatorioDespesasObra()}

      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
};

export default Relatorios;
