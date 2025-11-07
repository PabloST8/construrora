import React from "react";
import { Box } from "@mui/material";
import BuscarObra from "./BuscarObra";

const Obras: React.FC = () => {
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <BuscarObra />
    </Box>
  );
};

export default Obras;
