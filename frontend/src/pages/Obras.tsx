import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import CadastrarObra from "./CadastrarObra";
import BuscarObra from "./BuscarObra";

const Obras: React.FC = () => {
  const [tabAtual, setTabAtual] = useState(0);

  const handleChangeTab = (_event: React.SyntheticEvent, novaTab: number) => {
    setTabAtual(novaTab);
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabAtual}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="📋 Buscar Obra" />
          <Tab label="➕ Cadastrar Obra" />
        </Tabs>
      </Paper>

      {tabAtual === 0 && <BuscarObra />}
      {tabAtual === 1 && <CadastrarObra />}
    </Box>
  );
};

export default Obras;
