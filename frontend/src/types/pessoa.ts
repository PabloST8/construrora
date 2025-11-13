// ✅ Ajustado 100% para match com model Go Pessoa
export interface Pessoa {
  id?: number;
  nome: string;
  tipo: "PF" | "PJ"; // ✅ Match EXATO com banco PostgreSQL (varchar(2))
  documento: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  ativo?: boolean;

  // ✅ Campos de endereço (match com API Go)
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface PessoaFilters {
  codigoPessoa?: string;
  nome?: string;
  documento?: string;
  cpf?: string;
  funcao?: string;
  cargo?: string;
}
