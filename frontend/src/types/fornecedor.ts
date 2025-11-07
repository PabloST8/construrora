// ✅ Tipos para Fornecedor - Match 100% com model Go Fornecedor

export interface Fornecedor {
  id?: number;
  nome: string;
  tipo_documento: "CPF" | "CNPJ";
  tipoDocumento?: "CPF" | "CNPJ"; // Compatibilidade
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  contato_nome?: string;
  contatoNome?: string; // Compatibilidade
  contato_telefone?: string;
  contatoTelefone?: string; // Compatibilidade
  contato_email?: string;
  contatoEmail?: string; // Compatibilidade
  ativo: boolean; // ✅ REQUIRED (Model Go exige)
  foto?: string; // ✅ NOVO - Base64 encoded image (logo/foto do fornecedor)
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Compatibilidade
  updatedAt?: string; // Compatibilidade
}
