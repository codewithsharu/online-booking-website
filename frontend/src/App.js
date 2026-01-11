import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route - if already logged in, redirect to home */}
        <Route 
          path="/login" 
          element={
            localStorage.getItem('token') && localStorage.getItem('role') === 'user' 
              ? <Navigate to="/home" />
              : <Login />
          }
        />

        {/* Home route - protected for users */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute requiredRole="user">
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin login */}
        <Route 
          path="/admin-login" 
          element={
            localStorage.getItem('token') && localStorage.getItem('role') === 'admin'
              ? <Navigate to="/admin" />
              : <AdminLogin />
          }
        />

        {/* Admin panel - protected for admins */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
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
