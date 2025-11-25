import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import {
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { obraService } from "../services/obraService";
import api from "../services/api";
import { Obra } from "../types/obra";
import { Tarefa } from "../types/tarefa";
import { Ocorrencia } from "../types/ocorrencia";

// Interfaces COMPLETAS para os dados da API Go
interface EquipeDiario {
  id: number;
  diario_id: number;
  codigo?: string;
  descricao: string;
  quantidade_utilizada: number;
  horas_trabalhadas?: number;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
}

interface EquipamentoDiario {
  id: number;
  diario_id: number;
  codigo?: string;
  descricao: string;
  quantidade_utilizada: number;
  horas_uso?: number;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
}

// Interface removida - não utilizada após implementação dos novos endpoints
// interface MaterialDiario {
//   id: number;
//   diario_id: number;
//   codigo?: string;
//   descricao: string;
//   quantidade: number;
//   unidade: string;
//   fornecedor?: string;
//   valor_unitario?: number;
//   valor_total?: number;
//   observacoes?: string;
//   created_at: string;
//   updated_at?: string;
// }

const DiarioObras: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Dados do relatório
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [equipe, setEquipe] = useState<EquipeDiario[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoDiario[]>([]);

  useEffect(() => {
    carregarObras();
  }, []);

  const carregarObras = async () => {
    try {
      const data = await obraService.listar();
      const obrasArray = Array.isArray(data) ? data : [];
      setObras(obrasArray);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
      toast.error("Erro ao carregar obras");
    }
  };

  const gerarRelatorio = async () => {
    if (!obraId) {
      toast.warning("Selecione uma obra");
      return;
    }

    setLoading(true);

    // Limpar dados anteriores antes de buscar novos
    setTarefas([]);
    setOcorrencias([]);
    setEquipe([]);
    setEquipamentos([]);

    try {
      // 1. Buscar dados da obra
      const obra = obras.find((o) => o.id === obraId);
      setObraSelecionada(obra || null);

      console.log("Gerando relatório para obra ID:", obraId);

      // 2. ✨ NOVO: Buscar TODAS as tarefas da obra (sem filtro de data)
      // Endpoint: GET /tarefas/obra/:obra_id
      try {
        const tarefasResponse = await api.get(`/tarefas/obra/${obraId}`);
        const tarefasData =
          tarefasResponse.data.data || tarefasResponse.data || [];
        console.log("Tarefas recebidas (histórico completo):", tarefasData);
        console.log("Quantidade de tarefas:", tarefasData.length);
        setTarefas(Array.isArray(tarefasData) ? tarefasData : []);
      } catch (err) {
        console.warn(
          "⚠️ Endpoint /tarefas/obra/:id não encontrado, tentando fallback..."
        );
        // Fallback: Tentar endpoint antigo com query params
        try {
          const tarefasResponse = await api.get(`/tarefas`, {
            params: { obra_id: obraId },
          });
          const tarefasData =
            tarefasResponse.data.data || tarefasResponse.data || [];
          setTarefas(Array.isArray(tarefasData) ? tarefasData : []);
        } catch {
          setTarefas([]);
        }
      }

      // 3. ✨ NOVO: Buscar TODAS as ocorrências da obra (sem filtro de data)
      // Endpoint: GET /ocorrencias/obra/:obra_id
      try {
        const ocorrenciasResponse = await api.get(
          `/ocorrencias/obra/${obraId}`
        );
        const ocorrenciasData =
          ocorrenciasResponse.data.data || ocorrenciasResponse.data || [];
        console.log(
          "⚠️ Ocorrências recebidas (histórico completo):",
          ocorrenciasData
        );
        console.log("Quantidade de ocorrências:", ocorrenciasData.length);
        setOcorrencias(Array.isArray(ocorrenciasData) ? ocorrenciasData : []);
      } catch (err) {
        console.warn(
          "⚠️ Endpoint /ocorrencias/obra/:id não encontrado, tentando fallback..."
        );
        // Fallback: Tentar endpoint antigo com query params
        try {
          const ocorrenciasResponse = await api.get(`/ocorrencias`, {
            params: { obra_id: obraId },
          });
          const ocorrenciasData =
            ocorrenciasResponse.data.data || ocorrenciasResponse.data || [];
          setOcorrencias(Array.isArray(ocorrenciasData) ? ocorrenciasData : []);
        } catch {
          setOcorrencias([]);
        }
      }

      // 4. ✨ NOVO: Buscar equipe/equipamentos direto da obra (endpoint sem data)
      // Arrays consolidados
      let equipeConsolidada: EquipeDiario[] = [];
      let equipamentosConsolidados: EquipamentoDiario[] = [];

      // Tentar novo endpoint GET /equipe-diario/obra/:obra_id
      try {
        const equipeResp = await api.get(`/equipe-diario/obra/${obraId}`);
        const equipeData = equipeResp.data.data || equipeResp.data || [];
        equipeConsolidada = Array.isArray(equipeData) ? equipeData : [];
        console.log(
          "👷 Equipe consolidada (histórico completo):",
          equipeConsolidada
        );
      } catch (err: any) {
        console.warn(
          "⚠️ Endpoint /equipe-diario/obra/:id não encontrado, usando método antigo..."
        );
        // Fallback: Buscar por diários
        try {
          const diariosResponse = await api.get(`/diarios/obra/${obraId}`);
          // ✅ FIX: Extrair data corretamente
          const responseData =
            diariosResponse.data.data || diariosResponse.data;

          // ✅ FIX: Verificar se responseData é null ou não é um array
          let diariosData: any[] = [];
          if (responseData === null || responseData === undefined) {
            console.warn("Nenhum diário encontrado para esta obra");
            diariosData = [];
          } else if (Array.isArray(responseData)) {
            diariosData = responseData;
          } else {
            console.warn(
              "⚠️ diariosData não é um array nem null, convertendo:",
              responseData
            );
            diariosData = [];
          }

          console.log("Diários da obra:", diariosData);

          // Buscar equipe de cada diário
          for (const diario of diariosData) {
            try {
              const equipeResp = await api.get(
                `/equipe-diario/diario/${diario.id}`
              );
              const equipeData = equipeResp.data.data || equipeResp.data || [];
              equipeConsolidada.push(
                ...(Array.isArray(equipeData) ? equipeData : [])
              );
            } catch (err2: any) {
              // ✅ FIX: Não logar erro 500 para cada diário (muito verboso)
              if (err2.response?.status === 500) {
                console.warn(
                  `⚠️ Erro 500 ao buscar equipe do diário ${diario.id} (sem dados cadastrados)`
                );
              } else {
                console.error(
                  `Erro ao buscar equipe do diário ${diario.id}:`,
                  err2.message
                );
              }
            }
          }
        } catch (diariosErr: any) {
          console.error("Erro ao buscar diários:", diariosErr.message);
        }
      }

      // Buscar equipamentos da obra
      try {
        const equipResp = await api.get(`/equipamento-diario/obra/${obraId}`);
        const equipData = equipResp.data.data || equipResp.data || [];
        equipamentosConsolidados = Array.isArray(equipData) ? equipData : [];
        console.log(
          "🚜 Equipamentos consolidados (histórico completo):",
          equipamentosConsolidados
        );
      } catch (err) {
        console.warn("Endpoint /equipamento-diario/obra/:id não encontrado");
        equipamentosConsolidados = [];
      }

      console.log(
        `✅ Relatório gerado: ${tarefas.length} tarefas, ${ocorrencias.length} ocorrências, ${equipeConsolidada.length} membros de equipe`
      );

      setEquipe(equipeConsolidada);
      setEquipamentos(equipamentosConsolidados);

      toast.success("Relatório gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      toast.error(error.response?.data?.error || "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const formatarData = (dataISO: string) => {
    if (!dataISO) return "N/A";
    try {
      // Parse manual para evitar problema de fuso horário
      const dateStr = dataISO.includes("T") ? dataISO.split("T")[0] : dataISO;
      const [ano, mes, dia] = dateStr.split("-");
      return `${dia}/${mes}/${ano}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          📖 DIÁRIO DE OBRAS
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box sx={{ flex: "1 1 70%" }}>
            <FormControl fullWidth>
              <InputLabel>Obra *</InputLabel>
              <Select
                value={obraId}
                onChange={(e) => {
                  const novaObraId = Number(e.target.value);
                  setObraId(novaObraId);
                  // Limpar relatório anterior ao trocar de obra
                  setObraSelecionada(null);
                  setTarefas([]);
                  setOcorrencias([]);
                  setEquipe([]);
                  setEquipamentos([]);
                }}
                label="Obra *"
              >
                <MenuItem value={0}>Selecione uma obra</MenuItem>
                {obras.map((obra) => (
                  <MenuItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: "1 1 30%" }}>
            <Button
              fullWidth
              variant="contained"
              onClick={gerarRelatorio}
              disabled={loading || !obraId}
              sx={{ height: 56 }}
            >
              {loading ? <CircularProgress size={24} /> : "Gerar Relatório"}
            </Button>
          </Box>
        </Stack>

        {obraSelecionada && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={imprimirRelatorio}
            >
              Imprimir
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => toast.info("Exportar PDF em desenvolvimento")}
            >
              Exportar PDF
            </Button>
          </Stack>
        )}
      </Paper>

      {/* RELATÓRIO CONSOLIDADO */}
      {obraSelecionada && (
        <Paper sx={{ p: 4 }} id="relatorio-print">
          {/* CABEÇALHO */}
          <Box
            sx={{
              textAlign: "center",
              mb: 3,
              borderBottom: "2px solid #333",
              pb: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              DIÁRIO DE OBRAS
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              OBRA: {obraSelecionada.nome.toUpperCase()}
            </Typography>
            {obraSelecionada.contratanteNome && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                CONTRATANTE: {obraSelecionada.contratanteNome.toUpperCase()}
              </Typography>
            )}
          </Box>

          {/* INFORMAÇÕES DA OBRA - TABELA COMPLETA */}
          <TableContainer sx={{ mb: 3, border: "1px solid #000" }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      border: "1px solid #000",
                      width: "15%",
                    }}
                  >
                    Obra
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #000", width: "35%" }}>
                    {obraSelecionada.nome}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      border: "1px solid #000",
                      width: "15%",
                    }}
                  >
                    Nº CONTRATO
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #000", width: "35%" }}>
                    {obraSelecionada.contrato_numero ||
                      obraSelecionada.contratoNumero ||
                      "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #000" }}
                  >
                    Prazo de obra
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #000" }}>
                    {obraSelecionada.prazo_dias ||
                      obraSelecionada.prazoDias ||
                      "N/A"}{" "}
                    DIAS
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #000" }}
                  >
                    CONTRATADA
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #000" }}>
                    {obraSelecionada.contratanteNome || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #000" }}
                  >
                    Responsável técnico
                  </TableCell>
                  <TableCell colSpan={3} sx={{ border: "1px solid #000" }}>
                    {obraSelecionada.responsavelNome || "N/A"}
                    {obraSelecionada.art &&
                      ` | Registro: ${obraSelecionada.art}`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* TAREFAS REALIZADAS */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 1,
                backgroundColor: "#d0d0d0",
                p: 1,
                textAlign: "center",
                border: "1px solid #000",
              }}
            >
              Tarefas realizadas
            </Typography>
            {tarefas.length > 0 ? (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                      <TableCell
                        sx={{ fontWeight: "bold", border: "1px solid #000" }}
                      >
                        Descrição
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "100px",
                        }}
                        align="center"
                      >
                        Data
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "80px",
                        }}
                        align="center"
                      >
                        Período
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "110px",
                        }}
                        align="center"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "80px",
                        }}
                        align="center"
                      >
                        % Conclusão
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tarefas.map((tarefa, index) => (
                      <React.Fragment key={tarefa.id || index}>
                        <TableRow>
                          <TableCell sx={{ border: "1px solid #000" }}>
                            {tarefa.descricao}
                            {tarefa.observacao && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "#666",
                                  fontStyle: "italic",
                                  mt: 0.5,
                                }}
                              >
                                Obs: {tarefa.observacao}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #000" }}
                            align="center"
                          >
                            {formatarData(tarefa.data)}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #000" }}
                            align="center"
                          >
                            {tarefa.periodo?.toUpperCase() || "INTEGRAL"}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #000" }}
                            align="center"
                          >
                            {tarefa.status === "em_andamento"
                              ? "EM ANDAMENTO"
                              : tarefa.status === "concluida"
                              ? "CONCLUÍDA"
                              : tarefa.status === "planejada"
                              ? "PLANEJADA"
                              : tarefa.status === "cancelada"
                              ? "CANCELADA"
                              : "N/A"}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #000" }}
                            align="center"
                          >
                            {tarefa.percentual_conclusao !== undefined
                              ? `${tarefa.percentual_conclusao}%`
                              : "0%"}
                          </TableCell>
                        </TableRow>
                        {/* Linha de Fotos */}
                        {tarefa.fotos && tarefa.fotos.length > 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              sx={{
                                p: 1,
                                border: "1px solid #000",
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                }}
                              >
                                {tarefa.fotos.map((foto, fotoIndex) => (
                                  <Box
                                    key={foto.id || fotoIndex}
                                    sx={{
                                      width: "33.33%",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <CardMedia
                                      component="img"
                                      image={foto.foto}
                                      alt={`Foto ${fotoIndex + 1}`}
                                      sx={{
                                        width: "100%",
                                        height: 300,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontStyle: "italic",
                  color: "#666",
                  p: 2,
                  border: "1px solid #000",
                  textAlign: "center",
                }}
              >
                Nenhuma tarefa registrada nesta obra.
              </Typography>
            )}
          </Box>

          {/* OCORRÊNCIAS */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 1,
                backgroundColor: "#d0d0d0",
                p: 1,
                textAlign: "center",
                border: "1px solid #000",
              }}
            >
              Ocorrências
            </Typography>
            {ocorrencias.length > 0 ? (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                      <TableCell
                        sx={{ fontWeight: "bold", border: "1px solid #000" }}
                      >
                        Descrição
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "100px",
                        }}
                        align="center"
                      >
                        Data
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "100px",
                        }}
                        align="center"
                      >
                        Tipo
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "80px",
                        }}
                        align="center"
                      >
                        Gravidade
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "120px",
                        }}
                        align="center"
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ocorrencias.map((ocorrencia, index) => (
                      <TableRow key={ocorrencia.id || index}>
                        <TableCell sx={{ border: "1px solid #000" }}>
                          {ocorrencia.descricao}
                          {ocorrencia.acao_tomada && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                color: "#666",
                                fontStyle: "italic",
                                mt: 0.5,
                              }}
                            >
                              Ação: {ocorrencia.acao_tomada}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #000" }}
                          align="center"
                        >
                          {formatarData(ocorrencia.data)}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #000" }}
                          align="center"
                        >
                          {ocorrencia.tipo === "seguranca"
                            ? "SEGURANÇA"
                            : ocorrencia.tipo === "qualidade"
                            ? "QUALIDADE"
                            : ocorrencia.tipo === "prazo"
                            ? "PRAZO"
                            : ocorrencia.tipo === "custo"
                            ? "CUSTO"
                            : ocorrencia.tipo === "clima"
                            ? "CLIMA"
                            : ocorrencia.tipo === "ambiental"
                            ? "AMBIENTAL"
                            : ocorrencia.tipo === "trabalhista"
                            ? "TRABALHISTA"
                            : ocorrencia.tipo === "equipamento"
                            ? "EQUIPAMENTO"
                            : ocorrencia.tipo === "material"
                            ? "MATERIAL"
                            : "GERAL"}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #000", fontWeight: "bold" }}
                          align="center"
                        >
                          <span
                            style={{
                              color:
                                ocorrencia.gravidade === "critica"
                                  ? "#d32f2f"
                                  : ocorrencia.gravidade === "alta"
                                  ? "#f57c00"
                                  : ocorrencia.gravidade === "media"
                                  ? "#ffa726"
                                  : "#4caf50",
                            }}
                          >
                            {ocorrencia.gravidade?.toUpperCase() || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #000" }}
                          align="center"
                        >
                          {ocorrencia.status_resolucao === "em_tratamento"
                            ? "EM TRATAMENTO"
                            : ocorrencia.status_resolucao === "em_analise"
                            ? "EM ANÁLISE"
                            : ocorrencia.status_resolucao === "nao_aplicavel"
                            ? "NÃO APLICÁVEL"
                            : ocorrencia.status_resolucao?.toUpperCase() ||
                              "PENDENTE"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          textAlign: "center",
                          p: 2,
                        }}
                      >
                        Não houve ocorrências
                      </TableCell>
                      <TableCell
                        sx={{ border: "1px solid #000", width: "200px" }}
                      ></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* EQUIPE ENVOLVIDA */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 1,
                backgroundColor: "#d0d0d0",
                p: 1,
                textAlign: "center",
                border: "1px solid #000",
              }}
            >
              Equipe envolvida
            </Typography>
            {equipe.length > 0 ? (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "100px",
                        }}
                      >
                        Código
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", border: "1px solid #000" }}
                      >
                        Descrição
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "200px",
                        }}
                        align="center"
                      >
                        Quantidade utilizada
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipe.map((membro, index) => (
                      <TableRow key={membro.id || index}>
                        <TableCell sx={{ border: "1px solid #000" }}>
                          {membro.codigo || "N/A"}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #000" }}>
                          {membro.descricao}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #000" }}
                          align="center"
                        >
                          {membro.quantidade_utilizada}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          textAlign: "center",
                          p: 2,
                        }}
                        colSpan={3}
                      >
                        Nenhuma equipe registrada
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* EQUIPAMENTOS/MÁQUINAS UTILIZADOS */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 1,
                backgroundColor: "#d0d0d0",
                p: 1,
                textAlign: "center",
                border: "1px solid #000",
              }}
            >
              Equipamentos/Máquinas utilizados
            </Typography>
            {equipamentos.length > 0 ? (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "100px",
                        }}
                      >
                        Código
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", border: "1px solid #000" }}
                      >
                        Descrição
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000",
                          width: "200px",
                        }}
                        align="center"
                      >
                        Quantidade utilizada
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipamentos.map((equip, index) => (
                      <TableRow key={equip.id || index}>
                        <TableCell sx={{ border: "1px solid #000" }}>
                          {equip.codigo || "N/A"}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #000" }}>
                          {equip.descricao}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #000" }}
                          align="center"
                        >
                          {equip.quantidade_utilizada}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          textAlign: "center",
                          p: 2,
                        }}
                        colSpan={3}
                      >
                        Nenhum equipamento registrado
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* ASSINATURAS */}
          <Box sx={{ mt: 6, display: "flex", justifyContent: "space-between" }}>
            <Box
              sx={{
                textAlign: "center",
                width: "45%",
                borderTop: "1px solid #000",
                pt: 1,
              }}
            >
              <Typography variant="body2">Responsável/Empresa</Typography>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                width: "45%",
                borderTop: "1px solid #000",
                pt: 1,
              }}
            >
              <Typography variant="body2">Responsável/Prefeitura</Typography>
            </Box>
          </Box>

          {/* RODAPÉ */}
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #ddd" }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Relatório gerado em {new Date().toLocaleDateString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DiarioObras;
