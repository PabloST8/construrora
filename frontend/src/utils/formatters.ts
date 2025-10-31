export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

export const formatCpfCnpj = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 11) {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else {
    return cleanValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
};

export const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 10) {
    return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
};

export const formatCep = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.replace(/(\d{5})(\d{3})/, "$1-$2");
};

export const validateCpf = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, "");

  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(cleanCpf.charAt(10));
};

export const validateCnpj = (cnpj: string): boolean => {
  const cleanCnpj = cnpj.replace(/\D/g, "");

  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;

  const weights = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weights[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (firstDigit !== parseInt(cleanCnpj.charAt(12))) return false;

  const weights2 = [5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return secondDigit === parseInt(cleanCnpj.charAt(13));
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "PLANEJADA":
      return "#1976d2"; // Azul
    case "EM_ANDAMENTO":
      return "#ed6c02"; // Laranja
    case "CONCLUIDA":
      return "#2e7d32"; // Verde
    case "CANCELADA":
      return "#d32f2f"; // Vermelho
    case "PENDENTE":
      return "#ed6c02"; // Laranja
    case "PAGO":
      return "#2e7d32"; // Verde
    default:
      return "#9e9e9e"; // Cinza
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "PLANEJADA":
      return "Planejada";
    case "EM_ANDAMENTO":
      return "Em Andamento";
    case "CONCLUIDA":
      return "Concluída";
    case "CANCELADA":
      return "Cancelada";
    case "PENDENTE":
      return "Pendente";
    case "PAGO":
      return "Pago";
    case "FISICA":
      return "Pessoa Física";
    case "JURIDICA":
      return "Pessoa Jurídica";
    case "MATERIAL":
      return "Material";
    case "MAO_DE_OBRA":
      return "Mão de Obra";
    case "IMPOSTO":
      return "Imposto";
    case "PARCEIRO":
      return "Parceiro";
    case "OUTROS":
      return "Outros";
    case "A_VISTA":
      return "À Vista";
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "Boleto";
    case "CARTAO":
      return "Cartão";
    case "SOL":
      return "Sol";
    case "CHUVA":
      return "Chuva";
    case "NUBLADO":
      return "Nublado";
    case "VENTOSO":
      return "Ventoso";
    case "ADMIN":
      return "Administrador";
    case "ENGENHEIRO":
      return "Engenheiro";
    case "FINANCEIRO":
      return "Financeiro";
    default:
      return status;
  }
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
