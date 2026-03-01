import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [badgeCounts, setBadgeCounts] = useState({ pending: 0, confirmed: 0, ongoing: 0, total: 0 });

  const token = localStorage.getItem('token');

  // Get role from localStorage or decode from JWT
  let role = localStorage.getItem('role');
  if (!role) {
    try {
      const t = localStorage.getItem('token');
      if (t) {
        const payload = JSON.parse(atob(t.split('.')[1]));
        role = payload.role;
        if (role) localStorage.setItem('role', role);
      }
    } catch (e) { /* ignore */ }
  }
  const isMerchant = role === 'merchant';

  // Fetch badge counts for merchant - must be before any returns
  useEffect(() => {
    if (!isMerchant || !token) return;
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${API_URL}/merchant/navbar-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBadgeCounts(data);
        }
      } catch (e) { /* ignore */ }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isMerchant, token, location.pathname]);

  // Hide if not logged in - show only Login button
  if (!token) {
    const hideFully = ['/login', '/admin-login', '/admin', '/admin/approvals'];
    if (hideFully.includes(location.pathname)) {
      return null;
    }
    return (
      <div className="bottom-nav" style={{ justifyContent: 'center', padding: '8px 16px' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 17L15 12L10 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 12H3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Login
        </button>
      </div>
    );
  }

  // Only hide on admin pages
  const hideOnPages = ['/admin-login', '/admin', '/admin/approvals'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  const navItems = isMerchant ? [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/merchant-dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      path: '/merchant-bookings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      path: '/merchant-calendar',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8" cy="15" r="1" fill="currentColor"/>
          <circle cx="12" cy="15" r="1" fill="currentColor"/>
          <circle cx="16" cy="15" r="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      id: 'search', 
      label: 'Search', 
      path: '/merchant-search',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      path: '/profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ] : [
    { 
      id: 'home', 
      label: 'Home', 
      path: '/',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      path: '/bookings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'search', 
      label: 'Search', 
      path: '/search',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      path: '/home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.id === 'bookings' && (location.pathname === '/bookings' || location.pathname === '/merchant-bookings')) ||
                        (item.id === 'dashboard' && location.pathname === '/merchant-dashboard');
        // Badge count logic for merchant tabs
        let badge = 0;
        if (isMerchant && item.id === 'bookings') badge = badgeCounts.pending || 0;
        if (isMerchant && item.id === 'calendar') badge = badgeCounts.confirmed || 0;
        if (isMerchant && item.id === 'dashboard') badge = badgeCounts.ongoing || 0;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{ animation: isActive ? 'iconBounce 0.5s ease' : 'none' }}
          >
            <div className="nav-icon" style={{ position: 'relative' }}>
              {item.icon}
              {badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  background: item.id === 'bookings' ? '#F59E0B' : item.id === 'calendar' ? '#3B82F6' : '#8B5CF6',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  lineHeight: 1,
                }}>{badge}</span>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomNav;
