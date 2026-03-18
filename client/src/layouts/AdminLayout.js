import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaGamepad,
  FaExchangeAlt,
  FaGift,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/games', label: 'Games', icon: FaGamepad },
    { path: '/admin/transactions', label: 'Transactions', icon: FaExchangeAlt },
    { path: '/admin/promotions', label: 'Promotions', icon: FaGift },
    { path: '/admin/settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <FaGamepad className="admin-logo-icon" />
            {sidebarOpen && (
              <span className="admin-logo-text">
                Admin
              </span>
            )}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <item.icon className="admin-nav-icon" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-nav-item logout">
            <FaSignOutAlt className="admin-nav-icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile Header */}
        <header className="admin-mobile-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <span className="admin-mobile-title">Admin Panel</span>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="admin-mobile-menu">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-mobile-nav-item ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="admin-mobile-nav-item logout">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        )}

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
