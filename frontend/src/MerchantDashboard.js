import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MerchantDashboard() {
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchantStatus();
  }, []);

  const fetchMerchantStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/merchant/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setMerchantInfo(data);
      }
    } catch (error) {
      console.error('Error fetching merchant status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '50px auto', textAlign: 'center' }}>
      <h1>🎉 Welcome, Merchant!</h1>
      
      {merchantInfo && merchantInfo.hasApplication && merchantInfo.status === 'approved' ? (
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          padding: '30px', 
          borderRadius: '10px',
          border: '2px solid #10b981'
        }}>
          <h2>You are now a verified merchant!</h2>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>
            <strong>Merchant ID:</strong> {merchantInfo.merchantId}
          </p>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>
            <strong>Business:</strong> {merchantInfo.application.businessName}
          </p>
          <p style={{ color: '#059669' }}>
            Your merchant account is active. You can now manage your business bookings.
          </p>
        </div>
      ) : (
        <div>
          <p>Merchant dashboard features coming soon...</p>
        </div>
      )}

      <button 
        onClick={handleLogout}
        style={{
          marginTop: '30px',
          padding: '12px 30px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default MerchantDashboard;
