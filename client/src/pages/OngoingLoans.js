import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import '../styles/common.css';

const OngoingLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await api.getOngoingLoans(token);
        setLoans(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLoans();
    }
  }, [token]);

  if (loading) return <div className="loading">Loading loans...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Ongoing Loans</h1>

      {loans.length === 0 ? (
        <div className="empty-state">
          <p>No ongoing loans found.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Product</th>
              <th>Loan Amount</th>
              <th>Tenure</th>
              <th>Interest Rate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id}>
                <td>{loan.applicationNumber}</td>
                <td>{loan.productId?.name}</td>
                <td>₹{loan.loanAmount?.toLocaleString()}</td>
                <td>{loan.tenure} months</td>
                <td>{loan.interestRate}%</td>
                <td>
                  <strong style={{ color: '#28a745' }}>{loan.status.replace(/_/g, ' ').toUpperCase()}</strong>
                </td>
                <td>
                  <button className="btn btn-sm" onClick={() => navigate(`/loans/${loan._id}`)}>
                    View Details
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

export default OngoingLoans;
