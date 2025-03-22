import { useState, useEffect } from "react";
import { Container, Typography, Grid, Card, CardContent, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

const BudgetPage = ({ token }) => {
  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await API.get("/budget", { headers: { Authorization: `Bearer ${token}` } });
        setBudgets(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setMessage("Error fetching budgets");
        setMessageType("error");
      }
    };
    fetchBudgets();
  }, [token]);

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Manage Budgets</Typography>
      <Grid container spacing={2}>
        {budgets.map((b) => (
          <Grid item xs={12} md={6} lg={4} key={b.id}>
            <Card sx={{ minWidth: 275, backgroundColor: b.status === "Approved" ? "#d4edda" : b.status === "Rejected" ? "#f8d7da" : "white" }}>
              <CardContent>
                <Typography variant="h6">{b.title}</Typography>
                <Typography>Amount: ${b.amount}</Typography>
                <Typography>Status: <strong>{b.status}</strong></Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity={messageType} sx={{ width: "100%" }}>{message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default BudgetPage;
