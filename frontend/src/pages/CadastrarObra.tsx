import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { toast } from "react-toastify";
import { Obra } from "../types/obra";
import { Pessoa } from "../types/pessoa";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";
import FotoUpload from "../components/FotoUpload";
import {
  validarStringNaoVazia,
  validarValorMonetario,
  validarData,
  validarIntervaloData,
  validarInteiroPositivo,
} from "../utils/validators";

const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const CadastrarObra: React.FC = () => {
  const [salvando, setSalvando] = useState(false);
  const [carregandoPessoas, setCarregandoPessoas] = useState(false);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [fotoBase64, setFotoBase64] = useState<string>("");

  const [formData, setFormData] = useState<Partial<Obra>>({
    nome: "",
    data_inicio: "",
    data_fim_prevista: "",
    prazo_dias: 0,
    status: "planejamento",
    orcamento: 0,
    contrato_numero: "",
    contratante_id: undefined,
    responsavel_id: undefined,
    art: "",
    endereco_rua: "",
    endereco_numero: "",
    endereco_bairro: "",
    endereco_cidade: "",
    endereco_estado: "",
    endereco_cep: "",
    observacoes: "",
    ativo: true,
  });

  // Carregar lista de pessoas ao montar o componente
  useEffect(() => {
    carregarPessoas();
  }, []);

  const carregarPessoas = async () => {
    try {
      setCarregandoPessoas(true);
      const listaPessoas = await pessoaService.listar();
      console.log(
        "📥 Pessoas carregadas:",
        listaPessoas,
        "Tipo:",
        typeof listaPessoas,
        "É array?",
        Array.isArray(listaPessoas)
      );
      // ✅ Garantir que sempre seja um array
      setPessoas(Array.isArray(listaPessoas) ? listaPessoas : []);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
      toast.error("Erro ao carregar lista de pessoas");
      setPessoas([]); // ✅ Garantir array vazio em caso de erro
    } finally {
      setCarregandoPessoas(false);
    }
  };

  // Calcular prazo_dias automaticamente
  useEffect(() => {
    if (formData.data_inicio && formData.data_fim_prevista) {
      const dataInicio = new Date(formData.data_inicio);
      const dataFim = new Date(formData.data_fim_prevista);
      const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setFormData((prev) => ({ ...prev, prazo_dias: diffDays }));
    }
  }, [formData.data_inicio, formData.data_fim_prevista]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Converter número para number type
    if (name === "orcamento") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;

    // Converter IDs para number
    if (name === "contratante_id" || name === "responsavel_id") {
      setFormData({ ...formData, [name]: value ? Number(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações completas
    if (!formData.nome || !validarStringNaoVazia(formData.nome)) {
      toast.error("Nome da obra é obrigatório");
      return;
    }

    if (formData.nome.length < 3) {
      toast.error("Nome da obra deve ter no mínimo 3 caracteres");
      return;
    }

    if (!formData.data_inicio || !validarData(formData.data_inicio)) {
      toast.error("Data de início inválida ou não preenchida");
      return;
    }

    if (formData.data_fim_prevista) {
      if (!validarData(formData.data_fim_prevista)) {
        toast.error("Data de fim prevista inválida");
        return;
      }

      // Validar que data_fim >= data_inicio
      if (
        !validarIntervaloData(formData.data_inicio, formData.data_fim_prevista)
      ) {
        toast.error(
          "⚠️ Data de fim prevista deve ser posterior à data de início"
        );
        return;
      }
    }

    if (!formData.contratante_id || formData.contratante_id === 0) {
      toast.error("Selecione o contratante");
      return;
    }

    // Validar orçamento se preenchido
    if (formData.orcamento && !validarValorMonetario(formData.orcamento)) {
      toast.error("Orçamento deve ser um valor positivo");
      return;
    }

    // Validar prazo_dias
    if (
      formData.prazo_dias &&
      !validarInteiroPositivo(formData.prazo_dias) &&
      formData.prazo_dias !== 0
    ) {
      toast.error("Prazo em dias deve ser um número inteiro positivo");
      return;
    }

    try {
      setSalvando(true);

      // Preparar dados para API
      const dadosObra: Partial<Obra> = {
        nome: formData.nome,
        data_inicio: formData.data_inicio,
        data_fim_prevista: formData.data_fim_prevista || undefined,
        prazo_dias: formData.prazo_dias || 0,
        status: formData.status || "planejamento",
        orcamento: formData.orcamento || 0,
        contrato_numero: formData.contrato_numero || "",
        contratante_id: formData.contratante_id,
        responsavel_id: formData.responsavel_id || undefined,
        art: formData.art || "",
        endereco_rua: formData.endereco_rua || "",
        endereco_numero: formData.endereco_numero || "",
        endereco_bairro: formData.endereco_bairro || "",
        endereco_cidade: formData.endereco_cidade || "",
        endereco_estado: formData.endereco_estado || "",
        endereco_cep: formData.endereco_cep || "",
        observacoes: formData.observacoes || "",
        ativo: formData.ativo ?? true,
        foto: fotoBase64 || "",
      };

      console.log("📝 Enviando obra para API:", dadosObra);

      const obraCriada = await obraService.criar(dadosObra);

      console.log("✅ Obra cadastrada com sucesso:", obraCriada);

      toast.success(`Obra cadastrada com sucesso! ID: ${obraCriada.id}`);

      // Limpar formulário após sucesso
      setFormData({
        nome: "",
        data_inicio: "",
        data_fim_prevista: "",
        prazo_dias: 0,
        status: "planejamento",
        orcamento: 0,
        contrato_numero: "",
        contratante_id: undefined,
        responsavel_id: undefined,
        art: "",
        endereco_rua: "",
        endereco_numero: "",
        endereco_bairro: "",
        endereco_cidade: "",
        endereco_estado: "",
        endereco_cep: "",
        observacoes: "",
        ativo: true,
      });
      setFotoBase64("");

      // Redirecionar para página de obras após 2 segundos
      setTimeout(() => {
        window.location.href = "/obras";
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao cadastrar obra:", error);
      console.error("Resposta da API:", error.response?.data);

      const mensagemErro =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro ao cadastrar obra";

      toast.error(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cadastrar Obra
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <Typography variant="h6" gutterBottom>
            Informações Básicas
          </Typography>

          <Stack spacing={3}>
            {/* Nome da Obra */}
            <TextField
              required
              fullWidth
              label="Nome da Obra"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Construção Residencial Rua ABC"
              inputProps={{ maxLength: 200 }}
              helperText={`${(formData.nome || "").length}/200 caracteres`}
            />

            {/* Datas e Prazo */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                sx={{ flex: "1 1 200px" }}
                required
                type="date"
                label="Data de Início"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                sx={{ flex: "1 1 200px" }}
                type="date"
                label="Data de Fim Prevista"
                name="data_fim_prevista"
                value={formData.data_fim_prevista}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                sx={{ flex: "1 1 150px" }}
                label="Prazo (dias)"
                name="prazo_dias"
                type="number"
                value={formData.prazo_dias}
                InputProps={{ readOnly: true }}
                helperText="Calculado automaticamente"
              />
            </Box>

            {/* Status, Orçamento, Contrato e ART */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ flex: "1 1 200px" }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="planejamento">Planejamento</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="concluida">Concluída</MenuItem>
                  <MenuItem value="paralisada">Paralisada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: "1 1 200px" }}
                label="Orçamento"
                name="orcamento"
                type="number"
                value={formData.orcamento}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Valor deve ser positivo"
              />

              <TextField
                sx={{ flex: "1 1 200px" }}
                label="Número do Contrato"
                name="contrato_numero"
                value={formData.contrato_numero}
                onChange={handleInputChange}
              />

              <TextField
                sx={{ flex: "1 1 200px" }}
                label="ART"
                name="art"
                value={formData.art}
                onChange={handleInputChange}
              />
            </Box>

            {/* Contratante e Responsável */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ flex: "1 1 300px" }} required>
                <InputLabel>Contratante</InputLabel>
                <Select
                  name="contratante_id"
                  value={formData.contratante_id || ""}
                  onChange={handleSelectChange}
                  label="Contratante"
                  disabled={carregandoPessoas}
                >
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: "1 1 300px" }}>
                <InputLabel>Responsável</InputLabel>
                <Select
                  name="responsavel_id"
                  value={formData.responsavel_id || ""}
                  onChange={handleSelectChange}
                  label="Responsável"
                  disabled={carregandoPessoas}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {pessoas.map((pessoa) => (
                    <MenuItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>

          {/* Endereço */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Endereço da Obra
          </Typography>

          <Stack spacing={3}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                sx={{ flex: "1 1 300px" }}
                label="Rua/Logradouro"
                name="endereco_rua"
                value={formData.endereco_rua}
                onChange={handleInputChange}
              />

              <TextField
                sx={{ flex: "1 1 150px" }}
                label="Número"
                name="endereco_numero"
                value={formData.endereco_numero}
                onChange={handleInputChange}
              />

              <TextField
                sx={{ flex: "1 1 200px" }}
                label="Bairro"
                name="endereco_bairro"
                value={formData.endereco_bairro}
                onChange={handleInputChange}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                sx={{ flex: "1 1 250px" }}
                label="Cidade"
                name="endereco_cidade"
                value={formData.endereco_cidade}
                onChange={handleInputChange}
              />

              <FormControl sx={{ flex: "1 1 150px" }}>
                <InputLabel>Estado/UF</InputLabel>
                <Select
                  name="endereco_estado"
                  value={formData.endereco_estado}
                  onChange={handleSelectChange}
                  label="Estado/UF"
                >
                  {estadosBrasil.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: "1 1 200px" }}
                label="CEP"
                name="endereco_cep"
                value={formData.endereco_cep}
                onChange={handleInputChange}
                placeholder="00000-000"
              />
            </Box>
          </Stack>

          {/* Observações e Status Ativo */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Observações
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observações"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Anotações gerais sobre a obra..."
              inputProps={{ maxLength: 1000 }}
              helperText={`${
                (formData.observacoes || "").length
              }/1000 caracteres`}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1">Status da Obra:</Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Ativo</InputLabel>
                <Select
                  name="ativo"
                  value={formData.ativo ? "true" : "false"}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      ativo: e.target.value === "true",
                    });
                  }}
                  label="Ativo"
                >
                  <MenuItem value="true">✅ Ativa</MenuItem>
                  <MenuItem value="false">Inativa</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>

          {/* Upload de Foto */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Foto da Obra
          </Typography>

          <FotoUpload
            foto={fotoBase64}
            onFotoChange={(foto) => setFotoBase64(foto || "")}
            tamanho={200}
            label="Foto da Obra"
          />

          {/* Botão Salvar */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={salvando}
              startIcon={
                salvando ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{
                bgcolor: "#4caf50",
                "&:hover": { bgcolor: "#45a049" },
                borderRadius: "8px",
                px: 4,
              }}
            >
              {salvando ? "Salvando..." : "💾 Salvar"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CadastrarObra;
