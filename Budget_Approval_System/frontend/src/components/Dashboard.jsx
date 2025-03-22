import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import GraphDashboard from './GraphDashboard';

const Dashboard = ({ role }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          p: 4,
          borderRadius: 2,
          mb: 1,
          textAlign: 'center',
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the {role} Dashboard!
        </Typography>
        <Typography variant="h6">
          Get insights and analytics at a glance.
        </Typography>
      </Box>
      <GraphDashboard role={role} />
    </Container>
  );
};

export default Dashboard;
