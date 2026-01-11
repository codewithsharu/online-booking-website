import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import MerchantRegister from './MerchantRegister';
import MerchantDashboard from './MerchantDashboard';
import AdminApproval from './AdminApproval';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route 
          path="/login" 
          element={
            token 
              ? role === 'admin' ? <Navigate to="/admin" />
              : role === 'merchant' ? <Navigate to="/merchant-dashboard" />
              : <Navigate to="/home" />
              : <Login />
          }
        />

        {/* Home route - for regular users */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Merchant registration - No authentication required */}
        <Route 
          path="/merchant-register" 
          element={<MerchantRegister />}
        />

        {/* Merchant dashboard */}
        <Route 
          path="/merchant-dashboard" 
          element={
            <ProtectedRoute requiredRole="merchant">
              <MerchantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin login */}
        <Route 
          path="/admin-login" 
          element={
            token && role === 'admin'
              ? <Navigate to="/admin" />
              : <AdminLogin />
          }
        />

        {/* Admin panel */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Admin approval page */}
        <Route 
          path="/admin/approvals" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApproval />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
