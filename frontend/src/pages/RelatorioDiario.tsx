import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardMedia,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import {
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Construction as ConstructionIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import relatorioDiarioService, {
  DiarioRelatorioCompleto,
} from "../services/relatorioDiarioService";
import { obraService } from "../services/obraService";

const RelatorioDiario: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [obras, setObras] = useState<any[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number>(0);
  const [relatorio, setRelatorio] = useState<DiarioRelatorioCompleto | null>(
    null
  );

  useEffect(() => {
    carregarObras();
  }, []);

  const carregarObras = async () => {
    try {
      const response = await obraService.listar();
      setObras(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
      toast.error("Erro ao carregar lista de obras");
    }
  };

  const buscarRelatorio = async () => {
    if (!obraSelecionada || obraSelecionada === 0) {
      toast.error("Selecione uma obra");
      return;
    }

    setLoading(true);
    try {
      const dados = await relatorioDiarioService.obterRelatorioFormatado(
        obraSelecionada
      );
      setRelatorio(dados);
      toast.success("Relatório carregado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao buscar relatório:", error);
      const mensagem =
        error.response?.data?.error ||
        "Erro ao buscar relatório. Verifique se existem diários cadastrados para esta obra.";
      toast.error(mensagem);
      setRelatorio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarPDF = () => {
    toast.info("Funcionalidade de exportação PDF em desenvolvimento");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho com Filtros */}
      <Paper sx={{ p: 3, mb: 3 }} className="no-print">
        <Typography variant="h5" gutterBottom>
          📋 Relatório de Diário de Obra
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Selecione a Obra</InputLabel>
            <Select
              value={obraSelecionada}
              onChange={(e) => setObraSelecionada(Number(e.target.value))}
              label="Selecione a Obra"
            >
              <MenuItem value={0}>-- Selecione --</MenuItem>
              {obras.map((obra) => (
                <MenuItem key={obra.id} value={obra.id}>
                  {obra.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={buscarRelatorio}
            disabled={loading || obraSelecionada === 0}
            sx={{ minWidth: "200px" }}
          >
            {loading ? <CircularProgress size={24} /> : "Gerar Relatório"}
          </Button>
        </Box>

        {relatorio && (
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
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
          </Box>
        )}
      </Paper>

      {/* Conteúdo do Relatório */}
      {relatorio && relatorio.informacoes_obra && (
        <Paper sx={{ p: 4 }} id="relatorio-content">
          {/* 1. INFORMAÇÕES DA OBRA */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              DIÁRIO DE OBRA
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {relatorio.informacoes_obra.titulo}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          {/* Cards de Informações */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
              mb: 4,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Número do Contrato
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.numero_contrato || "N/A"}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Contratante
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.contratante}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Prazo da Obra
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.prazo_obra}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Tempo Decorrido
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.tempo_decorrido}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Contratada
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.contratada}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Responsável Técnico
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.responsavel_tecnico}
                </Typography>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{ gridColumn: { xs: "1", sm: "span 2" } }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Registro Profissional
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {relatorio.informacoes_obra.registro_profissional}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 2. TAREFAS REALIZADAS */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ConstructionIcon sx={{ mr: 1 }} /> Tarefas Realizadas
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.light" }}>
                    <TableCell>
                      <strong>Data</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Descrição</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.tarefas_realizadas &&
                  relatorio.tarefas_realizadas.length > 0 ? (
                    relatorio.tarefas_realizadas.map((tarefa, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {(() => {
                            const dateStr = tarefa.data.includes("T")
                              ? tarefa.data.split("T")[0]
                              : tarefa.data;
                            const [ano, mes, dia] = dateStr.split("-");
                            return `${dia}/${mes}/${ano}`;
                          })()}
                        </TableCell>
                        <TableCell>{tarefa.descricao}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        Nenhuma tarefa registrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 3. OCORRÊNCIAS */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              ⚠️ Ocorrências
            </Typography>
            {relatorio.ocorrencias && relatorio.ocorrencias.length > 0 ? (
              relatorio.ocorrencias.map((ocorrencia, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={ocorrencia.tipo}
                        color={
                          ocorrencia.tipo === "PROBLEMA" ? "error" : "default"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2">
                      {ocorrencia.descricao}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Não houve ocorrências
              </Typography>
            )}
          </Box>

          {/* 4. EQUIPE ENVOLVIDA */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <PeopleIcon sx={{ mr: 1 }} /> Equipe Envolvida
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.light" }}>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Descrição</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Quantidade</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.equipe_envolvida &&
                  relatorio.equipe_envolvida.length > 0 ? (
                    relatorio.equipe_envolvida.map((membro, index) => (
                      <TableRow key={index}>
                        <TableCell>{membro.codigo}</TableCell>
                        <TableCell>{membro.descricao}</TableCell>
                        <TableCell align="right">
                          {membro.quantidade_utilizada}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Nenhum membro da equipe registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 5. EQUIPAMENTOS UTILIZADOS */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <BusinessIcon sx={{ mr: 1 }} /> Equipamentos Utilizados
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.light" }}>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Descrição</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Quantidade</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.equipamentos_utilizados &&
                  relatorio.equipamentos_utilizados.length > 0 ? (
                    relatorio.equipamentos_utilizados.map(
                      (equipamento, index) => (
                        <TableRow key={index}>
                          <TableCell>{equipamento.codigo}</TableCell>
                          <TableCell>{equipamento.descricao}</TableCell>
                          <TableCell align="right">
                            {equipamento.quantidade_utilizada}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Nenhum equipamento registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 6. MATERIAIS UTILIZADOS */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <InventoryIcon sx={{ mr: 1 }} /> Materiais Utilizados
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.light" }}>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Descrição</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Quantidade</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Unidade</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Fornecedor</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Valor Unit.</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Valor Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.materiais_utilizados &&
                  relatorio.materiais_utilizados.length > 0 ? (
                    relatorio.materiais_utilizados.map((material, index) => (
                      <TableRow key={index}>
                        <TableCell>{material.codigo}</TableCell>
                        <TableCell>{material.descricao}</TableCell>
                        <TableCell align="right">
                          {material.quantidade.toFixed(2)}
                        </TableCell>
                        <TableCell>{material.unidade}</TableCell>
                        <TableCell>{material.fornecedor || "-"}</TableCell>
                        <TableCell align="right">
                          {material.valor_unitario
                            ? `R$ ${material.valor_unitario.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {material.valor_total
                            ? `R$ ${material.valor_total.toFixed(2)}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum material registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 7. FOTOS */}
          {relatorio.fotos && relatorio.fotos.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                📸 Fotos da Obra
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {relatorio.fotos.map((foto, index) => (
                  <Card key={index}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={foto.url}
                      alt={foto.descricao || `Foto ${index + 1}`}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        {(() => {
                          const dateStr = foto.timestamp.includes("T")
                            ? foto.timestamp.split("T")[0]
                            : foto.timestamp;
                          const [ano, mes, dia] = dateStr.split("-");
                          return `${dia}/${mes}/${ano}`;
                        })()}
                      </Typography>
                      {foto.descricao && (
                        <Typography variant="body2">
                          {foto.descricao}
                        </Typography>
                      )}
                      <Chip
                        label={foto.categoria}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* 8. ASSINATURAS */}
          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 4,
              mt: 4,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Responsável pela Empresa</strong>
              </Typography>
              <Typography variant="body2">
                {relatorio.responsavel_empresa.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {relatorio.responsavel_empresa.cargo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {relatorio.responsavel_empresa.empresa}
              </Typography>
              <Box
                sx={{
                  borderTop: "1px solid #000",
                  mt: 6,
                  pt: 1,
                  width: "80%",
                  mx: "auto",
                }}
              >
                <Typography variant="caption">Assinatura</Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Responsável pela Prefeitura</strong>
              </Typography>
              <Typography variant="body2">
                {relatorio.responsavel_prefeitura.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {relatorio.responsavel_prefeitura.cargo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {relatorio.responsavel_prefeitura.empresa}
              </Typography>
              <Box
                sx={{
                  borderTop: "1px solid #000",
                  mt: 6,
                  pt: 1,
                  width: "80%",
                  mx: "auto",
                }}
              >
                <Typography variant="caption">Assinatura</Typography>
              </Box>
            </Box>
          </Box>

          {/* Rodapé */}
          <Box sx={{ mt: 6, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Relatório gerado em {new Date().toLocaleDateString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Estilo para impressão */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          #relatorio-content {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </Box>
  );
};

export default RelatorioDiario;
