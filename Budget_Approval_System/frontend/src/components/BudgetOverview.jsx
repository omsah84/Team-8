import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const ManageRequests = () => {
  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // Create an Axios instance with baseURL and withCredentials enabled.
  const API = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
  });

  // Optionally, add an interceptor to include JWT from localStorage if you're using it.
  API.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      // Admin endpoint: get all budget requests
      const res = await API.get("/api/budgets");
      setBudgets(res.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error fetching budgets."
      );
      setMessageType("error");
    }
  };

  const handleApproval = async (id, status) => {
    try {
      await API.put(`/api/budgets/${id}/status`, { status });
      // Update the budget status in the list without removing it.
      setBudgets((prevBudgets) =>
        prevBudgets.map((b) =>
          b.id === id ? { ...b, status: status } : b
        )
      );
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
      <Typography variant="h5" sx={{ mb: 2 }}>
        Manage Budget Requests (Admin)
      </Typography>
      <Grid container spacing={2}>
        {budgets.map((b) => (
          <Grid item xs={12} md={6} key={b.id}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">{b.title}</Typography>
                <Typography>Amount: ${b.amount}</Typography>
                <Typography>Status: {b.status}</Typography>
                <Button
                  sx={{ mr: 1, mt: 1 }}
                  variant="contained"
                  color="success"
                  onClick={() => handleApproval(b.id, "Approved")}
                >
                  Approve
                </Button>
                <Button
                  sx={{ mr: 1, mt: 1 }}
                  variant="contained"
                  color="error"
                  onClick={() => handleApproval(b.id, "Rejected")}
                >
                  Reject
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
      >
        <Alert severity={messageType} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageRequests;
