import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import '../styles/common.css';

const LoanProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts();
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Loan Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="product-details">
              <div className="detail">
                <span className="label">Loan Amount:</span>
                <span className="value">
                  ₹{product.minLoanAmount.toLocaleString()} - ₹{product.maxLoanAmount.toLocaleString()}
                </span>
              </div>
              <div className="detail">
                <span className="label">Interest Rate:</span>
                <span className="value">{product.interestRate}% p.a.</span>
              </div>
              <div className="detail">
                <span className="label">Tenure:</span>
                <span className="value">
                  {product.minLoanTenure} - {product.maxLoanTenure} months
                </span>
              </div>
              <div className="detail">
                <span className="label">LTV Ratio:</span>
                <span className="value">{product.collateralRequirementPercentage}%</span>
              </div>
              <div className="detail">
                <span className="label">Processing Fee:</span>
                <span className="value">{product.processingFeePercentage}%</span>
              </div>
            </div>
            <div className="features">
              <h4>Features:</h4>
              <ul>
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanProducts;
