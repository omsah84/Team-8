// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import SubmitBudget from "./components/SubmitBudget";
import ManageRequests from "./components/ManageRequests";
import BudgetOverview from "./components/BudgetOverview";
import MyRequests from "./components/MyRequests";

const App = () => {
  // State to hold auth data
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // On first load or refresh, read auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedRole && storedUserId) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
    }
  }, [token, role, userId]);

  // Logout handler: remove from localStorage + reset state
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          token ? (
            // If logged in, go to dashboard
            <Navigate to="/dashboard" replace />
          ) : (
            // Otherwise show login page
            <Login
              setToken={setToken}
              setRole={setRole}
              setUserId={setUserId}
            />
          )
        }
      />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes (nested under /dashboard) */}
      {token ? (
        <Route
          path="/dashboard"
          element={<Layout role={role} onLogout={handleLogout} />}
        >
          {/* Index route for /dashboard */}
          <Route index element={<Dashboard role={role} userId={userId} />} />

          {/* Role-based sub-routes */}
          {role === "Employee" && (
            <>
              <Route
                path="submit-budget"
                element={<SubmitBudget userId={userId} />}
              />
              <Route
                path="my-requests"
                element={<MyRequests userId={userId} />}
              />
            </>
          )}
          {role === "Manager" && (
            <Route path="manage-requests" element={<ManageRequests />} />
          )}
          {role === "Admin" && (
            <Route path="budget-overview" element={<BudgetOverview />} />
          )}
        </Route>
      ) : (
        // If no token, redirect any other route to "/"
        <Route path="*" element={<Navigate to="/" replace />} />
      )}
    </Routes>
  );
};

export default App;
