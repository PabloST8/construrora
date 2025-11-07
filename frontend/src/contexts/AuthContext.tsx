import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, LoginCredentials } from "../types";
import { authService } from "../services/authService";
import { toast } from "react-toastify";

interface AuthContextData {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = authService.getAccessToken();
    if (accessToken && authService.isAuthenticated()) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const email = authService.getUserEmail();
      if (email) {
        // Criar um objeto de usuário básico com o email do token
        setUser({
          id: 0,
          nome: email.split("@")[0], // Nome temporário baseado no email
          email: email,
          perfil_acesso: "usuario",
        });
      }
    } catch (error) {
      authService.logout();
      toast.error("Sessão expirada. Faça login novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      await authService.login(credentials);

      // O authService já salva os tokens no localStorage
      // Criar objeto de usuário com base no email do token
      const email = authService.getUserEmail();
      if (email) {
        setUser({
          id: 0,
          nome: email.split("@")[0],
          email: email,
          perfil_acesso: "usuario",
        });
      }

      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao fazer login";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout(); // Usa o método do authService que limpa todos os tokens
    setUser(null);
    toast.info("Logout realizado com sucesso!");
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
