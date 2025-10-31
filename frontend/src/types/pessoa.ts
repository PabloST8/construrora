export interface Pessoa {
  id?: number;
  nome: string;
  tipo: "PF" | "PJ"; // ✅ Corrigido para match com API Go
  documento: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  ativo?: boolean;

  // Campos de endereço
  endereco_cep?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_complemento?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PessoaFilters {
  codigoPessoa?: string;
  nome?: string;
  documento?: string;
  cpf?: string;
  funcao?: string;
}
