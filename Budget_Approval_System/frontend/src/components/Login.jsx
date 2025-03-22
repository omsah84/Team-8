import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Snackbar, Alert, Paper } from "@mui/material";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  // Only needed if your server or routes require sending or receiving cookies
  withCredentials: true,
});

const Login = ({ setToken, setRole, setUserId }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/login", form);
      const { token, role, userId } = res.data;
  
      // Store the token, role, userId in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
  
      // Update our App-level state
      setToken(token);
      setRole(role);
      setUserId(userId);
  
      // Show success message
      setMessage("Login successful! Redirecting...");
      setMessageType("success");
  
      // Remove the explicit navigation
    } catch (err) {
      console.error("Login error:", err.response || err);
      setMessage(err.response?.data?.message || "Invalid credentials, try again!");
      setMessageType("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 400 }}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Welcome Back
        </Typography>

        <form onSubmit={handleLogin}>
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
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{ mt: 3, p: 1.5, fontSize: "1rem", fontWeight: "bold" }}
          >
            Login
          </Button>
        </form>

        <Typography
          align="center"
          sx={{
            mt: 2,
            color: "gray",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => navigate("/register")}
        >
          Don't have an account? Sign Up
        </Typography>
      </Paper>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity={messageType} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
