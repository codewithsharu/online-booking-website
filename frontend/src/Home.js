import React, { useEffect, useState } from 'react';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Home() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState('');
  const [askingName, setAskingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem('token');

      // If no token, redirect to login
      if (!token) {
        console.log('❌ No valid session found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      try {
        console.log('📱 Fetching user data...');
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
      setMessage({ text: 'Please enter your name', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Session expired. Please login again.', type: 'error' });
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
        setMessage({ text: '', type: '' });
        console.log('✅ Name saved successfully');
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to save name', type: 'error' });
        console.error('❌ Error saving name:', data);
      }
    } catch (error) {
      setMessage({ text: 'Network error: ' + error.message, type: 'error' });
      console.error('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      setMessage({ text: 'Name cannot be empty', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to update', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/user/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, profilePicture: data.profilePicture }));
        setMessage({ text: 'Profile picture updated!', type: 'success' });
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: 'Failed to upload picture', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const startEditing = () => {
    setEditName(user.name || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName('');
    setMessage({ text: '', type: '' });
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!user) {
    return <div className="loading-container">Loading...</div>;
  }

  if (askingName) {
    return (
      <div className="ask-name-container">
        <div className="ask-name-card">
          <h2>Welcome! 👋</h2>
          <p>We'd love to know your name</p>
          
          <form onSubmit={handleSaveName}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ask-name-input"
              autoFocus
            />
            
            {message.text && <div className={`message-toast ${message.type}`}>{message.text}</div>}
            
            <button
              type="submit"
              disabled={loading}
              className="ask-name-btn"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="profile-card-home">
        {/* Header */}
        <div className="profile-card-header">
          <h2>My Profile</h2>
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={startEditing}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          ) : (
            <button className="edit-profile-btn active" onClick={cancelEditing}>
              Cancel
            </button>
          )}
        </div>

        {/* Body */}
        <div className="profile-card-body">
          {showWelcomeBack && (
            <div className="welcome-toast">
              👋 Welcome back, {user.name || user.phone}!
            </div>
          )}

          {message.text && (
            <div className={`message-toast ${message.type}`}>{message.text}</div>
          )}

          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <label className={`avatar-upload-btn ${isEditing ? 'visible' : ''}`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                {uploading ? (
                  <span style={{ fontSize: '10px' }}>...</span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="profile-info-list">
            <div className="profile-info-item">
              <label>Phone Number</label>
              <div className="profile-info-value">{user.phone}</div>
            </div>

            <div className="profile-info-item">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="profile-info-input"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="profile-info-value">{user.name || 'Not set'}</div>
              )}
            </div>

            <div className="profile-info-item">
              <label>Role</label>
              <span className="role-badge-home">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="profile-card-footer">
          {isEditing ? (
            <>
              <button 
                className="cancel-profile-btn" 
                onClick={cancelEditing}
              >
                Cancel
              </button>
              <button 
                className="save-profile-btn" 
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button className="logout-btn-home" onClick={logout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
