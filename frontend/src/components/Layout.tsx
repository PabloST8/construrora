import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

interface LayoutProps {
  window?: () => Window;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleMenuClose();
  };

  // Determinar o título da página baseado na URL
  const getPageTitle = () => {
    if (location.pathname === "/" || location.pathname === "/dashboard")
      return "Tela Inicial";
    if (location.pathname === "/obras") return "Gestão de Obras";
    if (location.pathname === "/pessoas") return "Gestão de Pessoas";
    if (location.pathname === "/despesas") return "Gestão de Despesas";
    if (location.pathname === "/receitas") return "Gestão de Receitas";
    if (location.pathname === "/fornecedores") return "Gestão de Fornecedores";
    if (location.pathname === "/relatorios") return "Relatórios";
    if (location.pathname === "/relatorio-fotografico")
      return "Relatório Fotográfico";
    if (location.pathname === "/diario") return "Diário de Obra";
    if (location.pathname === "/tarefas") return "Tarefas Realizadas";
    if (location.pathname === "/ocorrencias") return "Ocorrências";
    if (location.pathname === "/equipe") return "Equipe da Obra";
    if (location.pathname === "/equipamentos") return "Equipamentos e Máquinas";
    return "Sistema de Gestão de Obras";
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#2c2c2c", // Fundo escuro
        color: "white",
      }}
    >
      <Toolbar
        sx={{ backgroundColor: "#d32f2f", minHeight: "64px !important" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          {/* Logo MIF3 */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "white",
              fontFamily: "Arial, sans-serif",
            }}
          >
            MIF3
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ py: 0 }}>
        {/* Dashboard/Tela Inicial */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/dashboard")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/dashboard"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Tela Inicial" />
          </ListItemButton>
        </ListItem>

        {/* Obras */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/obras")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/obras"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Obras" />
          </ListItemButton>
        </ListItem>

        {/* Pessoas */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/pessoas")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/pessoas"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Pessoas" />
          </ListItemButton>
        </ListItem>

        {/* Despesas */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/despesas")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/despesas"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Despesas" />
          </ListItemButton>
        </ListItem>

        {/* Receitas */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/receitas")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/receitas"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Receitas" />
          </ListItemButton>
        </ListItem>

        {/* Fornecedores */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/fornecedores")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/fornecedores"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Fornecedores" />
          </ListItemButton>
        </ListItem>

        {/* Relatórios */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/relatorios")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/relatorios"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Relatórios" />
          </ListItemButton>
        </ListItem>

        {/* Relatório Fotográfico */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/relatorio-fotografico")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/relatorio-fotografico"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Relatório Fotográfico" />
          </ListItemButton>
        </ListItem>

        {/* Diário de Obra */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/diario")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/diario"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Diário de Obra" />
          </ListItemButton>
        </ListItem>

        {/* Tarefas Realizadas */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/tarefas")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/tarefas"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Tarefas Realizadas" />
          </ListItemButton>
        </ListItem>

        {/* Ocorrências */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/ocorrencias")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/ocorrencias"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Ocorrências" />
          </ListItemButton>
        </ListItem>

        {/* Equipe da Obra */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/equipe")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/equipe"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Equipe da Obra" />
          </ListItemButton>
        </ListItem>

        {/* Equipamentos e Máquinas */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/equipamentos")}
            sx={{
              color: "white",
              backgroundColor:
                location.pathname === "/equipamentos"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ListItemText primary="Equipamentos" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "white",
          color: "#333",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color: "#333" }}
          >
            {getPageTitle()}
          </Typography>

          {/* Avatar do usuário */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {user?.nome || "Usuário"}
            </Typography>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{ color: "#333" }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#d32f2f" }}>
                {user?.nome?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#2c2c2c",
              border: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#2c2c2c",
              border: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          p: 0, // Remove padding para que o Dashboard controle
        }}
      >
        <Outlet />
      </Box>

      {/* Menu do usuário */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Perfil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
