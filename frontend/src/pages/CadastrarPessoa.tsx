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
import MaskedTextField from "../components/MaskedTextField";
import {
  validarCPF,
  validarCNPJ,
  validarEmail,
  validarTelefone,
  validarCEP,
  validarStringNaoVazia,
} from "../utils/validators";
import { removerMascara } from "../utils/masks";

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
  const [formData, setFormData] = useState<Partial<Pessoa>>({
    nome: "",
    tipo: "PF", // ✅ API Go usa "PF" (2 chars) ou "PJ" (2 chars)
    documento: "",
    email: "",
    telefone: "",
    cargo: "",
    ativo: true,
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
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
      tipo: tipo === "FISICA" ? "PF" : "PJ", // ✅ Banco usa "PF" ou "PJ" (varchar 2 chars)
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
    if (!formData.nome || !validarStringNaoVazia(formData.nome)) {
      toast.error("⚠️ Nome é obrigatório");
      return;
    }

    if (formData.nome.length < 3) {
      toast.error("⚠️ Nome deve ter no mínimo 3 caracteres");
      return;
    }

    if (!formData.documento) {
      toast.error(
        `⚠️ ${tipoPessoa === "FISICA" ? "CPF" : "CNPJ"} é obrigatório`
      );
      return;
    }

    // Validar formato do documento
    const documentoLimpo = removerMascara(formData.documento);
    if (tipoPessoa === "FISICA") {
      if (!validarCPF(documentoLimpo)) {
        toast.error("⚠️ CPF inválido. Verifique os números digitados.");
        return;
      }
    } else {
      if (!validarCNPJ(documentoLimpo)) {
        toast.error("⚠️ CNPJ inválido. Verifique os números digitados.");
        return;
      }
    }

    // Validar email se preenchido
    if (formData.email && !validarEmail(formData.email)) {
      toast.error("⚠️ Email inválido. Use o formato: exemplo@dominio.com");
      return;
    }

    // Validar telefone se preenchido
    if (formData.telefone) {
      const telefoneLimpo = removerMascara(formData.telefone);
      if (!validarTelefone(telefoneLimpo)) {
        toast.error(
          "⚠️ Telefone inválido. Use (00) 00000-0000 ou (00) 0000-0000"
        );
        return;
      }
    }

    // Validar CEP se preenchido
    if (endereco.cep) {
      const cepLimpo = removerMascara(endereco.cep);
      if (!validarCEP(cepLimpo)) {
        toast.error("⚠️ CEP inválido. Use o formato: 00000-000");
        return;
      }
    }

    // Validar ao menos uma função selecionada para Pessoa Física
    const funcoesAtivas = Object.entries(funcoes).filter(([_, value]) => value);
    if (tipoPessoa === "FISICA" && funcoesAtivas.length === 0) {
      toast.error("⚠️ Selecione ao menos uma função");
      return;
    }

    try {
      setSalvando(true);

      // Preparar dados para API (removendo máscaras)
      const dadosPessoa: Pessoa = {
        nome: formData.nome || "",
        tipo: formData.tipo || "PF", // Usar o tipo já convertido
        documento: removerMascara(formData.documento || ""),
        email: formData.email || "",
        telefone: removerMascara(formData.telefone || ""),
        cargo: funcoesAtivas.map(([key]) => key).join(", "),
        endereco_cep: removerMascara(endereco.cep || ""),
        endereco_rua: endereco.logradouro || "",
        endereco_numero: endereco.numero || "",
        endereco_complemento: endereco.complemento || "",
        endereco_bairro: endereco.bairro || "",
        endereco_cidade: endereco.cidade || "",
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
        tipo: "PF", // ✅ API Go usa "PF" (2 chars)
        documento: "",
        email: "",
        telefone: "",
        cargo: "",
        ativo: true,
      });
      setEndereco({
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      });
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
                inputProps={{ maxLength: 200 }}
                helperText={`${(formData.nome || "").length}/200 caracteres`}
              />

              <MaskedTextField
                sx={{ flex: "1 1 300px" }}
                required
                maskType={tipoPessoa === "FISICA" ? "cpf" : "cnpj"}
                label={tipoPessoa === "FISICA" ? "CPF" : "CNPJ"}
                value={formData.documento || ""}
                onChange={(value) =>
                  setFormData({ ...formData, documento: value })
                }
                validateOnBlur={true}
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
            <MaskedTextField
              sx={{ flex: "1 1 300px" }}
              maskType="telefone"
              label="Telefone"
              value={formData.telefone || ""}
              onChange={(value) =>
                setFormData({ ...formData, telefone: value })
              }
              validateOnBlur={true}
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
              error={formData.email ? !validarEmail(formData.email) : false}
              helperText={
                formData.email && !validarEmail(formData.email)
                  ? "Email inválido. Use o formato: exemplo@dominio.com"
                  : ""
              }
              inputProps={{ maxLength: 100 }}
            />
          </Box>

          {/* Endereço */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Endereço
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <MaskedTextField
              sx={{ flex: "1 1 200px" }}
              maskType="cep"
              label="CEP"
              value={endereco.cep || ""}
              onChange={(value) => setEndereco({ ...endereco, cep: value })}
              validateOnBlur={true}
              placeholder="00000-000"
            />

            <TextField
              sx={{ flex: "1 1 300px" }}
              label="Logradouro / Rua"
              name="logradouro"
              value={endereco.logradouro}
              onChange={handleEnderecoChange}
            />

            <TextField
              sx={{ flex: "1 1 150px" }}
              label="Número"
              name="numero"
              value={endereco.numero}
              onChange={handleEnderecoChange}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              sx={{ flex: "1 1 200px" }}
              label="Complemento"
              name="complemento"
              value={endereco.complemento}
              onChange={handleEnderecoChange}
              placeholder="Apto, Bloco, etc."
            />

            <TextField
              sx={{ flex: "1 1 200px" }}
              label="Bairro"
              name="bairro"
              value={endereco.bairro}
              onChange={handleEnderecoChange}
            />

            <TextField
              sx={{ flex: "1 1 200px" }}
              label="Cidade"
              name="cidade"
              value={endereco.cidade}
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
