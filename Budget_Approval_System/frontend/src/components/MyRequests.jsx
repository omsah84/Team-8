import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const MyRequests = () => {
  const [budgets, setBudgets] = useState([]); // initial state empty
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    fetchMyBudgets();
  }, []);

  const fetchMyBudgets = async () => {
    try {
      // Call the API endpoint which retrieves budget requests for the logged-in user (using cookies)
      const response = await axios.get("http://localhost:5000/api/budgets/user", {
        withCredentials: true, // ensures cookies are sent along with the request
      });
      setBudgets(response.data);
    } catch (err) {
      console.error("Error fetching budgets:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Failed to load budget requests.");
      setMessageType("error");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        My Budget Requests
      </Typography>

      {budgets.length === 0 ? (
        <Typography sx={{ color: "gray" }}>
          No budget requests found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {budgets.map((b) => (
            <Grid item xs={12} md={6} lg={4} key={b.id}>
              <Card
                sx={{
                  minWidth: 275,
                  p: 2,
                  backgroundColor:
                    b.status === "Approved"
                      ? "#D4EDDA"
                      : b.status === "Rejected"
                      ? "#F8D7DA"
                      : "white",
                }}
              >
                <CardContent>
                  <Typography variant="h6">{b.title}</Typography>
                  <Typography>Amount: ${b.amount}</Typography>
                  <Typography>
                    Status: <strong>{b.status}</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity={messageType} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyRequests;
