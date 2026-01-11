import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has valid token
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const phone = localStorage.getItem('phone');

    // If no token or no role, user is not logged in
    if (!token || !role || !phone) {
      console.log('❌ No valid session found');
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    // If specific role is required, check if user has that role
    if (requiredRole && role !== requiredRole) {
      console.log(`❌ User role (${role}) does not match required role (${requiredRole})`);
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    // User is authorized
    console.log(`✅ User authorized with role: ${role}`);
    setIsAuthorized(true);
    setLoading(false);
  }, [requiredRole]);

  // While checking auth status, show loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2>Loading...</h2>
          <p>Verifying your session...</p>
        </div>
      </div>
    );
  }

  // If not authorized, redirect to login
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // User is authorized, render children
  return children;
}

export default ProtectedRoute;
