import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import '../styles/common.css';

const LoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.getLoanApplications(token);
        setApplications(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token]);

  const getStatusColor = (status) => {
    const colors = {
      draft: '#gray',
      submitted: '#blue',
      under_review: '#orange',
      approved: '#green',
      rejected: '#red',
      disbursed: '#darkgreen',
      closed: '#darkgray',
    };
    return colors[status] || '#black';
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Loan Applications</h1>
        <button className="btn btn-primary" onClick={() => navigate('/create-loan')}>
          Create New Application
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <p>No loan applications found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/create-loan')}>
            Create Your First Application
          </button>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.applicationNumber}</td>
                <td>{app.productId?.name}</td>
                <td>₹{app.loanAmount?.toLocaleString()}</td>
                <td style={{ color: getStatusColor(app.status) }}>
                  <strong>{app.status.replace(/_/g, ' ').toUpperCase()}</strong>
                </td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => navigate(`/loans/${app._id}`)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LoanApplications;
