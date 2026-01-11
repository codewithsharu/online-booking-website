import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function AdminApproval() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      let role = null;
      try {
        role = token ? JSON.parse(atob(token.split('.')[1])).role : null;
      } catch (e) {
        console.warn('❌ Failed to decode token role');
      }

      // Verify admin is logged in
      if (!token || role !== 'admin') {
        console.log('❌ Not authorized to access approvals');
        window.location.href = '/admin-login';
        return;
      }

      const res = await fetch(`${API_URL}/admin/merchants/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If unauthorized, redirect
      if (res.status === 401 || res.status === 403) {
        console.log('❌ Admin session expired');
        localStorage.clear();
        window.location.href = '/admin-login';
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      } else {
        setMessage(data.error || 'Failed to fetch applications');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      console.error('❌ Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!window.confirm('Approve this merchant application?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/merchants/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Application approved! Merchant ID: ${data.merchantId}`);
        fetchPendingApplications();
      } else {
        setMessage(data.error || 'Failed to approve');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
    }
  };

  const handleReject = async (applicationId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/merchants/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId, reason })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Application rejected');
        fetchPendingApplications();
      } else {
        setMessage(data.error || 'Failed to reject');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto' }}>
      <h1>Merchant Application Approval</h1>
      {message && <p style={{ color: message.includes('approved') || message.includes('rejected') ? 'green' : 'red' }}>{message}</p>}
      
      {applications.length === 0 ? (
        <p>No pending applications</p>
      ) : (
        <div>
          <p><strong>{applications.length}</strong> pending application(s)</p>
          
          {applications.map(app => (
            <div key={app.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              marginBottom: '20px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{app.businessName}</h3>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Owner:</strong> {app.ownerName}<br />
                <strong>Phone:</strong> {app.phone}<br />
                {app.email && <><strong>Email:</strong> {app.email}<br /></>}
                <strong>Category:</strong> {app.businessCategory}<br />
                {app.businessDescription && <><strong>Description:</strong> {app.businessDescription}<br /></>}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Location:</strong><br />
                Pincode: {app.pincode}<br />
                Area: {app.area}<br />
                Address: {app.fullAddress}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Applied:</strong> {new Date(app.appliedAt).toLocaleString()}
              </div>

              <div>
                <button 
                  onClick={() => handleApprove(app.id)}
                  style={{
                    padding: '10px 20px',
                    marginRight: '10px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleReject(app.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => window.location.href = '/admin'}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Back to Admin Dashboard
      </button>
    </div>
  );
}

export default AdminApproval;
