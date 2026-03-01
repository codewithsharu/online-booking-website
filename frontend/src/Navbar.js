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
  const [navStats, setNavStats] = useState({ pending: 0, confirmed: 0 });
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

  // Fetch navbar stats for merchants
  useEffect(() => {
    const fetchNavStats = async () => {
      const token = localStorage.getItem('token');
      let role = localStorage.getItem('role');
      if (!role && token) {
        try { role = JSON.parse(atob(token.split('.')[1])).role; } catch(e) {}
      }
      if (role !== 'merchant' || !token) return;
      try {
        const res = await fetch(`${API_URL}/merchant/navbar-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNavStats(data);
        }
      } catch (e) { /* ignore */ }
    };
    fetchNavStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchNavStats, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

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

  let role = localStorage.getItem('role');
  // Fallback: decode role from JWT if not in localStorage
  if (!role) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role;
        if (role) localStorage.setItem('role', role);
      }
    } catch (e) { /* ignore */ }
  }
  const isMerchant = role === 'merchant';

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={smartwaitLogo} alt="WaitSmart Logo" />
        </Link>
      </div>

      <div className={`navbar-menu ${menuActive ? 'active' : ''}`}>
        {isMerchant && (
          <div className="nav-mobile-stats">
            <Link to="/merchant-bookings?status=pending" onClick={() => setMenuActive(false)}
              className="nav-mobile-stat-pill pending">
              <span className="nav-mobile-stat-label">Pending</span>
              <span className="nav-mobile-stat-count pending">{navStats.pending}</span>
            </Link>
            <Link to="/merchant-bookings?status=confirmed" onClick={() => setMenuActive(false)}
              className="nav-mobile-stat-pill confirmed">
              <span className="nav-mobile-stat-label">Confirmed</span>
              <span className="nav-mobile-stat-count confirmed">{navStats.confirmed}</span>
            </Link>
            <Link to="/merchant-bookings?status=ongoing" onClick={() => setMenuActive(false)}
              className="nav-mobile-stat-pill ongoing">
              <span className="nav-mobile-stat-label">Ongoing</span>
              <span className="nav-mobile-stat-count ongoing">{navStats.ongoing}</span>
            </Link>
          </div>
        )}
        {isMerchant ? (
          <>
            <Link to="/merchant-dashboard" className="nav-link" onClick={() => setMenuActive(false)}>Dashboard</Link>
            <Link to="/merchant-bookings" className="nav-link" onClick={() => setMenuActive(false)}>Bookings</Link>
            <Link to="/merchant-calendar" className="nav-link" onClick={() => setMenuActive(false)}>Calendar</Link>
            <Link to="/profile" className="nav-link" onClick={() => setMenuActive(false)}>Profile</Link>
          </>
        ) : (
          <>
            <Link to="/home" className="nav-link" onClick={() => setMenuActive(false)}>Home</Link>
            <Link to="/bookings" className="nav-link" onClick={() => setMenuActive(false)}>Bookings</Link>
            <Link to="/search" className="nav-link" onClick={() => setMenuActive(false)}>Search</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {isMerchant ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/merchant-bookings?status=pending"
              onClick={() => setMenuActive(false)}
              title="Today's Pending"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#FEF3C7', color: '#B45309',
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                border: '1px solid #FDE68A', whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '11px' }}>Pending</span>
              <span style={{
                background: '#F59E0B', color: '#fff',
                borderRadius: '50%', width: '20px', height: '20px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700
              }}>{navStats.pending}</span>
            </Link>
            <Link
              to="/merchant-bookings?status=confirmed"
              onClick={() => setMenuActive(false)}
              title="Today's Confirmed"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#D1FAE5', color: '#065F46',
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                border: '1px solid #A7F3D0', whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '11px' }}>Confirmed</span>
              <span style={{
                background: '#10B981', color: '#fff',
                borderRadius: '50%', width: '20px', height: '20px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700
              }}>{navStats.confirmed}</span>
            </Link>
          </div>
        ) : (
          <Link to="/search" className="navbar-button" onClick={() => setMenuActive(false)}>
            Book Now
          </Link>
        )}
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
              {isMerchant && (
                <>
                  <button onClick={() => { setDropdownOpen(false); navigate('/merchant-dashboard'); }} className="dropdown-item">
                    <div className="dropdown-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <span>Dashboard</span>
                  </button>
                  <button onClick={() => { setDropdownOpen(false); navigate('/merchant-bookings'); }} className="dropdown-item">
                    <div className="dropdown-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </div>
                    <span>My Bookings</span>
                  </button>
                  <button onClick={() => { setDropdownOpen(false); navigate('/merchant-calendar'); }} className="dropdown-item">
                    <div className="dropdown-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
                        <circle cx="8" cy="15" r="1" fill="currentColor"/>
                        <circle cx="12" cy="15" r="1" fill="currentColor"/>
                        <circle cx="16" cy="15" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <span>Calendar</span>
                  </button>
                </>
              )}
              <button onClick={handleProfileClick} className="dropdown-item">
                <div className="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>{isMerchant ? 'Settings & Profile' : 'My Profile'}</span>
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
