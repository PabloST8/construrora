import api from "./api";
import { Usuario } from "../types/apiGo";

export const usuarioService = {
  // ✅ Cadastrar novo usuário (ROTA PÚBLICA - não precisa token JWT)
  async cadastrar(usuario: Usuario): Promise<Usuario> {
    const response = await api.post("/usuarios", usuario);
    return response.data.data || response.data;
  },

  // Listar todos os usuários (protegido)
  async listar(): Promise<Usuario[]> {
    const response = await api.get("/usuarios");
    return response.data.data || response.data;
  },

  // Buscar usuário por ID (protegido)
  async buscarPorId(id: number): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Atualizar usuário (protegido)
  async atualizar(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  // Deletar usuário (protegido)
  async deletar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
