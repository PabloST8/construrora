import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Alert,
  Stack,
} from "@mui/material";
import {
  AttachMoney,
  PendingActions,
  CheckCircle,
  TrendingUp,
  GetApp,
  PictureAsPdf,
  TableChart,
} from "@mui/icons-material";
import { relatorioService } from "../services/relatorioService";
import { obraService } from "../services/obraService";
import { Obra } from "../types/obra";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Componente simples para gráficos
const SimpleChart: React.FC<{
  data: any[];
  title: string;
}> = ({ data, title }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box>
        {data?.length > 0 ? (
          data.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                p: 1,
                bgcolor: "grey.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                {item.categoria || item.nome}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                R${" "}
                {(item.valor || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="textSecondary">Nenhum dado disponível</Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const Relatorios: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [obraFiltro, setObraFiltro] = useState("");

  // Estados para dados
  const [relatorioFinanceiro, setRelatorioFinanceiro] = useState<any>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState("");
  const [relatorioDespesasObra, setRelatorioDespesasObra] = useState<any>(null);

  // Carregar relatório financeiro
  const carregarRelatorioFinanceiro = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros: any = {};
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;
      if (obraFiltro) filtros.obraId = parseInt(obraFiltro);

      console.log("🔍 Carregando relatório financeiro com filtros:", filtros);
      console.log("🔍 Estados dos filtros:", {
        dataInicio,
        dataFim,
        obraFiltro,
      });

      const relatorio = await relatorioService.relatorioFinanceiro(filtros);
      console.log("✅ Relatório financeiro carregado:", relatorio);
      setRelatorioFinanceiro(relatorio);
    } catch (error: any) {
      console.error("❌ Erro ao carregar relatório financeiro:", error);

      // Tratamento específico para erro de autenticação
      if (error.message?.includes("autenticação")) {
        setError("Sessão expirada. Você será redirecionado para o login.");
        // O interceptor já vai redirecionar, mas vamos mostrar uma mensagem amigável
      } else if (error.message?.includes("filtros")) {
        setError(
          "Erro ao aplicar filtros. Tente carregar o relatório sem filtros."
        );
      } else {
        setError("Erro ao carregar relatório financeiro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, obraFiltro]);

  // Carregar obras
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

  // Gerar relatório por obra
  const gerarRelatorioObra = async () => {
    if (!obraSelecionada) {
      setError("Selecione uma obra para gerar o relatório");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const relatorio = await relatorioService.despesasPorObra(
        parseInt(obraSelecionada)
      );
      console.log("🎯 Relatório recebido no componente:", relatorio);
      console.log("🎯 Resumo do relatório:", relatorio?.resumo);
      console.log("🎯 Despesas do relatório:", relatorio?.despesas);
      setRelatorioDespesasObra(relatorio);
    } catch (error) {
      console.error("Erro ao gerar relatório da obra:", error);
      setError("Erro ao gerar relatório da obra. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Exportar relatório
  const exportarRelatorio = (formato: "pdf" | "excel") => {
    // Aqui implementaria a lógica de exportação
    console.log(`Exportando relatório em formato ${formato}`);
    alert(
      `Funcionalidade de exportação ${formato.toUpperCase()} será implementada em breve!`
    );
  };

  useEffect(() => {
    const testAndLoadInitialData = async () => {
      try {
        const isAuthenticated = await relatorioService.testarAutenticacao();
        if (isAuthenticated) {
          console.log("✅ Autenticação OK, carregando relatórios...");
          carregarRelatorioFinanceiro();
        } else {
          console.log("❌ Problema de autenticação detectado");
          setError("Problema de autenticação. Tente fazer login novamente.");
        }
      } catch (error) {
        console.error("❌ Erro no teste de autenticação:", error);
        setError("Erro de conexão. Verifique sua internet.");
      }
    };

    carregarObras();
    testAndLoadInitialData();
  }, [carregarRelatorioFinanceiro]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relatórios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="relatórios tabs"
        >
          <Tab label="Relatório Financeiro" />
          <Tab label="Relatório por Obra" />
        </Tabs>

        {/* Tab 1: Relatório Financeiro */}
        <TabPanel value={tabValue} index={0}>
          {/* Filtros */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Obra</InputLabel>
                <Select
                  value={obraFiltro}
                  onChange={(e) => setObraFiltro(e.target.value)}
                  label="Obra"
                >
                  <MenuItem value="">Todas as obras</MenuItem>
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id?.toString()}>
                      {obra.nome} -{" "}
                      {obra.endereco_rua || "Endereço não informado"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                <Button
                  variant="contained"
                  onClick={carregarRelatorioFinanceiro}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <TrendingUp />
                  }
                  sx={{ flex: 1 }}
                >
                  {loading ? "Carregando..." : "Atualizar"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDataInicio("");
                    setDataFim("");
                    setObraFiltro("");
                    // Carrega automaticamente sem filtros
                    setTimeout(() => carregarRelatorioFinanceiro(), 100);
                  }}
                  disabled={loading}
                >
                  Limpar
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Cards de Resumo */}
          {relatorioFinanceiro && (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ mb: 3 }}
              >
                <Card sx={{ flex: 1, bgcolor: "#e3f2fd" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AttachMoney color="primary" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" gutterBottom>
                        Total de Despesas
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      R${" "}
                      {(relatorioFinanceiro.totalDespesas || 0).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 }
                      )}
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ flex: 1, bgcolor: "#e8f5e8" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" gutterBottom>
                        Valores Pagos
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      R${" "}
                      {(relatorioFinanceiro.totalPago || 0).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 }
                      )}
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ flex: 1, bgcolor: "#fce4ec" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PendingActions color="warning" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" gutterBottom>
                        Valores Pendentes
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      R${" "}
                      {(relatorioFinanceiro.totalPendente || 0).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 }
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>

              {/* Gráficos */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                sx={{ mb: 3 }}
              >
                <Box sx={{ flex: 1 }}>
                  <SimpleChart
                    data={relatorioFinanceiro.despesasPorCategoria || []}
                    title="Despesas por Categoria"
                  />
                </Box>
                <Card sx={{ flex: 1, height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resumo do Período
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total de Obras: {relatorioFinanceiro.totalObras || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Despesas Registradas:{" "}
                        {relatorioFinanceiro.totalDespesasRegistradas || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Média por Obra: R${" "}
                        {(
                          (relatorioFinanceiro.totalDespesas || 0) /
                          Math.max(relatorioFinanceiro.totalObras || 1, 1)
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>

              {/* Botões de Exportação */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Exportar Relatório
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => exportarRelatorio("pdf")}
                  >
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TableChart />}
                    onClick={() => exportarRelatorio("excel")}
                  >
                    Exportar Excel
                  </Button>
                </Stack>
              </Paper>
            </>
          )}
        </TabPanel>

        {/* Tab 2: Relatório por Obra */}
        <TabPanel value={tabValue} index={1}>
          {/* Seleção de Obra */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selecionar Obra para Relatório
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <FormControl fullWidth sx={{ flex: 2 }}>
                <InputLabel>Obra</InputLabel>
                <Select
                  value={obraSelecionada}
                  onChange={(e) => setObraSelecionada(e.target.value)}
                  label="Obra"
                >
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id?.toString()}>
                      {obra.nome} -{" "}
                      {obra.endereco_rua || "Endereço não informado"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                onClick={gerarRelatorioObra}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <GetApp />
                }
                sx={{ flex: 1 }}
              >
                {loading ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </Stack>
          </Paper>

          {/* Resultado do Relatório */}
          {relatorioDespesasObra && (
            <Box>
              {/* Resumo da Obra */}
              {relatorioDespesasObra.resumo ? (
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumo da Obra (ID: {relatorioDespesasObra.obraId})
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Gasto
                      </Typography>
                      <Typography variant="h6">
                        R${" "}
                        {(
                          relatorioDespesasObra.resumo.total || 0
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Quantidade de Despesas
                      </Typography>
                      <Typography variant="h6">
                        {relatorioDespesasObra.resumo.quantidade || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Média por Despesa
                      </Typography>
                      <Typography variant="h6">
                        R${" "}
                        {(
                          (relatorioDespesasObra.resumo.total || 0) /
                          Math.max(
                            relatorioDespesasObra.resumo.quantidade || 1,
                            1
                          )
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ) : (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Resumo não disponível para esta obra.
                </Alert>
              )}

              {/* Tabela de Despesas */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detalhamento das Despesas
                </Typography>
                <TableContainer>
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
                      {(relatorioDespesasObra.despesas || []).map(
                        (despesa: any, index: number) => (
                          <TableRow key={despesa.id || `despesa-${index}`}>
                            <TableCell>
                              {despesa.data_despesa || despesa.data
                                ? new Date(
                                    despesa.data_despesa || despesa.data
                                  ).toLocaleDateString("pt-BR")
                                : "-"}
                            </TableCell>
                            <TableCell>{despesa.descricao || "-"}</TableCell>
                            <TableCell>
                              {despesa.categoria ||
                                despesa.categoria_display ||
                                "-"}
                            </TableCell>
                            <TableCell>
                              {despesa.fornecedorNome ||
                                despesa.fornecedor_nome ||
                                despesa.fornecedor ||
                                "-"}
                            </TableCell>
                            <TableCell>
                              R${" "}
                              {(Number(despesa.valor) || 0).toLocaleString(
                                "pt-BR",
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  despesa.status_pagamento ||
                                  despesa.statusPagamento ||
                                  "Pendente"
                                }
                                color={
                                  despesa.status_pagamento === "PAGO" ||
                                  despesa.statusPagamento === "Pago"
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {(!relatorioDespesasObra.despesas ||
                  relatorioDespesasObra.despesas.length === 0) && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="textSecondary">
                      Nenhuma despesa encontrada para esta obra.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Relatorios;
