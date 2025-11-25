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
import { receitaService } from "../services/receitaService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import type { Receita } from "../types/receita";
import type { Obra } from "../types/obra";
import type { Pessoa } from "../types/pessoa";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  validarValorMonetario,
  validarData,
  validarStringNaoVazia,
  validarTamanhoMinimo,
} from "../utils/validators";

const Receitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [responsaveis, setResponsaveis] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(
    null
  );
  const [modoEdicao, setModoEdicao] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    obra_id: "",
    fonte_receita: "",
    data_inicio: "",
    data_fim: "",
    responsavel_id: "",
  });

  // Formulário
  // ✅ FormData 100% compatível com Model Go
  const [formData, setFormData] = useState<Partial<Receita>>({
    obra_id: 0,
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    status: "a_receber",
    fonte_receita: "CONTRATO",
    numero_documento: "",
    responsavel_id: 0,
    observacao: "",
  });

  // Resumo financeiro
  const [resumo, setResumo] = useState({
    total: 0,
    recebido: 0,
    aReceber: 0,
    quantidade: 0,
  });

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cálculo do resumo financeiro
  const calcularResumo = React.useCallback(() => {
    // ✅ Garantir que receitas é um array
    const receitasArray = Array.isArray(receitas) ? receitas : [];
    const total = receitasArray.reduce((acc, r) => acc + (r.valor || 0), 0);
    const recebido = receitasArray
      .filter((r) => r.status === "recebido")
      .reduce((acc, r) => acc + (r.valor || 0), 0);
    const aReceber = receitasArray
      .filter((r) => r.status === "a_receber")
      .reduce((acc, r) => acc + (r.valor || 0), 0);

    setResumo({
      total,
      recebido,
      aReceber,
      quantidade: receitasArray.length,
    });
  }, [receitas]);

  useEffect(() => {
    calcularResumo();
  }, [receitas, calcularResumo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarReceitas(),
        carregarObras(),
        carregarResponsaveis(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const carregarReceitas = async () => {
    try {
      // ✅ Se filtrar apenas por obra, usar endpoint específico
      if (
        filtros.obra_id &&
        !filtros.fonte_receita &&
        !filtros.data_inicio &&
        !filtros.data_fim &&
        !filtros.responsavel_id
      ) {
        const data: any = await receitaService.buscarPorObra(
          parseInt(filtros.obra_id)
        );
        const receitasArray = Array.isArray(data) ? data : data?.data || [];
        setReceitas(receitasArray);
        return;
      }

      // ✅ Caso contrário, usar endpoint com query params
      const params: any = {};
      if (filtros.obra_id) params.obra_id = parseInt(filtros.obra_id);
      if (filtros.fonte_receita) params.fonte_receita = filtros.fonte_receita;
      if (filtros.data_inicio) params.data_inicio = filtros.data_inicio;
      if (filtros.data_fim) params.data_fim = filtros.data_fim;
      if (filtros.responsavel_id)
        params.responsavel_id = parseInt(filtros.responsavel_id);

      const data: any = await receitaService.listar(params);
      // ✅ Garantir que sempre seja um array
      const receitasArray = Array.isArray(data) ? data : data?.data || [];
      setReceitas(receitasArray);
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
      toast.error("Erro ao carregar receitas");
      setReceitas([]); // ✅ Definir array vazio em caso de erro
    }
  };

  const carregarObras = async () => {
    try {
      const data: any = await obraService.listar();
      setObras(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
    }
  };

  const carregarResponsaveis = async () => {
    try {
      const data: any = await pessoaService.listar();
      setResponsaveis(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    }
  };

  const handleAbrirDialogCadastro = () => {
    setModoEdicao(false);
    setReceitaSelecionada(null);
    setFormData({
      obra_id: 0,
      descricao: "",
      valor: 0,
      data: new Date().toISOString().split("T")[0],
      status: "a_receber",
      fonte_receita: "CONTRATO",
      numero_documento: "",
      responsavel_id: 0,
      observacao: "",
    });
    setDialogAberto(true);
  };

  const handleAbrirDialogEdicao = async (receita: Receita) => {
    try {
      setLoading(true);
      const receitaCompleta = await receitaService.buscarPorId(receita.id!);

      setModoEdicao(true);
      setReceitaSelecionada(receitaCompleta);

      // ✅ Garantir conversão correta da data
      let dataFormatada = new Date().toISOString().split("T")[0];

      if (receitaCompleta.data) {
        try {
          if (typeof receitaCompleta.data === "string") {
            dataFormatada = receitaCompleta.data.split("T")[0];
          } else {
            // Se for Date ou outro tipo, converte para string primeiro
            const dataStr = String(receitaCompleta.data);
            dataFormatada = new Date(dataStr).toISOString().split("T")[0];
          }
        } catch (e) {
          console.warn("Erro ao formatar data, usando data atual:", e);
        }
      }

      setFormData({
        obra_id: receitaCompleta.obra_id,
        descricao: receitaCompleta.descricao,
        valor: receitaCompleta.valor,
        data: dataFormatada,
        status: receitaCompleta.status || "a_receber",
        fonte_receita: receitaCompleta.fonte_receita || "CONTRATO",
        numero_documento: receitaCompleta.numero_documento || "",
        responsavel_id: receitaCompleta.responsavel_id || 0,
        observacao:
          receitaCompleta.observacao || receitaCompleta.observacoes || "",
      });
      setDialogAberto(true);
    } catch (error) {
      console.error("Erro ao carregar receita:", error);
      toast.error("Erro ao carregar dados da receita");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDialogVisualizacao = async (receita: Receita) => {
    try {
      setLoading(true);
      const receitaCompleta = await receitaService.buscarPorId(receita.id!);
      setReceitaSelecionada(receitaCompleta);
      setDialogVisualizacao(true);
    } catch (error) {
      console.error("Erro ao carregar receita:", error);
      toast.error("Erro ao carregar dados da receita");
    } finally {
      setLoading(false);
    }
  };

  const handleFecharDialog = () => {
    setDialogAberto(false);
    setDialogVisualizacao(false);
    setReceitaSelecionada(null);
    setModoEdicao(false);
  };

  const handleSalvar = async () => {
    try {
      // ✅ VALIDAÇÕES COMPLETAS ANTES DE SALVAR
      // 1. Validar obra selecionada
      if (!formData.obra_id || formData.obra_id === 0) {
        toast.error("Selecione a obra");
        return;
      }

      // 2. Validar descrição (mínimo 3 caracteres, não vazia)
      if (!validarStringNaoVazia(formData.descricao || "")) {
        toast.error("Informe a descrição da receita");
        return;
      }
      if (!validarTamanhoMinimo(formData.descricao || "", 3)) {
        toast.error("Descrição deve ter pelo menos 3 caracteres");
        return;
      }

      // 3. Validar valor monetário (maior que 0)
      if (!validarValorMonetario(formData.valor || 0)) {
        toast.error("Informe um valor maior que zero");
        return;
      }

      // 4. Validar data
      if (!formData.data || !validarData(formData.data)) {
        const labelData =
          formData.status === "recebido"
            ? "data de recebimento"
            : "data prevista";
        toast.error(`Informe a ${labelData}`);
        return;
      }

      setLoading(true);

      // ✅ Payload 100% compatível com Model Go (9 campos)
      const receitaParaSalvar: Receita = {
        obra_id: formData.obra_id,
        descricao: formData.descricao!,
        valor: formData.valor!,
        data: formData.data!,
        status: formData.status || "a_receber",
        fonte_receita: formData.fonte_receita || "CONTRATO",
        numero_documento: formData.numero_documento || "",
        responsavel_id: formData.responsavel_id || undefined,
        observacao: formData.observacao || "",
      };

      if (modoEdicao && receitaSelecionada?.id) {
        await receitaService.atualizar(
          receitaSelecionada.id,
          receitaParaSalvar
        );
        toast.success("Receita atualizada com sucesso!");
      } else {
        await receitaService.criar(receitaParaSalvar);
        toast.success("Receita cadastrada com sucesso!");
      }

      handleFecharDialog();
      await carregarReceitas();
    } catch (error: any) {
      console.error("Erro ao salvar receita:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar receita");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Confirma a exclusão desta receita?")) {
      try {
        setLoading(true);
        await receitaService.deletar(id);
        toast.success("Receita excluída com sucesso!");
        await carregarReceitas();
      } catch (error) {
        console.error("Erro ao excluir receita:", error);
        toast.error("Erro ao excluir receita");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({
      obra_id: "",
      fonte_receita: "",
      data_inicio: "",
      data_fim: "",
      responsavel_id: "",
    });
  };

  const getChipColorFonteReceita = (fonte?: string) => {
    switch (fonte) {
      case "CONTRATO":
        return "success";
      case "PAGAMENTO_CLIENTE":
        return "primary";
      case "ADIANTAMENTO":
        return "warning";
      case "FINANCIAMENTO":
        return "info";
      case "MEDICAO":
        return "secondary";
      case "OUTROS":
      default:
        return "default";
    }
  };

  const getFonteReceitaLabel = (fonte?: string) => {
    const labels: Record<string, string> = {
      CONTRATO: "Contrato",
      PAGAMENTO_CLIENTE: "Pagamento Cliente",
      ADIANTAMENTO: "Adiantamento",
      FINANCIAMENTO: "Financiamento",
      MEDICAO: "Medição",
      OUTROS: "Outros",
    };
    return labels[fonte || ""] || fonte || "Não informado";
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "recebido":
      case "RECEBIDO":
        return "Recebido";
      case "a_receber":
      case "A_RECEBER":
        return "A Receber";
      case "cancelado":
      case "CANCELADO":
        return "Cancelado";
      default:
        return "Não informado";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "recebido":
      case "RECEBIDO":
        return "success";
      case "a_receber":
      case "A_RECEBER":
        return "warning";
      case "cancelado":
      case "CANCELADO":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Receitas
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleAbrirDialogCadastro}
        >
          Nova Receita
        </Button>
      </Box>

      {/* Resumo Financeiro */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo Financeiro
        </Typography>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total de Receitas
            </Typography>
            <Typography variant="h5">{formatCurrency(resumo.total)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Recebido (Caixa)
            </Typography>
            <Typography variant="h5" color="success.main">
              {formatCurrency(resumo.recebido)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              A Receber (Previsto)
            </Typography>
            <Typography variant="h5" color="warning.main">
              {formatCurrency(resumo.aReceber)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Quantidade
            </Typography>
            <Typography variant="h5">{resumo.quantidade}</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Obra</InputLabel>
            <Select
              value={filtros.obra_id}
              onChange={(e) =>
                setFiltros({ ...filtros, obra_id: e.target.value })
              }
              label="Obra"
            >
              <MenuItem value="">Todas</MenuItem>
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id}>
                  {obra.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Fonte de Receita</InputLabel>
            <Select
              value={filtros.fonte_receita}
              onChange={(e) =>
                setFiltros({ ...filtros, fonte_receita: e.target.value })
              }
              label="Fonte de Receita"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="CONTRATO">Contrato</MenuItem>
              <MenuItem value="PAGAMENTO_CLIENTE">Pagamento Cliente</MenuItem>
              <MenuItem value="ADIANTAMENTO">Adiantamento</MenuItem>
              <MenuItem value="FINANCIAMENTO">Financiamento</MenuItem>
              <MenuItem value="MEDICAO">Medição</MenuItem>
              <MenuItem value="OUTROS">Outros</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Responsável</InputLabel>
            <Select
              value={filtros.responsavel_id}
              onChange={(e) =>
                setFiltros({ ...filtros, responsavel_id: e.target.value })
              }
              label="Responsável"
            >
              <MenuItem value="">Todos</MenuItem>
              {responsaveis.map((pessoa) => (
                <MenuItem key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Data Início"
            type="date"
            value={filtros.data_inicio}
            onChange={(e) =>
              setFiltros({ ...filtros, data_inicio: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Data Fim"
            type="date"
            value={filtros.data_fim}
            onChange={(e) =>
              setFiltros({ ...filtros, data_fim: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={carregarReceitas}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleLimparFiltros}
          >
            Limpar
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Receitas */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : receitas.length === 0 ? (
        <Alert severity="info">Nenhuma receita encontrada</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Obra</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Fonte</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receitas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell>{receita.id}</TableCell>
                  <TableCell>
                    {receita.obra_nome || receita.obraNome || "-"}
                  </TableCell>
                  <TableCell>{receita.descricao}</TableCell>
                  <TableCell>
                    <Chip
                      label={getFonteReceitaLabel(
                        receita.fonte_receita || receita.fonteReceita
                      )}
                      color={getChipColorFonteReceita(
                        receita.fonte_receita || receita.fonteReceita
                      )}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(receita.status)}
                      color={getStatusColor(receita.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="success.main" fontWeight="bold">
                      {formatCurrency(receita.valor)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(receita.data)}</TableCell>
                  <TableCell>
                    {receita.responsavel_nome || receita.responsavelNome || "-"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleAbrirDialogVisualizacao(receita)}
                      title="Visualizar"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="warning"
                      onClick={() => handleAbrirDialogEdicao(receita)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleExcluir(receita.id!)}
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Cadastro/Edição */}
      <Dialog
        open={dialogAberto}
        onClose={handleFecharDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modoEdicao ? "Editar Receita" : "Nova Receita"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Obra</InputLabel>
              <Select
                value={formData.obra_id}
                onChange={(e) =>
                  setFormData({ ...formData, obra_id: Number(e.target.value) })
                }
                label="Obra"
              >
                <MenuItem value={0}>Selecione...</MenuItem>
                {obras.map((obra) => (
                  <MenuItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              required
              fullWidth
              multiline
              rows={2}
              inputProps={{ maxLength: 500 }}
              helperText={`${
                (formData.descricao || "").length
              }/500 caracteres (mínimo 3)`}
            />

            <TextField
              label="Valor (R$)"
              type="number"
              value={formData.valor}
              onChange={(e) =>
                setFormData({ ...formData, valor: Number(e.target.value) })
              }
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                label="Status"
              >
                <MenuItem value="a_receber">A Receber</MenuItem>
                <MenuItem value="recebido">Recebido</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={
                formData.status === "recebido"
                  ? "Data de Recebimento"
                  : "Data Prevista"
              }
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData({ ...formData, data: e.target.value })
              }
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText={
                formData.status === "recebido"
                  ? "Data em que o valor foi efetivamente recebido"
                  : "Data prevista para recebimento"
              }
            />

            <FormControl fullWidth required>
              <InputLabel>Fonte de Receita</InputLabel>
              <Select
                value={formData.fonte_receita}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fonte_receita: e.target.value as any,
                  })
                }
                label="Fonte de Receita"
              >
                <MenuItem value="CONTRATO">Contrato</MenuItem>
                <MenuItem value="PAGAMENTO_CLIENTE">Pagamento Cliente</MenuItem>
                <MenuItem value="ADIANTAMENTO">Adiantamento</MenuItem>
                <MenuItem value="FINANCIAMENTO">Financiamento</MenuItem>
                <MenuItem value="MEDICAO">Medição</MenuItem>
                <MenuItem value="OUTROS">Outros</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Número do Documento"
              value={formData.numero_documento}
              onChange={(e) =>
                setFormData({ ...formData, numero_documento: e.target.value })
              }
              fullWidth
              placeholder="Nº do contrato, nota fiscal, etc."
              inputProps={{ maxLength: 100 }}
            />

            <FormControl fullWidth>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={formData.responsavel_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsavel_id: Number(e.target.value),
                  })
                }
                label="Responsável"
              >
                <MenuItem value={0}>Não informado</MenuItem>
                {responsaveis.map((pessoa) => (
                  <MenuItem key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Observações"
              value={formData.observacao || ""}
              onChange={(e) =>
                setFormData({ ...formData, observacao: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="Observações adicionais sobre a receita..."
              inputProps={{ maxLength: 500 }}
              helperText={`${
                (formData.observacao || "").length
              }/500 caracteres`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog
        open={dialogVisualizacao}
        onClose={handleFecharDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes da Receita</DialogTitle>
        <DialogContent>
          {receitaSelecionada && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID
                </Typography>
                <Typography variant="body1">{receitaSelecionada.id}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Obra
                </Typography>
                <Typography variant="body1">
                  {receitaSelecionada.obra_nome ||
                    receitaSelecionada.obraNome ||
                    "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body1">
                  {receitaSelecionada.descricao}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Valor
                </Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(receitaSelecionada.valor)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Data de Recebimento
                </Typography>
                <Typography variant="body1">
                  {formatDate(receitaSelecionada.data)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusLabel(receitaSelecionada.status)}
                    color={getStatusColor(receitaSelecionada.status)}
                  />
                </Box>
              </Box>

              {receitaSelecionada.data_pagamento_programado && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Data de Pagamento Programado
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(receitaSelecionada.data_pagamento_programado)}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fonte de Receita
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getFonteReceitaLabel(
                      receitaSelecionada.fonte_receita ||
                        receitaSelecionada.fonteReceita
                    )}
                    color={getChipColorFonteReceita(
                      receitaSelecionada.fonte_receita ||
                        receitaSelecionada.fonteReceita
                    )}
                  />
                </Box>
              </Box>

              {receitaSelecionada.numero_documento && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Número do Documento
                  </Typography>
                  <Typography variant="body1">
                    {receitaSelecionada.numero_documento ||
                      receitaSelecionada.numeroDocumento}
                  </Typography>
                </Box>
              )}

              {(receitaSelecionada.responsavel_nome ||
                receitaSelecionada.responsavelNome) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Responsável
                  </Typography>
                  <Typography variant="body1">
                    {receitaSelecionada.responsavel_nome ||
                      receitaSelecionada.responsavelNome}
                  </Typography>
                </Box>
              )}

              {(receitaSelecionada.observacao ||
                receitaSelecionada.observacoes) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Observações
                  </Typography>
                  <Typography variant="body1">
                    {receitaSelecionada.observacao ||
                      receitaSelecionada.observacoes}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Data de Cadastro
                </Typography>
                <Typography variant="body1">
                  {receitaSelecionada.created_at || receitaSelecionada.createdAt
                    ? formatDate(
                        receitaSelecionada.created_at ||
                          receitaSelecionada.createdAt
                      )
                    : "-"}
                </Typography>
              </Box>

              {(receitaSelecionada.updated_at ||
                receitaSelecionada.updatedAt) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Última Atualização
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(
                      receitaSelecionada.updated_at ||
                        receitaSelecionada.updatedAt
                    )}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Receitas;
