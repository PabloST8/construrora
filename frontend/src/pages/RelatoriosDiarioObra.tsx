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
  Grid,
  Divider,
  CircularProgress,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { obraService } from "../services/obraService";
import api from "../services/api";

// Types baseados no modelo Go RelatorioDiarioCompleto
interface InfoObra {
  id: number;
  nome: string;
  contrato_numero: string | null;
  contratante_nome: string | null;
  contratada_nome: string | null;
  responsavel_tecnico: string | null;
  data_inicio: string | null;
  prazo_dias: number | null;
  tempo_decorrido: number | null;
  status: string;
  endereco_completo: string | null;
  percentual_concluido: number;
}

interface DiarioInfo {
  id: number;
  data: string;
  periodo: string | null;
  atividades_realizadas: string;
  observacoes: string | null;
  foto: string | null;
  responsavel_id: number | null;
  responsavel_nome: string | null;
  aprovado_por_id: number | null;
  aprovado_por_nome: string | null;
  status_aprovacao: string;
  created_at: string;
  updated_at: string | null;
}

interface ClimaInfo {
  condicao: string | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
  umidade: string | null;
  vento: string | null;
  observacoes: string | null;
  impacto_trabalho: string | null;
}

interface EquipeInfo {
  id: number;
  funcao: string;
  nome: string | null;
  quantidade: number;
  horas_trabalhadas: number;
  periodo_trabalho: string | null;
  observacoes: string | null;
  produtividade_nota: number | null;
}

interface EquipamentoInfo {
  id: number;
  nome: string;
  codigo: string | null;
  tipo: string | null;
  horas_uso: number;
  combustivel_gasto: number | null;
  estado_conservacao: string | null;
  observacoes: string | null;
  proxima_manutencao: string | null;
}

interface MaterialInfo {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  fornecedor: string | null;
  numero_nota: string | null;
  valor_unitario: number | null;
  valor_total: number | null;
  local_aplicacao: string | null;
  observacoes: string | null;
}

interface FotoInfo {
  id: number;
  url: string;
  descricao: string | null;
  timestamp: string;
  local_foto: string | null;
  categoria: string;
}

interface FotosInfo {
  antes_inicio: FotoInfo[];
  durante_execucao: FotoInfo[];
  fim_jornada: FotoInfo[];
  detalhes: FotoInfo[];
  problemas: FotoInfo[];
}

interface ProgressoInfo {
  percentual_dia: number;
  percentual_obra_geral: number;
  areas_executadas: any;
  meta_dia: string | null;
  meta_cumprida: boolean;
  proxima_atividade: string | null;
  prazo_estimado: string | null;
  observacoes: string | null;
}

interface OcorrenciaInfo {
  id: number;
  tipo: string;
  gravidade: string;
  descricao: string;
  acao_tomada: string | null;
  responsavel: string | null;
  status_resolucao: string;
  prazo_resolucao: string | null;
  fotos: string[];
  observacoes: string | null;
}

interface ObservacoesInfo {
  geral: string | null;
  qualidade: string | null;
  seguranca: string | null;
  produtividade: string | null;
  melhorias: string | null;
  proximo_dia: string | null;
}

interface RelatorioDiarioCompleto {
  obra: InfoObra;
  diario: DiarioInfo;
  clima: ClimaInfo;
  equipe: EquipeInfo[];
  equipamentos: EquipamentoInfo[];
  materiais: MaterialInfo[];
  fotos: FotosInfo;
  progresso: ProgressoInfo;
  ocorrencias: OcorrenciaInfo[];
  observacoes: ObservacoesInfo;
}

const RelatoriosDiarioObra: React.FC = () => {
  const [obras, setObras] = useState<any[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number>(0);
  const [relatorio, setRelatorio] = useState<RelatorioDiarioCompleto | null>(
    null
  );
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarObras();
  }, []);

  const carregarObras = async () => {
    try {
      const response = await obraService.listar();
      setObras(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
      toast.error("Erro ao carregar obras");
    }
  };

  const gerarRelatorio = async () => {
    if (obraSelecionada === 0) {
      toast.error("Selecione uma obra");
      return;
    }

    try {
      setCarregando(true);
      const response = await api.get(
        `/diarios/relatorio-formatado/${obraSelecionada}`
      );
      setRelatorio(response.data.data || response.data);
      toast.success("Relatório gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      toast.error(
        error.response?.data?.error || "Erro ao gerar relatório"
      );
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data: string | null): string => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor: number | null): string => {
    if (valor === null || valor === undefined) return "-";
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarPDF = () => {
    toast.info("Funcionalidade de exportação PDF em desenvolvimento");
  };

  if (carregando) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }} className="no-print">
        <Typography variant="h5" gutterBottom>
          📊 Relatório Completo de Diário de Obra
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Selecione a Obra</InputLabel>
            <Select
              value={obraSelecionada}
              onChange={(e) => setObraSelecionada(Number(e.target.value))}
              label="Selecione a Obra"
            >
              <MenuItem value={0}>Selecione</MenuItem>
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id}>
                  {obra.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={gerarRelatorio}
            disabled={obraSelecionada === 0}
          >
            Gerar Relatório
          </Button>

          {relatorio && (
            <>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handleImprimir}
              >
                Imprimir
              </Button>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={handleExportarPDF}
              >
                Exportar PDF
              </Button>
            </>
          )}
        </Stack>
      </Paper>

      {relatorio && relatorio.obra && (
        <Box sx={{ maxWidth: "210mm", margin: "0 auto" }}>
          {/* Cabeçalho da Obra */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: "#c62828" }}>
              {relatorio.obra?.nome || "Sem nome"}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Contrato:</strong>{" "}
                  {relatorio.obra?.contrato_numero || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Contratante:</strong>{" "}
                  {relatorio.obra?.contratante_nome || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Responsável Técnico:</strong>{" "}
                  {relatorio.obra?.responsavel_tecnico || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Data Início:</strong>{" "}
                  {formatarData(relatorio.obra?.data_inicio)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Prazo:</strong> {relatorio.obra?.prazo_dias || 0} dias
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Tempo Decorrido:</strong>{" "}
                  {relatorio.obra?.tempo_decorrido || 0} dias
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={relatorio.obra?.status || "-"}
                    size="small"
                    color="primary"
                  />
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Informações do Diário */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
              📖 Informações do Diário
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Data:</strong> {formatarData(relatorio.diario?.data)}
                </Typography>
                <Typography variant="body2">
                  <strong>Período:</strong> {relatorio.diario?.periodo || "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Responsável:</strong>{" "}
                  {relatorio.diario?.responsavel_nome || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Status Aprovação:</strong>{" "}
                  <Chip
                    label={relatorio.diario?.status_aprovacao || "-"}
                    size="small"
                    color={
                      relatorio.diario?.status_aprovacao === "aprovado"
                        ? "success"
                        : relatorio.diario?.status_aprovacao === "rejeitado"
                        ? "error"
                        : "warning"
                    }
                  />
                </Typography>
                {relatorio.diario?.aprovado_por_nome && (
                  <Typography variant="body2">
                    <strong>Aprovado por:</strong>{" "}
                    {relatorio.diario?.aprovado_por_nome}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Atividades Realizadas:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                  {relatorio.diario?.atividades_realizadas || "-"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Clima */}
          {relatorio.clima && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                ⛅ Condições Climáticas
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Condição:</strong> {relatorio.clima?.condicao || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Temperatura:</strong>{" "}
                    {relatorio.clima?.temperatura_min || 0}°C ~{" "}
                    {relatorio.clima?.temperatura_max || 0}°C
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Umidade:</strong> {relatorio.clima?.umidade || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Vento:</strong> {relatorio.clima?.vento || "-"}
                  </Typography>
                </Grid>
                {relatorio.clima?.impacto_trabalho && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Impacto no Trabalho:</strong>{" "}
                      {relatorio.clima?.impacto_trabalho}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Equipe */}
          {relatorio.equipe && relatorio.equipe.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                👷 Equipe Envolvida
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Função</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Nome</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Quantidade</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Horas</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Observações</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorio.equipe.map((membro) => (
                      <TableRow key={membro.id}>
                        <TableCell>{membro.funcao}</TableCell>
                        <TableCell>{membro.nome || "-"}</TableCell>
                        <TableCell align="center">{membro.quantidade}</TableCell>
                        <TableCell align="center">
                          {membro.horas_trabalhadas}h
                        </TableCell>
                        <TableCell>{membro.observacoes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Equipamentos */}
          {relatorio.equipamentos && relatorio.equipamentos.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                🚜 Equipamentos Utilizados
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Nome</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Código</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Horas de Uso</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Estado</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Observações</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorio.equipamentos.map((equip) => (
                      <TableRow key={equip.id}>
                        <TableCell>{equip.nome}</TableCell>
                        <TableCell>{equip.codigo || "-"}</TableCell>
                        <TableCell align="center">{equip.horas_uso}h</TableCell>
                        <TableCell>
                          {equip.estado_conservacao || "-"}
                        </TableCell>
                        <TableCell>{equip.observacoes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Materiais */}
          {relatorio.materiais && relatorio.materiais.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                🧱 Materiais Consumidos
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Descrição</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Quantidade</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Unidade</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Valor Unit.</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Valor Total</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Fornecedor</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorio.materiais.map((mat) => (
                      <TableRow key={mat.id}>
                        <TableCell>{mat.descricao}</TableCell>
                        <TableCell align="center">{mat.quantidade}</TableCell>
                        <TableCell align="center">{mat.unidade}</TableCell>
                        <TableCell align="right">
                          {formatarMoeda(mat.valor_unitario)}
                        </TableCell>
                        <TableCell align="right">
                          {formatarMoeda(mat.valor_total)}
                        </TableCell>
                        <TableCell>{mat.fornecedor || "-"}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <strong>TOTAL:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {formatarMoeda(
                            relatorio.materiais.reduce(
                              (sum, m) => sum + (m.valor_total || 0),
                              0
                            )
                          )}
                        </strong>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Progresso */}
          {relatorio.progresso && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                📈 Progresso da Obra
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Percentual do Dia:</strong>{" "}
                    {relatorio.progresso?.percentual_dia || 0}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Percentual Obra Geral:</strong>{" "}
                    {relatorio.progresso?.percentual_obra_geral || 0}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Meta Cumprida:</strong>{" "}
                    {relatorio.progresso?.meta_cumprida ? "Sim" : "Não"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {relatorio.progresso?.proxima_atividade && (
                    <Typography variant="body2">
                      <strong>Próxima Atividade:</strong>{" "}
                      {relatorio.progresso?.proxima_atividade}
                    </Typography>
                  )}
                  {relatorio.progresso?.prazo_estimado && (
                    <Typography variant="body2">
                      <strong>Prazo Estimado:</strong>{" "}
                      {relatorio.progresso?.prazo_estimado}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Ocorrências */}
          {relatorio.ocorrencias && relatorio.ocorrencias.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                ⚠️ Ocorrências e Problemas
              </Typography>
              <Divider sx={{ my: 2 }} />
              {relatorio.ocorrencias.map((ocorrencia, index) => (
                <Card key={ocorrencia.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip label={ocorrencia.tipo} size="small" />
                      <Chip
                        label={ocorrencia.gravidade}
                        size="small"
                        color={
                          ocorrencia.gravidade === "ALTA"
                            ? "error"
                            : ocorrencia.gravidade === "MEDIA"
                            ? "warning"
                            : "info"
                        }
                      />
                      <Chip
                        label={ocorrencia.status_resolucao}
                        size="small"
                        color={
                          ocorrencia.status_resolucao === "RESOLVIDO"
                            ? "success"
                            : "warning"
                        }
                      />
                    </Stack>
                    <Typography variant="body2">
                      <strong>Descrição:</strong> {ocorrencia.descricao}
                    </Typography>
                    {ocorrencia.acao_tomada && (
                      <Typography variant="body2">
                        <strong>Ação Tomada:</strong> {ocorrencia.acao_tomada}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}

          {/* Observações Detalhadas */}
          {relatorio.observacoes && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                📝 Observações Detalhadas
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {relatorio.observacoes?.geral && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Geral:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {relatorio.observacoes?.geral}
                    </Typography>
                  </Grid>
                )}
                {relatorio.observacoes?.qualidade && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Qualidade:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {relatorio.observacoes?.qualidade}
                    </Typography>
                  </Grid>
                )}
                {relatorio.observacoes?.seguranca && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Segurança:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {relatorio.observacoes?.seguranca}
                    </Typography>
                  </Grid>
                )}
                {relatorio.observacoes?.produtividade && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Produtividade:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {relatorio.observacoes?.produtividade}
                    </Typography>
                  </Grid>
                )}
                {relatorio.observacoes?.melhorias && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Melhorias:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {relatorio.observacoes?.melhorias}
                    </Typography>
                  </Grid>
                )}
                {relatorio.observacoes?.proximo_dia && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Próximo Dia:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {relatorio.observacoes?.proximo_dia}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Fotos */}
          {relatorio.fotos && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#c62828" }}>
                📷 Registro Fotográfico
              </Typography>
              <Divider sx={{ my: 2 }} />

              {relatorio.fotos?.antes_inicio &&
                relatorio.fotos?.antes_inicio.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Antes do Início
                    </Typography>
                    <Grid container spacing={2}>
                      {relatorio.fotos?.antes_inicio.map((foto) => (
                        <Grid item xs={12} md={4} key={foto.id}>
                          <Card>
                            <img
                              src={foto.url}
                              alt={foto.descricao || "Foto"}
                              style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            />
                            {foto.descricao && (
                              <CardContent>
                                <Typography variant="caption">
                                  {foto.descricao}
                                </Typography>
                              </CardContent>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

              {relatorio.fotos?.durante_execucao &&
                relatorio.fotos?.durante_execucao.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Durante Execução
                    </Typography>
                    <Grid container spacing={2}>
                      {relatorio.fotos?.durante_execucao.map((foto) => (
                        <Grid item xs={12} md={4} key={foto.id}>
                          <Card>
                            <img
                              src={foto.url}
                              alt={foto.descricao || "Foto"}
                              style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            />
                            {foto.descricao && (
                              <CardContent>
                                <Typography variant="caption">
                                  {foto.descricao}
                                </Typography>
                              </CardContent>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

              {relatorio.fotos?.fim_jornada &&
                relatorio.fotos?.fim_jornada.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Fim da Jornada
                    </Typography>
                    <Grid container spacing={2}>
                      {relatorio.fotos?.fim_jornada.map((foto) => (
                        <Grid item xs={12} md={4} key={foto.id}>
                          <Card>
                            <img
                              src={foto.url}
                              alt={foto.descricao || "Foto"}
                              style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            />
                            {foto.descricao && (
                              <CardContent>
                                <Typography variant="caption">
                                  {foto.descricao}
                                </Typography>
                              </CardContent>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
            </Paper>
          )}

          {/* Rodapé */}
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Relatório gerado em {new Date().toLocaleString("pt-BR")}
            </Typography>
          </Paper>
        </Box>
      )}

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default RelatoriosDiarioObra;
