import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import BottomNav from './BottomNav';
import Navbar from './Navbar';

// Lazy-loaded routes for code splitting
const Login = lazy(() => import('./Login'));
const Home = lazy(() => import('./Home'));
const Admin = lazy(() => import('./Admin'));
const AdminLogin = lazy(() => import('./AdminLogin'));
const MerchantRegister = lazy(() => import('./MerchantRegister'));
const MerchantDashboard = lazy(() => import('./MerchantDashboard'));
const MerchantBookings = lazy(() => import('./MerchantBookings'));
const MerchantSearch = lazy(() => import('./MerchantSearch'));
const MerchantCalendar = lazy(() => import('./MerchantCalendar'));
const AdminApproval = lazy(() => import('./AdminApproval'));
const Clear = lazy(() => import('./Clear'));
const Search = lazy(() => import('./Search'));
const Bookings = lazy(() => import('./Bookings'));
const Hero = lazy(() => import('./Hero'));
const Test = lazy(() => import('./test'));
const UserProfile = lazy(() => import('./UserProfile'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', justifyContent: 'center', alignItems: 'center', 
    minHeight: '80vh', flexDirection: 'column', gap: '12px'
  }}>
    <div style={{
      width: '40px', height: '40px', border: '3px solid #e5e7eb',
      borderTopColor: '#3b82f6', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
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

        {/* Merchant booking search */}
        <Route 
          path="/merchant-search" 
          element={
            <ProtectedRoute requiredRole="merchant">
              <MerchantSearch />
            </ProtectedRoute>
          }
        />

        {/* Merchant calendar */}
        <Route 
          path="/merchant-calendar" 
          element={
            <ProtectedRoute requiredRole="merchant">
              <MerchantCalendar />
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
      </Suspense>
      <BottomNav />
    </Router>
  );
}

export default App;
