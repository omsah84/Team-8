import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { Box, Typography, Card, CardHeader, CardContent } from '@mui/material';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

const GraphDashboard = ({ role }) => {
  // State variables to store chart data
  const [employeeData, setEmployeeData] = useState([]);
  const [managerData, setManagerData] = useState([]);
  const [adminData, setAdminData] = useState([]);

  // Create an Axios instance with base URL and credentials enabled
  const API = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
  });

  useEffect(() => {
    if (role === 'Employee') {
      fetchEmployeeData();
    } else if (role === 'Manager') {
      fetchManagerData();
    } else if (role === 'Admin') {
      fetchAdminData();
    }
  }, [role]);

  // Employee: Get data from /api/budgets/user and aggregate by status
  const fetchEmployeeData = async () => {
    try {
      const res = await API.get('/api/budgets/user');
      const budgets = res.data; // assume array of budget requests with a "status" field
      const statusCounts = budgets.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      const chartData = [
        { name: 'Approved', value: statusCounts['Approved'] || 0 },
        { name: 'Pending', value: statusCounts['Pending'] || 0 },
        { name: 'Rejected', value: statusCounts['Rejected'] || 0 },
      ];
      setEmployeeData(chartData);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  // Manager: Get pending budgets and group by month (e.g., using createdAt)
  const fetchManagerData = async () => {
    try {
      const res = await API.get('/api/budgets/pending');
      const budgets = res.data; // assume each has a "createdAt" field (ISO string)
      // Group budgets by month (e.g., "Jan", "Feb", etc.)
      const grouped = {};
      budgets.forEach(b => {
        const date = new Date(b.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        grouped[month] = (grouped[month] || 0) + 1;
      });
      const chartData = Object.keys(grouped).map(month => ({
        month,
        Pending: grouped[month],
      }));
      setManagerData(chartData);
    } catch (error) {
      console.error("Error fetching manager data:", error);
    }
  };

  // Admin: Get all budgets and group them by month (formatted as YYYY-MM)
  const fetchAdminData = async () => {
    try {
      const res = await API.get('/api/budgets');
      const budgets = res.data; // assume each has a "createdAt" field
      const grouped = {};
      budgets.forEach(b => {
        const date = new Date(b.createdAt);
        const month = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`;
        grouped[month] = (grouped[month] || 0) + 1;
      });
      // Sort keys and transform into chart data
      const chartData = Object.keys(grouped).sort().map(month => ({
        date: month,
        requests: grouped[month],
      }));
      setAdminData(chartData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 4, backgroundColor: '#f5f5f5' }}>
      {role === 'Employee' && (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardHeader
            title="Employee Budget Requests Overview"
            sx={{ backgroundColor: '#0088FE', color: 'white' }}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employeeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {employeeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {role === 'Manager' && (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardHeader
            title="Manager Team Requests Overview"
            sx={{ backgroundColor: '#00C49F', color: 'white' }}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={managerData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pending" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {role === 'Admin' && (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardHeader
            title="Admin Requests Trend Overview"
            sx={{ backgroundColor: '#FF8042', color: 'white' }}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={adminData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8884d8"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!['Employee', 'Manager', 'Admin'].includes(role) && (
        <Typography variant="body1" align="center">
          Please select a valid role to view graphs.
        </Typography>
      )}
    </Box>
  );
};

export default GraphDashboard;
