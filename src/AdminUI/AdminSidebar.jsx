import { NavLink, useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import './adminSidebar.css';
import {
  FaHome, FaUsers, FaBriefcase, FaChartLine, FaMoneyBillWave,
  FaSignOutAlt, FaCog, FaBars, FaTimes
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const AdminSidebar = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'admin-sidebar-link active' : 'admin-sidebar-link';

  const handleLogout = (e) => {
    e.preventDefault();
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to logout?</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => {
              confirmLogout();
              toast.dismiss(t.id);
            }}
            style={{
              marginRight: '8px',
              padding: '5px 10px',
              backgroundColor: '#f87171',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    setTimeout(() => {
      navigate('/auth');
    }, 100);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false);
    } else if (isRightSwipe && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          className={`mobile-sidebar-toggle ${darkMode ? 'dark' : ''}`}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <FaTimes className="toggle-icon" />
          ) : (
            <FaBars className="toggle-icon" />
          )}
        </button>
      )}

      {/* Overlay when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className={`sidebar-overlay ${darkMode ? 'dark' : ''}`}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar ${darkMode ? 'dark' : ''} ${
          isMobile ? (sidebarOpen ? 'mobile-open' : 'mobile-closed') : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="admin-sidebar__top-section">
          <div className="admin-sidebar__logo">
            <FaCog className="admin-sidebar__logo-icon spinning" />
            <h2 className="admin-sidebar__system-name">Admin Panel</h2>
          </div>

          <div className="admin-sidebar__separator"></div>

          <ul className="admin-sidebar__menu">
            <li>
              <NavLink to="/admin/dashboard" className={getNavLinkClass} onClick={() => isMobile && setSidebarOpen(false)}>
                <FaHome className="icon-animate" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users" className={getNavLinkClass} onClick={() => isMobile && setSidebarOpen(false)}>
                <FaUsers className="icon-animate" />
                <span>User Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/businesses" className={getNavLinkClass} onClick={() => isMobile && setSidebarOpen(false)}>
                <FaBriefcase className="icon-animate" />
                <span>Businesses</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/investments" className={getNavLinkClass} onClick={() => isMobile && setSidebarOpen(false)}>
                <FaMoneyBillWave className="icon-animate" />
                <span>Investments</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reports" className={getNavLinkClass} onClick={() => isMobile && setSidebarOpen(false)}>
                <FaChartLine className="icon-animate" />
                <span>Reports</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="admin-sidebar__logout-container">
          <button
            onClick={handleLogout}
            className="admin-sidebar-link"
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FaSignOutAlt className="icon-animate" /><span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;