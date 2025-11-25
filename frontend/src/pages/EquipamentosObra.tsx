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

interface Equipamento {
  id?: number;
  obra_id: number;
  data: string;
  codigo?: string;
  descricao: string;
  quantidade_utilizada: number;
  horas_uso?: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

const EquipamentosObra: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);
  const [formData, setFormData] = useState<Equipamento>({
    obra_id: 0,
    data: new Date().toISOString().split("T")[0],
    codigo: "",
    descricao: "",
    quantidade_utilizada: 1,
    horas_uso: 8,
    observacoes: "",
  });

  useEffect(() => {
    carregarObras();
  }, []);

  useEffect(() => {
    if (obraSelecionada > 0) {
      carregarEquipamentosCompleto();
    } else {
      setEquipamentos([]);
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

  // Carregar TODOS os equipamentos da obra
  const carregarEquipamentosCompleto = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/equipamento-diario/obra/${obraSelecionada}`
      );
      const equipamentosData = response.data.data || response.data || [];
      setEquipamentos(Array.isArray(equipamentosData) ? equipamentosData : []);
      toast.success(
        `Histórico completo: ${equipamentosData.length} registros de equipamentos`
      );
    } catch (error) {
      console.error("Erro ao carregar equipamentos completos:", error);
      toast.error("Erro ao carregar histórico completo de equipamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDialog = (equipamento?: Equipamento) => {
    if (obraSelecionada === 0) {
      toast.warning("Selecione uma obra primeiro");
      return;
    }

    if (equipamento) {
      setModoEdicao(true);
      setFormData({ ...equipamento });
    } else {
      setModoEdicao(false);
      setFormData({
        obra_id: obraSelecionada,
        data: new Date().toISOString().split("T")[0],
        codigo: "",
        descricao: "",
        quantidade_utilizada: 1,
        horas_uso: 8,
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
      horas_uso: 8,
      observacoes: "",
    });
  };

  const handleSalvar = async () => {
    if (!formData.descricao.trim()) {
      toast.warning("Preencha a descrição do equipamento");
      return;
    }

    setLoading(true);
    try {
      if (modoEdicao && formData.id) {
        await api.put(`/equipamento-diario/${formData.id}`, formData);
        toast.success("Equipamento atualizado com sucesso!");
      } else {
        await api.post("/equipamento-diario", formData);
        toast.success("Equipamento adicionado com sucesso!");
      }
      handleFecharDialog();
      carregarEquipamentosCompleto();
    } catch (error: any) {
      console.error("Erro ao salvar equipamento:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar equipamento");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este equipamento?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/equipamento-diario/${id}`);
      toast.success("Equipamento excluído com sucesso!");
      carregarEquipamentosCompleto();
    } catch (error: any) {
      console.error("Erro ao excluir equipamento:", error);
      toast.error(error.response?.data?.error || "Erro ao excluir equipamento");
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizar = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
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
          EQUIPAMENTOS E MÁQUINAS
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Obra *</InputLabel>
            <Select
              value={obraSelecionada}
              onChange={(e) => {
                setObraSelecionada(Number(e.target.value));
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAbrirDialog()}
            disabled={obraSelecionada === 0}
            sx={{ height: 56 }}
          >
            Adicionar
          </Button>
        </Box>
      </Paper>

      {obraSelecionada > 0 && (
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : equipamentos.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "#666", py: 3 }}
            >
              Nenhum equipamento cadastrado nesta obra
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Equipamento/Máquina
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Quantidade
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Horas de Uso
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
                  {equipamentos.map((equipamento) => (
                    <TableRow key={equipamento.id}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {formatarData(equipamento.data)}
                      </TableCell>
                      <TableCell>{equipamento.codigo || "N/A"}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {equipamento.descricao}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={equipamento.quantidade_utilizada}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {equipamento.horas_uso ? (
                          <Chip
                            label={`${equipamento.horas_uso}h`}
                            color="success"
                            size="small"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {equipamento.observacoes ? (
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: "italic", color: "#666" }}
                          >
                            {equipamento.observacoes.substring(0, 50)}
                            {equipamento.observacoes.length > 50 ? "..." : ""}
                          </Typography>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleVisualizar(equipamento)}
                          title="Visualizar"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleAbrirDialog(equipamento)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleExcluir(equipamento.id!)}
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
          {modoEdicao ? "Editar Equipamento" : "Adicionar Equipamento"}
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
              placeholder="Ex: BT001, EX001..."
            />

            <TextField
              label="Equipamento/Máquina *"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              fullWidth
              required
              placeholder="Ex: Betoneira 400L, Escavadeira, Guincho..."
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
              label="Horas de Uso"
              type="number"
              value={formData.horas_uso || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  horas_uso: Number(e.target.value) || undefined,
                })
              }
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              placeholder="Ex: 8, 6.5..."
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
              placeholder="Condições de uso, problemas identificados, etc..."
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
        <DialogTitle>Detalhes do Equipamento</DialogTitle>
        <DialogContent>
          {equipamentoSelecionado && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Data"
                value={formatarData(equipamentoSelecionado.data)}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Código"
                value={equipamentoSelecionado.codigo || "N/A"}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Equipamento/Máquina"
                value={equipamentoSelecionado.descricao}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Quantidade"
                value={equipamentoSelecionado.quantidade_utilizada}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Horas de Uso"
                value={
                  equipamentoSelecionado.horas_uso
                    ? `${equipamentoSelecionado.horas_uso}h`
                    : "N/A"
                }
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Observações"
                value={equipamentoSelecionado.observacoes || "N/A"}
                fullWidth
                multiline
                rows={3}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Data de Criação"
                value={formatarData(equipamentoSelecionado.created_at)}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              {equipamentoSelecionado.updated_at && (
                <TextField
                  label="Última Atualização"
                  value={formatarData(equipamentoSelecionado.updated_at)}
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

export default EquipamentosObra;
