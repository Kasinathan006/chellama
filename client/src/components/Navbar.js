import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          {/* Logo removed as requested */}
        </div>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">HOME</Link>
          <Link to="/registered" className="navbar-link">CONFIRM LIST</Link>
          <Link to="/register" className="navbar-link">REGISTER</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
