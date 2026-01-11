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
      const phone = localStorage.getItem('phone');

      // If no token or phone, redirect to login
      if (!token || !phone) {
        console.log('❌ No valid session found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      try {
        console.log('📱 Fetching user data with phone:', phone);
        const res = await fetch(`${API_URL}/user`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // If unauthorized, clear storage and redirect
        if (res.status === 401 || res.status === 403) {
          console.log('❌ Unauthorized, clearing session');
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ User data received:', data);
        
        // API returns { user: { ... } }
        const userData = data.user || data;

        // Verify user exists
        if (!userData || !userData.phone) {
          console.log('❌ User data invalid, redirecting to login');
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        setUser(userData);
        
        // If user doesn't have name, ask for it
        if (!userData.name) {
          console.log('📝 User needs to enter name');
          setAskingName(true);
        } else {
          // Show welcome back for returning users
          console.log('👋 Welcoming returning user:', userData.name);
          setShowWelcomeBack(true);
          setTimeout(() => setShowWelcomeBack(false), 3000);
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        // On error, clear storage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
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

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Session expired. Please login again.');
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/save-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });

      // If unauthorized, redirect to login
      if (res.status === 401 || res.status === 403) {
        console.log('❌ Session expired');
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        setUser({ ...user, name: name.trim(), hasName: true });
        setAskingName(false);
        setMessage('');
        console.log('✅ Name saved successfully');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save name');
        console.error('❌ Error saving name:', data);
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      console.error('❌ Network error:', error);
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
