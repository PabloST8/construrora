import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { consolidadoService } from "../services/consolidadoService";
import { obraService } from "../services/obraService";
import { RelatorioFormatado } from "../types/consolidado";
import { formatDate } from "../utils/formatters";

const RelatorioConsolidado: React.FC = () => {
  const [obras, setObras] = useState<any[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number>(0);
  const [relatorio, setRelatorio] = useState<RelatorioFormatado | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarObras();
  }, []);

  const carregarObras = async () => {
    try {
      const obrasData = await obraService.listar();
      setObras(Array.isArray(obrasData) ? obrasData : []);
    } catch (error) {
      toast.error("Erro ao carregar obras");
    }
  };

  const buscarRelatorio = async () => {
    if (!obraSelecionada || obraSelecionada === 0) {
      toast.error("Selecione uma obra");
      return;
    }

    setLoading(true);
    try {
      const relatorioData = await consolidadoService.buscarRelatorioFormatado(
        obraSelecionada
      );
      setRelatorio(relatorioData);
      toast.success("Relatório carregado com sucesso!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao buscar relatório");
      setRelatorio(null);
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = () => {
    if (!relatorio) {
      toast.error("Carregue um relatório primeiro");
      return;
    }
    window.print();
  };

  const exportarJSON = () => {
    if (!relatorio) {
      toast.error("Carregue um relatório primeiro");
      return;
    }

    const dataStr = JSON.stringify(relatorio, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-obra-${obraSelecionada}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exportado com sucesso!");
  };

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade.toLowerCase()) {
      case "alta":
      case "crítico":
        return "error";
      case "media":
      case "importante":
        return "warning";
      case "baixa":
      case "observacao":
        return "info";
      default:
        return "default";
    }
  };

  const getGravidadeIcon = (gravidade: string) => {
    switch (gravidade.toLowerCase()) {
      case "alta":
      case "crítico":
        return <WarningIcon />;
      case "media":
      case "importante":
        return <InfoIcon />;
      case "baixa":
      case "observacao":
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📊 Relatório Consolidado - Diário de Obra
        </Typography>

        {/* Filtros */}
        <Stack spacing={2} sx={{ mt: 2, mb: 3 }}>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Selecione a Obra</InputLabel>
              <Select
                value={obraSelecionada}
                onChange={(e) => setObraSelecionada(Number(e.target.value))}
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
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={buscarRelatorio}
              disabled={loading}
            >
              {loading ? "Carregando..." : "Buscar Relatório"}
            </Button>
            {relatorio && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={gerarPDF}
                >
                  Imprimir
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportarJSON}
                >
                  Exportar JSON
                </Button>
              </>
            )}
          </Box>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Relatório */}
        {relatorio && (
          <Box>
            {/* Cabeçalho */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {relatorio.informacoes_obra?.titulo || "Obra sem título"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Contratante:</strong>{" "}
                  {relatorio.informacoes_obra?.contratante || "N/A"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Endereço:</strong>{" "}
                  {relatorio.informacoes_obra?.endereco || "N/A"}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  <strong>Data do Relatório:</strong>{" "}
                  {formatDate(relatorio.data_relatorio)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Período:</strong> {relatorio.periodo}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={relatorio.status_aprovacao}
                    color={
                      relatorio.status_aprovacao === "aprovado"
                        ? "success"
                        : "warning"
                    }
                    size="small"
                  />
                </Typography>
              </CardContent>
            </Card>

            {/* Tarefas Realizadas */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Tarefas Realizadas (
                  {relatorio.tarefas_realizadas?.length || 0})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {relatorio.tarefas_realizadas &&
                relatorio.tarefas_realizadas.length > 0 ? (
                  <List>
                    {relatorio.tarefas_realizadas.map((tarefa, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={tarefa.descricao}
                          secondary={
                            <>
                              <strong>Status:</strong> {tarefa.status} |{" "}
                              <strong>Progresso:</strong>{" "}
                              {tarefa.percentual_conclusao}%
                              {tarefa.responsavel &&
                                ` | Responsável: ${tarefa.responsavel}`}
                            </>
                          }
                        />
                        <LinearProgress
                          variant="determinate"
                          value={tarefa.percentual_conclusao}
                          sx={{ width: 100, ml: 2 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    Nenhuma tarefa realizada neste período
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Ocorrências */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Ocorrências ({relatorio.ocorrencias?.length || 0})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {relatorio.ocorrencias && relatorio.ocorrencias.length > 0 ? (
                  <List>
                    {relatorio.ocorrencias.map((ocorrencia, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={ocorrencia.descricao}
                          secondary={
                            <>
                              <Chip
                                label={ocorrencia.gravidade}
                                color={
                                  getGravidadeColor(ocorrencia.gravidade) as any
                                }
                                icon={
                                  getGravidadeIcon(ocorrencia.gravidade) as any
                                }
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <strong>Tipo:</strong> {ocorrencia.tipo} |{" "}
                              <strong>Status:</strong>{" "}
                              {ocorrencia.status_resolucao}
                              {ocorrencia.acao_tomada && (
                                <>
                                  <br />
                                  <strong>Ação tomada:</strong>{" "}
                                  {ocorrencia.acao_tomada}
                                </>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success">
                    Nenhuma ocorrência registrada ✅
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Recursos */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              {/* Equipe */}
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      👷 Equipe ({relatorio.equipe_envolvida?.length || 0})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {relatorio.equipe_envolvida &&
                    relatorio.equipe_envolvida.length > 0 ? (
                      <List dense>
                        {relatorio.equipe_envolvida.map((pessoa, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={pessoa} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Não informado
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Equipamentos */}
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🚜 Equipamentos (
                      {relatorio.equipamentos_utilizados?.length || 0})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {relatorio.equipamentos_utilizados &&
                    relatorio.equipamentos_utilizados.length > 0 ? (
                      <List dense>
                        {relatorio.equipamentos_utilizados.map(
                          (equipamento, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={equipamento} />
                            </ListItem>
                          )
                        )}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Não informado
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Materiais */}
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🧱 Materiais (
                      {relatorio.materiais_utilizados?.length || 0})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {relatorio.materiais_utilizados &&
                    relatorio.materiais_utilizados.length > 0 ? (
                      <List dense>
                        {relatorio.materiais_utilizados.map(
                          (material, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={material} />
                            </ListItem>
                          )
                        )}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Não informado
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Stack>

            {/* Observações */}
            {relatorio.observacoes_gerais && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📝 Observações Gerais
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {relatorio.observacoes_gerais}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Fotos */}
            {relatorio.fotos && relatorio.fotos.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📸 Fotos ({relatorio.fotos.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    {relatorio.fotos.map((foto, index) => (
                      <Box key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image={foto.foto}
                            alt={foto.descricao || `Foto ${index + 1}`}
                          />
                          {foto.descricao && (
                            <CardContent>
                              <Typography variant="body2">
                                {foto.descricao}
                              </Typography>
                              <Chip
                                label={foto.categoria}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </CardContent>
                          )}
                        </Card>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Rodapé */}
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  <strong>Responsável pelo Diário:</strong>{" "}
                  {relatorio.responsavel_diario || "Não informado"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Aprovado Por:</strong>{" "}
                  {relatorio.aprovado_por || "Não informado"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Data de Criação:</strong>{" "}
                  {formatDate(relatorio.created_at)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RelatorioConsolidado;
