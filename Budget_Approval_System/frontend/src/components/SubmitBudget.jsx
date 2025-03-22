import { useState } from "react";
import { TextField, Button, Typography, Snackbar, Alert, Box } from "@mui/material";
import axios from "axios";

const SubmitBudget = ({ userId }) => {
  const [budget, setBudget] = useState({ title: "", amount: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Get Token from Local Storage
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in. Please log in first.");
      setMessageType("error");
      return;
    }

    try {
      // ✅ Ensure API URL is correct and Token is included
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        "http://localhost:5000/api/budgets", // ✅ Make sure this is correct
        { ...budget, userId },
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Include Authorization Header
        }
      );

      setMessage("Budget submitted successfully!");
      setMessageType("success");
      setBudget({ title: "", amount: "" }); // ✅ Reset input fields
    } catch (error) {
      console.error("Error submitting budget:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Failed to submit budget.");
      setMessageType("error");
    }
  };

  return (
    <Box>
      <Typography variant="h5">Submit a Budget Request</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          value={budget.title}
          onChange={(e) => setBudget({ ...budget, title: e.target.value })}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={budget.amount}
          onChange={(e) => setBudget({ ...budget, amount: e.target.value })}
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity={messageType}>{message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SubmitBudget;
