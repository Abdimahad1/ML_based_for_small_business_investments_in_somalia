import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useContext, useEffect } from 'react';
import {
  FaRocket, FaHome, FaSearchDollar, FaChartPie,
  FaChartBar, FaCog, FaSignOutAlt, FaBars, FaTimes
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import './investorSidebar.css';

const InvestorSidebar = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('investorSidebarCollapsed');
    return saved === 'true';
  });

  // handle resize
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

  // restore collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('investorSidebarCollapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(prev => {
        localStorage.setItem('investorSidebarCollapsed', !prev);
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
    isActive ? 'investor-sidebar-link active' : 'investor-sidebar-link';

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
    navigate('/auth');
  };

  return (
    <>
      {/* mobile toggle */}
      {isMobile && (
        <button
          className={`investor-mobile-sidebar-toggle ${darkMode ? 'investor-dark' : ''}`}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="investor-sidebar-overlay" onClick={toggleSidebar} />
      )}

      <div
        className={`investor-sidebar
        ${darkMode ? 'investor-dark' : ''}
        ${collapsed && !isMobile ? 'investor-collapsed' : ''}
        ${isMobile ? (sidebarOpen ? 'investor-mobile-open' : 'investor-mobile-closed') : ''}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >


        <div className="investor-sidebar__top-section">
          <div className="investor-sidebar__logo">
            <FaRocket className="investor-sidebar__logo-icon" />
            <h2 className="investor-sidebar__system-name">SBM System</h2>
          </div>

          <div className="investor-sidebar__separator"></div>

          <ul className="investor-sidebar__menu">
            <li>
              <NavLink to="/investor/dashboard" className={getNavLinkClass}><FaHome /><span>Dashboard</span></NavLink>
            </li>
            <li>
              <NavLink to="/investor/find-investments" className={getNavLinkClass}><FaSearchDollar /><span>Find Investments</span></NavLink>
            </li>
            <li>
              <NavLink to="/investor/my-investments" className={getNavLinkClass}><FaChartPie /><span>My Investments</span></NavLink>
            </li>
            <li>
              <NavLink to="/investor/performance" className={getNavLinkClass}><FaChartBar /><span>Performance</span></NavLink>
            </li>
            <li>
              <NavLink to="/investor/account-settings" className={getNavLinkClass}><FaCog /><span>Account Settings</span></NavLink>
            </li>
          </ul>
        </div>

        <div className="investor-sidebar__logout-container">
          <button onClick={handleLogout} className="investor-sidebar-link">
            <FaSignOutAlt /><span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default InvestorSidebar;
