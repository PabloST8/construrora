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
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  PhotoCamera as PhotoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { diarioService } from "../services/diarioService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import FotoUpload from "../components/FotoUpload";
import {
  validarData,
  validarStringNaoVazia,
  validarTamanhoMinimo,
} from "../utils/validators";

interface DiarioForm {
  obra_id: number;
  data: string;
  periodo: string;
  atividades_realizadas: string;
  ocorrencias?: string;
  observacoes?: string;
  responsavel_id: number;
  aprovado_por_id?: number;
  status_aprovacao: string;
  foto?: string; // Base64 da foto
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DiarioObras: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [diarios, setDiarios] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Estados para edição e visualização
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [dialogEdicao, setDialogEdicao] = useState(false);
  const [diarioSelecionado, setDiarioSelecionado] = useState<any>(null);
  const [dadosEdicao, setDadosEdicao] = useState<any>({});

  // Estados para filtros
  const [filtroObra, setFiltroObra] = useState<number>(0);
  const [filtroData, setFiltroData] = useState<string>("");

  const [novoDiario, setNovoDiario] = useState<DiarioForm>({
    obra_id: 0,
    data: "",
    periodo: "",
    atividades_realizadas: "",
    responsavel_id: 0,
    status_aprovacao: "pendente",
  });

  // Função para formatar período
  const formatarPeriodo = (periodo: string) => {
    const periodos: Record<string, string> = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
      integral: "Integral",
    };
    return periodos[periodo] || periodo;
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [diariosRes, obrasRes, pessoasRes] = await Promise.all([
        diarioService.listar(),
        obraService.listar(),
        pessoaService.listar(),
      ]);
      setDiarios(Array.isArray(diariosRes) ? diariosRes : []);
      setObras(Array.isArray(obrasRes) ? obrasRes : []);
      setPessoas(Array.isArray(pessoasRes) ? pessoasRes : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleCadastrar = async () => {
    // ✅ VALIDAÇÕES ANTES DE SALVAR
    if (!novoDiario.obra_id || novoDiario.obra_id === 0) {
      toast.error("Selecione a obra");
      return;
    }

    if (!novoDiario.data || !validarData(novoDiario.data)) {
      toast.error("Data inválida");
      return;
    }

    // Validar que a data não é futura
    const dataEscolhida = new Date(novoDiario.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataEscolhida > hoje) {
      toast.error("❌ A data do diário não pode ser no futuro");
      return;
    }

    if (!novoDiario.periodo) {
      toast.error("Selecione o período");
      return;
    }

    if (!validarStringNaoVazia(novoDiario.atividades_realizadas)) {
      toast.error("Descreva as atividades realizadas");
      return;
    }

    if (!validarTamanhoMinimo(novoDiario.atividades_realizadas, 10)) {
      toast.error("❌ Atividades realizadas deve ter pelo menos 10 caracteres");
      return;
    }

    if (!novoDiario.responsavel_id || novoDiario.responsavel_id === 0) {
      toast.error("Selecione o responsável");
      return;
    }

    try {
      setSalvando(true);

      // Função para adicionar timestamp às datas (API Go requer formato completo)
      const adicionarTimestamp = (data: string): string => {
        if (!data) return "";
        if (data.includes("T")) return data; // Já tem timestamp
        return `${data}T00:00:00Z`; // YYYY-MM-DD → YYYY-MM-DDTHH:MM:SSZ
      };

      // ✅ Preparar dados para envio - 13 campos do modelo Go DiarioObra
      const dadosEnvio: any = {
        obra_id: Number(novoDiario.obra_id),
        data: adicionarTimestamp(novoDiario.data), // ISO 8601 format
        periodo: novoDiario.periodo,
        atividades_realizadas: novoDiario.atividades_realizadas,
        status_aprovacao: novoDiario.status_aprovacao || "pendente",
      };

      // ✅ Adicionar foto se houver (já vem em base64 do FotoUpload)
      if (novoDiario.foto) {
        dadosEnvio.foto = novoDiario.foto;
      }

      // Só adicionar responsavel_id se tiver um valor válido (> 0)
      if (novoDiario.responsavel_id && Number(novoDiario.responsavel_id) > 0) {
        dadosEnvio.responsavel_id = Number(novoDiario.responsavel_id);
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (novoDiario.ocorrencias && novoDiario.ocorrencias.trim()) {
        dadosEnvio.ocorrencias = novoDiario.ocorrencias;
      }
      if (novoDiario.observacoes && novoDiario.observacoes.trim()) {
        dadosEnvio.observacoes = novoDiario.observacoes;
      }
      // N�O enviar aprovado_por_id se n�o tiver valor (evita erro de FK)

      await diarioService.criar(dadosEnvio);
      toast.success("Diário cadastrado com sucesso!");
      setNovoDiario({
        obra_id: 0,
        data: "",
        periodo: "",
        atividades_realizadas: "",
        responsavel_id: 0,
        status_aprovacao: "pendente",
      });
      carregarDados();
    } catch (error: any) {
      console.error("? Erro completo:", error);
      toast.error(error.response?.data?.error || "Erro ao cadastrar di�rio");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Deseja excluir este diário?")) return;
    try {
      await diarioService.deletar(Number(id));
      toast.success("Diário excluído!");
      carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  // Função para filtrar diários
  const diariosFiltrados = diarios.filter((diario) => {
    // Filtro por obra
    if (filtroObra !== 0 && diario.obra_id !== filtroObra) {
      return false;
    }

    // Filtro por data
    if (filtroData !== "") {
      const dataDiario = diario.data?.split("T")[0]; // YYYY-MM-DD
      if (dataDiario !== filtroData) {
        return false;
      }
    }

    return true;
  });

  // === FUNÇÕES DE VISUALIZAÇÃO ===
  const abrirDialogVisualizacao = async (diario: any) => {
    try {
      console.log("👁️ Abrindo visualização do diário:", diario.id);
      const diarioCompleto = await diarioService.buscarPorId(diario.id);
      setDiarioSelecionado(diarioCompleto);
      setDialogVisualizacao(true);
    } catch (error) {
      console.error("Erro ao carregar diário:", error);
      toast.error("Erro ao carregar dados do diário");
    }
  };

  const fecharDialogVisualizacao = () => {
    setDialogVisualizacao(false);
    setDiarioSelecionado(null);
  };

  // === FUNÇÕES DE EDIÇÃO ===
  const abrirDialogEdicao = async (diario: any) => {
    try {
      console.log("✏️ Abrindo edição do diário:", diario.id);
      const diarioCompleto = await diarioService.buscarPorId(diario.id);

      // Função para formatar data (remover timestamp para exibição no input type="date")
      const formatarData = (data: string | undefined | null): string => {
        if (!data) return "";
        if (data.includes("T")) return data.split("T")[0]; // Remove timestamp
        // Já está em formato YYYY-MM-DD
        return data;
      };

      setDiarioSelecionado(diarioCompleto);
      setDadosEdicao({
        obra_id: diarioCompleto.obra_id,
        data: formatarData(diarioCompleto.data), // Formatado para YYYY-MM-DD
        periodo: diarioCompleto.periodo,
        atividades_realizadas: diarioCompleto.atividades_realizadas,
        ocorrencias: diarioCompleto.ocorrencias || "",
        observacoes: diarioCompleto.observacoes || "",
        responsavel_id: diarioCompleto.responsavel_id,
        status_aprovacao: diarioCompleto.status_aprovacao,
        aprovado_por_id: diarioCompleto.aprovado_por_id || 0,
      });
      setDialogEdicao(true);
    } catch (error) {
      console.error("Erro ao carregar diário:", error);
      toast.error("Erro ao carregar dados do diário");
    }
  };

  const fecharDialogEdicao = () => {
    setDialogEdicao(false);
    setDiarioSelecionado(null);
    setDadosEdicao({});
  };

  const salvarEdicao = async () => {
    try {
      setSalvando(true);
      console.log("💾 Salvando edição do diário:", diarioSelecionado.id);

      // Função para adicionar timestamp às datas (API Go requer formato completo)
      const adicionarTimestamp = (data: string): string => {
        if (!data) return "";
        if (data.includes("T")) return data; // Já tem timestamp
        // Converter DD/MM/YYYY para YYYY-MM-DD se necessário
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
          const [dia, mes, ano] = data.split("/");
          return `${ano}-${mes}-${dia}T00:00:00Z`;
        }
        // YYYY-MM-DD → YYYY-MM-DDTHH:MM:SSZ
        return `${data}T00:00:00Z`;
      };

      // ✅ Preparar dados para atualização - 13 campos do modelo Go DiarioObra
      const dadosParaAtualizar: any = {
        obra_id: Number(dadosEdicao.obra_id),
        data: adicionarTimestamp(dadosEdicao.data), // ISO 8601 format
        periodo: dadosEdicao.periodo,
        atividades_realizadas: dadosEdicao.atividades_realizadas,
        responsavel_id: Number(dadosEdicao.responsavel_id),
        status_aprovacao: dadosEdicao.status_aprovacao,
      };

      // ✅ Adicionar campos OPCIONAIS somente se tiverem valor (não enviar strings vazias)
      if (dadosEdicao.ocorrencias && dadosEdicao.ocorrencias.trim() !== "") {
        dadosParaAtualizar.ocorrencias = dadosEdicao.ocorrencias;
      }

      if (dadosEdicao.observacoes && dadosEdicao.observacoes.trim() !== "") {
        dadosParaAtualizar.observacoes = dadosEdicao.observacoes;
      }

      if (dadosEdicao.foto) {
        dadosParaAtualizar.foto = dadosEdicao.foto;
      }

      // ✅ Lógica para aprovado_por_id:
      // - PENDENTE: NÃO enviar o campo (será omitido)
      // - APROVADO/REJEITADO: Obrigatório (ID > 0)
      if (dadosEdicao.status_aprovacao !== "pendente") {
        // Status aprovado ou rejeitado: campo é OBRIGATÓRIO
        if (
          !dadosEdicao.aprovado_por_id ||
          Number(dadosEdicao.aprovado_por_id) === 0
        ) {
          const acao =
            dadosEdicao.status_aprovacao === "aprovado"
              ? "aprovou"
              : "rejeitou";
          toast.error(`Você deve selecionar quem ${acao} o diário.`);
          setSalvando(false);
          return;
        }
        dadosParaAtualizar.aprovado_por_id = Number(
          dadosEdicao.aprovado_por_id
        );
      }
      // Se status = pendente, aprovado_por_id NÃO é adicionado ao payload

      await diarioService.atualizar(diarioSelecionado.id, dadosParaAtualizar);

      toast.success("Diário atualizado com sucesso!");

      // Atualizar lista imediatamente (estado local)
      const novaListaDiarios = diarios.map((d) =>
        d.id === diarioSelecionado.id
          ? { ...d, ...dadosParaAtualizar, id: diarioSelecionado.id }
          : d
      );
      setDiarios(novaListaDiarios);

      fecharDialogEdicao();
      // Recarregar dados do servidor para garantir sincronização
      setTimeout(() => carregarDados(), 500);
    } catch (error: any) {
      console.error("❌ Erro ao salvar edição:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
        <Tab label="Cadastrar" />
        <Tab label="Listar" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Novo Diário de Obra
          </Typography>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Obra</InputLabel>
              <Select
                value={novoDiario.obra_id}
                onChange={(e) =>
                  setNovoDiario({
                    ...novoDiario,
                    obra_id: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={0}>Selecione</MenuItem>
                {obras.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              type="date"
              label="Data"
              value={novoDiario.data}
              onChange={(e) =>
                setNovoDiario({ ...novoDiario, data: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth required>
              <InputLabel>Período</InputLabel>
              <Select
                value={novoDiario.periodo}
                onChange={(e) =>
                  setNovoDiario({ ...novoDiario, periodo: e.target.value })
                }
              >
                <MenuItem value="manha">Manhã</MenuItem>
                <MenuItem value="tarde">Tarde</MenuItem>
                <MenuItem value="noite">Noite</MenuItem>
                <MenuItem value="integral">Integral</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Atividades Realizadas"
              value={novoDiario.atividades_realizadas}
              onChange={(e) =>
                setNovoDiario({
                  ...novoDiario,
                  atividades_realizadas: e.target.value,
                })
              }
              inputProps={{ maxLength: 1000 }}
              helperText={`${novoDiario.atividades_realizadas.length}/1000 caracteres (mínimo 10)`}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Ocorrências (opcional)"
              value={novoDiario.ocorrencias || ""}
              onChange={(e) =>
                setNovoDiario({ ...novoDiario, ocorrencias: e.target.value })
              }
              inputProps={{ maxLength: 500 }}
              helperText={`${
                (novoDiario.ocorrencias || "").length
              }/500 caracteres`}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observações (opcional)"
              value={novoDiario.observacoes || ""}
              onChange={(e) =>
                setNovoDiario({ ...novoDiario, observacoes: e.target.value })
              }
              inputProps={{ maxLength: 500 }}
              helperText={`${
                (novoDiario.observacoes || "").length
              }/500 caracteres`}
            />

            {/* Upload de Foto */}
            <Box
              sx={{
                p: 2,
                border: "1px dashed",
                borderColor: "grey.400",
                borderRadius: 1,
                backgroundColor: "grey.50",
              }}
            >
              <FotoUpload
                foto={novoDiario.foto}
                onFotoChange={(fotoBase64) =>
                  setNovoDiario({
                    ...novoDiario,
                    foto: fotoBase64 || undefined,
                  })
                }
                label="Foto do Progresso (opcional)"
                tamanho={120}
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={novoDiario.responsavel_id}
                onChange={(e) =>
                  setNovoDiario({
                    ...novoDiario,
                    responsavel_id: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={0}>Selecione</MenuItem>
                {pessoas.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCadastrar}
              disabled={salvando}
            >
              {salvando ? <CircularProgress size={24} /> : "Cadastrar"}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Diários Cadastrados ({diariosFiltrados.length})
          </Typography>

          {/* Filtros */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 2 }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Filtrar por Obra</InputLabel>
              <Select
                value={filtroObra}
                onChange={(e) => setFiltroObra(Number(e.target.value))}
                label="Filtrar por Obra"
              >
                <MenuItem value={0}>Todas as obras</MenuItem>
                {obras.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Filtrar por Data"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />

            {(filtroObra !== 0 || filtroData !== "") && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFiltroObra(0);
                  setFiltroData("");
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </Stack>

          <Box sx={{ overflowX: "auto", mt: 2 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#c62828", color: "white" }}>
                  <th style={{ padding: "12px" }}>Ações</th>
                  <th style={{ padding: "12px" }}>Data</th>
                  <th style={{ padding: "12px" }}>Período</th>
                  <th style={{ padding: "12px" }}>Atividades</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Fotos</th>
                </tr>
              </thead>
              <tbody>
                {diariosFiltrados.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px" }}>
                      <Stack direction="row" spacing={0.5}>
                        {/* Botão Visualizar */}
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogVisualizacao(d)}
                          sx={{
                            backgroundColor: "#2196f3",
                            color: "white",
                            "&:hover": { backgroundColor: "#1976d2" },
                          }}
                          title="Visualizar"
                        >
                          <ViewIcon sx={{ fontSize: 16 }} />
                        </IconButton>

                        {/* Botão Editar */}
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogEdicao(d)}
                          sx={{
                            backgroundColor: "#ff9800",
                            color: "white",
                            "&:hover": { backgroundColor: "#f57c00" },
                          }}
                          title="Editar"
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>

                        {/* Botão Excluir */}
                        <IconButton
                          size="small"
                          onClick={() => handleExcluir(d.id!)}
                          sx={{
                            backgroundColor: "#f44336",
                            color: "white",
                            "&:hover": { backgroundColor: "#d32f2f" },
                          }}
                          title="Excluir"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </td>
                    <td style={{ padding: "12px" }}>{d.data}</td>
                    <td style={{ padding: "12px" }}>
                      {formatarPeriodo(d.periodo)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {d.atividades_realizadas.substring(0, 50)}...
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Chip
                        label={d.status_aprovacao}
                        color={
                          d.status_aprovacao === "aprovado"
                            ? "success"
                            : d.status_aprovacao === "rejeitado"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    </td>
                    <td style={{ padding: "12px" }}>
                      {d.foto ? (
                        <Chip
                          icon={<PhotoIcon />}
                          label="Com foto"
                          color="primary"
                          size="small"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sem fotos
                        </Typography>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </TabPanel>

      {/* === DIALOG DE VISUALIZAÇÃO === */}
      <Dialog
        open={dialogVisualizacao}
        onClose={fecharDialogVisualizacao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Visualizar Diário de Obra
          <IconButton onClick={fecharDialogVisualizacao}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {diarioSelecionado && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Data"
                  value={diarioSelecionado.data || ""}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label="Período"
                  value={formatarPeriodo(diarioSelecionado.periodo) || ""}
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <TextField
                fullWidth
                label="Atividades Realizadas"
                value={diarioSelecionado.atividades_realizadas || ""}
                multiline
                rows={4}
                InputProps={{ readOnly: true }}
              />

              {diarioSelecionado.ocorrencias && (
                <TextField
                  fullWidth
                  label="Ocorrências"
                  value={diarioSelecionado.ocorrencias}
                  multiline
                  rows={2}
                  InputProps={{ readOnly: true }}
                />
              )}

              {diarioSelecionado.observacoes && (
                <TextField
                  fullWidth
                  label="Observações"
                  value={diarioSelecionado.observacoes}
                  multiline
                  rows={2}
                  InputProps={{ readOnly: true }}
                />
              )}

              <TextField
                fullWidth
                label="Status de Aprovação"
                value={diarioSelecionado.status_aprovacao || ""}
                InputProps={{ readOnly: true }}
              />

              {/* Foto */}
              {diarioSelecionado.foto && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Foto do Diário
                  </Typography>
                  <Card sx={{ maxWidth: 600, mx: "auto" }}>
                    <CardMedia
                      component="img"
                      image={diarioSelecionado.foto}
                      alt="Foto do diário de obra"
                      sx={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 400,
                        objectFit: "contain",
                      }}
                    />
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogVisualizacao}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG DE EDIÇÃO === */}
      <Dialog
        open={dialogEdicao}
        onClose={fecharDialogEdicao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Editar Diário de Obra
          <IconButton onClick={fecharDialogEdicao}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {diarioSelecionado && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Obra</InputLabel>
                  <Select
                    value={dadosEdicao.obra_id || 0}
                    onChange={(e) =>
                      setDadosEdicao({
                        ...dadosEdicao,
                        obra_id: Number(e.target.value),
                      })
                    }
                  >
                    <MenuItem value={0}>Selecione</MenuItem>
                    {obras.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  value={dadosEdicao.data || ""}
                  onChange={(e) =>
                    setDadosEdicao({ ...dadosEdicao, data: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={dadosEdicao.periodo || ""}
                    onChange={(e) =>
                      setDadosEdicao({
                        ...dadosEdicao,
                        periodo: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="manha">Manhã</MenuItem>
                    <MenuItem value="tarde">Tarde</MenuItem>
                    <MenuItem value="noite">Noite</MenuItem>
                    <MenuItem value="integral">Integral</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Responsável</InputLabel>
                  <Select
                    value={dadosEdicao.responsavel_id || 0}
                    onChange={(e) =>
                      setDadosEdicao({
                        ...dadosEdicao,
                        responsavel_id: Number(e.target.value),
                      })
                    }
                  >
                    <MenuItem value={0}>Selecione</MenuItem>
                    {pessoas.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Atividades Realizadas"
                value={dadosEdicao.atividades_realizadas || ""}
                onChange={(e) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    atividades_realizadas: e.target.value,
                  })
                }
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Ocorrências (opcional)"
                  value={dadosEdicao.ocorrencias || ""}
                  onChange={(e) =>
                    setDadosEdicao({
                      ...dadosEdicao,
                      ocorrencias: e.target.value,
                    })
                  }
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observações (opcional)"
                  value={dadosEdicao.observacoes || ""}
                  onChange={(e) =>
                    setDadosEdicao({
                      ...dadosEdicao,
                      observacoes: e.target.value,
                    })
                  }
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={dadosEdicao.status_aprovacao || "pendente"}
                  onChange={(e) =>
                    setDadosEdicao({
                      ...dadosEdicao,
                      status_aprovacao: e.target.value,
                    })
                  }
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="aprovado">Aprovado</MenuItem>
                  <MenuItem value="rejeitado">Rejeitado</MenuItem>
                </Select>
              </FormControl>

              {/* ✅ Campo Aprovado Por - visível sempre, obrigatório se status ≠ pendente */}
              <FormControl
                fullWidth
                required={dadosEdicao.status_aprovacao !== "pendente"}
              >
                <InputLabel>
                  Aprovado/Rejeitado Por{" "}
                  {dadosEdicao.status_aprovacao !== "pendente"
                    ? "*"
                    : "(opcional)"}
                </InputLabel>
                <Select
                  value={dadosEdicao.aprovado_por_id || 0}
                  onChange={(e) =>
                    setDadosEdicao({
                      ...dadosEdicao,
                      aprovado_por_id: Number(e.target.value),
                    })
                  }
                >
                  <MenuItem value={0}>
                    {dadosEdicao.status_aprovacao === "pendente"
                      ? "Ninguém"
                      : "Selecione"}
                  </MenuItem>
                  {pessoas.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogEdicao} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={salvarEdicao}
            variant="contained"
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={20} /> : null}
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiarioObras;
