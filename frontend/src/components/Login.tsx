import React, { useState } from "react";

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoginCredentials } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

const schema = yup.object({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  senha: yup.string().required("Senha é obrigatória"),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError("");
      await login(data);
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao fazer login");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Lado Esquerdo - Formulário */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          p: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: "bold",
              color: "#333",
              borderBottom: "3px solid #d32f2f",
              paddingBottom: 1,
              display: "inline-block",
            }}
          >
            Realize o Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
              E-mail:
            </Typography>
            <TextField
              {...register("email")}
              fullWidth
              variant="outlined"
              placeholder="seuemail@email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8f9fa",
                },
              }}
            />

            <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
              Senha:
            </Typography>
            <TextField
              {...register("senha")}
              fullWidth
              type={showPassword ? "text" : "password"}
              variant="outlined"
              placeholder="1234"
              error={!!errors.senha}
              helperText={errors.senha?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8f9fa",
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: "#d32f2f",
                color: "white",
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
              }}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#d32f2f", mb: 1 }}>
                Acesso exclusivo para administradores
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Entre em contato com o administrador do sistema para obter
                acesso
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Lado Direito - Background com Logo */}
      <Box
        sx={{
          flex: 1,
          background:
            "linear-gradient(135deg, #d32f2f 0%, #f44336 50%, #ffcdd2 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          p: 4,
          position: "relative",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            mb: 4,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="Logo do Projeto"
            style={{
              width: 150,
              height: 80,
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Slogan */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 1,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Inovação e confiança em cada processo.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 300,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Seja bem-vindo(a).
          </Typography>
        </Box>

        {/* Elementos decorativos */}
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
      </Box>
    </Box>
  );
};

export default Login;
