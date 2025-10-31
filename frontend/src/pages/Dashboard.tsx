import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { Construction, Search, PersonAdd, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Cadastrar Obras",
      icon: <Construction sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/obras?tab=cadastrar",
      color: "#d32f2f",
    },
    {
      title: "Buscar Obras",
      icon: <Search sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/obras?tab=buscar",
      color: "#d32f2f",
    },
    {
      title: "Cadastrar Pessoas",
      icon: <PersonAdd sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/pessoas?tab=cadastrar",
      color: "#d32f2f",
    },
    {
      title: "Buscar Pessoas",
      icon: <Person sx={{ fontSize: 40, color: "#d32f2f" }} />,
      path: "/pessoas?tab=buscar",
      color: "#d32f2f",
    },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 4,
        }}
      >
        {menuItems.map((item, index) => (
          <Card
            key={index}
            sx={{
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 3,
              },
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              border: "2px solid #e0e0e0",
              borderRadius: 2,
            }}
            onClick={() => navigate(item.path)}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Box sx={{ mb: 2 }}>{item.icon}</Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#333",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                {item.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;
