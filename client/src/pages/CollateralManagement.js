import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import '../styles/common.css';

const CollateralManagement = () => {
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fundName: '',
    fundIsin: '',
    units: '',
    currentNavPerUnit: '',
    depositoryReference: '',
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCollaterals = async () => {
      try {
        const response = await api.getCollaterals(token);
        setCollaterals(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCollaterals();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addCollateral(token, {
        ...formData,
        units: parseFloat(formData.units),
        currentNavPerUnit: parseFloat(formData.currentNavPerUnit),
      });
      const response = await api.getCollaterals(token);
      setCollaterals(response.data);
      setFormData({
        fundName: '',
        fundIsin: '',
        units: '',
        currentNavPerUnit: '',
        depositoryReference: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading collaterals...</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Collateral Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Mutual Fund'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Fund Name *</label>
              <input
                type="text"
                name="fundName"
                value={formData.fundName}
                onChange={handleInputChange}
                placeholder="e.g., SBI Bluechip Fund"
                required
              />
            </div>

            <div className="form-group">
              <label>Fund ISIN *</label>
              <input
                type="text"
                name="fundIsin"
                value={formData.fundIsin}
                onChange={handleInputChange}
                placeholder="e.g., INF090K01XX0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Units *</label>
              <input
                type="number"
                step="0.01"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                placeholder="Number of units"
                required
              />
            </div>

            <div className="form-group">
              <label>NAV per Unit (₹) *</label>
              <input
                type="number"
                step="0.01"
                name="currentNavPerUnit"
                value={formData.currentNavPerUnit}
                onChange={handleInputChange}
                placeholder="Current NAV"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Depository Reference</label>
            <input
              type="text"
              name="depositoryReference"
              value={formData.depositoryReference}
              onChange={handleInputChange}
              placeholder="Depository reference number"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Add Collateral
            </button>
          </div>
        </form>
      )}

      {collaterals.length === 0 ? (
        <div className="empty-state">
          <p>No mutual funds added yet.</p>
        </div>
      ) : (
        <div className="collaterals-grid">
          {collaterals.map((collateral) => (
            <div key={collateral._id} className="collateral-card">
              <h3>{collateral.fundName}</h3>
              <p className="isin">ISIN: {collateral.fundIsin}</p>
              <div className="details">
                <div>
                  <span className="label">Units:</span>
                  <span className="value">{collateral.units.toFixed(2)}</span>
                </div>
                <div>
                  <span className="label">NAV/Unit:</span>
                  <span className="value">₹{collateral.currentNavPerUnit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="label">Total Value:</span>
                  <span className="value">₹{collateral.totalValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="label">Status:</span>
                  <span className="value" style={{ color: collateral.status === 'active' ? '#28a745' : '#ffc107' }}>
                    {collateral.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollateralManagement;
