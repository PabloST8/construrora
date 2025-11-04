import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Construction,
  Search,
  PersonAdd,
  Person,
  AttachMoney,
  Business,
  Assessment,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import { despesaService } from "../services/despesaService";
import { fornecedorService } from "../services/fornecedorService";
import { toast } from "react-toastify";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    totalObras: 0,
    obrasEmAndamento: 0,
    totalPessoas: 0,
    totalFornecedores: 0,
    totalDespesas: 0,
    valorTotalDespesas: 0,
    despesasPendentes: 0,
    valorPendente: 0,
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);

      // Carregar dados em paralelo
      const [obras, pessoas, despesas, fornecedores] = await Promise.all([
        obraService.listar().catch(() => []),
        pessoaService.listar().catch(() => []),
        despesaService.listar().catch(() => []),
        fornecedorService.listar().catch(() => []),
      ]);

      // Calcular estatísticas das obras
      const obrasArray = Array.isArray(obras) ? obras : [];
      const totalObras = obrasArray.length;
      const obrasEmAndamento = obrasArray.filter(
        (obra: any) => obra.status === "em_andamento"
      ).length;

      // Calcular estatísticas das pessoas
      const pessoasArray = Array.isArray(pessoas) ? pessoas : [];
      const totalPessoas = pessoasArray.length;

      // Calcular estatísticas dos fornecedores
      const fornecedoresArray = Array.isArray(fornecedores) ? fornecedores : [];
      const totalFornecedores = fornecedoresArray.length;

      // Calcular estatísticas das despesas
      const despesasArray = Array.isArray(despesas) ? despesas : [];
      const totalDespesas = despesasArray.length;
      const valorTotalDespesas = despesasArray.reduce(
        (acc: number, despesa: any) => acc + (despesa.valor || 0),
        0
      );
      const despesasPendentes = despesasArray.filter(
        (despesa: any) => despesa.status_pagamento === "PENDENTE"
      ).length;
      const valorPendente = despesasArray
        .filter((despesa: any) => despesa.status_pagamento === "PENDENTE")
        .reduce((acc: number, despesa: any) => acc + (despesa.valor || 0), 0);

      setEstatisticas({
        totalObras,
        obrasEmAndamento,
        totalPessoas,
        totalFornecedores,
        totalDespesas,
        valorTotalDespesas,
        despesasPendentes,
        valorPendente,
      });
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const menuItems = [
    {
      title: "Despesas",
      icon: <AttachMoney sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/despesas",
      color: "#d32f2f",
      description: "Gestão financeira",
    },
    {
      title: "Fornecedores",
      icon: <Business sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/fornecedores",
      color: "#d32f2f",
      description: "Cadastro de fornecedores",
    },
    {
      title: "Relatórios",
      icon: <Assessment sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/relatorios",
      color: "#d32f2f",
      description: "Análises e relatórios",
    },
    {
      title: "Cadastrar Obras",
      icon: <Construction sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/obras?tab=cadastrar",
      color: "#d32f2f",
      description: "Nova obra",
    },
    {
      title: "Buscar Obras",
      icon: <Search sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/obras?tab=buscar",
      color: "#d32f2f",
      description: "Consultar obras",
    },
    {
      title: "Cadastrar Pessoas",
      icon: <PersonAdd sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/pessoas?tab=cadastrar",
      color: "#d32f2f",
      description: "Nova pessoa",
    },
    {
      title: "Buscar Pessoas",
      icon: <Person sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/pessoas?tab=buscar",
      color: "#d32f2f",
      description: "Consultar pessoas",
    },
  ];

  if (loading) {
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
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Cabeçalho com estatísticas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#d32f2f" }}>
          📊 Dashboard - Sistema de Gestão de Obras
        </Typography>

        {/* Cards de estatísticas usando flexbox */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            mt: 2,
          }}
        >
          {/* Card de Obras */}
          <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
            <Card
              sx={{ backgroundColor: "#e3f2fd", border: "1px solid #2196f3" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Construction sx={{ color: "#1976d2", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#1976d2" }}>
                    Obras
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: "#1976d2" }}>
                  {estatisticas.totalObras}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${estatisticas.obrasEmAndamento} em andamento`}
                    color="success"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Card de Pessoas */}
          <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
            <Card
              sx={{ backgroundColor: "#f3e5f5", border: "1px solid #9c27b0" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Person sx={{ color: "#7b1fa2", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#7b1fa2" }}>
                    Pessoas
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: "#7b1fa2" }}>
                  {estatisticas.totalPessoas}
                </Typography>
                <Typography variant="body2" sx={{ color: "#7b1fa2", mt: 1 }}>
                  Cadastradas no sistema
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Card de Fornecedores */}
          <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
            <Card
              sx={{ backgroundColor: "#fff3e0", border: "1px solid #ff9800" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Business sx={{ color: "#f57c00", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#f57c00" }}>
                    Fornecedores
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: "#f57c00" }}>
                  {estatisticas.totalFornecedores}
                </Typography>
                <Typography variant="body2" sx={{ color: "#f57c00", mt: 1 }}>
                  Ativos no sistema
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Card de Despesas */}
          <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
            <Card
              sx={{ backgroundColor: "#e8f5e8", border: "1px solid #4caf50" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AttachMoney sx={{ color: "#388e3c", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#388e3c" }}>
                    Despesas
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: "#388e3c" }}>
                  {estatisticas.totalDespesas}
                </Typography>
                <Typography variant="body2" sx={{ color: "#388e3c", mt: 1 }}>
                  Total: {formatCurrency(estatisticas.valorTotalDespesas)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Resumo Financeiro */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
          }}
        >
          <Box sx={{ flex: "1 1 400px", minWidth: "300px" }}>
            <Card
              sx={{ backgroundColor: "#ffebee", border: "1px solid #f44336" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TrendingUp sx={{ color: "#d32f2f", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#d32f2f" }}>
                    Despesas Pendentes
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ color: "#d32f2f" }}>
                  {estatisticas.despesasPendentes} despesas
                </Typography>
                <Typography variant="h6" sx={{ color: "#d32f2f", mt: 1 }}>
                  Valor: {formatCurrency(estatisticas.valorPendente)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 400px", minWidth: "300px" }}>
            <Card
              sx={{ backgroundColor: "#e8f5e8", border: "1px solid #4caf50" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Assessment sx={{ color: "#388e3c", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#388e3c" }}>
                    Total Geral
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ color: "#388e3c" }}>
                  {formatCurrency(estatisticas.valorTotalDespesas)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#388e3c", mt: 1 }}>
                  Todas as despesas registradas
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Menu de navegação */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: "#333", mb: 3 }}>
          🚀 Acesso Rápido
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {menuItems.map((item, index) => (
            <Card
              key={index}
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 3,
                },
                minHeight: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: 2,
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                <Box sx={{ mb: 1 }}>{item.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#333",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    fontSize: "0.875rem",
                  }}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
