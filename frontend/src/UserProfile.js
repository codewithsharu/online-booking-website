import React, { useEffect, useState } from 'react';
import './UserProfile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch user data');

      const data = await res.json();
      const userData = data.user || data;
      setUser(userData);
      setName(userData.name || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/user/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      setUser(data.user);
      setMessage('Profile picture updated successfully!');
      
      // Dispatch event to notify Navbar to refresh
      window.dispatchEvent(new Event('profileUpdated'));
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage('Name cannot be empty');
      return;
    }

    const token = localStorage.getItem('token');
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name.trim() })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Update failed');
      }

      const data = await res.json();
      setUser(data.user);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-wrapper">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              
              <label htmlFor="profile-picture-input" className="upload-button">
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload Photo</span>
                  </>
                )}
              </label>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleProfilePictureChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* User Information Section */}
          <div className="profile-info">
            <div className="info-item">
              <label>Phone Number</label>
              <div className="info-value">{user?.phone}</div>
            </div>

            <div className="info-item">
              <label>Name</label>
              {editing ? (
                <form onSubmit={handleUpdateProfile} className="edit-form">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="name-input"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button type="submit" className="save-button" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={() => {
                        setEditing(false);
                        setName(user?.name || '');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-value-with-edit">
                  <span>{user?.name || 'Not set'}</span>
                  <button 
                    className="edit-icon-button" 
                    onClick={() => setEditing(true)}
                    title="Edit name"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="info-item">
              <label>Role</label>
              <div className="info-value role-badge">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
            </div>

            <div className="info-item">
              <label>Member Since</label>
              <div className="info-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="back-button"
            onClick={() => window.history.back()}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
