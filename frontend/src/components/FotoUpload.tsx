// Componente reutilizável para upload de foto (base64)
import React, { useState } from "react";
import {
  Box,
  Button,
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";

interface FotoUploadProps {
  foto?: string; // Base64 ou URL
  onFotoChange: (fotoBase64: string | null) => void;
  tamanho?: number; // Tamanho do avatar em pixels
  label?: string;
  disabled?: boolean;
}

const FotoUpload: React.FC<FotoUploadProps> = ({
  foto,
  onFotoChange,
  tamanho = 150,
  label = "Foto",
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const converterParaBase64 = async (arquivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(arquivo);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setError(null);

    // Validações
    if (!arquivo.type.startsWith("image/")) {
      setError("Apenas arquivos de imagem são permitidos");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      // 5MB
      setError("Arquivo muito grande. Máximo: 5MB");
      return;
    }

    try {
      setLoading(true);
      const fotoBase64 = await converterParaBase64(arquivo);
      onFotoChange(fotoBase64);
    } catch (err) {
      setError("Erro ao processar imagem");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = () => {
    onFotoChange(null);
    setError(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>

      <Box sx={{ position: "relative" }}>
        <Avatar
          src={foto || ""}
          sx={{
            width: tamanho,
            height: tamanho,
            bgcolor: "grey.300",
            fontSize: tamanho / 3,
          }}
        >
          {!foto && <PhotoCamera sx={{ fontSize: tamanho / 2 }} />}
        </Avatar>

        {loading && (
          <CircularProgress
            size={tamanho}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}

        {foto && !disabled && (
          <IconButton
            size="small"
            onClick={handleRemover}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              bgcolor: "error.main",
              color: "white",
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Box>

      {!disabled && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          disabled={loading}
          size="small"
        >
          {foto ? "Alterar Foto" : "Selecionar Foto"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
      )}

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary">
        Máximo: 5MB (JPG, PNG, GIF)
      </Typography>
    </Box>
  );
};

export default FotoUpload;
