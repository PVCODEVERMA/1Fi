import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/common.css';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Welcome, {user?.firstName}!</h1>
        <p className="subtitle">Loan Management System for Lending Against Mutual Funds</p>

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/products')}>
            <h3>📋 Loan Products</h3>
            <p>Explore available loan products and their details</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/loans')}>
            <h3>📝 Loan Applications</h3>
            <p>View all your loan applications</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/create-loan')}>
            <h3>➕ Create New Loan</h3>
            <p>Apply for a new loan against mutual funds</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/ongoing-loans')}>
            <h3>💰 Ongoing Loans</h3>
            <p>Track your active loan accounts</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/collaterals')}>
            <h3>🎁 Collateral Management</h3>
            <p>Manage your mutual fund collaterals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
