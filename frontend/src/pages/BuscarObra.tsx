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
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { Obra } from "../types/obra";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import { Pessoa } from "../types/pessoa";

const BuscarObra: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obrasFiltradas, setObrasFiltradas] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    codigo: "",
    nome: "",
    contratoNumero: "",
    status: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [obraEditando, setObraEditando] = useState<Obra | null>(null);
  const [obraVisualizando, setObraVisualizando] = useState<Obra | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  useEffect(() => {
    carregarObras();
    carregarPessoas();
  }, []);

  const carregarPessoas = async () => {
    try {
      const data = await pessoaService.listar();
      setPessoas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Erro ao carregar pessoas:", error);
    }
  };

  const carregarObras = async () => {
    setLoading(true);
    try {
      const data = await obraService.listar();
      console.log("📊 Obras carregadas:", data);
      console.log("📊 Tipo de data:", typeof data, Array.isArray(data));

      // Garantir que data seja sempre um array
      const obrasArray = Array.isArray(data) ? data : [];

      setObras(obrasArray);
      setObrasFiltradas(obrasArray);
      toast.success(`${obrasArray.length} obra(s) carregada(s)`);
    } catch (error: any) {
      console.error("❌ Erro ao carregar obras:", error);
      toast.error(error.response?.data?.error || "Erro ao carregar obras");
      // Garantir que seja array mesmo em caso de erro
      setObras([]);
      setObrasFiltradas([]);
    } finally {
      setLoading(false);
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

  const handleBuscar = () => {
    let resultado = [...obras];

    if (filtros.codigo) {
      resultado = resultado.filter((o) =>
        o.id?.toString().includes(filtros.codigo)
      );
    }

    if (filtros.nome) {
      resultado = resultado.filter((o) =>
        o.nome?.toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }

    if (filtros.contratoNumero) {
      resultado = resultado.filter((o) =>
        (o.contrato_numero || o.contratoNumero)
          ?.toLowerCase()
          .includes(filtros.contratoNumero.toLowerCase())
      );
    }

    if (filtros.status) {
      resultado = resultado.filter((o) => o.status === filtros.status);
    }

    setObrasFiltradas(resultado);
    toast.info(`${resultado.length} obra(s) encontrada(s)`);
  };

  const handleLimpar = () => {
    setFiltros({
      codigo: "",
      nome: "",
      contratoNumero: "",
      status: "",
    });
    setObrasFiltradas(obras);
    toast.info("Filtros limpos");
  };

  const handleVisualizar = async (id: number) => {
    try {
      setLoading(true);
      const obra = await obraService.buscarPorId(id.toString());
      setObraVisualizando(obra);
      setViewModalOpen(true);
    } catch (error: any) {
      console.error("❌ Erro ao carregar obra:", error);
      toast.error("❌ Erro ao carregar dados da obra");
    } finally {
      setLoading(false);
    }
  };

  const handleFecharModalVisualizacao = () => {
    setViewModalOpen(false);
    setObraVisualizando(null);
  };

  const handleEditar = async (id: number) => {
    try {
      setLoading(true);
      const obra = await obraService.buscarPorId(id.toString());
      setObraEditando(obra);
      setEditModalOpen(true);
    } catch (error: any) {
      console.error("❌ Erro ao carregar obra:", error);
      toast.error("❌ Erro ao carregar dados da obra");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta obra?")) {
      return;
    }

    try {
      await obraService.deletar(id.toString());
      toast.success("✅ Obra excluída com sucesso!");
      carregarObras();
    } catch (error: any) {
      console.error("❌ Erro ao excluir obra:", error);
      toast.error("❌ Erro ao excluir obra");
    }
  };

  const handleFecharModal = () => {
    setEditModalOpen(false);
    setObraEditando(null);
  };

  const handleSalvarEdicao = async () => {
    if (!obraEditando) return;

    try {
      setSalvando(true);

      // Calcular prazo_dias se as datas mudaram
      let prazo_dias = obraEditando.prazo_dias;
      if (obraEditando.data_inicio && obraEditando.data_fim_prevista) {
        const inicio = new Date(obraEditando.data_inicio);
        const fim = new Date(obraEditando.data_fim_prevista);
        prazo_dias = Math.ceil(
          (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      const dadosAtualizados: Partial<Obra> = {
        nome: obraEditando.nome,
        descricao: obraEditando.descricao || "",
        data_inicio: obraEditando.data_inicio,
        data_fim_prevista: obraEditando.data_fim_prevista,
        prazo_dias: prazo_dias,
        status: obraEditando.status,
        orcamento: obraEditando.orcamento,
        contrato_numero: obraEditando.contrato_numero || "",
        responsavel_id: obraEditando.responsavel_id,
        contratante_id: obraEditando.contratante_id,
        art: obraEditando.art || "",
        endereco_rua: obraEditando.endereco_rua || "",
        endereco_numero: obraEditando.endereco_numero || "",
        endereco_bairro: obraEditando.endereco_bairro || "",
        endereco_cidade: obraEditando.endereco_cidade || "",
        endereco_estado: obraEditando.endereco_estado || "",
        endereco_cep: obraEditando.endereco_cep || "",
      };

      await obraService.atualizar(
        obraEditando.id!.toString(),
        dadosAtualizados
      );
      toast.success("✅ Obra atualizada com sucesso!");
      handleFecharModal();
      carregarObras();
    } catch (error: any) {
      console.error("❌ Erro ao atualizar obra:", error);
      const mensagem = error.response?.data?.error || "Erro ao atualizar obra";
      toast.error(`❌ ${mensagem}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleCampoChange = (campo: keyof Obra, valor: any) => {
    if (obraEditando) {
      setObraEditando({
        ...obraEditando,
        [campo]: valor,
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "em_andamento":
        return "success";
      case "planejamento":
        return "info";
      case "concluida":
        return "default";
      case "pausada":
        return "warning";
      case "cancelada":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "em_andamento":
        return "Em Andamento";
      case "planejamento":
        return "Planejamento";
      case "concluida":
        return "Concluída";
      case "pausada":
        return "Pausada";
      case "cancelada":
        return "Cancelada";
      default:
        return status || "N/A";
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Filtros</Typography>
          <IconButton
            onClick={carregarObras}
            disabled={loading}
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Código da Obra"
              name="codigo"
              value={filtros.codigo}
              onChange={handleFiltroChange}
              sx={{ width: { xs: "100%", md: "20%" } }}
              placeholder="Ex: 1"
            />
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={filtros.nome}
              onChange={handleFiltroChange}
              placeholder="Ex: Construção do Edifício"
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Número do Contrato"
              name="contratoNumero"
              value={filtros.contratoNumero}
              onChange={handleFiltroChange}
              placeholder="Ex: CNT-2025-001"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filtros.status}
                onChange={handleFiltroChange}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="planejamento">Planejamento</MenuItem>
                <MenuItem value="em_andamento">Em Andamento</MenuItem>
                <MenuItem value="pausada">Pausada</MenuItem>
                <MenuItem value="concluida">Concluída</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={handleLimpar}
              disabled={loading}
              sx={{
                color: "#666",
                borderColor: "#666",
                "&:hover": { borderColor: "#333", backgroundColor: "#f5f5f5" },
              }}
            >
              Limpar
            </Button>
            <Button
              variant="contained"
              onClick={handleBuscar}
              disabled={loading}
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#45a049" },
              }}
            >
              Buscar
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resultados ({obrasFiltradas.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : obrasFiltradas.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            Nenhuma obra encontrada
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
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    Ação
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    Nome
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    Contrato
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    Orçamento
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    Data Início
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "none",
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {obrasFiltradas.map((obra) => (
                  <tr
                    key={obra.id}
                    style={{
                      borderBottom: "1px solid #e0e0e0",
                      backgroundColor: "white",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleVisualizar(obra.id!)}
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
                          onClick={() => handleEditar(obra.id!)}
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
                          onClick={() => handleExcluir(obra.id!)}
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
                    <td style={{ padding: "12px" }}>{obra.id}</td>
                    <td style={{ padding: "12px" }}>{obra.nome}</td>
                    <td style={{ padding: "12px" }}>
                      {obra.contrato_numero || obra.contratoNumero || "N/A"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatCurrency(obra.orcamento)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatDate(obra.data_inicio || obra.dataInicio)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Chip
                        label={getStatusLabel(obra.status)}
                        color={getStatusColor(obra.status)}
                        size="small"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      {/* Modal de Edição */}
      <Dialog
        open={editModalOpen}
        onClose={handleFecharModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ✏️ Editar Obra {obraEditando?.nome && `- ${obraEditando.nome}`}
        </DialogTitle>
        <DialogContent>
          {obraEditando && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {/* Nome */}
              <TextField
                label="Nome da Obra *"
                fullWidth
                value={obraEditando.nome || ""}
                onChange={(e) => handleCampoChange("nome", e.target.value)}
              />

              {/* Descrição */}
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                value={obraEditando.descricao || ""}
                onChange={(e) => handleCampoChange("descricao", e.target.value)}
              />

              {/* Contrato Número */}
              <TextField
                label="Número do Contrato"
                fullWidth
                value={obraEditando.contrato_numero || ""}
                onChange={(e) =>
                  handleCampoChange("contrato_numero", e.target.value)
                }
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Responsável */}
                <FormControl fullWidth>
                  <InputLabel>Responsável *</InputLabel>
                  <Select
                    value={obraEditando.responsavel_id || ""}
                    onChange={(e) =>
                      handleCampoChange(
                        "responsavel_id",
                        Number(e.target.value)
                      )
                    }
                    label="Responsável *"
                  >
                    <MenuItem value="">
                      <em>Selecione</em>
                    </MenuItem>
                    {pessoas.map((pessoa) => (
                      <MenuItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Contratante */}
                <FormControl fullWidth>
                  <InputLabel>Contratante *</InputLabel>
                  <Select
                    value={obraEditando.contratante_id || ""}
                    onChange={(e) =>
                      handleCampoChange(
                        "contratante_id",
                        Number(e.target.value)
                      )
                    }
                    label="Contratante *"
                  >
                    <MenuItem value="">
                      <em>Selecione</em>
                    </MenuItem>
                    {pessoas.map((pessoa) => (
                      <MenuItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Data Início */}
                <TextField
                  label="Data de Início *"
                  type="date"
                  fullWidth
                  value={obraEditando.data_inicio || ""}
                  onChange={(e) =>
                    handleCampoChange("data_inicio", e.target.value)
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />

                {/* Data Fim Prevista */}
                <TextField
                  label="Data Fim Prevista *"
                  type="date"
                  fullWidth
                  value={obraEditando.data_fim_prevista || ""}
                  onChange={(e) =>
                    handleCampoChange("data_fim_prevista", e.target.value)
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Box>

              {/* Orçamento */}
              <TextField
                label="Orçamento (R$) *"
                type="number"
                fullWidth
                value={obraEditando.orcamento || ""}
                onChange={(e) =>
                  handleCampoChange("orcamento", Number(e.target.value))
                }
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Status */}
                <FormControl fullWidth>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={obraEditando.status || "planejamento"}
                    onChange={(e) =>
                      handleCampoChange("status", e.target.value)
                    }
                    label="Status *"
                  >
                    <MenuItem value="planejamento">Planejamento</MenuItem>
                    <MenuItem value="em_andamento">Em Andamento</MenuItem>
                    <MenuItem value="pausada">Pausada</MenuItem>
                    <MenuItem value="concluida">Concluída</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>

                {/* ART */}
                <TextField
                  label="ART (Anotação de Responsabilidade Técnica)"
                  fullWidth
                  value={obraEditando.art || ""}
                  onChange={(e) => handleCampoChange("art", e.target.value)}
                  placeholder="Ex: ART123456789"
                />
              </Box>

              {/* Endereço - Rua */}
              <TextField
                label="Rua/Logradouro"
                fullWidth
                value={obraEditando.endereco_rua || ""}
                onChange={(e) =>
                  handleCampoChange("endereco_rua", e.target.value)
                }
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Endereço - Número */}
                <TextField
                  label="Número"
                  fullWidth
                  value={obraEditando.endereco_numero || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_numero", e.target.value)
                  }
                />

                {/* Endereço - Bairro */}
                <TextField
                  label="Bairro"
                  fullWidth
                  value={obraEditando.endereco_bairro || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_bairro", e.target.value)
                  }
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Endereço - Cidade */}
                <TextField
                  label="Cidade"
                  fullWidth
                  value={obraEditando.endereco_cidade || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_cidade", e.target.value)
                  }
                />

                {/* Endereço - Estado */}
                <TextField
                  label="Estado (UF)"
                  fullWidth
                  value={obraEditando.endereco_estado || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_estado", e.target.value)
                  }
                  inputProps={{ maxLength: 2 }}
                />
              </Box>

              {/* Endereço - CEP */}
              <TextField
                label="CEP"
                fullWidth
                value={obraEditando.endereco_cep || ""}
                onChange={(e) =>
                  handleCampoChange("endereco_cep", e.target.value)
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModal} disabled={salvando}>
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

      {/* Modal de Visualização */}
      <Dialog
        open={viewModalOpen}
        onClose={handleFecharModalVisualizacao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          👁️ Visualizar Obra{" "}
          {obraVisualizando?.nome && `- ${obraVisualizando.nome}`}
        </DialogTitle>
        <DialogContent>
          {obraVisualizando && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {/* ID */}
              <TextField
                label="ID"
                fullWidth
                value={obraVisualizando.id || ""}
                InputProps={{ readOnly: true }}
              />

              {/* Nome */}
              <TextField
                label="Nome da Obra"
                fullWidth
                value={obraVisualizando.nome || ""}
                InputProps={{ readOnly: true }}
              />

              {/* Descrição */}
              {obraVisualizando.descricao && (
                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  value={obraVisualizando.descricao}
                  InputProps={{ readOnly: true }}
                />
              )}

              {/* Contrato Número */}
              <TextField
                label="Número do Contrato"
                fullWidth
                value={
                  obraVisualizando.contrato_numero ||
                  obraVisualizando.contratoNumero ||
                  "Não informado"
                }
                InputProps={{ readOnly: true }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Responsável */}
                <TextField
                  label="Responsável"
                  fullWidth
                  value={
                    obraVisualizando.responsavelNome ||
                    `ID: ${obraVisualizando.responsavel_id}` ||
                    "Não informado"
                  }
                  InputProps={{ readOnly: true }}
                />

                {/* Contratante */}
                <TextField
                  label="Contratante"
                  fullWidth
                  value={
                    obraVisualizando.contratanteNome ||
                    `ID: ${obraVisualizando.contratante_id}` ||
                    "Não informado"
                  }
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Data Início */}
                <TextField
                  label="Data de Início"
                  fullWidth
                  value={
                    obraVisualizando.data_inicio
                      ? new Date(
                          obraVisualizando.data_inicio
                        ).toLocaleDateString("pt-BR")
                      : "Não informado"
                  }
                  InputProps={{ readOnly: true }}
                />

                {/* Data Fim Prevista */}
                <TextField
                  label="Data Fim Prevista"
                  fullWidth
                  value={
                    obraVisualizando.data_fim_prevista
                      ? new Date(
                          obraVisualizando.data_fim_prevista
                        ).toLocaleDateString("pt-BR")
                      : "Não informado"
                  }
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Prazo (dias) */}
                <TextField
                  label="Prazo (dias)"
                  fullWidth
                  value={
                    obraVisualizando.prazo_dias ||
                    obraVisualizando.prazoDias ||
                    "Não calculado"
                  }
                  InputProps={{ readOnly: true }}
                />

                {/* Orçamento */}
                <TextField
                  label="Orçamento"
                  fullWidth
                  value={
                    obraVisualizando.orcamento
                      ? `R$ ${obraVisualizando.orcamento.toLocaleString(
                          "pt-BR",
                          { minimumFractionDigits: 2 }
                        )}`
                      : "Não informado"
                  }
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Status */}
                <TextField
                  label="Status"
                  fullWidth
                  value={
                    obraVisualizando.status === "em_andamento"
                      ? "Em Andamento"
                      : obraVisualizando.status === "planejamento"
                      ? "Planejamento"
                      : obraVisualizando.status === "concluida"
                      ? "Concluída"
                      : obraVisualizando.status === "pausada"
                      ? "Pausada"
                      : obraVisualizando.status === "cancelada"
                      ? "Cancelada"
                      : obraVisualizando.status || "Não informado"
                  }
                  InputProps={{ readOnly: true }}
                />

                {/* ART */}
                <TextField
                  label="ART"
                  fullWidth
                  value={obraVisualizando.art || "Não informado"}
                  InputProps={{ readOnly: true }}
                />
              </Box>

              {/* Endereço completo */}
              {(obraVisualizando.endereco_rua ||
                obraVisualizando.endereco_cidade) && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 1, fontWeight: "bold" }}
                  >
                    📍 Endereço
                  </Typography>

                  {/* Endereço - Rua */}
                  {obraVisualizando.endereco_rua && (
                    <TextField
                      label="Rua/Logradouro"
                      fullWidth
                      value={obraVisualizando.endereco_rua}
                      InputProps={{ readOnly: true }}
                    />
                  )}

                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Endereço - Número */}
                    {obraVisualizando.endereco_numero && (
                      <TextField
                        label="Número"
                        fullWidth
                        value={obraVisualizando.endereco_numero}
                        InputProps={{ readOnly: true }}
                      />
                    )}

                    {/* Endereço - Bairro */}
                    {obraVisualizando.endereco_bairro && (
                      <TextField
                        label="Bairro"
                        fullWidth
                        value={obraVisualizando.endereco_bairro}
                        InputProps={{ readOnly: true }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Endereço - Cidade */}
                    {obraVisualizando.endereco_cidade && (
                      <TextField
                        label="Cidade"
                        fullWidth
                        value={obraVisualizando.endereco_cidade}
                        InputProps={{ readOnly: true }}
                      />
                    )}

                    {/* Endereço - Estado */}
                    {obraVisualizando.endereco_estado && (
                      <TextField
                        label="Estado (UF)"
                        fullWidth
                        value={obraVisualizando.endereco_estado}
                        InputProps={{ readOnly: true }}
                      />
                    )}
                  </Box>

                  {/* Endereço - CEP */}
                  {obraVisualizando.endereco_cep && (
                    <TextField
                      label="CEP"
                      fullWidth
                      value={obraVisualizando.endereco_cep}
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </>
              )}

              {/* Datas de criação/atualização */}
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                {obraVisualizando.created_at && (
                  <TextField
                    label="Data de Criação"
                    fullWidth
                    value={new Date(obraVisualizando.created_at).toLocaleString(
                      "pt-BR"
                    )}
                    InputProps={{ readOnly: true }}
                  />
                )}

                {obraVisualizando.updated_at && (
                  <TextField
                    label="Última Atualização"
                    fullWidth
                    value={new Date(obraVisualizando.updated_at).toLocaleString(
                      "pt-BR"
                    )}
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModalVisualizacao}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuscarObra;
