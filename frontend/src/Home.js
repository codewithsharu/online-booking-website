import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Home() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [askingName, setAskingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);
        
        // If user doesn't have name, ask for it
        if (!data.hasName && !data.name) {
          setAskingName(true);
        } else {
          // Show welcome back for returning users
          setShowWelcomeBack(true);
          setTimeout(() => setShowWelcomeBack(false), 3000);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getUser();
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/save-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });

      if (res.ok) {
        setUser({ ...user, name: name.trim(), hasName: true });
        setAskingName(false);
        setMessage('');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save name');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (askingName) {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '500px', 
        margin: '100px auto',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>Welcome! 👋</h2>
        <p>We'd love to know your name</p>
        
        <form onSubmit={handleSaveName}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '20px 0',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
            autoFocus
          />
          
          {message && <p style={{ color: 'red', fontSize: '14px' }}>{message}</p>}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container welcome-box">
      {showWelcomeBack && (
        <div style={{
          backgroundColor: '#edf2ff',
          color: '#667eea',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          Welcome back, {user.name || user.phone}! 👋
        </div>
      )}
      
      <h1>Welcome{user.name ? `, ${user.name}` : ''}!</h1>
      <p>Phone: {user.phone}</p>
      <p>Role: {user.role}</p>
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Home;
