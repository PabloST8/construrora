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
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { tarefaService } from "../services/tarefaService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import { Tarefa, TarefaFormData } from "../types/tarefa";
import { Pessoa } from "../types/pessoa";
import { formatDate } from "../utils/formatters";

const TarefasRealizadas: React.FC = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(
    null
  );
  const [modoEdicao, setModoEdicao] = useState(false);
  const [fotosBase64, setFotosBase64] = useState<string[]>([]);

  const [formData, setFormData] = useState<TarefaFormData>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    periodo: "manha",
    descricao: "",
    responsavel_id: undefined,
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
      const [tarefasData, obrasData, pessoasData] = await Promise.all([
        tarefaService.listar(),
        obraService.listar(),
        pessoaService.listar(),
      ]);
      setTarefas(Array.isArray(tarefasData) ? tarefasData : []);
      setObras(Array.isArray(obrasData) ? obrasData : []);
      setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
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
      responsavel_id: undefined,
      status: "planejada",
      percentual_conclusao: 0,
      observacao: "",
    });
    setFotosBase64([]);
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (tarefa: Tarefa) => {
    setFormData({
      obra_id: tarefa.obra_id,
      data: tarefa.data.split("T")[0],
      periodo: tarefa.periodo,
      descricao: tarefa.descricao,
      responsavel_id: tarefa.responsavel_id,
      status: tarefa.status,
      percentual_conclusao: tarefa.percentual_conclusao,
      observacao: tarefa.observacao || "",
    });
    // Carregar fotos existentes
    const fotosExistentes =
      tarefa.fotos && tarefa.fotos.length > 0
        ? tarefa.fotos.map((f) => f.foto)
        : [];
    setFotosBase64(fotosExistentes);
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
      // ✅ Preparar dados incluindo fotos se houver
      const dadosParaEnviar: TarefaFormData = {
        ...formData,
      };

      // ✅ Sempre enviar o campo fotos (mesmo se vazio) para garantir atualização
      // Marcar para SUBSTITUIR todas as fotos antigas
      dadosParaEnviar.fotos = fotosBase64.map(
        (foto, index) =>
          ({
            id: modoEdicao ? -1 : 0, // -1 indica "substituir todas" em edição
            entidade_tipo: "atividade",
            entidade_id: tarefaSelecionada?.id || 0,
            foto: foto,
            descricao: `Foto da atividade ${index + 1}`,
            ordem: index,
            categoria: "ATIVIDADE",
          } as any)
      );

      if (modoEdicao && tarefaSelecionada) {
        // 🔥 SOLUÇÃO DEFINITIVA: Deletar e recriar para substituir fotos
        // A API Go adiciona fotos ao invés de substituir, então precisamos recriar
        console.log(
          "🔄 Deletando tarefa antiga para recriar com fotos atualizadas..."
        );
        await tarefaService.deletar(tarefaSelecionada.id);

        console.log("Recriando tarefa com fotos corretas...");
        await tarefaService.criar(dadosParaEnviar);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await tarefaService.criar(dadosParaEnviar);
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
                  <React.Fragment key={tarefa.id}>
                    <TableRow>
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
                    {/* Linha de Fotos */}
                    {tarefa.fotos && tarefa.fotos.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          sx={{ py: 2, backgroundColor: "#f5f5f5" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              justifyContent: "flex-start",
                            }}
                          >
                            {tarefa.fotos.map((foto, index) => (
                              <Card
                                key={foto.id || index}
                                sx={{
                                  width:
                                    tarefa.fotos!.length === 1
                                      ? 300
                                      : tarefa.fotos!.length === 2
                                      ? 200
                                      : 150,
                                  flexShrink: 0,
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height={
                                    tarefa.fotos!.length === 1
                                      ? 200
                                      : tarefa.fotos!.length === 2
                                      ? 150
                                      : 120
                                  }
                                  image={foto.foto}
                                  alt={foto.descricao || `Foto ${index + 1}`}
                                  sx={{ objectFit: "cover" }}
                                />
                                {foto.descricao && (
                                  <Box sx={{ p: 1 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {foto.descricao}
                                    </Typography>
                                  </Box>
                                )}
                              </Card>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
            <Box>
              <FormControl fullWidth>
                <InputLabel>Responsável (opcional)</InputLabel>
                <Select
                  value={formData.responsavel_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsavel_id: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  label="Responsável (opcional)"
                >
                  <MenuItem value="">-- Nenhum --</MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Sistema de Upload de Múltiplas Fotos */}
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                📸 Fotos da Atividade (máx. 3)
              </Typography>

              {/* Grid de Preview das Fotos */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                {fotosBase64.map((foto, index) => (
                  <Card key={index} sx={{ width: 120, position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={foto}
                      alt={`Foto ${index + 1}`}
                      sx={{ objectFit: "cover" }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const novasFotos = fotosBase64.filter(
                          (_, i) => i !== index
                        );
                        setFotosBase64(novasFotos);
                        toast.info("Foto removida");
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": {
                          backgroundColor: "rgba(255,0,0,0.8)",
                          color: "white",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>

              {/* Botão Adicionar Foto */}
              {fotosBase64.length < 3 && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  fullWidth
                >
                  Adicionar Foto ({fotosBase64.length}/3)
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Validação de tamanho (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Arquivo muito grande. Máximo 5MB.");
                        return;
                      }

                      // Validação de tipo
                      if (!file.type.startsWith("image/")) {
                        toast.error(
                          "Apenas imagens são permitidas (JPG, PNG, GIF)"
                        );
                        return;
                      }

                      // Converter para Base64
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = reader.result as string;
                        setFotosBase64([...fotosBase64, base64]);
                        toast.success("Foto adicionada!");
                      };
                      reader.readAsDataURL(file);

                      // Limpar input
                      e.target.value = "";
                    }}
                  />
                </Button>
              )}

              {fotosBase64.length >= 3 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  ✅ Limite de 3 fotos atingido. Remova uma foto para adicionar
                  outra.
                </Typography>
              )}
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
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="span"
                  sx={{ mr: 1 }}
                >
                  <strong>Status:</strong>
                </Typography>
                <Chip
                  label={tarefaSelecionada.status
                    .replace("_", " ")
                    .toUpperCase()}
                  color={getStatusColor(tarefaSelecionada.status) as any}
                  size="small"
                />
              </Box>
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
                        <Box key={foto.id || index}>
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
