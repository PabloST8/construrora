import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Construction,
} from "@mui/icons-material";
import { obraService } from "../services/obraService";
import { despesaService } from "../services/despesaService";
import { receitaService } from "../services/receitaService";
import { toast } from "react-toastify";
import { formatCurrency } from "../utils/formatters";

interface Obra {
  id: number;
  nome: string;
  status?: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number | "todas">(
    "todas"
  );

  const [estatisticas, setEstatisticas] = useState({
    totalObras: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    despesasPagas: 0,
    despesasPendentes: 0,
    saldoCaixa: 0,
  });

  useEffect(() => {
    carregarObras();
  }, []);

  useEffect(() => {
    if (obras.length > 0) {
      carregarEstatisticas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraSelecionada, obras]);

  const carregarObras = async () => {
    try {
      setLoading(true);
      const data: any = await obraService.listar();
      const obrasArray = Array.isArray(data) ? data : data?.data || [];
      setObras(obrasArray);
    } catch (error) {
      console.error("❌ Erro ao carregar obras:", error);
      toast.error("Erro ao carregar obras");
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);

      // Definir filtros com base na obra selecionada
      const filtros: any = {};
      if (obraSelecionada !== "todas") {
        filtros.obra_id = obraSelecionada;
      }

      // Carregar dados financeiros em paralelo
      const [despesas, receitas] = await Promise.all([
        despesaService.listar(filtros).catch(() => []),
        receitaService.listar(filtros).catch(() => []),
      ]);

      // FILTRO MANUAL: Backend não filtra corretamente, então filtramos no frontend
      let despesasArray = Array.isArray(despesas) ? despesas : [];
      let receitasArray = Array.isArray(receitas) ? receitas : [];

      // Se uma obra específica foi selecionada, filtrar manualmente
      if (obraSelecionada !== "todas") {
        const obraIdNum = Number(obraSelecionada);

        despesasArray = despesasArray.filter(
          (d: any) => d.obra_id === obraIdNum
        );
        receitasArray = receitasArray.filter(
          (r: any) => r.obra_id === obraIdNum
        );
      }

      // Processar despesas
      const totalDespesas = despesasArray.reduce(
        (acc: number, despesa: any) => acc + (despesa.valor || 0),
        0
      );
      const despesasPagas = despesasArray
        .filter((despesa: any) => despesa.status_pagamento === "PAGO")
        .reduce((acc: number, despesa: any) => acc + (despesa.valor || 0), 0);
      const despesasPendentes = despesasArray
        .filter((despesa: any) => despesa.status_pagamento === "PENDENTE")
        .reduce((acc: number, despesa: any) => acc + (despesa.valor || 0), 0);

      // Processar receitas
      const totalReceitas = receitasArray.reduce(
        (acc: number, receita: any) => acc + (receita.valor || 0),
        0
      );

      // Calcular saldo em caixa (Receitas - Despesas Pagas)
      const saldoCaixa = totalReceitas - despesasPagas;

      setEstatisticas({
        totalObras: obras.length,
        totalReceitas,
        totalDespesas,
        despesasPagas,
        despesasPendentes,
        saldoCaixa,
      });
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas financeiras");
    } finally {
      setLoading(false);
    }
  };

  if (loading && obras.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#d32f2f", mb: 3 }}>
          📊 Dashboard Financeiro
        </Typography>

        {/* Filtro por Obra */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Filtrar por Obra</InputLabel>
            <Select
              value={obraSelecionada}
              onChange={(e) => setObraSelecionada(e.target.value as any)}
              label="Filtrar por Obra"
            >
              <MenuItem value="todas">📋 Todas as Obras</MenuItem>
              <Divider />
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id}>
                  🏗️ {obra.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Indicador de obra selecionada */}
        <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
          {obraSelecionada === "todas"
            ? `Exibindo dados de todas as ${estatisticas.totalObras} obras`
            : `Exibindo dados da obra: ${
                obras.find((o) => o.id === obraSelecionada)?.nome || ""
              }`}
        </Typography>
      </Paper>

      {/* Cards Financeiros */}
      <Grid container spacing={3}>
        {/* Card: Total de Receitas */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#e8f5e9",
              border: "2px solid #4caf50",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: "#388e3c", mr: 2 }} />
                <Typography variant="h6" sx={{ color: "#388e3c" }}>
                  Total de Receitas
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#2e7d32", fontWeight: "bold" }}
              >
                {formatCurrency(estatisticas.totalReceitas)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#388e3c", mt: 1 }}>
                Valores recebidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card: Despesas Pagas */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#fff3e0",
              border: "2px solid #ff9800",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: "#f57c00", mr: 2 }} />
                <Typography variant="h6" sx={{ color: "#f57c00" }}>
                  Despesas Pagas
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#e65100", fontWeight: "bold" }}
              >
                {formatCurrency(estatisticas.despesasPagas)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#f57c00", mt: 1 }}>
                Já quitadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card: Despesas Pendentes */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#ffebee",
              border: "2px solid #f44336",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingDown sx={{ fontSize: 40, color: "#d32f2f", mr: 2 }} />
                <Typography variant="h6" sx={{ color: "#d32f2f" }}>
                  Despesas Pendentes
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#c62828", fontWeight: "bold" }}
              >
                {formatCurrency(estatisticas.despesasPendentes)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#d32f2f", mt: 1 }}>
                A pagar
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card: Saldo em Caixa */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Card
            sx={{
              backgroundColor:
                estatisticas.saldoCaixa >= 0 ? "#e3f2fd" : "#ffebee",
              border: `2px solid ${
                estatisticas.saldoCaixa >= 0 ? "#2196f3" : "#f44336"
              }`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccountBalanceWallet
                  sx={{
                    fontSize: 50,
                    color: estatisticas.saldoCaixa >= 0 ? "#1976d2" : "#d32f2f",
                    mr: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: estatisticas.saldoCaixa >= 0 ? "#1976d2" : "#d32f2f",
                  }}
                >
                  Saldo em Caixa
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{
                  color: estatisticas.saldoCaixa >= 0 ? "#0d47a1" : "#c62828",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(estatisticas.saldoCaixa)}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: estatisticas.saldoCaixa >= 0 ? "#1976d2" : "#d32f2f",
                  mt: 1,
                }}
              >
                Receitas - Despesas Pagas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card: Total de Despesas */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Card
            sx={{
              backgroundColor: "#fce4ec",
              border: "2px solid #e91e63",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Construction sx={{ fontSize: 50, color: "#c2185b", mr: 2 }} />
                <Typography variant="h5" sx={{ color: "#c2185b" }}>
                  Total de Despesas
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ color: "#880e4f", fontWeight: "bold" }}
              >
                {formatCurrency(estatisticas.totalDespesas)}
              </Typography>
              <Typography variant="body1" sx={{ color: "#c2185b", mt: 1 }}>
                Pagas + Pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
