/**
 * Utilitários de Validação
 * Sistema de validação completo para CPF, CNPJ, Email, Telefone, CEP, etc.
 */

// ==================== VALIDAÇÃO DE CPF ====================
export const validarCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto === 10 || resto === 11 ? 0 : resto;

  if (digito1 !== parseInt(cpfLimpo.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digito2 = resto === 10 || resto === 11 ? 0 : resto;

  return digito2 === parseInt(cpfLimpo.charAt(10));
};

// ==================== VALIDAÇÃO DE CNPJ ====================
export const validarCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  // Verifica se tem 14 dígitos
  if (cnpjLimpo.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  // Validação do primeiro dígito verificador
  const tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Validação do segundo dígito verificador
  numeros = cnpjLimpo.substring(0, tamanho + 1);
  soma = 0;
  pos = tamanho - 6;

  for (let i = tamanho + 1; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho + 1 - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

// ==================== VALIDAÇÃO DE EMAIL ====================
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ==================== VALIDAÇÃO DE TELEFONE ====================
export const validarTelefone = (telefone: string): boolean => {
  const telefoneLimpo = telefone.replace(/\D/g, "");
  // Aceita telefone fixo (10 dígitos) e celular (11 dígitos)
  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
};

// ==================== VALIDAÇÃO DE CEP ====================
export const validarCEP = (cep: string): boolean => {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
};

// ==================== VALIDAÇÃO DE VALORES MONETÁRIOS ====================
export const validarValorMonetario = (valor: number): boolean => {
  return !isNaN(valor) && valor >= 0;
};

// ==================== VALIDAÇÃO DE DATA ====================
export const validarData = (data: string): boolean => {
  if (!data) return false;
  const dateObj = new Date(data);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// ==================== VALIDAÇÃO DE DATA FUTURA ====================
export const validarDataFutura = (data: string): boolean => {
  if (!validarData(data)) return false;
  const dataObj = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return dataObj >= hoje;
};

// ==================== VALIDAÇÃO DE DATA PASSADA ====================
export const validarDataPassada = (data: string): boolean => {
  if (!validarData(data)) return false;
  const dataObj = new Date(data);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return dataObj <= hoje;
};

// ==================== VALIDAÇÃO DE INTERVALO DE DATAS ====================
export const validarIntervaloData = (
  dataInicio: string,
  dataFim: string
): boolean => {
  if (!validarData(dataInicio) || !validarData(dataFim)) return false;
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  return inicio <= fim;
};

// ==================== VALIDAÇÃO DE NÚMERO INTEIRO POSITIVO ====================
export const validarInteiroPositivo = (valor: number): boolean => {
  return Number.isInteger(valor) && valor > 0;
};

// ==================== VALIDAÇÃO DE STRING NÃO VAZIA ====================
export const validarStringNaoVazia = (texto: string): boolean => {
  return texto.trim().length > 0;
};

// ==================== VALIDAÇÃO DE TAMANHO MÍNIMO ====================
export const validarTamanhoMinimo = (
  texto: string,
  minimo: number
): boolean => {
  return texto.trim().length >= minimo;
};

// ==================== VALIDAÇÃO DE TAMANHO MÁXIMO ====================
export const validarTamanhoMaximo = (
  texto: string,
  maximo: number
): boolean => {
  return texto.trim().length <= maximo;
};

// ==================== VALIDAÇÃO DE UF (ESTADO) ====================
const estadosValidos = [
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

export const validarUF = (uf: string): boolean => {
  return estadosValidos.includes(uf.toUpperCase());
};

// ==================== VALIDAÇÃO DE ARQUIVO (TAMANHO) ====================
export const validarTamanhoArquivo = (
  arquivo: File,
  tamanhoMaxMB: number
): boolean => {
  const tamanhoMaxBytes = tamanhoMaxMB * 1024 * 1024;
  return arquivo.size <= tamanhoMaxBytes;
};

// ==================== VALIDAÇÃO DE TIPO DE ARQUIVO ====================
export const validarTipoArquivo = (
  arquivo: File,
  tiposPermitidos: string[]
): boolean => {
  return tiposPermitidos.includes(arquivo.type);
};

// ==================== VALIDAÇÃO DE IMAGEM ====================
export const validarImagem = (arquivo: File): boolean => {
  const tiposImagem = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  return validarTipoArquivo(arquivo, tiposImagem);
};

// ==================== MENSAGENS DE ERRO ====================
export const obterMensagemErro = (campo: string, tipo: string): string => {
  const mensagens: Record<string, string> = {
    cpf_invalido: "CPF inválido. Verifique os números digitados.",
    cnpj_invalido: "CNPJ inválido. Verifique os números digitados.",
    email_invalido: "Email inválido. Use o formato: exemplo@dominio.com.br",
    telefone_invalido:
      "Telefone inválido. Use (00) 00000-0000 ou (00) 0000-0000.",
    cep_invalido: "CEP inválido. Use o formato: 00000-000.",
    campo_obrigatorio: `${campo} é obrigatório.`,
    valor_invalido: `${campo} possui um valor inválido.`,
    data_invalida: "Data inválida. Verifique o formato.",
    data_futura: "A data deve ser futura.",
    data_passada: "A data deve ser passada.",
    intervalo_invalido: "A data de início deve ser anterior à data de fim.",
    tamanho_minimo: `${campo} deve ter no mínimo {min} caracteres.`,
    tamanho_maximo: `${campo} deve ter no máximo {max} caracteres.`,
    arquivo_grande: "Arquivo muito grande. Tamanho máximo: {max}MB.",
    tipo_arquivo_invalido: "Tipo de arquivo não permitido.",
  };

  return mensagens[tipo] || "Valor inválido.";
};
