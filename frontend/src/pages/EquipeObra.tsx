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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../services/api";
import { Obra } from "../types/obra";

interface EquipeMembro {
  id?: number;
  obra_id: number;
  data: string;
  codigo?: string;
  descricao: string;
  quantidade_utilizada: number;
  horas_trabalhadas?: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Diario {
  id: number;
  obra_id: number;
  data: string;
  periodo: string;
}

const EquipeObra: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [membroSelecionado, setMembroSelecionado] =
    useState<EquipeMembro | null>(null);
  const [formData, setFormData] = useState<EquipeMembro>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    codigo: "",
    descricao: "",
    quantidade_utilizada: 1,
    horas_trabalhadas: 8,
    observacoes: "",
  });

  useEffect(() => {
    carregarObras();
  }, []);

  useEffect(() => {
    if (obraSelecionada > 0) {
      carregarEquipeCompleta();
    } else {
      setEquipe([]);
    }
  }, [obraSelecionada]);

  const carregarObras = async () => {
    try {
      const response = await api.get("/obras");
      const obrasData = response.data.data || response.data || [];
      setObras(Array.isArray(obrasData) ? obrasData : []);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
      toast.error("Erro ao carregar obras");
    }
  };

  // Carregar TODA a equipe da obra (endpoint: GET /equipe-diario/obra/:id)
  const carregarEquipeCompleta = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/equipe-diario/obra/${obraSelecionada}`);
      const equipeData = response.data.data || response.data || [];
      setEquipe(Array.isArray(equipeData) ? equipeData : []);
      toast.success(
        `Histórico completo: ${equipeData.length} registros de equipe`
      );
    } catch (error) {
      console.error("Erro ao carregar equipe completa:", error);
      toast.error("Erro ao carregar histórico completo da equipe");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDialog = (membro?: EquipeMembro) => {
    if (obraSelecionada === 0) {
      toast.warning("Selecione uma obra primeiro");
      return;
    }

    if (membro) {
      setModoEdicao(true);
      setFormData({ ...membro });
    } else {
      setModoEdicao(false);
      setFormData({
        obra_id: obraSelecionada,
        data: new Date().toISOString().split("T")[0],
        codigo: "",
        descricao: "",
        quantidade_utilizada: 1,
        horas_trabalhadas: 8,
        observacoes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleFecharDialog = () => {
    setOpenDialog(false);
    setModoEdicao(false);
    setFormData({
      obra_id: obraSelecionada,
      data: new Date().toISOString().split("T")[0],
      codigo: "",
      descricao: "",
      quantidade_utilizada: 1,
      horas_trabalhadas: 8,
      observacoes: "",
    });
  };

  const handleSalvar = async () => {
    if (!formData.descricao.trim()) {
      toast.warning("Preencha a descrição da função");
      return;
    }

    setLoading(true);
    try {
      if (modoEdicao && formData.id) {
        await api.put(`/equipe-diario/${formData.id}`, formData);
        toast.success("Membro atualizado com sucesso!");
      } else {
        await api.post("/equipe-diario", formData);
        toast.success("Membro adicionado com sucesso!");
      }
      handleFecharDialog();
      carregarEquipeCompleta();
    } catch (error: any) {
      console.error("Erro ao salvar membro:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar membro");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este membro?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/equipe-diario/${id}`);
      toast.success("Membro excluído com sucesso!");
      carregarEquipeCompleta();
    } catch (error: any) {
      console.error("Erro ao excluir membro:", error);
      toast.error(error.response?.data?.error || "Erro ao excluir membro");
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizar = (membro: EquipeMembro) => {
    setMembroSelecionado(membro);
    setOpenViewDialog(true);
  };

  const formatarData = (dataISO?: string) => {
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
          👷 EQUIPE DA OBRA
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Obra *</InputLabel>
            <Select
              value={obraSelecionada}
              onChange={(e) => {
                setObraSelecionada(Number(e.target.value));
                setEquipe([]);
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAbrirDialog()}
            disabled={obraSelecionada === 0}
            sx={{ height: 56 }}
          >
            Adicionar Membro
          </Button>
        </Box>
      </Paper>

      {obraSelecionada > 0 && (
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : equipe.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "#666", py: 3 }}
            >
              Nenhum membro cadastrado nesta obra
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Função/Descrição
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Quantidade
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Horas
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Observações
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipe.map((membro) => (
                    <TableRow key={membro.id}>
                      <TableCell>{formatarData(membro.data)}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {membro.descricao}
                      </TableCell>
                      <TableCell>{membro.codigo || "-"}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={membro.quantidade_utilizada}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {membro.horas_trabalhadas
                          ? `${membro.horas_trabalhadas}h`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {membro.observacoes ? (
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: "italic", color: "#666" }}
                          >
                            {membro.observacoes.substring(0, 50)}
                            {membro.observacoes.length > 50 ? "..." : ""}
                          </Typography>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleVisualizar(membro)}
                          title="Visualizar"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleAbrirDialog(membro)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleExcluir(membro.id!)}
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
          )}
        </Paper>
      )}

      {/* Dialog de Cadastro/Edição */}
      <Dialog
        open={openDialog}
        onClose={handleFecharDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {modoEdicao ? "Editar Membro" : "Adicionar Membro"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Data *"
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData({ ...formData, data: e.target.value })
              }
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Código"
              value={formData.codigo || ""}
              onChange={(e) =>
                setFormData({ ...formData, codigo: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Função/Descrição *"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              fullWidth
              required
              placeholder="Ex: Pedreiro, Servente, Engenheiro..."
            />

            <TextField
              label="Quantidade *"
              type="number"
              value={formData.quantidade_utilizada}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantidade_utilizada: Number(e.target.value),
                })
              }
              fullWidth
              required
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Horas Trabalhadas"
              type="number"
              value={formData.horas_trabalhadas || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  horas_trabalhadas: Number(e.target.value) || undefined,
                })
              }
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
            />

            <TextField
              label="Observações"
              value={formData.observacoes || ""}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialog}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes do Membro</DialogTitle>
        <DialogContent>
          {membroSelecionado && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Data"
                value={formatarData(membroSelecionado.data)}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Código"
                value={membroSelecionado.codigo || "N/A"}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Função/Descrição"
                value={membroSelecionado.descricao}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Quantidade"
                value={membroSelecionado.quantidade_utilizada}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Horas Trabalhadas"
                value={
                  membroSelecionado.horas_trabalhadas
                    ? `${membroSelecionado.horas_trabalhadas}h`
                    : "N/A"
                }
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Observações"
                value={membroSelecionado.observacoes || "N/A"}
                fullWidth
                multiline
                rows={3}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Data de Criação"
                value={formatarData(membroSelecionado.created_at)}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              {membroSelecionado.updated_at && (
                <TextField
                  label="Última Atualização"
                  value={formatarData(membroSelecionado.updated_at)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipeObra;
