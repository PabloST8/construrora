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
  Business as BusinessIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { fornecedorService } from "../services/fornecedorService";
import { Fornecedor } from "../types/apiGo";

const Fornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<Fornecedor | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    nome: "",
    tipo_documento: "",
    ativo: "",
  });

  // Formulário
  const [formData, setFormData] = useState<Partial<Fornecedor>>({
    nome: "",
    tipo_documento: "CPF",
    documento: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    ativo: true,
  });

  // Resumo
  const [resumo, setResumo] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    cpf: 0,
    cnpj: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  // Cálculo do resumo
  const calcularResumo = React.useCallback(() => {
    const total = fornecedores.length;
    const ativos = fornecedores.filter((f) => f.ativo).length;
    const cpf = fornecedores.filter((f) => f.tipo_documento === "CPF").length;
    const cnpj = fornecedores.filter((f) => f.tipo_documento === "CNPJ").length;

    setResumo({
      total,
      ativos,
      inativos: total - ativos,
      cpf,
      cnpj,
    });
  }, [fornecedores]);

  useEffect(() => {
    calcularResumo();
  }, [calcularResumo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const fornecedoresData = await fornecedorService.listar();
      console.log("🔍 Fornecedores carregados:", fornecedoresData);
      setFornecedores(Array.isArray(fornecedoresData) ? fornecedoresData : []);
    } catch (error) {
      console.error("❌ Erro ao carregar fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  const buscarComFiltros = () => {
    const resultado = fornecedores.filter((fornecedor) => {
      const filtroNome =
        !filtros.nome ||
        fornecedor.nome.toLowerCase().includes(filtros.nome.toLowerCase());

      const filtroTipo =
        !filtros.tipo_documento ||
        fornecedor.tipo_documento === filtros.tipo_documento;

      const filtroAtivo =
        !filtros.ativo || fornecedor.ativo.toString() === filtros.ativo;

      return filtroNome && filtroTipo && filtroAtivo;
    });

    setFornecedores(resultado);
    toast.info(`${resultado.length} fornecedor(es) encontrado(s)`);
  };

  const limparFiltros = () => {
    setFiltros({
      nome: "",
      tipo_documento: "",
      ativo: "",
    });
    carregarDados();
  };

  const abrirDialogCriacao = () => {
    setFormData({
      nome: "",
      tipo_documento: "CPF",
      documento: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      ativo: true,
    });
    setModoEdicao(false);
    setDialogAberto(true);
  };

  const abrirDialogEdicao = (fornecedor: Fornecedor) => {
    setFormData({ ...fornecedor });
    setFornecedorSelecionado(fornecedor);
    setModoEdicao(true);
    setDialogAberto(true);
  };

  const abrirDialogVisualizacao = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setDialogVisualizacao(true);
  };

  const salvarFornecedor = async () => {
    try {
      if (!formData.nome || !formData.documento || !formData.tipo_documento) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      setLoading(true);

      const dadosFornecedor: Fornecedor = {
        nome: formData.nome,
        tipo_documento: formData.tipo_documento,
        documento: formData.documento,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        ativo: Boolean(formData.ativo),
      };

      console.log("💾 Salvando fornecedor:", dadosFornecedor);

      if (modoEdicao && fornecedorSelecionado) {
        await fornecedorService.atualizar(
          fornecedorSelecionado.id!,
          dadosFornecedor
        );
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        await fornecedorService.criar(dadosFornecedor);
        toast.success("Fornecedor criado com sucesso!");
      }

      setDialogAberto(false);
      carregarDados();
    } catch (error: any) {
      console.error("❌ Erro ao salvar fornecedor:", error);
      const mensagem =
        error.response?.data?.message || "Erro ao salvar fornecedor";
      toast.error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const excluirFornecedor = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      return;
    }

    try {
      setLoading(true);
      await fornecedorService.deletar(id);
      toast.success("Fornecedor excluído com sucesso!");
      carregarDados();
    } catch (error) {
      console.error("❌ Erro ao excluir fornecedor:", error);
      toast.error("Erro ao excluir fornecedor");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (ativo: boolean) => {
    return ativo ? "success" : "error";
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === "CNPJ" ? <BusinessIcon /> : <PersonIcon />;
  };

  const formatarDocumento = (documento: string, tipo: string) => {
    if (!documento) return "";

    if (tipo === "CPF" && documento.length === 11) {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    if (tipo === "CNPJ" && documento.length === 14) {
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    return documento;
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
          🏢 Gestão de Fornecedores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirDialogCriacao}
          sx={{ backgroundColor: "#4caf50" }}
        >
          Novo Fornecedor
        </Button>
      </Stack>

      {/* Resumo */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Total Geral
          </Typography>
          <Typography variant="h5" color="primary">
            {resumo.total}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Ativos
          </Typography>
          <Typography variant="h5" color="success.main">
            {resumo.ativos}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            Inativos
          </Typography>
          <Typography variant="h5" color="error.main">
            {resumo.inativos}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography color="textSecondary" gutterBottom>
            CPF / CNPJ
          </Typography>
          <Typography variant="h5" color="info.main">
            {resumo.cpf} / {resumo.cnpj}
          </Typography>
        </Paper>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          🔍 Filtros
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            size="small"
            label="Nome"
            value={filtros.nome}
            onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo Documento</InputLabel>
            <Select
              value={filtros.tipo_documento}
              onChange={(e) =>
                setFiltros({ ...filtros, tipo_documento: e.target.value })
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="CPF">CPF</MenuItem>
              <MenuItem value="CNPJ">CNPJ</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filtros.ativo}
              onChange={(e) =>
                setFiltros({ ...filtros, ativo: e.target.value })
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Ativos</MenuItem>
              <MenuItem value="false">Inativos</MenuItem>
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

      {/* Tabela de Fornecedores */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Ações</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo/Documento</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">Nenhum fornecedor encontrado</Alert>
                </TableCell>
              </TableRow>
            ) : (
              fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => abrirDialogVisualizacao(fornecedor)}
                        title="Visualizar"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => abrirDialogEdicao(fornecedor)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => excluirFornecedor(fornecedor.id!)}
                        title="Excluir"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>{fornecedor.nome}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getTipoIcon(fornecedor.tipo_documento)}
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {fornecedor.tipo_documento}
                        </Typography>
                        <Typography variant="body2">
                          {formatarDocumento(
                            fornecedor.documento,
                            fornecedor.tipo_documento
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{fornecedor.email || "-"}</TableCell>
                  <TableCell>{fornecedor.telefone || "-"}</TableCell>
                  <TableCell>{fornecedor.cidade || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={fornecedor.ativo ? "Ativo" : "Inativo"}
                      color={getStatusColor(fornecedor.ativo) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Criar/Editar Fornecedor */}
      <Dialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modoEdicao ? "✏️ Editar Fornecedor" : "➕ Novo Fornecedor"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Nome"
                value={formData.nome || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
              <FormControl fullWidth required>
                <InputLabel>Tipo Documento</InputLabel>
                <Select
                  value={formData.tipo_documento || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_documento: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="CPF">CPF</MenuItem>
                  <MenuItem value="CNPJ">CNPJ</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                required
                label={formData.tipo_documento === "CNPJ" ? "CNPJ" : "CPF"}
                value={formData.documento || ""}
                onChange={(e) =>
                  setFormData({ ...formData, documento: e.target.value })
                }
                placeholder={
                  formData.tipo_documento === "CNPJ"
                    ? "00.000.000/0000-00"
                    : "000.000.000-00"
                }
              />
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.ativo ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ativo: e.target.value === "true",
                    })
                  }
                >
                  <MenuItem value="true">Ativo</MenuItem>
                  <MenuItem value="false">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </Box>
            <TextField
              fullWidth
              label="Endereço"
              value={formData.endereco || ""}
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
              }
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.cidade || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cidade: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Estado"
                value={formData.estado || ""}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                placeholder="Ex: SP, RJ, MG"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvarFornecedor}
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
        <DialogTitle>👁️ Visualizar Fornecedor</DialogTitle>
        <DialogContent>
          {fornecedorSelecionado && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                value={fornecedorSelecionado.nome}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Tipo Documento"
                  value={fornecedorSelecionado.tipo_documento}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Documento"
                  value={formatarDocumento(
                    fornecedorSelecionado.documento,
                    fornecedorSelecionado.tipo_documento
                  )}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Email"
                  value={fornecedorSelecionado.email || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Telefone"
                  value={fornecedorSelecionado.telefone || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Box>
              <TextField
                label="Endereço"
                value={fornecedorSelecionado.endereco || "-"}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Cidade"
                  value={fornecedorSelecionado.cidade || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Estado"
                  value={fornecedorSelecionado.estado || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Box>
              <TextField
                label="Status"
                value={fornecedorSelecionado.ativo ? "Ativo" : "Inativo"}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              {fornecedorSelecionado.created_at && (
                <TextField
                  label="Data de Criação"
                  value={new Date(
                    fornecedorSelecionado.created_at
                  ).toLocaleDateString("pt-BR")}
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

export default Fornecedores;
