import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import CadastrarObra from "./CadastrarObra";
import BuscarObra from "./BuscarObra";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Obras: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "cadastrar") {
      setTabValue(0);
    } else if (tab === "buscar") {
      setTabValue(1);
    }
  }, [searchParams]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Cadastrar Obra" />
          <Tab label="Buscar Obra" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <CadastrarObra />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <BuscarObra />
      </TabPanel>
    </Box>
  );
};

export default Obras;
