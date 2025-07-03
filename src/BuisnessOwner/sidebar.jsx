import { NavLink, useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import './Sidebar.css';
import {
  FaHome, FaBoxes, FaBullseye, FaMoneyBillWave, FaHandshake,
  FaShieldAlt, FaStoreAlt, FaCog, FaSignOutAlt, FaRocket,
  FaBars, FaTimes, FaUsers
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('boSidebarCollapsed');
    return saved === 'true';
  });

  // Handle resize
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

  // Restore collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('boSidebarCollapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(prev => {
        localStorage.setItem('boSidebarCollapsed', !prev);
        return !prev;
      });
    }
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
    if (distance > 50 && sidebarOpen) {
      setSidebarOpen(false);
    }
    if (distance < -50 && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'bo-sidebar-link active' : 'bo-sidebar-link';

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

  return (
    <>
      {/* Mobile toggle */}
      {isMobile && (
        <button
          className={`bo-mobile-sidebar-toggle ${darkMode ? 'bo-dark' : ''}`}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="bo-sidebar-overlay" onClick={toggleSidebar} />
      )}

      <div
        className={`bo-sidebar 
        ${darkMode ? 'bo-dark' : ''} 
        ${collapsed && !isMobile ? 'bo-collapsed' : ''} 
        ${isMobile ? (sidebarOpen ? 'bo-mobile-open' : 'bo-mobile-closed') : ''}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* toggle for large screen */}
        {!isMobile && (
          <div className="bo-sidebar__toggle" onClick={toggleSidebar}>
            {collapsed ? <FaBars /> : <FaTimes />}
          </div>
        )}

        <div className="bo-sidebar__top-section">
          <div className="bo-sidebar__logo">
            <FaRocket className="bo-sidebar__logo-icon" />
            <h2 className="bo-sidebar__system-name">SBM System</h2>
          </div>

          <div className="bo-sidebar__separator"></div>

          <ul className="bo-sidebar__menu">
            <li>
              <NavLink to="/dashboard" className={getNavLinkClass}><FaHome /><span>Dashboard</span></NavLink>
            </li>
            <li>
              <NavLink to="/business-overview" className={getNavLinkClass}><FaStoreAlt /><span>Business Overview</span></NavLink>
            </li>
            <li>
              <NavLink to="/products" className={getNavLinkClass}><FaBoxes /><span>Products & Inventory</span></NavLink>
            </li>
            <li>
              <NavLink to="/customer-view" className={getNavLinkClass}><FaUsers /><span>Customer View</span></NavLink>
            </li>
            <li>
              <NavLink to="/milestones" className={getNavLinkClass}><FaBullseye /><span>Milestones</span></NavLink>
            </li>
            <li>
              <NavLink to="/investment-request" className={getNavLinkClass}><FaMoneyBillWave /><span>Investment Request</span></NavLink>
            </li>
            <li>
              <NavLink to="/investors-interested" className={getNavLinkClass}><FaHandshake /><span>Investors Interested</span></NavLink>
            </li>
            <li>
              <NavLink to="/risk-analysis" className={getNavLinkClass}><FaShieldAlt /><span>Risk Analysis</span></NavLink>
            </li>
            <li>
              <NavLink to="/BusinessProfileForm" className={getNavLinkClass}><FaRocket /><span>BusinessProfileForm</span></NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={getNavLinkClass}><FaCog /><span>Settings</span></NavLink>
            </li>
          </ul>
        </div>

        <div className="bo-sidebar__logout-container">
          <button onClick={handleLogout} className="bo-sidebar-link">
            <FaSignOutAlt /><span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
