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
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { ocorrenciaService } from "../services/ocorrenciaService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import { Ocorrencia, OcorrenciaFormData } from "../types/ocorrencia";
import { Pessoa } from "../types/pessoa";
import { formatDate } from "../utils/formatters";

const OcorrenciasNovo: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
    useState<Ocorrencia | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [fotosBase64, setFotosBase64] = useState<string[]>([]);

  const [formData, setFormData] = useState<OcorrenciaFormData>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    periodo: "manha",
    tipo: "geral",
    gravidade: "media",
    descricao: "",
    responsavel_id: undefined,
    status_resolucao: "pendente",
    acao_tomada: "",
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
      const [ocorrenciasData, obrasData, pessoasData] = await Promise.all([
        ocorrenciaService.listar(),
        obraService.listar(),
        pessoaService.listar(),
      ]);
      setOcorrencias(Array.isArray(ocorrenciasData) ? ocorrenciasData : []);
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
        const ocorrenciasFiltradas = await ocorrenciaService.buscarPorObraEData(
          filtroObra,
          filtroData
        );
        setOcorrencias(
          Array.isArray(ocorrenciasFiltradas) ? ocorrenciasFiltradas : []
        );
      } catch (error) {
        toast.error("Erro ao buscar ocorrências");
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
      tipo: "geral",
      gravidade: "media",
      descricao: "",
      responsavel_id: undefined,
      status_resolucao: "pendente",
      acao_tomada: "",
    });
    setFotosBase64([]);
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
      responsavel_id: ocorrencia.responsavel_id,
      status_resolucao: ocorrencia.status_resolucao,
      acao_tomada: ocorrencia.acao_tomada || "",
    });
    // Carregar fotos existentes
    const fotosExistentes =
      ocorrencia.fotos && ocorrencia.fotos.length > 0
        ? ocorrencia.fotos.map((f) => f.foto)
        : [];
    setFotosBase64(fotosExistentes);
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
      const dadosParaEnviar: any = {
        ...formData,
      };

      // Sempre enviar o campo fotos
      dadosParaEnviar.fotos = fotosBase64.map((foto, index) => ({
        id: modoEdicao ? -1 : 0,
        entidade_tipo: "ocorrencia",
        entidade_id: ocorrenciaSelecionada?.id || 0,
        foto: foto,
        descricao: `Foto da ocorrência ${index + 1}`,
        ordem: index,
        categoria: "OCORRENCIA",
      }));

      if (modoEdicao && ocorrenciaSelecionada) {
        // Deletar e recriar para substituir fotos
        console.log(
          "🔄 Deletando ocorrência antiga para recriar com fotos atualizadas..."
        );
        await ocorrenciaService.deletar(ocorrenciaSelecionada.id);

        console.log("➕ Recriando ocorrência com fotos corretas...");
        await ocorrenciaService.criar(dadosParaEnviar);
        toast.success("Ocorrência atualizada com sucesso!");
      } else {
        await ocorrenciaService.criar(dadosParaEnviar);
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
    if (!window.confirm(`Deseja excluir a ocorrência "${descricao}"?`)) return;

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

  const getGravidadeIcon = (gravidade: string) => {
    switch (gravidade) {
      case "critica":
        return <ErrorIcon />;
      case "alta":
        return <WarningIcon />;
      case "media":
        return <InfoIcon />;
      case "baixa":
        return <CheckCircleIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case "critica":
        return "error";
      case "alta":
        return "warning";
      case "media":
        return "info";
      case "baixa":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolvida":
        return "success";
      case "em_tratamento":
        return "primary";
      case "em_analise":
        return "info";
      case "nao_aplicavel":
        return "default";
      default:
        return "warning";
    }
  };

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case "manha":
        return "Manhã";
      case "tarde":
        return "Tarde";
      case "noite":
        return "Noite";
      case "integral":
        return "Integral";
      default:
        return periodo;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: any = {
      seguranca: "Segurança",
      qualidade: "Qualidade",
      prazo: "Prazo",
      custo: "Custo",
      clima: "Clima",
      ambiental: "Ambiental",
      trabalhista: "Trabalhista",
      equipamento: "Equipamento",
      material: "Material",
      geral: "Geral",
    };
    return labels[tipo] || tipo;
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pendente: "Pendente",
      em_tratamento: "Em Tratamento",
      em_analise: "Em Análise",
      resolvida: "Resolvida",
      nao_aplicavel: "Não Aplicável",
    };
    return labels[status] || status;
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
            color="primary"
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
                        icon={getGravidadeIcon(ocorrencia.gravidade)}
                        label={ocorrencia.gravidade.toUpperCase()}
                        color={getGravidadeColor(ocorrencia.gravidade) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ocorrencia.descricao}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(ocorrencia.status_resolucao)}
                        color={
                          getStatusColor(ocorrencia.status_resolucao) as any
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => abrirModalVisualizacao(ocorrencia)}
                        title="Visualizar"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => abrirModalEdicao(ocorrencia)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleExcluir(ocorrencia.id, ocorrencia.descricao)
                        }
                        title="Excluir"
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
          <Stack spacing={2} sx={{ mt: 2 }}>
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
                  onChange={(e) =>
                    setFormData({ ...formData, periodo: e.target.value as any })
                  }
                  label="Período"
                >
                  <MenuItem value="manha">Manhã</MenuItem>
                  <MenuItem value="tarde">Tarde</MenuItem>
                  <MenuItem value="noite">Noite</MenuItem>
                  <MenuItem value="integral">Integral</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value as any })
                  }
                  label="Tipo"
                >
                  <MenuItem value="seguranca">Segurança</MenuItem>
                  <MenuItem value="qualidade">Qualidade</MenuItem>
                  <MenuItem value="prazo">Prazo</MenuItem>
                  <MenuItem value="custo">Custo</MenuItem>
                  <MenuItem value="clima">Clima</MenuItem>
                  <MenuItem value="ambiental">Ambiental</MenuItem>
                  <MenuItem value="trabalhista">Trabalhista</MenuItem>
                  <MenuItem value="equipamento">Equipamento</MenuItem>
                  <MenuItem value="material">Material</MenuItem>
                  <MenuItem value="geral">Geral</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Gravidade</InputLabel>
                <Select
                  value={formData.gravidade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gravidade: e.target.value as any,
                    })
                  }
                  label="Gravidade"
                >
                  <MenuItem value="baixa">Baixa</MenuItem>
                  <MenuItem value="media">Média</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="critica">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status_resolucao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status_resolucao: e.target.value as any,
                    })
                  }
                  label="Status"
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_tratamento">Em Tratamento</MenuItem>
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
                label="Ação Tomada (opcional)"
                value={formData.acao_tomada}
                onChange={(e) =>
                  setFormData({ ...formData, acao_tomada: e.target.value })
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
                📸 Fotos da Ocorrência (máx. 3)
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
        <DialogTitle>👁️ Visualizar Ocorrência</DialogTitle>
        <DialogContent>
          {ocorrenciaSelecionada && (
            <Box sx={{ mt: 2 }}>
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
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="span"
                  sx={{ mr: 1 }}
                >
                  <strong>Gravidade:</strong>
                </Typography>
                <Chip
                  icon={getGravidadeIcon(ocorrenciaSelecionada.gravidade)}
                  label={ocorrenciaSelecionada.gravidade.toUpperCase()}
                  color={
                    getGravidadeColor(ocorrenciaSelecionada.gravidade) as any
                  }
                  size="small"
                />
              </Box>
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
                  label={getStatusLabel(ocorrenciaSelecionada.status_resolucao)}
                  color={
                    getStatusColor(
                      ocorrenciaSelecionada.status_resolucao
                    ) as any
                  }
                  size="small"
                />
              </Box>
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

export default OcorrenciasNovo;
