import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { despesaService } from "../services/despesaService";
import { obraService } from "../services/obraService";
import { fornecedorService } from "../services/fornecedorService";
import { Fornecedor } from "../types/apiGo";
import type { Despesa } from "../types/despesa";
import type { Obra } from "../types/obra";
import { formatCurrency, formatDate } from "../utils/formatters";

const Despesas: React.FC = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(
    null
  );
  const [modoEdicao, setModoEdicao] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    obra_id: "",
    categoria: "",
    status_pagamento: "",
    fornecedor_id: "",
  });

  // Formulário
  const [formData, setFormData] = useState<Partial<Despesa>>({
    obra_id: 0,
    fornecedor_id: 0,
    descricao: "",
    categoria: "MATERIAL",
    valor: 0,
    data_vencimento: new Date().toISOString().split("T")[0],
    forma_pagamento: "PIX",
    status_pagamento: "PENDENTE",
    observacao: "",
    data_pagamento: "", // Será preenchido automaticamente se status for PAGO
  });

  // Resumo financeiro
  const [resumo, setResumo] = useState({
    total: 0,
    pago: 0,
    pendente: 0,
    quantidade: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  // Cálculo do resumo financeiro
  const calcularResumo = React.useCallback(() => {
    const total = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);
    const pago = despesas
      .filter(
        (d) => d.status_pagamento === "PAGO" || d.statusPagamento === "Pago"
      )
      .reduce((acc, d) => acc + (d.valor || 0), 0);

    setResumo({
      total,
      pago,
      pendente: total - pago,
      quantidade: despesas.length,
    });
  }, [despesas]);

  useEffect(() => {
    calcularResumo();
  }, [calcularResumo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      console.log("🔄 Carregando dados das despesas...");

      // Limpar estados antes de recarregar
      setDespesas([]);
      setObras([]);
      setFornecedores([]);

      const [despesasData, obrasData, fornecedoresData] = await Promise.all([
        despesaService.listar(),
        obraService.listar(),
        fornecedorService.listar(),
      ]);

      console.log("🔍 Despesas carregadas:", despesasData);
      console.log("🔍 Obras carregadas:", obrasData);
      console.log("🔍 Fornecedores carregados:", fornecedoresData);

      // Aguardar um tick para garantir que os estados foram limpos
      await new Promise((resolve) => setTimeout(resolve, 10));

      const despesasArray = Array.isArray(despesasData) ? despesasData : [];
      const obrasArray = Array.isArray(obrasData) ? obrasData : [];
      const fornecedoresArray = Array.isArray(fornecedoresData)
        ? fornecedoresData
        : [];

      setDespesas(despesasArray);
      setObras(obrasArray);
      setFornecedores(fornecedoresArray);

      console.log("✅ Estados atualizados com sucesso");
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      toast.error("❌ Erro ao carregar dados");
      setDespesas([]);
      setObras([]);
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarComFiltros = async () => {
    setLoading(true);
    try {
      const filtrosLimpos = Object.fromEntries(
        Object.entries(filtros).filter(([_, valor]) => valor !== "")
      );

      console.log("🔍 Buscando com filtros:", filtrosLimpos);
      const resultado = await despesaService.buscarComFiltros(filtrosLimpos);
      setDespesas(Array.isArray(resultado) ? resultado : []);
    } catch (error) {
      console.error("❌ Erro ao buscar com filtros:", error);
      toast.error("Erro ao aplicar filtros");
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      obra_id: "",
      categoria: "",
      status_pagamento: "",
      fornecedor_id: "",
    });
    carregarDados();
  };

  const abrirDialogCriacao = () => {
    setFormData({
      obra_id: 0,
      fornecedor_id: 0,
      descricao: "",
      categoria: "MATERIAL",
      valor: 0,
      data_vencimento: new Date().toISOString().split("T")[0],
      forma_pagamento: "PIX",
      status_pagamento: "PENDENTE",
      observacao: "",
    });
    setModoEdicao(false);
    setDialogAberto(true);
  };

  const abrirDialogEdicao = (despesa: Despesa) => {
    setFormData({
      ...despesa,
      data_vencimento: despesa.data_vencimento?.split("T")[0] || "",
    });
    setDespesaSelecionada(despesa);
    setModoEdicao(true);
    setDialogAberto(true);
  };

  const abrirDialogVisualizacao = (despesa: Despesa) => {
    setDespesaSelecionada(despesa);
    setDialogVisualizacao(true);
  };

  const salvarDespesa = async () => {
    try {
      if (!formData.obra_id || !formData.fornecedor_id || !formData.descricao) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      setLoading(true);

      // Validação básica
      if (!formData.obra_id || !formData.fornecedor_id || !formData.descricao) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      // Validação específica: se status é PAGO, data_pagamento é obrigatória
      if (formData.status_pagamento === "PAGO" && !formData.data_pagamento) {
        toast.error("Data de pagamento é obrigatória quando status é PAGO");
        setLoading(false);
        return;
      }

      const dadosDespesa = {
        obra_id: Number(formData.obra_id),
        fornecedor_id: Number(formData.fornecedor_id),
        descricao: formData.descricao,
        categoria: formData.categoria,
        valor: Number(formData.valor),
        data_vencimento:
          formData.data_vencimento || new Date().toISOString().split("T")[0],
        forma_pagamento: formData.forma_pagamento || "PIX",
        status_pagamento: formData.status_pagamento || "PENDENTE",
        observacao: formData.observacao || "",
        // Campos que podem ser necessários baseados na API Go
        data_despesa: new Date().toISOString().split("T")[0],
        // REGRA: Se status é PAGO, data_pagamento é OBRIGATÓRIA
        ...(formData.status_pagamento === "PAGO" && {
          data_pagamento:
            formData.data_pagamento || new Date().toISOString().split("T")[0],
        }),
      };

      console.log("💾 Salvando despesa:", dadosDespesa);
      console.log("💾 Dados originais do form:", formData);

      if (modoEdicao && despesaSelecionada) {
        console.log(`🔄 Atualizando despesa ID ${despesaSelecionada.id}`);

        const despesaAtualizada = await despesaService.atualizar(
          despesaSelecionada.id!,
          dadosDespesa
        );
        console.log("✅ Despesa atualizada na API:", despesaAtualizada);

        // Atualizar estado local IMEDIATAMENTE
        const novaListaDespesas = despesas.map((d) =>
          d.id === despesaSelecionada.id
            ? ({ ...d, ...dadosDespesa, id: despesaSelecionada.id } as Despesa)
            : d
        );

        console.log("📤 Nova lista de despesas:", novaListaDespesas);
        setDespesas(novaListaDespesas);

        toast.success("✅ Despesa atualizada com sucesso!");

        // Recarregar dados do servidor para garantir sincronização
        setTimeout(() => {
          carregarDados();
        }, 500);
      } else {
        console.log("🆕 Criando nova despesa");
        await despesaService.criar(dadosDespesa as Despesa);
        toast.success("✅ Despesa criada com sucesso!");
        carregarDados();
      }

      setDialogAberto(false);
      setModoEdicao(false);
      setDespesaSelecionada(null);

      // Limpar formulário
      setFormData({
        obra_id: 0,
        fornecedor_id: 0,
        descricao: "",
        categoria: "MATERIAL",
        valor: 0,
        data_vencimento: "",
        forma_pagamento: "PIX",
        status_pagamento: "PENDENTE",
        observacao: "",
        data_pagamento: "",
      });
    } catch (error: any) {
      console.error("❌ Erro ao salvar despesa:", error);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response headers:", error.response?.headers);

      let mensagem = "Erro ao salvar despesa";

      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.data?.error) {
        mensagem = error.response.data.error;
      } else if (error.response?.status === 400) {
        mensagem =
          "Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.";
      }

      toast.error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const excluirDespesa = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

    try {
      setLoading(true);
      await despesaService.deletar(id);
      toast.success("Despesa excluída com sucesso!");
      carregarDados();
    } catch (error) {
      console.error("❌ Erro ao excluir despesa:", error);
      toast.error("Erro ao excluir despesa");
    } finally {
      setLoading(false);
    }
  };

  const getObraNome = (obraId: number) => {
    const obra = obras.find((o) => o.id === obraId);
    return obra?.nome || `Obra ${obraId}`;
  };

  const getFornecedorNome = (fornecedorId: number) => {
    const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
    return fornecedor?.nome || `Fornecedor ${fornecedorId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAGO":
        return "success";
      case "PENDENTE":
        return "warning";
      default:
        return "default";
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria?.toUpperCase()) {
      case "MATERIAL":
        return "🏗️";
      case "MAO_DE_OBRA":
        return "👷";
      case "IMPOSTO":
        return "📋";
      case "PARCEIRO":
        return "🤝";
      default:
        return "📦";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          💰 Gestão de Despesas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirDialogCriacao}
          sx={{ backgroundColor: "#4caf50" }}
        >
          Nova Despesa
        </Button>
      </Stack>

      {/* Resumo Financeiro */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Total Geral
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(resumo.total)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Total Pago
          </Typography>
          <Typography variant="h5" color="success.main">
            {formatCurrency(resumo.pago)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Total Pendente
          </Typography>
          <Typography variant="h5" color="warning.main">
            {formatCurrency(resumo.pendente)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Quantidade
          </Typography>
          <Typography variant="h5" color="info.main">
            {resumo.quantidade}
          </Typography>
        </Paper>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          🔍 Filtros
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Obra</InputLabel>
            <Select
              value={filtros.obra_id}
              onChange={(e) =>
                setFiltros({ ...filtros, obra_id: e.target.value })
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id}>
                  {obra.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={filtros.categoria}
              onChange={(e) =>
                setFiltros({ ...filtros, categoria: e.target.value })
              }
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="MATERIAL">Material</MenuItem>
              <MenuItem value="MAO_DE_OBRA">Mão de Obra</MenuItem>
              <MenuItem value="IMPOSTO">Imposto</MenuItem>
              <MenuItem value="PARCEIRO">Parceiro</MenuItem>
              <MenuItem value="OUTROS">Outros</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filtros.status_pagamento}
              onChange={(e) =>
                setFiltros({ ...filtros, status_pagamento: e.target.value })
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="PAGO">Pago</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Fornecedor</InputLabel>
            <Select
              value={filtros.fornecedor_id}
              onChange={(e) =>
                setFiltros({ ...filtros, fornecedor_id: e.target.value })
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {fornecedores.map((fornecedor) => (
                <MenuItem key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={buscarComFiltros}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={limparFiltros}
          >
            Limpar
          </Button>
        </Box>
      </Paper>

      {/* Tabela de Despesas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Ações</TableCell>
              <TableCell>Obra</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Forma Pagamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {despesas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Alert severity="info">Nenhuma despesa encontrada</Alert>
                </TableCell>
              </TableRow>
            ) : (
              despesas.map((despesa) => (
                <TableRow key={despesa.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => abrirDialogVisualizacao(despesa)}
                        title="Visualizar"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => abrirDialogEdicao(despesa)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => excluirDespesa(despesa.id!)}
                        title="Excluir"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>{getObraNome(despesa.obra_id)}</TableCell>
                  <TableCell>{despesa.descricao}</TableCell>
                  <TableCell>
                    {getCategoriaIcon(despesa.categoria)} {despesa.categoria}
                  </TableCell>
                  <TableCell>
                    {getFornecedorNome(despesa.fornecedor_id)}
                  </TableCell>
                  <TableCell>{formatCurrency(despesa.valor)}</TableCell>
                  <TableCell>{formatDate(despesa.data_vencimento)}</TableCell>
                  <TableCell>
                    <Chip
                      label={despesa.status_pagamento}
                      color={getStatusColor(despesa.status_pagamento) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{despesa.forma_pagamento}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Criar/Editar Despesa */}
      <Dialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modoEdicao ? "✏️ Editar Despesa" : "➕ Nova Despesa"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Obra</InputLabel>
                <Select
                  value={formData.obra_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      obra_id: Number(e.target.value),
                    })
                  }
                >
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Fornecedor</InputLabel>
                <Select
                  value={formData.fornecedor_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fornecedor_id: Number(e.target.value),
                    })
                  }
                >
                  {fornecedores.map((fornecedor) => (
                    <MenuItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              required
              label="Descrição"
              value={formData.descricao || ""}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoria || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoria: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="MATERIAL">🏗️ Material</MenuItem>
                  <MenuItem value="MAO_DE_OBRA">👷 Mão de Obra</MenuItem>
                  <MenuItem value="IMPOSTO">📋 Imposto</MenuItem>
                  <MenuItem value="PARCEIRO">🤝 Parceiro</MenuItem>
                  <MenuItem value="OUTROS">📦 Outros</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                required
                type="number"
                label="Valor"
                value={formData.valor || ""}
                onChange={(e) => {
                  const novoValor = Number(e.target.value);
                  console.log("💰 Alterando valor da despesa:", novoValor);
                  console.log("💰 Valor anterior:", formData.valor);
                  setFormData({ ...formData, valor: novoValor });
                }}
                InputProps={{ startAdornment: "R$" }}
                placeholder="0.00"
                helperText="Informe o valor da despesa"
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Data de Vencimento"
                value={formData.data_vencimento || ""}
                onChange={(e) =>
                  setFormData({ ...formData, data_vencimento: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth required>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={formData.forma_pagamento || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forma_pagamento: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="A_VISTA">À Vista</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                  <MenuItem value="BOLETO">Boleto</MenuItem>
                  <MenuItem value="CARTAO">Cartão</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth required>
              <InputLabel>Status de Pagamento</InputLabel>
              <Select
                value={formData.status_pagamento || ""}
                onChange={(e) => {
                  const novoStatus = e.target.value as any;
                  setFormData({
                    ...formData,
                    status_pagamento: novoStatus,
                    // Se mudou para PAGO, preenche data_pagamento automaticamente
                    data_pagamento:
                      novoStatus === "PAGO"
                        ? formData.data_pagamento ||
                          new Date().toISOString().split("T")[0]
                        : formData.data_pagamento,
                  });
                }}
              >
                <MenuItem value="PENDENTE">Pendente</MenuItem>
                <MenuItem value="PAGO">Pago</MenuItem>
              </Select>
            </FormControl>

            {/* Campo condicional: Data de Pagamento (só aparece se status for PAGO) */}
            {formData.status_pagamento === "PAGO" && (
              <TextField
                fullWidth
                required
                type="date"
                label="Data de Pagamento"
                value={formData.data_pagamento || ""}
                onChange={(e) =>
                  setFormData({ ...formData, data_pagamento: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                helperText="Obrigatório quando status é PAGO"
              />
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={formData.observacao || ""}
              onChange={(e) =>
                setFormData({ ...formData, observacao: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvarDespesa}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Visualização */}
      <Dialog
        open={dialogVisualizacao}
        onClose={() => setDialogVisualizacao(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>👁️ Visualizar Despesa</DialogTitle>
        <DialogContent>
          {despesaSelecionada && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Obra"
                value={getObraNome(despesaSelecionada.obra_id)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Fornecedor"
                value={getFornecedorNome(despesaSelecionada.fornecedor_id)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Descrição"
                value={despesaSelecionada.descricao}
                InputProps={{ readOnly: true }}
                fullWidth
                multiline
                rows={2}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Categoria"
                  value={`${getCategoriaIcon(despesaSelecionada.categoria)} ${
                    despesaSelecionada.categoria
                  }`}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Valor"
                  value={formatCurrency(despesaSelecionada.valor)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Vencimento"
                  value={formatDate(despesaSelecionada.data_vencimento)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Status"
                  value={despesaSelecionada.status_pagamento}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Box>
              <TextField
                label="Forma de Pagamento"
                value={despesaSelecionada.forma_pagamento}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              {despesaSelecionada.observacao && (
                <TextField
                  label="Observações"
                  value={despesaSelecionada.observacao}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
              {despesaSelecionada.created_at && (
                <TextField
                  label="Data de Criação"
                  value={formatDate(despesaSelecionada.created_at)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogVisualizacao(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Despesas;
