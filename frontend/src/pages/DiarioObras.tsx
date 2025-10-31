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
  SelectChangeEvent,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { diarioService } from "../services/diarioService";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";

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
      setDiarios(Array.isArray(diariosRes?.data) ? diariosRes.data : []);
      setObras(Array.isArray(obrasRes) ? obrasRes : []);
      setPessoas(Array.isArray(pessoasRes) ? pessoasRes : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleCadastrar = async () => {
    if (
      !novoDiario.obra_id ||
      !novoDiario.data ||
      !novoDiario.periodo ||
      !novoDiario.atividades_realizadas ||
      !novoDiario.responsavel_id
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSalvando(true);

      // Preparar dados para envio (garantir formato correto)
      const dadosEnvio: any = {
        obra_id: Number(novoDiario.obra_id),
        data: novoDiario.data, // Formato YYYY-MM-DD do input type="date"
        periodo: novoDiario.periodo,
        atividades_realizadas: novoDiario.atividades_realizadas,
        status_aprovacao: novoDiario.status_aprovacao || "pendente",
      };

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
      // NÃO enviar aprovado_por_id se não tiver valor (evita erro de FK)

      console.log("📤 Dados enviados:", dadosEnvio);
      console.log("📤 JSON stringified:", JSON.stringify(dadosEnvio, null, 2));
      const response = await diarioService.criar(dadosEnvio);
      console.log("✅ Resposta da API:", response);
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
      console.error("❌ Erro completo:", error);
      console.error("❌ Resposta do servidor:", error.response?.data);
      toast.error(error.response?.data?.error || "Erro ao cadastrar diário");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Deseja excluir este diário?")) return;
    try {
      await diarioService.deletar(id);
      toast.success("Diário excluído!");
      carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir");
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
            />

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
            Diários Cadastrados ({diarios.length})
          </Typography>
          <Box sx={{ overflowX: "auto", mt: 2 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#c62828", color: "white" }}>
                  <th style={{ padding: "12px" }}>Ação</th>
                  <th style={{ padding: "12px" }}>Data</th>
                  <th style={{ padding: "12px" }}>Período</th>
                  <th style={{ padding: "12px" }}>Atividades</th>
                  <th style={{ padding: "12px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {diarios.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleExcluir(d.id!)}
                        sx={{ backgroundColor: "#f44336", color: "white" }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </td>
                    <td style={{ padding: "12px" }}>{d.data}</td>
                    <td style={{ padding: "12px" }}>
                      {formatarPeriodo(d.periodo)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {d.atividades_realizadas.substring(0, 50)}...
                    </td>
                    <td style={{ padding: "12px" }}>{d.status_aprovacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default DiarioObras;
