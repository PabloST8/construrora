import axios from "axios";

// ✅ API Go rodando na porta 9090 (conforme README)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9090";

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  // Login - retorna access_token e refresh_token
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    const { access_token, refresh_token } = response.data;

    // Armazena os tokens no localStorage
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    // Decodifica o token para extrair o email do usuário
    const email = authService.getEmailFromToken(access_token);
    if (email) {
      localStorage.setItem("user_email", email);
    }

    return response.data;
  },

  // Renovar access token usando o refresh token
  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/refresh`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;

    // Atualiza os tokens
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", newRefreshToken);

    return response.data;
  },

  // Logout - limpa todos os dados do localStorage
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    window.location.href = "/login";
  },

  // Verifica se o usuário está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token");
  },

  // Obtém o email do token JWT (decodificação básica)
  getEmailFromToken: (token: string): string | null => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.email || null;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  },

  // Obtém o email do usuário logado
  getUserEmail: (): string | null => {
    return localStorage.getItem("user_email");
  },

  // Obtém o access token
  getAccessToken: (): string | null => {
    return localStorage.getItem("access_token");
  },

  // Obtém o refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refresh_token");
  },
};
