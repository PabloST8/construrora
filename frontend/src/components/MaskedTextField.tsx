import React, { useState } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import {
  aplicarMascaraCPF,
  aplicarMascaraCNPJ,
  aplicarMascaraTelefone,
  aplicarMascaraCEP,
  aplicarMascaraMoeda,
  aplicarMascaraData,
  aplicarMascaraInteiro,
  aplicarMascaraDocumento,
  removerMascara,
} from "../utils/masks";
import {
  validarCPF,
  validarCNPJ,
  validarTelefone,
  validarCEP,
  obterMensagemErro,
} from "../utils/validators";

type MaskType =
  | "cpf"
  | "cnpj"
  | "documento"
  | "telefone"
  | "cep"
  | "moeda"
  | "data"
  | "inteiro"
  | "none";

interface MaskedTextFieldProps extends Omit<TextFieldProps, "onChange"> {
  maskType: MaskType;
  value: string;
  onChange: (value: string) => void;
  validateOnBlur?: boolean;
  maxLength?: number;
  upperCase?: boolean;
}

const MaskedTextField: React.FC<MaskedTextFieldProps> = ({
  maskType,
  value,
  onChange,
  validateOnBlur = true,
  maxLength,
  upperCase = false,
  error: externalError,
  helperText: externalHelperText,
  ...props
}) => {
  const [internalError, setInternalError] = useState(false);
  const [internalHelperText, setInternalHelperText] = useState("");

  const aplicarMascara = (valor: string): string => {
    let resultado = valor;

    // Aplicar uppercase se configurado
    if (upperCase) {
      resultado = resultado.toUpperCase();
    }

    // Aplicar máscara conforme tipo
    switch (maskType) {
      case "cpf":
        resultado = aplicarMascaraCPF(resultado);
        break;
      case "cnpj":
        resultado = aplicarMascaraCNPJ(resultado);
        break;
      case "documento":
        resultado = aplicarMascaraDocumento(resultado);
        break;
      case "telefone":
        resultado = aplicarMascaraTelefone(resultado);
        break;
      case "cep":
        resultado = aplicarMascaraCEP(resultado);
        break;
      case "moeda":
        resultado = aplicarMascaraMoeda(resultado);
        break;
      case "data":
        resultado = aplicarMascaraData(resultado);
        break;
      case "inteiro":
        resultado = aplicarMascaraInteiro(resultado);
        break;
      default:
        break;
    }

    // Aplicar limite de caracteres
    if (maxLength) {
      resultado = resultado.slice(0, maxLength);
    }

    return resultado;
  };

  const validarCampo = (valor: string): boolean => {
    // Se o campo está vazio e não é obrigatório, não valida
    if (!valor && !props.required) {
      setInternalError(false);
      setInternalHelperText("");
      return true;
    }

    // Se o campo está vazio e é obrigatório
    if (!valor && props.required) {
      setInternalError(true);
      setInternalHelperText(
        obterMensagemErro(
          props.label?.toString() || "Campo",
          "campo_obrigatorio"
        )
      );
      return false;
    }

    const valorLimpo = removerMascara(valor);
    let valido = true;
    let mensagem = "";

    switch (maskType) {
      case "cpf":
        valido = validarCPF(valorLimpo);
        if (!valido) mensagem = obterMensagemErro("", "cpf_invalido");
        break;

      case "cnpj":
        valido = validarCNPJ(valorLimpo);
        if (!valido) mensagem = obterMensagemErro("", "cnpj_invalido");
        break;

      case "documento":
        if (valorLimpo.length <= 11) {
          valido = validarCPF(valorLimpo);
          if (!valido) mensagem = obterMensagemErro("", "cpf_invalido");
        } else {
          valido = validarCNPJ(valorLimpo);
          if (!valido) mensagem = obterMensagemErro("", "cnpj_invalido");
        }
        break;

      case "telefone":
        valido = validarTelefone(valorLimpo);
        if (!valido) mensagem = obterMensagemErro("", "telefone_invalido");
        break;

      case "cep":
        valido = validarCEP(valorLimpo);
        if (!valido) mensagem = obterMensagemErro("", "cep_invalido");
        break;

      case "moeda":
      case "inteiro":
        valido = !isNaN(parseFloat(valorLimpo));
        if (!valido) mensagem = "Valor numérico inválido";
        break;

      default:
        valido = true;
        break;
    }

    setInternalError(!valido);
    setInternalHelperText(mensagem);
    return valido;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorComMascara = aplicarMascara(e.target.value);
    onChange(valorComMascara);

    // Limpa erro ao digitar
    if (internalError) {
      setInternalError(false);
      setInternalHelperText("");
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validateOnBlur) {
      validarCampo(e.target.value);
    }

    // Chama onBlur externo se existir
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Prioriza erro/helperText externos sobre internos
  const error = externalError !== undefined ? externalError : internalError;
  const helperText =
    externalHelperText !== undefined ? externalHelperText : internalHelperText;

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      helperText={helperText}
      inputProps={{
        ...props.inputProps,
        maxLength: maxLength,
      }}
    />
  );
};

export default MaskedTextField;
