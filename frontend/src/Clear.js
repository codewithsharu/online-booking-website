import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Clear Component
 * Clears all browser session data (localStorage, sessionStorage, cookies)
 * and then redirects to home page
 */
const Clear = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const clearAllData = async () => {
      try {
        console.log('🧹 Clearing all browser session data...');

        // Clear localStorage
        localStorage.clear();
        console.log('✅ localStorage cleared');

        // Clear sessionStorage
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');

        // Clear all cookies
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        console.log('✅ cookies cleared');

        // Call backend clear endpoint
        try {
          const response = await fetch('http://localhost:3000/api/clear');
          const data = await response.json();
          console.log('✅ Backend clear response:', data);
        } catch (error) {
          console.warn('⚠️  Backend clear endpoint not available:', error.message);
        }

        // Show success message
        alert('✅ All session data cleared successfully!\n\nRedirecting to home page...');

        // Redirect to home page after 1 second
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('❌ Error clearing data:', error);
        alert('Error clearing data: ' + error.message);
        navigate('/');
      }
    };

    clearAllData();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🧹 Clearing Data</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
          Clearing all browser session data...
        </p>
        <div style={{
          display: 'inline-block',
          padding: '20px',
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          border: '1px solid #4caf50'
        }}>
          <p style={{ color: '#2e7d32', margin: '5px 0' }}>
            ✅ localStorage cleared
          </p>
          <p style={{ color: '#2e7d32', margin: '5px 0' }}>
            ✅ sessionStorage cleared
          </p>
          <p style={{ color: '#2e7d32', margin: '5px 0' }}>
            ✅ cookies cleared
          </p>
        </div>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '20px' }}>
          Redirecting to home page...
        </p>
      </div>
    </div>
  );
};

export default Clear;
