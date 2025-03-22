import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TextField, Button, Container, Typography, Select, MenuItem, 
  Snackbar, Alert, Paper, Box 
} from "@mui/material";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "Employee" });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/api/auth/register", form);
      console.log(response);
      setMessage("Registration successful! Please login.");
      setMessageType("success");
      setTimeout(() => navigate("/"), 2000); // Navigate after success
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Create an Account
        </Typography>
        
        <form onSubmit={handleRegister}>
          <TextField 
            fullWidth 
            label="Email" 
            name="email" 
            margin="normal" 
            onChange={handleChange} 
            required 
          />
          <TextField 
            fullWidth 
            label="Password" 
            name="password" 
            type="password" 
            margin="normal" 
            onChange={handleChange} 
            required 
          />
          <Box sx={{ mt: 2 }}>
            <Select fullWidth name="role" value={form.role} onChange={handleChange}>
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </Box>

          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            type="submit" 
            sx={{ mt: 3, p: 1.5, fontSize: "1rem", fontWeight: "bold" }}
          >
            Register
          </Button>
        </form>
        
        <Typography 
          align="center" 
          sx={{ mt: 2, color: "gray", cursor: "pointer", "&:hover": { textDecoration: "underline" } }} 
          onClick={() => navigate("/")}
        >
          Already have an account? Login
        </Typography>
      </Paper>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity={messageType} sx={{ width: "100%" }}>{message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
