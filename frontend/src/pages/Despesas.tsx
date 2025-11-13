import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  IconButton,
  SelectChangeEvent,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import type { Despesa } from "../types/despesa";
import { despesaService } from "../services/despesaService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import type { Obra } from "../types/obra";
import type { Pessoa } from "../types/pessoa";
import {
  validarStringNaoVazia,
  validarValorMonetario,
  validarData,
} from "../utils/validators";

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Funções auxiliares de conversão entre frontend e backend
const categoriaParaFrontend = (categoria: string): string => {
  const mapa: Record<string, string> = {
    MATERIAL: "Material",
    MAO_DE_OBRA: "Mão de Obra",
    IMPOSTO: "Imposto",
    PARCEIRO: "Parceiro",
    OUTROS: "Outros",
  };
  return mapa[categoria] || categoria;
};

const categoriaParaBackend = (categoria: string): string => {
  const mapa: Record<string, string> = {
    Material: "MATERIAL",
    "Mão de Obra": "MAO_DE_OBRA",
    Imposto: "IMPOSTO",
    Parceiro: "PARCEIRO",
    Outros: "OUTROS",
  };
  return mapa[categoria] || categoria;
};

const formaPagamentoParaFrontend = (forma: string): string => {
  const mapa: Record<string, string> = {
    A_VISTA: "À Vista",
    PIX: "PIX",
    BOLETO: "Boleto",
    CARTAO: "Cartão",
  };
  return mapa[forma] || forma;
};

const statusParaFrontend = (status: string): string => {
  return status.charAt(0) + status.slice(1).toLowerCase(); // "PENDENTE" -> "Pendente"
};

const statusParaBackend = (status: string): string => {
  const mapa: Record<string, string> = {
    Pendente: "PENDENTE",
    Pago: "PAGO",
  };
  return mapa[status] || status.toUpperCase();
};

const Despesas: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Modais
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [despesaVisualizando, setDespesaVisualizando] =
    useState<Despesa | null>(null);
  const [despesaEditando, setDespesaEditando] = useState<Despesa | null>(null);

  // Estado do formulário de cadastro
  const [novaDespesa, setNovaDespesa] = useState<Despesa>({
    obra_id: 0,
    fornecedor_id: 0,
    pessoa_id: 0,
    descricao: "",
    categoria: "MATERIAL",
    valor: 0,
    data_vencimento: new Date().toISOString().split("T")[0],
    forma_pagamento: "PIX",
    status_pagamento: "PENDENTE",
    data_pagamento: "",
    responsavel_pagamento: "",
    observacao: "",
  });

  // Estado dos filtros de busca
  const [filtros, setFiltros] = useState({
    obraId: "",
    categoria: "",
    statusPagamento: "",
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    await Promise.all([carregarDespesas(), carregarObras(), carregarPessoas()]);
  };

  const carregarDespesas = async () => {
    try {
      const response = await despesaService.listar();
      console.log("📊 Despesas carregadas:", response);

      // Extrair array de despesas da resposta
      // O cast para `any` é usado para lidar com formatos de resposta diferentes
      // (ex.: { data: [...] } ou [...] ) sem causar erro de tipagem em build de produção
      const despesasArray = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : [];

      // Converter dados do backend (UPPERCASE) para frontend (friendly)
      const despesasConvertidas = despesasArray.map((d: any) => ({
        ...d,
        categoria: categoriaParaFrontend(d.categoria || ""),
        formaPagamento: formaPagamentoParaFrontend(
          d.forma_pagamento || d.formaPagamento || ""
        ),
        statusPagamento: statusParaFrontend(
          d.status_pagamento || d.statusPagamento || ""
        ),
        // Converter datas ISO para formato brasileiro se necessário
        dataPagamento: d.data_pagamento ? d.data_pagamento.split("T")[0] : "",
      }));

      setDespesas(despesasConvertidas);
      toast.success(`✅ ${despesasConvertidas.length} despesa(s) carregada(s)`);
    } catch (error: any) {
      console.error("❌ Erro ao carregar despesas:", error);
      toast.error("❌ Erro ao carregar despesas");
      setDespesas([]);
    }
  };

  const carregarObras = async () => {
    try {
      const data = await obraService.listar();
      setObras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Erro ao carregar obras:", error);
    }
  };

  const carregarPessoas = async () => {
    try {
      const data = await pessoaService.listar();
      setPessoas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Erro ao carregar pessoas:", error);
    }
  };

  const handleNovaDespesaChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setNovaDespesa({ ...novaDespesa, [name as string]: value });
  };

  const handleCadastrar = async () => {
    // Validações completas
    if (
      !novaDespesa.obra_id ||
      novaDespesa.obra_id === 0 ||
      !novaDespesa.obraId ||
      novaDespesa.obraId === 0
    ) {
      toast.error("⚠️ Selecione a obra");
      return;
    }

    if (
      !novaDespesa.descricao ||
      !validarStringNaoVazia(novaDespesa.descricao)
    ) {
      toast.error("⚠️ Preencha a descrição da despesa");
      return;
    }

    if (novaDespesa.descricao.length < 3) {
      toast.error("⚠️ Descrição deve ter no mínimo 3 caracteres");
      return;
    }

    if (!novaDespesa.valor || !validarValorMonetario(novaDespesa.valor)) {
      toast.error("⚠️ Valor da despesa deve ser maior que zero");
      return;
    }

    if (novaDespesa.valor <= 0) {
      toast.error("⚠️ Valor da despesa deve ser positivo");
      return;
    }

    // Validar data de vencimento
    if (
      novaDespesa.data_vencimento &&
      !validarData(novaDespesa.data_vencimento)
    ) {
      toast.error("⚠️ Data de vencimento inválida");
      return;
    }

    try {
      setSalvando(true);

      // Encontrar a obra selecionada
      const obraSelecionada = obras.find(
        (o) => o.id === Number(novaDespesa.obraId)
      );
      if (!obraSelecionada) {
        toast.error("❌ Obra não encontrada");
        setSalvando(false);
        return;
      }

      // Montar payload conforme esperado pelo backend Go
      // Go SEMPRE espera ISO 8601 com hora: "2006-01-02T15:04:05Z07:00"
      const dataFormatada =
        novaDespesa.data_vencimento && novaDespesa.data_vencimento.trim() !== ""
          ? `${novaDespesa.data_vencimento}T00:00:00Z` // "2025-10-31T00:00:00Z"
          : new Date().toISOString(); // "2025-10-29T14:30:00.000Z"

      const despesaData: any = {
        obra_id: Number(novaDespesa.obra_id),
        descricao: novaDespesa.descricao,
        categoria: novaDespesa.categoria,
        valor: Number(novaDespesa.valor),
        forma_pagamento: novaDespesa.forma_pagamento,
        status_pagamento: novaDespesa.status_pagamento,
        // Campo obrigatório com formato ISO 8601 completo
        data_vencimento: dataFormatada,
        data: dataFormatada, // ✅ Data da despesa/compra
      };

      // REGRA: Se status é PAGO, data_pagamento é OBRIGATÓRIA
      if (novaDespesa.status_pagamento === "PAGO") {
        despesaData.data_pagamento = dataFormatada;
      }

      // Campos opcionais
      if (novaDespesa.fornecedor_id && novaDespesa.fornecedor_id > 0) {
        despesaData.fornecedor_id = Number(novaDespesa.fornecedor_id);
      }

      if (novaDespesa.pessoa_id && novaDespesa.pessoa_id > 0) {
        despesaData.pessoa_id = Number(novaDespesa.pessoa_id);
      }

      if (novaDespesa.responsavel_pagamento) {
        despesaData.responsavel_pagamento = novaDespesa.responsavel_pagamento;
      }

      if (novaDespesa.observacao || novaDespesa.observacoes) {
        despesaData.observacao =
          novaDespesa.observacao || novaDespesa.observacoes;
      }

      // IMPORTANTE: Remover qualquer campo undefined/null antes de enviar
      Object.keys(despesaData).forEach((key) => {
        if (
          despesaData[key] === undefined ||
          despesaData[key] === null ||
          despesaData[key] === ""
        ) {
          delete despesaData[key];
        }
      });

      console.log(
        "📤 Enviando despesa para API Go:",
        JSON.stringify(despesaData, null, 2)
      );
      await despesaService.criar(despesaData);
      toast.success("✅ Despesa cadastrada com sucesso!");

      // Limpar formulário
      setNovaDespesa({
        obra_id: 0,
        fornecedor_id: 0,
        descricao: "",
        categoria: "MATERIAL",
        valor: 0,
        data_vencimento: new Date().toISOString().split("T")[0],
        forma_pagamento: "PIX",
        status_pagamento: "PENDENTE",
        data_pagamento: "",
        observacoes: "",
      });

      // Recarregar despesas
      carregarDespesas();
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar despesa:", error);
      console.error("📋 Resposta do servidor:", error.response?.data);
      console.error("📋 Status:", error.response?.status);
      console.error("📋 Headers:", error.response?.headers);
      const mensagem =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro ao cadastrar despesa";
      toast.error(`❌ ${mensagem}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleFiltroChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name as string]: value });
  };

  const handleBuscar = async () => {
    try {
      setBuscando(true);
      const params: any = {};

      // Converter filtros para formato do backend Go
      if (filtros.obraId) params.obra_id = Number(filtros.obraId);
      if (filtros.categoria)
        params.categoria = categoriaParaBackend(filtros.categoria);
      if (filtros.statusPagamento)
        params.status_pagamento = statusParaBackend(filtros.statusPagamento);
      if (filtros.dataInicio)
        params.data_inicio = `${filtros.dataInicio}T00:00:00Z`;
      if (filtros.dataFim) params.data_fim = `${filtros.dataFim}T23:59:59Z`;

      console.log("🔍 Buscando despesas com filtros:", params);
      const response = await despesaService.listar(params);

      // Extrair array de despesas da resposta (response.data ou response)
      const despesasArray = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : [];

      // Converter dados do backend (UPPERCASE) para frontend (friendly)
      const despesasConvertidas = despesasArray.map((d: any) => ({
        ...d,
        categoria: categoriaParaFrontend(d.categoria || ""),
        formaPagamento: formaPagamentoParaFrontend(
          d.forma_pagamento || d.formaPagamento || ""
        ),
        statusPagamento: statusParaFrontend(
          d.status_pagamento || d.statusPagamento || ""
        ),
        dataPagamento: d.data_pagamento ? d.data_pagamento.split("T")[0] : "",
      }));

      console.log("📊 Despesas encontradas:", despesasConvertidas);
      setDespesas(despesasConvertidas);
      toast.success(
        `🔍 ${despesasConvertidas.length} despesa(s) encontrada(s)`
      );
    } catch (error: any) {
      console.error("❌ Erro ao buscar despesas:", error);
      console.error("📋 Resposta do servidor:", error.response?.data);
      toast.error("❌ Erro ao buscar despesas");
      setDespesas([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleLimpar = () => {
    setFiltros({
      obraId: "",
      categoria: "",
      statusPagamento: "",
      dataInicio: "",
      dataFim: "",
    });
    carregarDespesas();
    toast.info("🔄 Filtros limpos");
  };

  const handleVisualizar = async (id: number) => {
    try {
      const despesa = await despesaService.buscarPorId(id.toString());
      setDespesaVisualizando(despesa);
      setViewModalOpen(true);
    } catch (error: any) {
      console.error("❌ Erro ao carregar despesa:", error);
      toast.error("❌ Erro ao carregar dados da despesa");
    }
  };

  const handleEditar = async (id: number) => {
    try {
      const despesa = await despesaService.buscarPorId(id.toString());
      setDespesaEditando(despesa);
      setEditModalOpen(true);
    } catch (error: any) {
      console.error("❌ Erro ao carregar despesa:", error);
      toast.error("❌ Erro ao carregar dados da despesa");
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

    try {
      await despesaService.deletar(id.toString());
      toast.success("✅ Despesa excluída com sucesso!");
      carregarDespesas();
    } catch (error: any) {
      console.error("❌ Erro ao excluir despesa:", error);
      toast.error("❌ Erro ao excluir despesa");
    }
  };

  const handleFecharModalVisualizacao = () => {
    setViewModalOpen(false);
    setDespesaVisualizando(null);
  };

  const handleFecharModalEdicao = () => {
    setEditModalOpen(false);
    setDespesaEditando(null);
  };

  const handleSalvarEdicao = async () => {
    if (!despesaEditando) return;

    try {
      setSalvando(true);

      // ✅ Usar snake_case conforme Model Go
      const dadosAtualizados: any = {
        obra_id: despesaEditando.obra_id || despesaEditando.obraId,
        descricao: despesaEditando.descricao,
        categoria: despesaEditando.categoria,
        valor: despesaEditando.valor,
        forma_pagamento:
          despesaEditando.forma_pagamento || despesaEditando.formaPagamento,
        status_pagamento:
          despesaEditando.status_pagamento || despesaEditando.statusPagamento,
        data_vencimento:
          despesaEditando.data_vencimento || despesaEditando.dataVencimento,
        data: despesaEditando.data || despesaEditando.dataCadastro,
        data_pagamento:
          despesaEditando.data_pagamento ||
          despesaEditando.dataPagamento ||
          undefined,
        responsavel_pagamento:
          despesaEditando.responsavel_pagamento ||
          despesaEditando.responsavelPagamento ||
          undefined,
        observacao:
          despesaEditando.observacao ||
          despesaEditando.observacoes ||
          undefined,
      };

      // Campos opcionais (IDs)
      if (despesaEditando.fornecedor_id || despesaEditando.fornecedorId) {
        dadosAtualizados.fornecedor_id =
          despesaEditando.fornecedor_id || despesaEditando.fornecedorId;
      }

      if (despesaEditando.pessoa_id || despesaEditando.pessoaId) {
        dadosAtualizados.pessoa_id =
          despesaEditando.pessoa_id || despesaEditando.pessoaId;
      }

      // Remover campos undefined
      Object.keys(dadosAtualizados).forEach((key) => {
        if (dadosAtualizados[key] === undefined) {
          delete dadosAtualizados[key];
        }
      });

      await despesaService.atualizar(
        despesaEditando.id!.toString(),
        dadosAtualizados
      );
      toast.success("✅ Despesa atualizada com sucesso!");
      handleFecharModalEdicao();
      carregarDespesas();
    } catch (error: any) {
      console.error("❌ Erro ao atualizar despesa:", error);
      const mensagem =
        error.response?.data?.error || "Erro ao atualizar despesa";
      toast.error(`❌ ${mensagem}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleCampoChange = (campo: keyof Despesa, valor: any) => {
    if (despesaEditando) {
      setDespesaEditando({
        ...despesaEditando,
        [campo]: valor,
      });
    }
  };

  // Calcular total
  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
  const totalPago = despesas
    .filter((d) => d.statusPagamento === "Pago")
    .reduce((sum, d) => sum + d.valor, 0);
  const totalPendente = despesas
    .filter((d) => d.statusPagamento === "Pendente")
    .reduce((sum, d) => sum + d.valor, 0);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Cadastrar Despesa" />
          <Tab label="Buscar Despesas" />
        </Tabs>
      </Box>

      {/* ABA 1: CADASTRAR */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cadastrar Nova Despesa
          </Typography>

          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Obra</InputLabel>
              <Select
                name="obra_id"
                value={novaDespesa.obra_id?.toString() || "0"}
                onChange={handleNovaDespesaChange}
              >
                <MenuItem value={0}>Selecione uma obra</MenuItem>
                {obras.map((obra) => (
                  <MenuItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Descrição"
              name="descricao"
              value={novaDespesa.descricao}
              onChange={handleNovaDespesaChange}
              placeholder="Ex: CIMENTO (40 SACOS)"
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoria"
                  value={novaDespesa.categoria}
                  onChange={handleNovaDespesaChange}
                >
                  <MenuItem value="MATERIAL">Material</MenuItem>
                  <MenuItem value="MAO_DE_OBRA">Mão de Obra</MenuItem>
                  <MenuItem value="IMPOSTO">Imposto</MenuItem>
                  <MenuItem value="PARCEIRO">Parceiro</MenuItem>
                  <MenuItem value="OUTROS">Outros</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                type="number"
                label="Valor (R$)"
                name="valor"
                value={novaDespesa.valor}
                onChange={handleNovaDespesaChange}
                InputProps={{ startAdornment: "R$" }}
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  name="forma_pagamento"
                  value={novaDespesa.forma_pagamento}
                  onChange={handleNovaDespesaChange}
                >
                  <MenuItem value="A_VISTA">À Vista</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                  <MenuItem value="BOLETO">Boleto</MenuItem>
                  <MenuItem value="CARTAO">Cartão</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Status do Pagamento</InputLabel>
                <Select
                  name="status_pagamento"
                  value={novaDespesa.status_pagamento}
                  onChange={handleNovaDespesaChange}
                >
                  <MenuItem value="PENDENTE">Pendente</MenuItem>
                  <MenuItem value="PAGO">Pago</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Data de Vencimento"
                name="data_vencimento"
                value={novaDespesa.data_vencimento}
                onChange={handleNovaDespesaChange}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth>
                <InputLabel>Fornecedor</InputLabel>
                <Select
                  name="fornecedor_id"
                  value={novaDespesa.fornecedor_id?.toString() || "0"}
                  onChange={handleNovaDespesaChange}
                >
                  <MenuItem value={0}>Selecione um fornecedor</MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* ✅ Pessoa (para Mão de Obra) */}
            <FormControl fullWidth>
              <InputLabel>Pessoa (Mão de Obra)</InputLabel>
              <Select
                name="pessoa_id"
                value={novaDespesa.pessoa_id?.toString() || "0"}
                onChange={handleNovaDespesaChange}
              >
                <MenuItem value={0}>Nenhuma</MenuItem>
                {pessoas.map((pessoa) => (
                  <MenuItem key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ✅ Responsável pelo Pagamento */}
            <TextField
              fullWidth
              label="Responsável pelo Pagamento"
              name="responsavel_pagamento"
              value={novaDespesa.responsavel_pagamento || ""}
              onChange={handleNovaDespesaChange}
              placeholder="Nome de quem efetuou o pagamento"
            />

            {/* ✅ Observações */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              name="observacao"
              value={novaDespesa.observacao || novaDespesa.observacoes || ""}
              onChange={handleNovaDespesaChange}
              placeholder="Observações adicionais sobre a despesa..."
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() =>
                  setNovaDespesa({
                    obra_id: 0,
                    fornecedor_id: 0,
                    pessoa_id: 0,
                    descricao: "",
                    categoria: "MATERIAL",
                    valor: 0,
                    data_vencimento: new Date().toISOString().split("T")[0],
                    forma_pagamento: "PIX",
                    status_pagamento: "PENDENTE",
                    data_pagamento: "",
                    responsavel_pagamento: "",
                    observacao: "",
                  })
                }
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={handleCadastrar}
                disabled={salvando}
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                {salvando ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Cadastrar Despesa"
                )}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </TabPanel>

      {/* ABA 2: BUSCAR */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>

          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Obra</InputLabel>
                <Select
                  name="obra_id"
                  value={filtros.obraId}
                  onChange={handleFiltroChange}
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

              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoria"
                  value={filtros.categoria}
                  onChange={handleFiltroChange}
                  label="Categoria"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="Material">Material</MenuItem>
                  <MenuItem value="Mão de Obra">Mão de Obra</MenuItem>
                  <MenuItem value="Imposto">Imposto</MenuItem>
                  <MenuItem value="Parceiro">Parceiro</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="statusPagamento"
                  value={filtros.statusPagamento}
                  onChange={handleFiltroChange}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Pendente">Pendente</MenuItem>
                  <MenuItem value="Pago">Pago</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Data Início"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Data Fim"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleLimpar}
                disabled={buscando}
                sx={{
                  color: "#666",
                  borderColor: "#666",
                  "&:hover": {
                    borderColor: "#333",
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={buscando}
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                {buscando ? "Buscando..." : "Buscar"}
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Resumo Financeiro */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resumo Financeiro
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ mt: 2 }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total de Despesas
              </Typography>
              <Typography variant="h5" color="primary">
                R$ {totalDespesas.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Pago
              </Typography>
              <Typography variant="h5" color="success.main">
                R$ {totalPago.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Pendente
              </Typography>
              <Typography variant="h5" color="error.main">
                R$ {totalPendente.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Tabela de Resultados */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultados ({despesas.length})
          </Typography>

          {despesas.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              Nenhuma despesa encontrada
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "16px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#c62828", color: "white" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Ação</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Obra</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Descrição
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Categoria
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Valor
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Forma Pagto
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Data Pagto
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Responsável
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.map((despesa) => (
                    <tr
                      key={despesa.id}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: "white",
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleVisualizar(despesa.id!)}
                            sx={{
                              backgroundColor: "#2196f3",
                              color: "white",
                              "&:hover": { backgroundColor: "#1976d2" },
                              width: 32,
                              height: 32,
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditar(despesa.id!)}
                            sx={{
                              backgroundColor: "#ff9800",
                              color: "white",
                              "&:hover": { backgroundColor: "#f57c00" },
                              width: 32,
                              height: 32,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleExcluir(despesa.id!)}
                            sx={{
                              backgroundColor: "#f44336",
                              color: "white",
                              "&:hover": { backgroundColor: "#d32f2f" },
                              width: 32,
                              height: 32,
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </td>
                      <td style={{ padding: "12px" }}>{despesa.id}</td>
                      <td style={{ padding: "12px" }}>{despesa.obraNome}</td>
                      <td style={{ padding: "12px" }}>{despesa.descricao}</td>
                      <td style={{ padding: "12px" }}>{despesa.categoria}</td>
                      <td style={{ padding: "12px" }}>
                        R$ {despesa.valor.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {despesa.formaPagamento}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Box
                          component="span"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                            backgroundColor:
                              despesa.statusPagamento === "Pago"
                                ? "#4caf50"
                                : "#ff9800",
                            color: "white",
                          }}
                        >
                          {despesa.statusPagamento}
                        </Box>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {despesa.dataPagamento}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {despesa.responsavelPagamentoNome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* Modal de Visualização */}
      <Dialog
        open={viewModalOpen}
        onClose={handleFecharModalVisualizacao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          👁️ Visualizar Despesa{" "}
          {despesaVisualizando?.descricao &&
            `- ${despesaVisualizando.descricao}`}
        </DialogTitle>
        <DialogContent>
          {despesaVisualizando && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                label="ID"
                value={despesaVisualizando.id || ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Obra"
                value={
                  despesaVisualizando.obraNome ||
                  `ID: ${despesaVisualizando.obraId}`
                }
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Descrição"
                value={despesaVisualizando.descricao}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Categoria"
                value={despesaVisualizando.categoria}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Valor"
                value={`R$ ${despesaVisualizando.valor.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Forma de Pagamento"
                value={despesaVisualizando.formaPagamento}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Status do Pagamento"
                value={despesaVisualizando.statusPagamento}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              {/* ✅ Data da Despesa */}
              {despesaVisualizando.data && (
                <TextField
                  label="Data da Despesa"
                  value={new Date(despesaVisualizando.data).toLocaleDateString(
                    "pt-BR"
                  )}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}

              {/* ✅ Data de Vencimento */}
              {despesaVisualizando.data_vencimento && (
                <TextField
                  label="Data de Vencimento"
                  value={new Date(
                    despesaVisualizando.data_vencimento
                  ).toLocaleDateString("pt-BR")}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}

              {despesaVisualizando.dataPagamento && (
                <TextField
                  label="Data de Pagamento"
                  value={new Date(
                    despesaVisualizando.dataPagamento
                  ).toLocaleDateString("pt-BR")}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}

              {/* ✅ Fornecedor */}
              {despesaVisualizando.fornecedorNome && (
                <TextField
                  label="Fornecedor"
                  value={despesaVisualizando.fornecedorNome}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}

              {/* ✅ Pessoa (Mão de Obra) */}
              {despesaVisualizando.pessoaNome && (
                <TextField
                  label="Pessoa (Mão de Obra)"
                  value={despesaVisualizando.pessoaNome}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}

              {despesaVisualizando.responsavel_pagamento && (
                <TextField
                  label="Responsável pelo Pagamento"
                  value={despesaVisualizando.responsavel_pagamento}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}

              {/* ✅ Observações */}
              {despesaVisualizando.observacao && (
                <TextField
                  label="Observações"
                  multiline
                  rows={3}
                  value={despesaVisualizando.observacao}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModalVisualizacao}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog
        open={editModalOpen}
        onClose={handleFecharModalEdicao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ✏️ Editar Despesa{" "}
          {despesaEditando?.descricao && `- ${despesaEditando.descricao}`}
        </DialogTitle>
        <DialogContent>
          {despesaEditando && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <FormControl fullWidth required>
                <InputLabel>Obra</InputLabel>
                <Select
                  value={despesaEditando.obraId}
                  onChange={(e) =>
                    handleCampoChange("obra_id", Number(e.target.value))
                  }
                  label="Obra"
                >
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Descrição *"
                value={despesaEditando.descricao}
                onChange={(e) => handleCampoChange("descricao", e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={despesaEditando.categoria}
                  onChange={(e) =>
                    handleCampoChange("categoria", e.target.value as any)
                  }
                  label="Categoria"
                >
                  <MenuItem value="Material">Material</MenuItem>
                  <MenuItem value="Mão de Obra">Mão de Obra</MenuItem>
                  <MenuItem value="Imposto">Imposto</MenuItem>
                  <MenuItem value="Parceiro">Parceiro</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Valor (R$) *"
                type="number"
                value={despesaEditando.valor}
                onChange={(e) =>
                  handleCampoChange("valor", Number(e.target.value))
                }
                fullWidth
              />

              {/* ✅ Data da Despesa */}
              <TextField
                label="Data da Despesa"
                type="date"
                value={despesaEditando.data || ""}
                onChange={(e) => handleCampoChange("data", e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* ✅ Data de Vencimento */}
              <TextField
                label="Data de Vencimento"
                type="date"
                value={
                  despesaEditando.data_vencimento ||
                  despesaEditando.dataVencimento ||
                  ""
                }
                onChange={(e) =>
                  handleCampoChange("data_vencimento", e.target.value)
                }
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* ✅ Fornecedor */}
              <FormControl fullWidth>
                <InputLabel>Fornecedor</InputLabel>
                <Select
                  value={
                    despesaEditando.fornecedor_id ||
                    despesaEditando.fornecedorId ||
                    ""
                  }
                  onChange={(e) =>
                    handleCampoChange("fornecedor_id", Number(e.target.value))
                  }
                  label="Fornecedor"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* ✅ Pessoa (Mão de Obra) */}
              <FormControl fullWidth>
                <InputLabel>Pessoa (Mão de Obra)</InputLabel>
                <Select
                  value={
                    despesaEditando.pessoa_id || despesaEditando.pessoaId || ""
                  }
                  onChange={(e) =>
                    handleCampoChange("pessoa_id", Number(e.target.value))
                  }
                  label="Pessoa (Mão de Obra)"
                >
                  <MenuItem value="">Nenhuma</MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={despesaEditando.formaPagamento}
                  onChange={(e) =>
                    handleCampoChange("formaPagamento", e.target.value as any)
                  }
                  label="Forma de Pagamento"
                >
                  <MenuItem value="À Vista">À Vista</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                  <MenuItem value="Boleto">Boleto</MenuItem>
                  <MenuItem value="Cartão">Cartão</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status do Pagamento</InputLabel>
                <Select
                  value={despesaEditando.statusPagamento}
                  onChange={(e) =>
                    handleCampoChange("statusPagamento", e.target.value as any)
                  }
                  label="Status do Pagamento"
                >
                  <MenuItem value="Pendente">Pendente</MenuItem>
                  <MenuItem value="Pago">Pago</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Data de Pagamento"
                type="date"
                value={despesaEditando.dataPagamento || ""}
                onChange={(e) =>
                  handleCampoChange("dataPagamento", e.target.value)
                }
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* ✅ Responsável pelo Pagamento (STRING, não ID) */}
              <TextField
                label="Responsável pelo Pagamento"
                value={
                  despesaEditando.responsavel_pagamento ||
                  despesaEditando.responsavelPagamento ||
                  ""
                }
                onChange={(e) =>
                  handleCampoChange("responsavel_pagamento", e.target.value)
                }
                fullWidth
                placeholder="Nome de quem efetuou o pagamento"
              />

              {/* ✅ Observações */}
              <TextField
                label="Observações"
                multiline
                rows={3}
                value={
                  despesaEditando.observacao ||
                  despesaEditando.observacoes ||
                  ""
                }
                onChange={(e) =>
                  handleCampoChange("observacao", e.target.value)
                }
                fullWidth
                placeholder="Observações adicionais..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModalEdicao} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarEdicao}
            variant="contained"
            disabled={salvando}
          >
            {salvando ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Despesas;
