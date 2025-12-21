import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './styles/common.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoanProducts from './pages/LoanProducts';
import LoanApplications from './pages/LoanApplications';
import CreateLoanApplication from './pages/CreateLoanApplication';
import LoanApplicationDetails from './pages/LoanApplicationDetails';
import OngoingLoans from './pages/OngoingLoans';
import CollateralManagement from './pages/CollateralManagement';

// Navigation Component
const Navigation = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <nav>
      <h2 onClick={() => navigate('/')}>LAMF LMS</h2>
      {user && (
        <ul>
          <li>
            <button onClick={() => navigate('/')}>Dashboard</button>
          </li>
          <li>
            <button onClick={() => navigate('/products')}>Products</button>
          </li>
          <li>
            <button onClick={() => navigate('/loans')}>Applications</button>
          </li>
          <li>
            <button onClick={() => navigate('/collaterals')}>Collaterals</button>
          </li>
          <li>
            <button onClick={handleLogout}>Logout ({user.firstName})</button>
          </li>
        </ul>
      )}
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Restore user session from localStorage on app mount
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="App"><p>Loading...</p></div>;
  }

  return (
    <div className="App">
      {location.pathname !== '/login' && <Navigation user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute user={user}>
              <LoanProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute user={user}>
              <LoanApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-loan"
          element={
            <ProtectedRoute user={user}>
              <CreateLoanApplication />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/:id"
          element={
            <ProtectedRoute user={user}>
              <LoanApplicationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ongoing-loans"
          element={
            <ProtectedRoute user={user}>
              <OngoingLoans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaterals"
          element={
            <ProtectedRoute user={user}>
              <CollateralManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
