import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import smartwaitLogo from './smartwait-logo.png';
import defaultUserImg from './user.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Navbar() {
  const [menuActive, setMenuActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  // Fetch on mount and when location changes (coming back from profile page)
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, location.pathname]);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchUserData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={smartwaitLogo} alt="WaitSmart Logo" />
        </Link>
      </div>

      <div className={`navbar-menu ${menuActive ? 'active' : ''}`}>
        <a href="#home" className="nav-link">Home</a>
        <a href="#gallery" className="nav-link">Bookings</a>
        <a href="#testimonials" className="nav-link">Search</a>
      </div>

      <div className="navbar-right">
        <button className="navbar-button" onClick={() => window.location.href = '#contact'}>
          Book Now
        </button>
      </div>

      {user ? (
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="profile-button" title="Menu">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="profile-picture-nav" />
            ) : (
              <div className="profile-letter-avatar">
                {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{user.name || 'User'}</span>
                  <span className="dropdown-phone">{user.phone}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={handleProfileClick} className="dropdown-item">
                <div className="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>My Profile</span>
              </button>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item logout">
                <div className="dropdown-icon logout-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="profile-button default-profile" title="Login">
            <img src={defaultUserImg} alt="Login" className="default-user-img" />
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="profile-dropdown login-dropdown">
              <div className="dropdown-header guest-header">
                <div className="dropdown-avatar">
                  <img src={defaultUserImg} alt="Guest" />
                </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">Welcome!</span>
                  <span className="dropdown-phone">Sign in to continue</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={() => { setDropdownOpen(false); navigate('/login'); }} className="dropdown-item login-item">
                <div className="dropdown-icon login-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="hamburger" onClick={toggleMenu}>☰</div>
    </nav>
  );
}

export default Navbar;
