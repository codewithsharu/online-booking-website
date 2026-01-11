import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loginWithPassword = async (pass) => {
    if (!pass) {
      setMessage('Enter password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });

      const data = await res.json();
      if (res.ok) {
        // Store only JWT; role is decoded by ProtectedRoute
        localStorage.setItem('token', data.token);
        window.location.href = '/admin';
      } else {
        setMessage(data.error || 'Invalid password');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    await loginWithPassword(password);
  };

  // Auto-login via URL query (?pw=... or ?password=... or ?key=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoPwd = params.get('pw') || params.get('password') || params.get('key');
    if (autoPwd) {
      setPassword(autoPwd);
      loginWithPassword(autoPwd);
    }
  }, []);

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <input
        type="password"
        placeholder="Admin Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {message && <p className={message.includes('Invalid') ? 'error' : 'success'}>{message}</p>}
    </div>
  );
}

export default AdminLogin;
