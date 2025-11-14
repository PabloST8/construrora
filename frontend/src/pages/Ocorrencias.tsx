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
  Alert,
  Stack,
  Card,
  CardMedia,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { ocorrenciaService } from "../services/ocorrenciaService";
import { obraService } from "../services/obraService";
import { Ocorrencia, OcorrenciaFormData } from "../types/ocorrencia";
import { formatDate } from "../utils/formatters";

const Ocorrencias: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
    useState<Ocorrencia | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [formData, setFormData] = useState<OcorrenciaFormData>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    periodo: "manha",
    tipo: "outro",
    gravidade: "baixa",
    descricao: "",
    status_resolucao: "pendente",
    acao_tomada: "",
  });

  // Filtros
  const [filtroObra, setFiltroObra] = useState<number>(0);
  const [filtroData, setFiltroData] = useState("");
  const [filtroGravidade, setFiltroGravidade] = useState<
    "baixa" | "media" | "alta" | ""
  >("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [ocorrenciasData, obrasData] = await Promise.all([
        ocorrenciaService.listar(),
        obraService.listar(),
      ]);
      setOcorrencias(Array.isArray(ocorrenciasData) ? ocorrenciasData : []);
      setObras(Array.isArray(obrasData) ? obrasData : []);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      if (filtroObra > 0 && filtroData) {
        const ocorrenciasFiltradas = await ocorrenciaService.buscarPorObraEData(
          filtroObra,
          filtroData
        );
        setOcorrencias(
          Array.isArray(ocorrenciasFiltradas) ? ocorrenciasFiltradas : []
        );
      } else if (filtroGravidade) {
        const ocorrenciasFiltradas = await ocorrenciaService.buscarPorGravidade(
          filtroGravidade
        );
        setOcorrencias(
          Array.isArray(ocorrenciasFiltradas) ? ocorrenciasFiltradas : []
        );
      } else {
        carregarDados();
      }
    } catch (error) {
      toast.error("Erro ao buscar ocorrências");
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltroObra(0);
    setFiltroData("");
    setFiltroGravidade("");
    carregarDados();
  };

  const abrirModalCriacao = () => {
    setFormData({
      obra_id: 0,
      data: new Date().toISOString().split("T")[0],
      periodo: "manha",
      tipo: "outro",
      gravidade: "baixa",
      descricao: "",
      status_resolucao: "pendente",
      acao_tomada: "",
    });
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (ocorrencia: Ocorrencia) => {
    setFormData({
      obra_id: ocorrencia.obra_id,
      data: ocorrencia.data.split("T")[0],
      periodo: ocorrencia.periodo,
      tipo: ocorrencia.tipo,
      gravidade: ocorrencia.gravidade,
      descricao: ocorrencia.descricao,
      status_resolucao: ocorrencia.status_resolucao,
      acao_tomada: ocorrencia.acao_tomada || "",
    });
    setOcorrenciaSelecionada(ocorrencia);
    setModoEdicao(true);
    setModalAberto(true);
  };

  const abrirModalVisualizacao = (ocorrencia: Ocorrencia) => {
    setOcorrenciaSelecionada(ocorrencia);
    setModalVisualizacao(true);
  };

  const handleSalvar = async () => {
    if (!formData.obra_id || !formData.descricao) {
      toast.warning("Preencha obra e descrição");
      return;
    }

    setLoading(true);
    try {
      if (modoEdicao && ocorrenciaSelecionada) {
        await ocorrenciaService.atualizar(ocorrenciaSelecionada.id, formData);
        toast.success("Ocorrência atualizada com sucesso!");
      } else {
        await ocorrenciaService.criar(formData);
        toast.success("Ocorrência criada com sucesso!");
      }
      setModalAberto(false);
      carregarDados();
    } catch (error) {
      toast.error("Erro ao salvar ocorrência");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number, descricao: string) => {
    if (
      !window.confirm(
        `Deseja excluir a ocorrência "${descricao.substring(0, 50)}..."?`
      )
    )
      return;

    setLoading(true);
    try {
      await ocorrenciaService.deletar(id);
      toast.success("Ocorrência excluída com sucesso!");
      carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir ocorrência");
    } finally {
      setLoading(false);
    }
  };

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case "alta":
        return "error";
      case "media":
        return "warning";
      case "baixa":
        return "info";
      default:
        return "default";
    }
  };

  const getGravidadeIcon = (gravidade: string) => {
    switch (gravidade) {
      case "alta":
        return <ErrorIcon />;
      case "media":
        return <WarningIcon />;
      case "baixa":
        return <InfoIcon />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolvida":
        return "success";
      case "em_analise":
        return "warning";
      case "nao_aplicavel":
        return "default";
      default:
        return "error";
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      seguranca: "Segurança",
      qualidade: "Qualidade",
      prazo: "Prazo",
      custo: "Custo",
      clima: "Clima",
      outro: "Outro",
    };
    return tipos[tipo] || tipo;
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
          <Typography variant="h5">⚠️ Ocorrências</Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            onClick={abrirModalCriacao}
          >
            Nova Ocorrência
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
            <FormControl fullWidth>
              <InputLabel>Gravidade</InputLabel>
              <Select
                value={filtroGravidade}
                onChange={(e: any) => setFiltroGravidade(e.target.value)}
                label="Gravidade"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="baixa">Baixa</MenuItem>
                <MenuItem value="media">Média</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={aplicarFiltros} fullWidth>
              Buscar
            </Button>
            <Button variant="outlined" onClick={limparFiltros} fullWidth>
              Limpar
            </Button>
          </Box>
        </Stack>

        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Obra</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="center">Gravidade</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ocorrencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhuma ocorrência encontrada
                  </TableCell>
                </TableRow>
              ) : (
                ocorrencias.map((ocorrencia) => (
                  <TableRow key={ocorrencia.id}>
                    <TableCell>{formatDate(ocorrencia.data)}</TableCell>
                    <TableCell>{getPeriodoLabel(ocorrencia.periodo)}</TableCell>
                    <TableCell>{getObraNome(ocorrencia.obra_id)}</TableCell>
                    <TableCell>{getTipoLabel(ocorrencia.tipo)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={
                          getGravidadeIcon(ocorrencia.gravidade) || undefined
                        }
                        label={ocorrencia.gravidade.toUpperCase()}
                        color={getGravidadeColor(ocorrencia.gravidade) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {ocorrencia.descricao.substring(0, 50)}
                      {ocorrencia.descricao.length > 50 ? "..." : ""}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ocorrencia.status_resolucao
                          .replace("_", " ")
                          .toUpperCase()}
                        color={
                          getStatusColor(ocorrencia.status_resolucao) as any
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        onClick={() => abrirModalVisualizacao(ocorrencia)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => abrirModalEdicao(ocorrencia)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleExcluir(ocorrencia.id, ocorrencia.descricao)
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
          {modoEdicao ? "✏️ Editar Ocorrência" : "➕ Nova Ocorrência"}
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
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e: any) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  label="Tipo"
                >
                  <MenuItem value="seguranca">Segurança</MenuItem>
                  <MenuItem value="qualidade">Qualidade</MenuItem>
                  <MenuItem value="prazo">Prazo</MenuItem>
                  <MenuItem value="custo">Custo</MenuItem>
                  <MenuItem value="clima">Clima</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Gravidade</InputLabel>
                <Select
                  value={formData.gravidade}
                  onChange={(e: any) =>
                    setFormData({ ...formData, gravidade: e.target.value })
                  }
                  label="Gravidade"
                >
                  <MenuItem value="baixa">Baixa (Observação)</MenuItem>
                  <MenuItem value="media">Média (Importante)</MenuItem>
                  <MenuItem value="alta">Alta (Crítico)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Status de Resolução</InputLabel>
                <Select
                  value={formData.status_resolucao}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      status_resolucao: e.target.value,
                    })
                  }
                  label="Status de Resolução"
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_analise">Em Análise</MenuItem>
                  <MenuItem value="resolvida">Resolvida</MenuItem>
                  <MenuItem value="nao_aplicavel">Não Aplicável</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Descrição da Ocorrência"
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
                rows={3}
                label="Ação Tomada (opcional)"
                value={formData.acao_tomada}
                onChange={(e) =>
                  setFormData({ ...formData, acao_tomada: e.target.value })
                }
                helperText="Descreva as medidas tomadas para resolver a ocorrência"
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
        <DialogTitle>👁️ Visualizar Ocorrência</DialogTitle>
        <DialogContent>
          {ocorrenciaSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Alert
                severity={
                  ocorrenciaSelecionada.gravidade === "alta"
                    ? "error"
                    : ocorrenciaSelecionada.gravidade === "media"
                    ? "warning"
                    : "info"
                }
                sx={{ mb: 2 }}
              >
                <strong>
                  Gravidade: {ocorrenciaSelecionada.gravidade.toUpperCase()}
                </strong>
              </Alert>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Obra:</strong>{" "}
                {getObraNome(ocorrenciaSelecionada.obra_id)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Data:</strong> {formatDate(ocorrenciaSelecionada.data)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Período:</strong>{" "}
                {getPeriodoLabel(ocorrenciaSelecionada.periodo)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Tipo:</strong>{" "}
                {getTipoLabel(ocorrenciaSelecionada.tipo)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={ocorrenciaSelecionada.status_resolucao
                    .replace("_", " ")
                    .toUpperCase()}
                  color={
                    getStatusColor(
                      ocorrenciaSelecionada.status_resolucao
                    ) as any
                  }
                  size="small"
                />
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
                {ocorrenciaSelecionada.descricao}
              </Typography>

              {ocorrenciaSelecionada.acao_tomada && (
                <>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    <strong>Ação Tomada:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {ocorrenciaSelecionada.acao_tomada}
                  </Typography>
                </>
              )}
              {ocorrenciaSelecionada.fotos &&
                ocorrenciaSelecionada.fotos.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      <strong>
                        📸 Fotos ({ocorrenciaSelecionada.fotos.length}):
                      </strong>
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      {ocorrenciaSelecionada.fotos.map((foto, index) => (
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

export default Ocorrencias;
