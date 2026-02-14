import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import MerchantRegister from './MerchantRegister';
import MerchantDashboard from './MerchantDashboard';
import MerchantBookings from './MerchantBookings';
import AdminApproval from './AdminApproval';
import Clear from './Clear';
import Search from './Search';
import Bookings from './Bookings';
import ProtectedRoute from './ProtectedRoute';
import Hero from './Hero';
import BottomNav from './BottomNav';
import Navbar from './Navbar';
import Test from './test';
import UserProfile from './UserProfile';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Navbar />
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

        {/* User Profile route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* User Bookings route */}
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute>
              <Bookings />
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

        {/* Merchant bookings management */}
        <Route 
          path="/merchant-bookings" 
          element={
            <ProtectedRoute requiredRole="merchant">
              <MerchantBookings />
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

        {/* Search merchants - public route */}
        <Route 
          path="/search" 
          element={<Search />}
        />

        {/* Clear browser session data */}
        <Route 
          path="/clear" 
          element={<Clear />}
        />

        {/* Test route */}
        <Route 
          path="/test" 
          element={<Test />}
        />

        {/* Root landing - show hero, do not auto-redirect to login */}
        <Route path="/" element={<Hero />} />

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </Router>
  );
}

export default App;
