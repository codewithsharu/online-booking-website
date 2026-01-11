import React, { useState } from 'react';

const API_URL = 'http://localhost:3000/api';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!password) {
      setMessage('Enter password');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        window.location.href = '/admin';
      } else {
        setMessage('Invalid password');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <input
        type="password"
        placeholder="Admin Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {message && <p className={message.includes('Invalid') ? 'error' : 'success'}>{message}</p>}
    </div>
  );
}

export default AdminLogin;
