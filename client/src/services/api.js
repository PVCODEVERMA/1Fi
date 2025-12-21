import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

// Auth API
export const register = (userData) => axios.post(`${API_BASE_URL}/auth/register`, userData);
export const login = (email, password) => axios.post(`${API_BASE_URL}/auth/login`, { email, password });
export const getProfile = (token) =>
  axios.get(`${API_BASE_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (token, data) =>
  axios.put(`${API_BASE_URL}/auth/profile`, data, { headers: { Authorization: `Bearer ${token}` } });

// Products API
export const getProducts = () => axios.get(`${API_BASE_URL}/products`);
export const getProductById = (id) => axios.get(`${API_BASE_URL}/products/${id}`);

// Loans API
export const createLoanApplication = (token, data) =>
  axios.post(`${API_BASE_URL}/loans`, data, { headers: { Authorization: `Bearer ${token}` } });
export const getLoanApplications = (token, params = {}) =>
  axios.get(`${API_BASE_URL}/loans`, { headers: { Authorization: `Bearer ${token}` }, params });
export const getLoanApplicationById = (token, id) =>
  axios.get(`${API_BASE_URL}/loans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
export const approveLoanApplication = (token, id, comments) =>
  axios.patch(`${API_BASE_URL}/loans/${id}/approve`, { comments }, { headers: { Authorization: `Bearer ${token}` } });
export const rejectLoanApplication = (token, id, comments) =>
  axios.patch(`${API_BASE_URL}/loans/${id}/reject`, { comments }, { headers: { Authorization: `Bearer ${token}` } });
export const getOngoingLoans = (token, params = {}) =>
  axios.get(`${API_BASE_URL}/loans/status/ongoing`, { headers: { Authorization: `Bearer ${token}` }, params });

// Collaterals API
export const addCollateral = (token, data) =>
  axios.post(`${API_BASE_URL}/collaterals`, data, { headers: { Authorization: `Bearer ${token}` } });
export const getCollaterals = (token) =>
  axios.get(`${API_BASE_URL}/collaterals`, { headers: { Authorization: `Bearer ${token}` } });
export const updateCollateral = (token, id, data) =>
  axios.put(`${API_BASE_URL}/collaterals/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
export const removeCollateral = (token, id) =>
  axios.delete(`${API_BASE_URL}/collaterals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
