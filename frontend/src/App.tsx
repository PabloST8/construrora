import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Pessoas from "./pages/Pessoas";
import Obras from "./pages/Obras";
import DespesasNovo from "./pages/DespesasNovo";
import Receitas from "./pages/Receitas";
import Fornecedores from "./pages/Fornecedores";
import RelatoriosApiGo from "./pages/RelatoriosApiGo";
import DiarioObras from "./pages/DiarioObras";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/cadastro"
              element={
                <PublicRoute>
                  <Cadastro />
                </PublicRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pessoas" element={<Pessoas />} />
              <Route path="obras" element={<Obras />} />
              <Route path="despesas" element={<DespesasNovo />} />
              <Route path="receitas" element={<Receitas />} />
              <Route path="fornecedores" element={<Fornecedores />} />
              <Route path="diario" element={<DiarioObras />} />
              <Route
                path="empresas"
                element={<div>Empresas - Em desenvolvimento</div>}
              />
              <Route path="relatorios" element={<RelatoriosApiGo />} />
              <Route
                path="notificacoes"
                element={<div>Notificações - Em desenvolvimento</div>}
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
