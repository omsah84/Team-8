import { Drawer, Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Dashboard as DashboardIcon, ExitToApp, MonetizationOn, ListAlt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role, onLogout }) => {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: 250, bgcolor: "#1A1D21", color: "#FFFFFF" },
      }}
    >
      <Box sx={{ p: 3, textAlign: "center", borderBottom: "1px solid #444" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
          Budget System
        </Typography>
        <Typography variant="subtitle2" sx={{ color: "#B0B3B8", mt: 1 }}>
          {role}
        </Typography>
      </Box>

      <List sx={{ mt: 2 }}>
        <ListItem button="true" onClick={() => navigate("/dashboard")}>
          <ListItemIcon><DashboardIcon sx={{ color: "#FFD700" }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        {role === "Employee" && (
           <>
           <ListItem onClick={() => navigate("/dashboard/submit-budget")}>
             <ListItemIcon><MonetizationOn sx={{ color: "#FFD700" }} /></ListItemIcon>
             <ListItemText primary="Submit Budget" />
           </ListItem>
       
           {/* ✅ New List Item for Employees */}
           <ListItem onClick={() => navigate("/dashboard/my-requests")}>
             <ListItemIcon><ListAlt sx={{ color: "#FFD700" }} /></ListItemIcon>
             <ListItemText primary="My Budget Requests" />
           </ListItem>
         </>
          
        )}

        {role === "Manager" && (
          <ListItem button="true" onClick={() => navigate("/dashboard/manage-requests")}>
            <ListItemIcon><ListAlt sx={{ color: "#FFD700" }} /></ListItemIcon>
            <ListItemText primary="Manage Requests" />
          </ListItem>
        )}

        {role === "Admin" && (
          <ListItem button ="true"onClick={() => navigate("/dashboard/budget-overview")}>
            <ListItemIcon><ListAlt sx={{ color: "#FFD700" }} /></ListItemIcon>
            <ListItemText primary="Budget Overview" />
          </ListItem>
        )}

        <ListItem button="true" onClick={onLogout}>
          <ListItemIcon><ExitToApp sx={{ color: "#FFFFFF" }} /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
