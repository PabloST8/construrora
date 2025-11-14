import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Card,
  CardMedia,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayArrow as InProgressIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { tarefaService } from "../services/tarefaService";
import { obraService } from "../services/obraService";
import { Tarefa, TarefaFormData } from "../types/tarefa";
import { formatDate } from "../utils/formatters";

const TarefasRealizadas: React.FC = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(
    null
  );
  const [modoEdicao, setModoEdicao] = useState(false);

  const [formData, setFormData] = useState<TarefaFormData>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    periodo: "manha",
    descricao: "",
    status: "planejada",
    percentual_conclusao: 0,
    observacao: "",
  });

  // Filtros
  const [filtroObra, setFiltroObra] = useState<number>(0);
  const [filtroData, setFiltroData] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [tarefasData, obrasData] = await Promise.all([
        tarefaService.listar(),
        obraService.listar(),
      ]);
      setTarefas(Array.isArray(tarefasData) ? tarefasData : []);
      setObras(Array.isArray(obrasData) ? obrasData : []);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    if (filtroObra > 0 && filtroData) {
      setLoading(true);
      try {
        const tarefasFiltradas = await tarefaService.buscarPorObraEData(
          filtroObra,
          filtroData
        );
        setTarefas(Array.isArray(tarefasFiltradas) ? tarefasFiltradas : []);
      } catch (error) {
        toast.error("Erro ao buscar tarefas");
      } finally {
        setLoading(false);
      }
    } else {
      carregarDados();
    }
  };

  const limparFiltros = () => {
    setFiltroObra(0);
    setFiltroData("");
    carregarDados();
  };

  const abrirModalCriacao = () => {
    setFormData({
      obra_id: 0,
      data: new Date().toISOString().split("T")[0],
      periodo: "manha",
      descricao: "",
      status: "planejada",
      percentual_conclusao: 0,
      observacao: "",
    });
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (tarefa: Tarefa) => {
    setFormData({
      obra_id: tarefa.obra_id,
      data: tarefa.data.split("T")[0],
      periodo: tarefa.periodo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      percentual_conclusao: tarefa.percentual_conclusao,
      observacao: tarefa.observacao || "",
    });
    setTarefaSelecionada(tarefa);
    setModoEdicao(true);
    setModalAberto(true);
  };

  const abrirModalVisualizacao = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
    setModalVisualizacao(true);
  };

  const handleSalvar = async () => {
    if (!formData.obra_id || !formData.descricao) {
      toast.warning("Preencha obra e descrição");
      return;
    }

    setLoading(true);
    try {
      if (modoEdicao && tarefaSelecionada) {
        await tarefaService.atualizar(tarefaSelecionada.id, formData);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await tarefaService.criar(formData);
        toast.success("Tarefa criada com sucesso!");
      }
      setModalAberto(false);
      carregarDados();
    } catch (error) {
      toast.error("Erro ao salvar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number, descricao: string) => {
    if (!window.confirm(`Deseja excluir a tarefa "${descricao}"?`)) return;

    setLoading(true);
    try {
      await tarefaService.deletar(id);
      toast.success("Tarefa excluída com sucesso!");
      carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir tarefa");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluida":
        return <CheckCircleIcon color="success" />;
      case "em_andamento":
        return <InProgressIcon color="primary" />;
      case "cancelada":
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "success";
      case "em_andamento":
        return "primary";
      case "cancelada":
        return "error";
      default:
        return "default";
    }
  };

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case "manha":
        return "Manhã";
      case "tarde":
        return "Tarde";
      case "integral":
        return "Integral";
      default:
        return periodo;
    }
  };

  const getObraNome = (obraId: number) => {
    const obra = obras.find((o) => o.id === obraId);
    return obra?.nome || `Obra #${obraId}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5">📋 Tarefas Realizadas</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={abrirModalCriacao}
          >
            Nova Tarefa
          </Button>
        </Box>

        {/* Filtros */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Obra</InputLabel>
              <Select
                value={filtroObra}
                onChange={(e) => setFiltroObra(Number(e.target.value))}
                label="Filtrar por Obra"
              >
                <MenuItem value={0}>Todas as obras</MenuItem>
                {obras.map((obra) => (
                  <MenuItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              type="date"
              label="Filtrar por Data"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={aplicarFiltros}
              disabled={filtroObra === 0 || !filtroData}
              fullWidth
            >
              Buscar
            </Button>
            <Button variant="outlined" onClick={limparFiltros} fullWidth>
              Limpar
            </Button>
          </Box>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Obra</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Progresso</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tarefas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhuma tarefa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                tarefas.map((tarefa) => (
                  <TableRow key={tarefa.id}>
                    <TableCell>{formatDate(tarefa.data)}</TableCell>
                    <TableCell>{getPeriodoLabel(tarefa.periodo)}</TableCell>
                    <TableCell>{getObraNome(tarefa.obra_id)}</TableCell>
                    <TableCell>{tarefa.descricao}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(tarefa.status)}
                        label={tarefa.status.replace("_", " ").toUpperCase()}
                        color={getStatusColor(tarefa.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={tarefa.percentual_conclusao}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                          {tarefa.percentual_conclusao}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        onClick={() => abrirModalVisualizacao(tarefa)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => abrirModalEdicao(tarefa)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleExcluir(tarefa.id, tarefa.descricao)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal Criar/Editar */}
      <Dialog
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modoEdicao ? "✏️ Editar Tarefa" : "➕ Nova Tarefa"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Obra</InputLabel>
                <Select
                  value={formData.obra_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      obra_id: Number(e.target.value),
                    })
                  }
                  label="Obra"
                >
                  <MenuItem value={0}>-- Selecione --</MenuItem>
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                type="date"
                label="Data"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Período</InputLabel>
                <Select
                  value={formData.periodo}
                  onChange={(e: any) =>
                    setFormData({ ...formData, periodo: e.target.value })
                  }
                  label="Período"
                >
                  <MenuItem value="manha">Manhã</MenuItem>
                  <MenuItem value="tarde">Tarde</MenuItem>
                  <MenuItem value="integral">Integral</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e: any) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  label="Status"
                >
                  <MenuItem value="planejada">Planejada</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="concluida">Concluída</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                type="number"
                label="Progresso (%)"
                value={formData.percentual_conclusao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentual_conclusao: Math.min(
                      100,
                      Math.max(0, Number(e.target.value))
                    ),
                  })
                }
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Descrição"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observação (opcional)"
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({ ...formData, observacao: e.target.value })
                }
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={loading || !formData.obra_id || !formData.descricao}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Visualização */}
      <Dialog
        open={modalVisualizacao}
        onClose={() => setModalVisualizacao(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>👁️ Visualizar Tarefa</DialogTitle>
        <DialogContent>
          {tarefaSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Obra:</strong> {getObraNome(tarefaSelecionada.obra_id)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Data:</strong> {formatDate(tarefaSelecionada.data)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Período:</strong>{" "}
                {getPeriodoLabel(tarefaSelecionada.periodo)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={tarefaSelecionada.status
                    .replace("_", " ")
                    .toUpperCase()}
                  color={getStatusColor(tarefaSelecionada.status) as any}
                  size="small"
                />
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Progresso:</strong>{" "}
                {tarefaSelecionada.percentual_conclusao}%
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                <strong>Descrição:</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                {tarefaSelecionada.descricao}
              </Typography>
              {tarefaSelecionada.observacao && (
                <>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    <strong>Observação:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {tarefaSelecionada.observacao}
                  </Typography>
                </>
              )}
              {tarefaSelecionada.fotos &&
                tarefaSelecionada.fotos.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      <strong>
                        📸 Fotos ({tarefaSelecionada.fotos.length}):
                      </strong>
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      {tarefaSelecionada.fotos.map((foto, index) => (
                        <Box>
                          <Card>
                            <CardMedia
                              component="img"
                              height="200"
                              image={foto.foto}
                              alt={foto.descricao || `Foto ${index + 1}`}
                            />
                            {foto.descricao && (
                              <Box sx={{ p: 1 }}>
                                <Typography variant="caption">
                                  {foto.descricao}
                                </Typography>
                              </Box>
                            )}
                          </Card>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVisualizacao(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TarefasRealizadas;
