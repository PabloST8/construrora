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
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { metadadosService } from "../services/metadadosService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import {
  MetadadosDiario,
  MetadadosDiarioFormData,
  PeriodoMetadados,
  StatusAprovacao,
} from "../types/metadados";
import { formatDate } from "../utils/formatters";
import FotoUpload from "../components/FotoUpload";

const MetadadosDiarioPage: React.FC = () => {
  const [metadados, setMetadados] = useState<MetadadosDiario[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [metadadoSelecionado, setMetadadoSelecionado] =
    useState<MetadadosDiario | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [formData, setFormData] = useState<MetadadosDiarioFormData>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    periodo: PeriodoMetadados.INTEGRAL,
    observacoes: "",
    responsavel_id: 0,
    aprovado_por_id: 0,
    status_aprovacao: StatusAprovacao.PENDENTE,
    fotos: [],
  });

  // Filtros
  const [filtroObra, setFiltroObra] = useState<number>(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [metadadosData, obrasData, pessoasData] = await Promise.all([
        metadadosService.listar(),
        obraService.listar(),
        pessoaService.listar(),
      ]);
      setMetadados(Array.isArray(metadadosData) ? metadadosData : []);
      setObras(Array.isArray(obrasData) ? obrasData : []);
      setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    if (filtroObra > 0) {
      setLoading(true);
      try {
        const metadadosFiltrados = await metadadosService.buscarPorObra(
          filtroObra
        );
        setMetadados(
          Array.isArray(metadadosFiltrados) ? metadadosFiltrados : []
        );
      } catch (error) {
        toast.error("Erro ao buscar metadados");
      } finally {
        setLoading(false);
      }
    } else {
      carregarDados();
    }
  };

  const limparFiltros = () => {
    setFiltroObra(0);
    carregarDados();
  };

  const abrirModalCriacao = () => {
    setFormData({
      obra_id: 0,
      data: new Date().toISOString().split("T")[0],
      periodo: PeriodoMetadados.INTEGRAL,
      observacoes: "",
      responsavel_id: 0,
      aprovado_por_id: 0,
      status_aprovacao: StatusAprovacao.PENDENTE,
      fotos: [],
    });
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (metadado: MetadadosDiario) => {
    setMetadadoSelecionado(metadado);
    setFormData({
      obra_id: metadado.obra_id,
      data: metadado.data.split("T")[0],
      periodo: metadado.periodo,
      observacoes: metadado.observacoes || "",
      responsavel_id: metadado.responsavel_id || 0,
      aprovado_por_id: metadado.aprovado_por_id || 0,
      status_aprovacao: metadado.status_aprovacao,
      fotos: metadado.fotos || [],
    });
    setModoEdicao(true);
    setModalAberto(true);
  };

  const abrirModalVisualizacao = (metadado: MetadadosDiario) => {
    setMetadadoSelecionado(metadado);
    setModalVisualizacao(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalVisualizacao(false);
    setMetadadoSelecionado(null);
  };

  const handleSubmit = async () => {
    if (!formData.obra_id || formData.obra_id === 0) {
      toast.error("Selecione uma obra");
      return;
    }

    setLoading(true);
    try {
      if (modoEdicao && metadadoSelecionado) {
        await metadadosService.atualizar(metadadoSelecionado.id, formData);
        toast.success("Metadados atualizados com sucesso!");
      } else {
        await metadadosService.criar(formData);
        toast.success("Metadados criados com sucesso!");
      }
      fecharModal();
      carregarDados();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar metadados");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Deseja realmente excluir estes metadados?")) {
      setLoading(true);
      try {
        await metadadosService.deletar(id);
        toast.success("Metadados excluídos com sucesso!");
        carregarDados();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Erro ao excluir metadados"
        );
      } finally {
        setLoading(false);
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "success";
      case "rejeitado":
        return "error";
      case "pendente":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return <ApprovedIcon />;
      case "rejeitado":
        return <RejectedIcon />;
      case "pendente":
        return <PendingIcon />;
      default:
        return null;
    }
  };

  const getNomePessoa = (id?: number) => {
    if (!id) return "Não informado";
    const pessoa = pessoas.find((p) => p.id === id);
    return pessoa ? pessoa.nome : "Desconhecido";
  };

  const getNomeObra = (id: number) => {
    const obra = obras.find((o) => o.id === id);
    return obra ? obra.titulo : "Desconhecida";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">📋 Metadados do Diário</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={abrirModalCriacao}
          >
            Novo Metadado
          </Button>
        </Box>

        {/* Filtros */}
        <Box sx={{ mb: 3 }}>
          <Stack spacing={2}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Filtrar por Obra</InputLabel>
                <Select
                  value={filtroObra}
                  onChange={(e) => setFiltroObra(Number(e.target.value))}
                >
                  <MenuItem value={0}>Todas as obras</MenuItem>
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id}>
                      {obra.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={aplicarFiltros}>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={limparFiltros}>
                Limpar
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Obra</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aprovado Por</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metadados.map((metadado) => (
                <TableRow key={metadado.id}>
                  <TableCell>{formatDate(metadado.data)}</TableCell>
                  <TableCell>{getPeriodoLabel(metadado.periodo)}</TableCell>
                  <TableCell>{getNomeObra(metadado.obra_id)}</TableCell>
                  <TableCell>
                    {getNomePessoa(metadado.responsavel_id)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={metadado.status_aprovacao}
                      color={getStatusColor(metadado.status_aprovacao) as any}
                      icon={getStatusIcon(metadado.status_aprovacao) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {getNomePessoa(metadado.aprovado_por_id)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => abrirModalVisualizacao(metadado)}
                      title="Visualizar"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      color="warning"
                      onClick={() => abrirModalEdicao(metadado)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(metadado.id)}
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
      </Paper>

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onClose={fecharModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {modoEdicao ? "Editar Metadados" : "Novo Metadado"}
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
                >
                  <MenuItem value={0}>Selecione...</MenuItem>
                  {obras.map((obra) => (
                    <MenuItem key={obra.id} value={obra.id}>
                      {obra.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                type="date"
                label="Data"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Período</InputLabel>
                <Select
                  value={formData.periodo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      periodo: e.target.value as PeriodoMetadados,
                    })
                  }
                >
                  <MenuItem value="manha">Manhã</MenuItem>
                  <MenuItem value="tarde">Tarde</MenuItem>
                  <MenuItem value="integral">Integral</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
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
                >
                  <MenuItem value={0}>Não informado</MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Status de Aprovação</InputLabel>
                <Select
                  value={formData.status_aprovacao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status_aprovacao: e.target.value as StatusAprovacao,
                    })
                  }
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="aprovado">Aprovado</MenuItem>
                  <MenuItem value="rejeitado">Rejeitado</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Aprovado Por</InputLabel>
                <Select
                  value={formData.aprovado_por_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aprovado_por_id: Number(e.target.value),
                    })
                  }
                >
                  <MenuItem value={0}>Não informado</MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observações Gerais"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
              />
            </Box>
            <Box>
              <FotoUpload
                foto={
                  formData.fotos && formData.fotos.length > 0
                    ? formData.fotos[0].foto
                    : ""
                }
                onFotoChange={(novaFoto: string | null) => {
                  if (novaFoto) {
                    setFormData({
                      ...formData,
                      fotos: [
                        {
                          foto: novaFoto,
                          ordem: 0,
                          categoria: "DIARIO",
                          descricao: "Foto do diário",
                        },
                      ],
                    });
                  } else {
                    setFormData({ ...formData, fotos: [] });
                  }
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Visualização */}
      <Dialog
        open={modalVisualizacao}
        onClose={fecharModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Visualizar Metadados</DialogTitle>
        <DialogContent>
          {metadadoSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Data:</strong> {formatDate(metadadoSelecionado.data)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Período:</strong>{" "}
                {getPeriodoLabel(metadadoSelecionado.periodo)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Obra:</strong>{" "}
                {getNomeObra(metadadoSelecionado.obra_id)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Responsável:</strong>{" "}
                {getNomePessoa(metadadoSelecionado.responsavel_id)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={metadadoSelecionado.status_aprovacao}
                  color={
                    getStatusColor(metadadoSelecionado.status_aprovacao) as any
                  }
                  size="small"
                />
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Aprovado Por:</strong>{" "}
                {getNomePessoa(metadadoSelecionado.aprovado_por_id)}
              </Typography>
              {metadadoSelecionado.observacoes && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  <strong>Observações:</strong>
                  <br />
                  {metadadoSelecionado.observacoes}
                </Typography>
              )}
              {metadadoSelecionado.fotos &&
                metadadoSelecionado.fotos.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      <strong>Foto:</strong>
                    </Typography>
                    <img
                      src={metadadoSelecionado.fotos[0].foto}
                      alt="Foto do diário"
                      style={{ maxWidth: "100%", borderRadius: 8 }}
                    />
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MetadadosDiarioPage;
