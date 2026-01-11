import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Admin() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem('token');
      let role = null;
      try {
        role = token ? JSON.parse(atob(token.split('.')[1])).role : null;
      } catch (e) {
        console.warn('❌ Failed to decode token role');
      }

      // Verify admin is logged in
      if (!token || role !== 'admin') {
        console.log('❌ Not authorized to access admin panel');
        window.location.href = '/admin-login';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // If unauthorized, redirect
        if (res.status === 401 || res.status === 403) {
          console.log('❌ Admin session expired');
          localStorage.clear();
          window.location.href = '/admin-login';
          return;
        }

        const data = await res.json();
        setUsers(data && data.data ? data.data : {});
      } catch (error) {
        console.error('❌ Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = '/admin-login';
  };

  const goToApprovals = () => {
    window.location.href = '/admin/approvals';
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Admin Panel</h1>
      
      <button 
        onClick={goToApprovals}
        style={{
          padding: '12px 24px',
          marginBottom: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Merchant Approvals
      </button>
      
      <h2>Registered Users</h2>
      
      {!users || users.length === 0 ? (
        <p>No users yet</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Phone</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Merchant ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{user.phone}</td>
                <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{user.name || '-'}</td>
                <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: user.role === 'admin' ? '#ff6b6b' : user.role === 'merchant' ? '#4ecdc4' : '#95e1d3',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{user.merchantId || '-'}</td>
                <td style={{ padding: '12px' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Admin;
