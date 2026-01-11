import React from 'react';

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    window.location.href = '/login';
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    window.location.href = '/login';
    return null;
  }

  return children;
}

export default ProtectedRoute;
