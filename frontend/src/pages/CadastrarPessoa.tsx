import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Stack,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { toast } from "react-toastify";
import { Pessoa } from "../types/pessoa";
import { pessoaService } from "../services/pessoaService";

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

const CadastrarPessoa: React.FC = () => {
  const [tipoPessoa, setTipoPessoa] = useState<"FISICA" | "JURIDICA">("FISICA");
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState<Pessoa>({
    nome: "",
    tipo: "CPF", // ✅ API Go usa "CPF" ou "CNPJ", não "PF"/"PJ"
    documento: "",
    email: "",
    telefone: "",
    cargo: "",
    ativo: true,
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    estado: "",
  });

  const [funcoes, setFuncoes] = useState({
    administradorObras: false,
    engenheiro: false,
    mestreObras: false,
    cliente: false,
    pedreiro: false,
    fornecedor: false,
  });

  const handleTipoPessoaChange = (tipo: "FISICA" | "JURIDICA") => {
    setTipoPessoa(tipo);
    setFormData({
      ...formData,
      tipo: tipo === "FISICA" ? "CPF" : "CNPJ", // ✅ API Go usa "CPF"/"CNPJ"
      documento: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEnderecoChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setEndereco({ ...endereco, [name as string]: value as string });
  };

  const handleFuncaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFuncoes({ ...funcoes, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.nome) {
      toast.error("⚠️ Nome é obrigatório");
      return;
    }

    if (!formData.documento) {
      toast.error(
        `⚠️ ${tipoPessoa === "FISICA" ? "CPF" : "CNPJ"} é obrigatório`
      );
      return;
    }

    // Validar ao menos uma função selecionada para Pessoa Física
    const funcoesAtivas = Object.entries(funcoes).filter(([_, value]) => value);
    if (tipoPessoa === "FISICA" && funcoesAtivas.length === 0) {
      toast.error("⚠️ Selecione ao menos uma função");
      return;
    }

    try {
      setSalvando(true);

      // Preparar dados para API
      const dadosPessoa: Pessoa = {
        nome: formData.nome,
        tipo: formData.tipo, // Usar o tipo já convertido
        documento: formData.documento,
        email: formData.email || "",
        telefone: formData.telefone || "",
        cargo: funcoesAtivas.map(([key]) => key).join(", "),
        endereco_cep: endereco.cep || "",
        endereco_rua: endereco.logradouro || "",
        endereco_estado: endereco.estado || "",
        ativo: true,
      };

      console.log("📝 Enviando pessoa para API:", dadosPessoa);
      console.log("📤 Payload JSON:", JSON.stringify(dadosPessoa, null, 2));

      const pessoaCriada = await pessoaService.criar(dadosPessoa);

      console.log("✅ Pessoa cadastrada com sucesso:", pessoaCriada);

      toast.success(
        `✅ ${
          tipoPessoa === "FISICA" ? "Pessoa" : "Empresa"
        } cadastrada com sucesso! ID: ${pessoaCriada.id}`
      );

      // Limpar formulário após sucesso
      setFormData({
        nome: "",
        tipo: "CPF", // ✅ API Go usa "CPF" ou "CNPJ"
        documento: "",
        email: "",
        telefone: "",
        cargo: "",
        ativo: true,
      });
      setEndereco({ cep: "", logradouro: "", estado: "" });
      setFuncoes({
        administradorObras: false,
        engenheiro: false,
        mestreObras: false,
        cliente: false,
        pedreiro: false,
        fornecedor: false,
      });

      // Opcional: redirecionar para página de pessoas após 2 segundos
      setTimeout(() => {
        window.location.href = "/pessoas";
      }, 2000);
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar pessoa:", error);
      console.error("📥 Resposta da API:", error.response?.data);
      console.error("📊 Status HTTP:", error.response?.status);
      console.error("📋 Detalhes:", error.response?.data?.details);

      // Mensagens de erro específicas
      let mensagemErro = "Erro ao cadastrar pessoa";

      if (error.response?.status === 400) {
        const details = error.response?.data?.details || "";
        const serverError = error.response?.data?.error || "";

        // Documento duplicado
        if (
          details.includes("duplicate key") ||
          details.includes("pessoa_documento_key") ||
          serverError.includes("documento")
        ) {
          mensagemErro = `⚠️ Este ${
            tipoPessoa === "FISICA" ? "CPF" : "CNPJ"
          } já está cadastrado no sistema.`;
        }
        // Email duplicado
        else if (
          details.includes("pessoa_email_key") ||
          serverError.includes("email")
        ) {
          mensagemErro = "⚠️ Este email já está cadastrado no sistema.";
        }
        // Outros erros 400
        else {
          mensagemErro =
            serverError ||
            error.response?.data?.message ||
            "Dados inválidos. Verifique os campos obrigatórios.";
        }
      } else {
        mensagemErro =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erro desconhecido";
      }

      toast.error(`❌ ${mensagemErro}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cadastrar Pessoa
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Informações */}
          <Typography variant="h6" gutterBottom>
            Informações
          </Typography>

          <Stack spacing={3}>
            {/* Tipo de Pessoa */}
            <FormControl component="fieldset">
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant={tipoPessoa === "FISICA" ? "contained" : "outlined"}
                  onClick={() => handleTipoPessoaChange("FISICA")}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor:
                        tipoPessoa === "FISICA" ? "white" : "transparent",
                      border: "2px solid",
                      borderColor:
                        tipoPessoa === "FISICA" ? "white" : "primary.main",
                    }}
                  />
                  Pessoa Física
                </Button>
                <Button
                  variant={tipoPessoa === "JURIDICA" ? "contained" : "outlined"}
                  onClick={() => handleTipoPessoaChange("JURIDICA")}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor:
                        tipoPessoa === "JURIDICA" ? "white" : "transparent",
                      border: "2px solid",
                      borderColor:
                        tipoPessoa === "JURIDICA" ? "white" : "primary.main",
                    }}
                  />
                  Pessoa Jurídica
                </Button>
              </Box>
            </FormControl>

            {/* Nome/Fantasia e CPF/CNPJ */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                sx={{ flex: "1 1 300px" }}
                required
                label={tipoPessoa === "FISICA" ? "Nome Completo" : "Fantasia"}
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
              />

              <TextField
                sx={{ flex: "1 1 300px" }}
                required
                label={tipoPessoa === "FISICA" ? "CPF" : "CNPJ"}
                name="documento"
                value={formData.documento}
                onChange={handleInputChange}
                placeholder={
                  tipoPessoa === "FISICA"
                    ? "000.000.000-00"
                    : "00.000.000/0000-00"
                }
              />
            </Box>

            {/* Funções (checkboxes) - apenas para Pessoa Física */}
            {tipoPessoa === "FISICA" && (
              <FormControl component="fieldset">
                <FormLabel component="legend">Função *</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={funcoes.administradorObras}
                        onChange={handleFuncaoChange}
                        name="administradorObras"
                      />
                    }
                    label="Administrador de Obras"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={funcoes.cliente}
                        onChange={handleFuncaoChange}
                        name="cliente"
                      />
                    }
                    label="Cliente"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={funcoes.engenheiro}
                        onChange={handleFuncaoChange}
                        name="engenheiro"
                      />
                    }
                    label="Engenheiro"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={funcoes.pedreiro}
                        onChange={handleFuncaoChange}
                        name="pedreiro"
                      />
                    }
                    label="Pedreiro"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={funcoes.mestreObras}
                        onChange={handleFuncaoChange}
                        name="mestreObras"
                      />
                    }
                    label="Mestre de Obras"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={funcoes.fornecedor}
                        onChange={handleFuncaoChange}
                        name="fornecedor"
                      />
                    }
                    label="Fornecedor"
                  />
                </FormGroup>
              </FormControl>
            )}
          </Stack>

          {/* Contato */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Contato
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              sx={{ flex: "1 1 300px" }}
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              placeholder="(00) 00000-0000"
            />

            <TextField
              sx={{ flex: "1 1 300px" }}
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="exemplo@email.com"
            />
          </Box>

          {/* Endereço */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Endereço
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              sx={{ flex: "1 1 200px" }}
              label="CEP"
              name="cep"
              value={endereco.cep}
              onChange={handleEnderecoChange}
              placeholder="00000-000"
            />

            <TextField
              sx={{ flex: "1 1 300px" }}
              label="Logradouro / Rua"
              name="logradouro"
              value={endereco.logradouro}
              onChange={handleEnderecoChange}
            />

            <FormControl sx={{ flex: "1 1 150px" }}>
              <InputLabel>Estado/UF</InputLabel>
              <Select
                name="estado"
                value={endereco.estado}
                onChange={handleEnderecoChange}
                label="Estado/UF"
              >
                {estadosBrasil.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

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

export default CadastrarPessoa;
