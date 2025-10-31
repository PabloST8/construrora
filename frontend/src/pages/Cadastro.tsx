import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  MenuItem,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipo_documento: "PF",
    documento: "",
    telefone: "",
    perfil_acesso: "usuario",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (formData.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      console.log("📋 FormData completo antes de enviar:", formData);
      console.log("📝 tipo_documento selecionado:", formData.tipo_documento);

      const { confirmarSenha, tipo_documento, documento, ...dadosCadastro } =
        formData;

      const payload = {
        ...dadosCadastro,
        tipo_documento: tipo_documento,
        documento: documento,
        ativo: true,
      };

      console.log("📤 Enviando payload:", JSON.stringify(payload, null, 2));

      await api.post("/usuarios", payload);

      toast.success(
        "Cadastro realizado com sucesso! Faça login para continuar."
      );
      navigate("/login");
    } catch (error: any) {
      console.error("❌ Erro no cadastro:", error);
      console.error("📥 Resposta do servidor:", error.response?.data);
      console.error("📊 Status HTTP:", error.response?.status);

      // Mensagens de erro mais amigáveis
      let errorMessage = "Erro ao realizar cadastro. Tente novamente.";

      if (error.response?.status === 400) {
        const details = error.response?.data?.details || "";
        const serverError = error.response?.data?.error || "";

        // Verificar se é erro de documento duplicado
        if (
          details.includes("duplicate key") ||
          details.includes("usuario_documento_key") ||
          serverError.includes("documento")
        ) {
          errorMessage = `⚠️ Este ${
            formData.tipo_documento === "PF" ? "CPF" : "CNPJ"
          } já está cadastrado no sistema.`;
        } else if (
          details.includes("usuario_email_key") ||
          serverError.includes("email")
        ) {
          errorMessage = "⚠️ Este email já está cadastrado no sistema.";
        } else {
          errorMessage =
            serverError ||
            error.response?.data?.message ||
            "Dados inválidos. Verifique os campos e tente novamente.";
        }
      } else if (error.response?.status === 409) {
        errorMessage = "⚠️ Usuário já cadastrado. Tente fazer login.";
      } else {
        errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          errorMessage;
      }

      setErro(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 600,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🏗️ Sistema de Obras
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          color="textSecondary"
        >
          Cadastro de Usuário
        </Typography>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Tipo Documento"
                name="tipo_documento"
                select
                value={formData.tipo_documento}
                onChange={handleChange}
                required
              >
                <MenuItem value="PF">CPF (Pessoa Física)</MenuItem>
                <MenuItem value="PJ">CNPJ (Pessoa Jurídica)</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label={formData.tipo_documento === "PF" ? "CPF" : "CNPJ"}
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                placeholder={
                  formData.tipo_documento === "PF"
                    ? "000.000.000-00"
                    : "00.000.000/0000-00"
                }
              />
            </Box>

            <TextField
              fullWidth
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />

            <TextField
              fullWidth
              label="Perfil de Acesso"
              name="perfil_acesso"
              select
              value={formData.perfil_acesso}
              onChange={handleChange}
              required
            >
              <MenuItem value="usuario">Usuário</MenuItem>
              <MenuItem value="gestor">Gestor</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
              />

              <TextField
                fullWidth
                label="Confirmar Senha"
                name="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                placeholder="Digite a senha novamente"
              />
            </Box>
          </Stack>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            Já tem uma conta?{" "}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              sx={{ cursor: "pointer" }}
            >
              Faça login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Cadastro;
