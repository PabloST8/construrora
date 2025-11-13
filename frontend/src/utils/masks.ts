/**
 * Utilitários de Máscaras
 * Sistema completo de máscaras para formatação de inputs
 */

// ==================== MÁSCARA DE CPF ====================
export const aplicarMascaraCPF = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9)
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(
    6,
    9
  )}-${numeros.slice(9, 11)}`;
};

// ==================== MÁSCARA DE CNPJ ====================
export const aplicarMascaraCNPJ = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
  if (numeros.length <= 8)
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
  if (numeros.length <= 12)
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(
      5,
      8
    )}/${numeros.slice(8)}`;

  return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(
    5,
    8
  )}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
};

// ==================== MÁSCARA DE CPF OU CNPJ (AUTOMÁTICA) ====================
export const aplicarMascaraDocumento = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length <= 11) {
    return aplicarMascaraCPF(numeros);
  } else {
    return aplicarMascaraCNPJ(numeros);
  }
};

// ==================== MÁSCARA DE TELEFONE ====================
export const aplicarMascaraTelefone = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return `(${numeros}`;
  if (numeros.length <= 6)
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10)
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(
      6
    )}`;

  // Celular com 9 dígitos
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(
    7,
    11
  )}`;
};

// ==================== MÁSCARA DE CEP ====================
export const aplicarMascaraCEP = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 5) return numeros;

  return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
};

// ==================== MÁSCARA DE VALOR MONETÁRIO ====================
export const aplicarMascaraMoeda = (valor: string | number): string => {
  let valorNumerico: number;

  if (typeof valor === "string") {
    // Remove tudo exceto números e ponto decimal
    const limpo = valor.replace(/[^\d]/g, "");
    valorNumerico = parseFloat(limpo) / 100;
  } else {
    valorNumerico = valor;
  }

  if (isNaN(valorNumerico)) return "R$ 0,00";

  return valorNumerico.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// ==================== MÁSCARA DE DATA (DD/MM/YYYY) ====================
export const aplicarMascaraData = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
};

// ==================== MÁSCARA DE HORA (HH:MM) ====================
export const aplicarMascaraHora = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return numeros;

  return `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
};

// ==================== MÁSCARA DE NÚMERO INTEIRO ====================
export const aplicarMascaraInteiro = (valor: string): string => {
  return valor.replace(/\D/g, "");
};

// ==================== MÁSCARA DE NÚMERO DECIMAL ====================
export const aplicarMascaraDecimal = (valor: string): string => {
  // Remove tudo exceto números e ponto/vírgula
  const limpo = valor.replace(/[^\d.,]/g, "");

  // Substitui vírgula por ponto
  const comPonto = limpo.replace(",", ".");

  // Garante apenas um ponto decimal
  const partes = comPonto.split(".");
  if (partes.length > 2) {
    return `${partes[0]}.${partes.slice(1).join("")}`;
  }

  return comPonto;
};

// ==================== MÁSCARA DE PERCENTUAL ====================
export const aplicarMascaraPercentual = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";

  const valorNumerico = parseFloat(numeros) / 100;

  if (isNaN(valorNumerico) || valorNumerico > 100) return "100%";

  return `${valorNumerico.toFixed(2)}%`;
};

// ==================== MÁSCARA DE PLACA DE VEÍCULO (MERCOSUL) ====================
export const aplicarMascaraPlaca = (valor: string): string => {
  const caracteres = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (caracteres.length === 0) return "";
  if (caracteres.length <= 3) return caracteres;
  if (caracteres.length <= 4)
    return `${caracteres.slice(0, 3)}${caracteres.slice(3)}`;

  return `${caracteres.slice(0, 3)}${caracteres.slice(3, 4)}${caracteres.slice(
    4,
    7
  )}`;
};

// ==================== MÁSCARA DE NÚMERO DE CARTÃO DE CRÉDITO ====================
export const aplicarMascaraCartaoCredito = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 4) return numeros;
  if (numeros.length <= 8) return `${numeros.slice(0, 4)} ${numeros.slice(4)}`;
  if (numeros.length <= 12)
    return `${numeros.slice(0, 4)} ${numeros.slice(4, 8)} ${numeros.slice(8)}`;

  return `${numeros.slice(0, 4)} ${numeros.slice(4, 8)} ${numeros.slice(
    8,
    12
  )} ${numeros.slice(12, 16)}`;
};

// ==================== MÁSCARA DE CVV ====================
export const aplicarMascaraCVV = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");
  return numeros.slice(0, 4); // Aceita 3 ou 4 dígitos
};

// ==================== REMOVER MÁSCARA (OBTER SÓ NÚMEROS) ====================
export const removerMascara = (valor: string): string => {
  return valor.replace(/\D/g, "");
};

// ==================== OBTER TIPO DE DOCUMENTO (CPF/CNPJ) ====================
export const obterTipoDocumento = (
  documento: string
): "CPF" | "CNPJ" | null => {
  const numeros = removerMascara(documento);

  if (numeros.length === 11) return "CPF";
  if (numeros.length === 14) return "CNPJ";

  return null;
};

// ==================== LIMITAR CARACTERES ====================
export const limitarCaracteres = (valor: string, max: number): string => {
  return valor.slice(0, max);
};

// ==================== CAPITALIZAR PRIMEIRA LETRA ====================
export const capitalizarPrimeiraLetra = (texto: string): string => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

// ==================== CAPITALIZAR TODAS AS PALAVRAS ====================
export const capitalizarPalavras = (texto: string): string => {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra) => capitalizarPrimeiraLetra(palavra))
    .join(" ");
};

// ==================== UPPERCASE ====================
export const aplicarUpperCase = (texto: string): string => {
  return texto.toUpperCase();
};

// ==================== LOWERCASE ====================
export const aplicarLowerCase = (texto: string): string => {
  return texto.toLowerCase();
};

// ==================== MÁSCARA DE RG ====================
export const aplicarMascaraRG = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
  if (numeros.length <= 8)
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;

  return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(
    5,
    8
  )}-${numeros.slice(8, 9)}`;
};

// ==================== MÁSCARA DE TÍTULO DE ELEITOR ====================
export const aplicarMascaraTituloEleitor = (valor: string): string => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 0) return "";
  if (numeros.length <= 4) return numeros;
  if (numeros.length <= 8) return `${numeros.slice(0, 4)} ${numeros.slice(4)}`;

  return `${numeros.slice(0, 4)} ${numeros.slice(4, 8)} ${numeros.slice(
    8,
    12
  )}`;
};
