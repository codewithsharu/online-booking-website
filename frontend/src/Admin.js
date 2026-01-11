import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Admin() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'admin') {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data.data);
      } catch (error) {
        console.error('Error:', error);
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
      
      {Object.keys(users).length === 0 ? (
        <p>No users yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Phone</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(users).map(([phone, user]) => (
              <tr key={phone}>
                <td>{phone}</td>
                <td>{user.role}</td>
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
