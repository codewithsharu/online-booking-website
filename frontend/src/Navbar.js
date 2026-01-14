import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import smartwaitLogo from './smartwait-logo.png';


function Navbar() {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
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
        <a href="#faqs" className="nav-link">Profile</a>
      </div>

      <button className="navbar-button" onClick={() => window.location.href = '#contact'}>
        Book Now
      </button>
      
      <div className="hamburger" onClick={toggleMenu}>☰</div>
    </nav>
  );
}

export default Navbar;
