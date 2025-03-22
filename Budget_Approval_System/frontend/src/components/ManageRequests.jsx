import { useState, useEffect } from "react";
import { Typography, Button, Grid, Card, CardContent, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const ManageRequests = () => {
  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // Create an Axios instance with baseURL and withCredentials option.
  const API = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
  });


  useEffect(() => {
    fetchPendingBudgets();
  }, []);

  const fetchPendingBudgets = async () => {
    try {
      const res = await API.get("/api/budgets/pending");
      setBudgets(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error fetching budgets.");
      setMessageType("error");
    }
  };

  const handleApproval = async (id, status) => {
    try {
      await API.put(`/api/budgets/${id}/status`, { status });
      // Remove the approved/rejected budget from state.
      setBudgets(budgets.filter(b => b.id !== id));
      setMessage(`Budget ${status} successfully!`);
      setMessageType("success");
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage("Failed to update budget status.");
      setMessageType("error");
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>Manage Budget Requests</Typography>
      <Grid container spacing={2}>
        {budgets.map((b) => (
          <Grid item xs={12} md={6} key={b.id}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">{b.title}</Typography>
                <Typography>Amount: ${b.amount}</Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1, mt: 1 }}
                  onClick={() => handleApproval(b.id, "Approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={() => handleApproval(b.id, "Rejected")}
                >
                  Reject
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity={messageType} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageRequests;
