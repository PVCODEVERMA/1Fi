import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import '../styles/common.css';

const CreateLoanApplication = () => {
  const [products, setProducts] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    loanAmount: '',
    tenure: '',
    collateralIds: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCollaterals, setSelectedCollaterals] = useState([]);
  const [emiDetails, setEmiDetails] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, collateralsRes] = await Promise.all([
          api.getProducts(),
          api.getCollaterals(token),
        ]);
        setProducts(productsRes.data);
        setCollaterals(collateralsRes.data);
      } catch (err) {
        setErrors({ general: err.message });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    calculateEMI();
  };

  const handleCollateralSelect = (collateralId) => {
    const updated = selectedCollaterals.includes(collateralId)
      ? selectedCollaterals.filter((id) => id !== collateralId)
      : [...selectedCollaterals, collateralId];
    setSelectedCollaterals(updated);
    setFormData({ ...formData, collateralIds: updated });
  };

  const calculateEMI = () => {
    if (formData.productId && formData.loanAmount && formData.tenure) {
      const product = products.find((p) => p._id === formData.productId);
      if (product) {
        const monthlyRate = product.interestRate / 12 / 100;
        const months = parseInt(formData.tenure);
        const principal = parseInt(formData.loanAmount);

        if (monthlyRate === 0) {
          setEmiDetails({ emi: Math.round((principal / months) * 100) / 100 });
        } else {
          const emi =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
          setEmiDetails({ emi: Math.round(emi * 100) / 100 });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.productId || !formData.loanAmount || !formData.tenure || selectedCollaterals.length === 0) {
      setErrors({ general: 'Please fill all required fields' });
      return;
    }

    try {
      const response = await api.createLoanApplication(token, {
        productId: formData.productId,
        loanAmount: parseInt(formData.loanAmount),
        tenure: parseInt(formData.tenure),
        collateralIds: selectedCollaterals,
      });

      navigate(`/loans/${response.data.application._id}`);
    } catch (err) {
      setErrors({ general: err.response?.data?.error || err.message });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Create New Loan Application</h1>

      <form onSubmit={handleSubmit} className="form">
        {errors.general && <div className="error-message">{errors.general}</div>}

        <div className="form-group">
          <label>Select Loan Product *</label>
          <select name="productId" value={formData.productId} onChange={handleInputChange} required>
            <option value="">-- Choose a Product --</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.interestRate}% p.a.)
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Loan Amount *</label>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleInputChange}
              placeholder="Enter loan amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Tenure (Months) *</label>
            <input
              type="number"
              name="tenure"
              value={formData.tenure}
              onChange={handleInputChange}
              placeholder="Enter tenure"
              required
            />
          </div>
        </div>

        {emiDetails && (
          <div className="info-box">
            <strong>Estimated Monthly EMI: ₹{emiDetails.emi.toLocaleString()}</strong>
          </div>
        )}

        <div className="form-group">
          <label>Select Collaterals (Mutual Funds) *</label>
          {collaterals.length === 0 ? (
            <p>No collaterals available. Please add mutual funds first.</p>
          ) : (
            <div className="collateral-list">
              {collaterals.map((collateral) => (
                <div key={collateral._id} className="collateral-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCollaterals.includes(collateral._id)}
                      onChange={() => handleCollateralSelect(collateral._id)}
                    />
                    <span>
                      {collateral.fundName} - {collateral.units} units @ ₹
                      {collateral.currentNavPerUnit.toFixed(2)} (₹
                      {collateral.totalValue.toLocaleString()})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Submit Application
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/loans')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLoanApplication;
