// ✅ RelatoriosApiGo.tsx - Sistema COMPLETO usando os 5 endpoints da API Go
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Chip,
  SelectChangeEvent,
  LinearProgress,
} from "@mui/material";
import { obraService } from "../services/obraService";
import { Obra } from "../types/obra";
import relatoriosApiGoService, {
  RelatorioObra,
  RelatorioDespesas,
  RelatorioPagamentos,
  RelatorioMateriais,
  RelatorioProfissionais,
} from "../services/relatoriosApiGo";

interface RelatoriosCompletos {
  obra: RelatorioObra | null;
  despesas: RelatorioDespesas | null;
  pagamentos: RelatorioPagamentos | null;
  materiais: RelatorioMateriais | null;
  profissionais: RelatorioProfissionais | null;
}

const RelatoriosApiGo: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState<string>("");
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [relatorios, setRelatorios] = useState<RelatoriosCompletos>({
    obra: null,
    despesas: null,
    pagamentos: null,
    materiais: null,
    profissionais: null,
  });

  useEffect(() => {
    const carregarObras = async () => {
      try {
        const response = await obraService.listar({});
        setObras(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao carregar obras:", error);
      }
    };
    carregarObras();
  }, []);

  const handleChangeObra = (event: SelectChangeEvent<string>) => {
    setObraId(event.target.value);
  };

  const carregarRelatorios = async () => {
    if (!obraId) {
      setError("Selecione uma obra");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Carregando TODOS os relatórios da obra:", obraId);

      // 🎯 Busca TODOS os 5 relatórios de uma vez
      const todos = await relatoriosApiGoService.obterTodosRelatoriosObra(
        Number(obraId)
      );

      setRelatorios({
        obra: todos.obra,
        despesas: todos.despesas,
        pagamentos: todos.pagamentos,
        materiais: todos.materiais,
        profissionais: todos.profissionais,
      });

      console.log("✅ Relatórios carregados:", todos);
      console.log(
        "🔍 Tipo de despesas:",
        Array.isArray(todos.despesas) ? "ARRAY" : typeof todos.despesas
      );
      console.log(
        "🔍 Tipo de pagamentos:",
        Array.isArray(todos.pagamentos) ? "ARRAY" : typeof todos.pagamentos
      );
      if (Array.isArray(todos.despesas) && todos.despesas.length > 0) {
        console.log("🔍 Estrutura despesas[0]:", todos.despesas[0]);
      }
      if (Array.isArray(todos.pagamentos) && todos.pagamentos.length > 0) {
        console.log("🔍 Estrutura pagamentos[0]:", todos.pagamentos[0]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar relatórios:", error);
      setError("Erro ao carregar relatórios. Verifique a conexão com a API.");
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (
    status: string
  ): "success" | "error" | "warning" | "default" => {
    if (status === "PAGO") return "success";
    if (status === "VENCIDO") return "error";
    if (status === "PENDENTE") return "warning";
    return "default";
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          📊 Relatórios Completos (API Go)
        </Typography>

        {/* Seletor de Obra */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: "300px" }}>
              <FormControl fullWidth>
                <InputLabel>Obra</InputLabel>
                <Select value={obraId} onChange={handleChangeObra} label="Obra">
                  <MenuItem value="">
                    <em>Selecione uma obra</em>
                  </MenuItem>
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id?.toString()}>
                      {obra.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: "300px" }}>
              <Button
                variant="contained"
                fullWidth
                onClick={carregarRelatorios}
                disabled={!obraId || loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Carregar Relatórios"
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs de Relatórios */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="💰 Financeiro" />
            <Tab label="📦 Despesas" />
            <Tab label="💳 Pagamentos" />
            <Tab label="🔨 Materiais" />
            <Tab label="👷 Profissionais" />
          </Tabs>
        </Box>

        {/* ============================================ */}
        {/* 1️⃣ TAB: RELATÓRIO FINANCEIRO */}
        {/* ============================================ */}
        {tabValue === 0 && (
          <Box>
            {!relatorios.obra ? (
              <Alert severity="info">
                Selecione uma obra e clique em "Carregar Relatórios" para
                visualizar os dados.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {/* Cards de Resumo */}
                <Box sx={{ flex: "1 1 calc(25% - 16px)", minWidth: "200px" }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Orçamento Previsto
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(relatorios.obra.orcamento_previsto)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: "1 1 calc(25% - 16px)", minWidth: "200px" }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Gasto Realizado
                      </Typography>
                      <Typography variant="h5" color="error">
                        {formatCurrency(relatorios.obra.gasto_realizado)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: "1 1 calc(25% - 16px)", minWidth: "200px" }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Receita Total
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(relatorios.obra.receita_total)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: "1 1 calc(25% - 16px)", minWidth: "200px" }}>
                  <Card sx={{ bgcolor: "primary.main", color: "white" }}>
                    <CardContent>
                      <Typography gutterBottom>Saldo Atual</Typography>
                      <Typography variant="h5">
                        {formatCurrency(relatorios.obra.saldo_atual)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Percentuais */}
                <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: "300px" }}>
                  <Card>
                    <CardContent>
                      <Typography gutterBottom>Percentual Executado</Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={relatorios.obra.percentual_executado}
                          sx={{ flex: 1, height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="h6">
                          {relatorios.obra.percentual_executado.toFixed(1)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: "300px" }}>
                  <Card>
                    <CardContent>
                      <Typography gutterBottom>Percentual de Lucro</Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={Math.abs(relatorios.obra.percentual_lucro)}
                          color={
                            relatorios.obra.percentual_lucro >= 0
                              ? "success"
                              : "error"
                          }
                          sx={{ flex: 1, height: 10, borderRadius: 5 }}
                        />
                        <Typography
                          variant="h6"
                          color={
                            relatorios.obra.percentual_lucro >= 0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {relatorios.obra.percentual_lucro.toFixed(1)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Status */}
                <Box sx={{ flex: "1 1 100%" }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Status da Obra
                      </Typography>
                      <Chip
                        label={relatorios.obra.status}
                        color={
                          relatorios.obra.status === "EM_ANDAMENTO"
                            ? "primary"
                            : "default"
                        }
                        size="medium"
                      />
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Pagamento Pendente:{" "}
                          {formatCurrency(relatorios.obra.pagamento_pendente)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ============================================ */}
        {/* 2️⃣ TAB: DESPESAS POR CATEGORIA */}
        {/* ============================================ */}
        {tabValue === 1 && (
          <Box>
            {!relatorios.despesas || !Array.isArray(relatorios.despesas) ? (
              <Alert severity="info">
                Selecione uma obra e clique em "Carregar Relatórios" para
                visualizar os dados.
              </Alert>
            ) : (
              <>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Geral de Despesas
                    </Typography>
                    <Typography variant="h4" color="error">
                      {formatCurrency(
                        relatorios.despesas.reduce(
                          (sum, cat) => sum + (cat.total_gasto || 0),
                          0
                        )
                      )}
                    </Typography>
                  </CardContent>
                </Card>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Categoria</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Percentual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.despesas.map((cat, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={cat.categoria} />
                        </TableCell>
                        <TableCell align="right">
                          {cat.quantidade_itens}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(cat.total_gasto)}
                        </TableCell>
                        <TableCell align="right">
                          <strong>{(cat.percentual || 0).toFixed(1)}%</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        )}

        {/* ============================================ */}
        {/* 3️⃣ TAB: RELATÓRIO DE PAGAMENTOS */}
        {/* ============================================ */}
        {tabValue === 2 && (
          <Box>
            {!relatorios.pagamentos || !Array.isArray(relatorios.pagamentos) ? (
              <Alert severity="info">
                Selecione uma obra e clique em "Carregar Relatórios" para
                visualizar os dados.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Pendente
                        </Typography>
                        <Typography variant="h5" color="warning.main">
                          {formatCurrency(
                            relatorios.pagamentos
                              .filter((p) => p.status_pagamento === "PENDENTE")
                              .reduce((sum, p) => sum + (p.valor || 0), 0)
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Pago
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {formatCurrency(
                            relatorios.pagamentos
                              .filter((p) => p.status_pagamento === "PAGO")
                              .reduce((sum, p) => sum + (p.valor || 0), 0)
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Pagamentos em Atraso
                        </Typography>
                        <Typography variant="h5" color="error">
                          {
                            relatorios.pagamentos.filter(
                              (p) => (p.dias_atraso || 0) > 0
                            ).length
                          }
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Fornecedor</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Forma Pgto</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell align="right">Dias Atraso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.pagamentos.map((pag, index) => (
                      <TableRow key={pag.despesa_id || index}>
                        <TableCell>{pag.descricao}</TableCell>
                        <TableCell>{pag.fornecedor_nome || "-"}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(pag.valor)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pag.status_pagamento}
                            color={getStatusColor(pag.status_pagamento)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{pag.forma_pagamento}</TableCell>
                        <TableCell>{formatDate(pag.data_vencimento)}</TableCell>
                        <TableCell align="right">
                          {pag.dias_atraso ? (
                            <Chip
                              label={`${pag.dias_atraso} dias`}
                              color="error"
                              size="small"
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        )}

        {/* ============================================ */}
        {/* 4️⃣ TAB: RELATÓRIO DE MATERIAIS */}
        {/* ============================================ */}
        {tabValue === 3 && (
          <Box>
            {!relatorios.materiais ? (
              <Alert severity="info">
                Selecione uma obra e clique em "Carregar Relatórios" para
                visualizar os dados.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total em Materiais
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(relatorios.materiais.total_materiais)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Quantidade de Itens
                        </Typography>
                        <Typography variant="h5">
                          {relatorios.materiais.quantidade_itens}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Maior Gasto
                        </Typography>
                        <Typography variant="h6" noWrap>
                          {relatorios.materiais.maior_gasto_descricao}
                        </Typography>
                        <Typography variant="h5" color="error">
                          {formatCurrency(
                            relatorios.materiais.maior_gasto_valor
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Fornecedor</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.materiais.materiais &&
                      relatorios.materiais.materiais.map((mat, index) => (
                        <TableRow key={index}>
                          <TableCell>{mat.descricao}</TableCell>
                          <TableCell>{mat.fornecedor || "-"}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(mat.valor)}
                          </TableCell>
                          <TableCell>{formatDate(mat.data)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        )}

        {/* ============================================ */}
        {/* 5️⃣ TAB: RELATÓRIO DE PROFISSIONAIS */}
        {/* ============================================ */}
        {tabValue === 4 && (
          <Box>
            {!relatorios.profissionais ? (
              <Alert severity="info">
                Selecione uma obra e clique em "Carregar Relatórios" para
                visualizar os dados.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Mão de Obra
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(
                            relatorios.profissionais.total_mao_de_obra
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Quantidade de Pagamentos
                        </Typography>
                        <Typography variant="h5">
                          {relatorios.profissionais.quantidade_pagamentos}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: "280px" }}
                  >
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Maior Pagamento
                        </Typography>
                        <Typography variant="h6" noWrap>
                          {relatorios.profissionais.maior_pagamento_descricao}
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(
                            relatorios.profissionais.maior_pagamento_valor
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Responsável</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.profissionais.profissionais &&
                      relatorios.profissionais.profissionais.map(
                        (prof, index) => (
                          <TableRow key={index}>
                            <TableCell>{prof.descricao}</TableCell>
                            <TableCell>{prof.responsavel || "-"}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(prof.valor)}
                            </TableCell>
                            <TableCell>{formatDate(prof.data)}</TableCell>
                          </TableRow>
                        )
                      )}
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RelatoriosApiGo;
