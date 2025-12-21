import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import '../styles/common.css';

const LoanApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await api.getLoanApplicationById(token, id);
        setApplication(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchApplication();
    }
  }, [token, id]);

  if (loading) return <div className="loading">Loading application details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!application) return <div className="error">Application not found</div>;

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate('/loans')}>
        ← Back to Applications
      </button>

      <div className="application-details">
        <h1>Loan Application Details</h1>

        <div className="details-section">
          <h3>Basic Information</h3>
          <div className="details-grid">
            <div className="detail">
              <span className="label">Application Number:</span>
              <span className="value">{application.applicationNumber}</span>
            </div>
            <div className="detail">
              <span className="label">Status:</span>
              <span className="value" style={{ color: '#28a745', fontWeight: 'bold' }}>
                {application.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <div className="detail">
              <span className="label">Product:</span>
              <span className="value">{application.productId?.name}</span>
            </div>
            <div className="detail">
              <span className="label">Applied Date:</span>
              <span className="value">{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Loan Details</h3>
          <div className="details-grid">
            <div className="detail">
              <span className="label">Loan Amount:</span>
              <span className="value">₹{application.loanAmount?.toLocaleString()}</span>
            </div>
            <div className="detail">
              <span className="label">Tenure:</span>
              <span className="value">{application.tenure} months</span>
            </div>
            <div className="detail">
              <span className="label">Interest Rate:</span>
              <span className="value">{application.interestRate}% p.a.</span>
            </div>
            <div className="detail">
              <span className="label">Processing Fee:</span>
              <span className="value">₹{application.processingFee?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Collateral Details</h3>
          {application.collaterals && application.collaterals.length > 0 ? (
            <div>
              <p>
                <strong>Total Collateral Value:</strong> ₹{application.totalCollateralValue?.toLocaleString()}
              </p>
              <p>
                <strong>Loan to Value Ratio:</strong> {application.loanToValueRatio?.toFixed(2)}%
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fund Name</th>
                    <th>Units</th>
                    <th>NAV/Unit</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {application.collaterals.map((collateral) => (
                    <tr key={collateral._id}>
                      <td>{collateral.fundName}</td>
                      <td>{collateral.units?.toFixed(2)}</td>
                      <td>₹{collateral.currentNavPerUnit?.toFixed(2)}</td>
                      <td>₹{collateral.totalValue?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No collaterals linked</p>
          )}
        </div>

        {application.approvalDate && (
          <div className="details-section">
            <h3>Approval Information</h3>
            <div className="details-grid">
              <div className="detail">
                <span className="label">Approval Date:</span>
                <span className="value">{new Date(application.approvalDate).toLocaleDateString()}</span>
              </div>
              <div className="detail">
                <span className="label">Approved By:</span>
                <span className="value">{application.approvedBy?.firstName} {application.approvedBy?.lastName}</span>
              </div>
            </div>
          </div>
        )}

        {application.comments && (
          <div className="details-section">
            <h3>Comments</h3>
            <p>{application.comments}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplicationDetails;
