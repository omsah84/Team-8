import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = ({ role, onLogout }) => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar Stays Fixed */}
      <Sidebar role={role} onLogout={onLogout} />

      {/* Main Content Updates */}
      <Box sx={{ flex: 1, p: 3, overflowY: "auto", backgroundColor: "#f4f6f8" }}>
        <Outlet /> {/* 🔥 This ensures child routes render dynamically */}
      </Box>
    </Box>
  );
};

export default Layout;
