import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useContext, useEffect } from 'react';
import './sidebar.css';
import {
  FaHome, FaBoxes, FaBullseye, FaMoneyBillWave, FaHandshake,
  FaShieldAlt, FaStoreAlt, FaCog, FaSignOutAlt, FaRocket,
  FaBars, FaChevronLeft, FaUsers
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebarCollapsed', !prev);
      return !prev;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'bo-sidebar-link active' : 'bo-sidebar-link';

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default behavior

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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
  
    setTimeout(() => {
      navigate('/auth');
    }, 100);
  };
  

  return (
    <div className={`bo-sidebar ${collapsed ? 'bo-collapsed' : ''} ${darkMode ? 'dark' : ''}`}>
      <div className="bo-sidebar__toggle" onClick={toggleSidebar}>
        {collapsed ? <FaBars /> : <FaChevronLeft />}
      </div>

      <div className="bo-sidebar__top-section">
        <div className="bo-sidebar__logo">
          <FaRocket className="bo-sidebar__logo-icon" />
          <h2 className="bo-sidebar__system-name">SBM System</h2>
        </div>

        <div className="bo-sidebar__separator"></div>

        <ul className="bo-sidebar__menu">
          <li><NavLink to="/dashboard" className={getNavLinkClass}><FaHome /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/business-overview" className={getNavLinkClass}><FaStoreAlt /><span>Business Overview</span></NavLink></li>
          <li><NavLink to="/products" className={getNavLinkClass}><FaBoxes /><span>Products & Inventory</span></NavLink></li>
          <li><NavLink to="/customer-view" className={getNavLinkClass}><FaUsers /><span>Customer View</span></NavLink></li>
          <li><NavLink to="/milestones" className={getNavLinkClass}><FaBullseye /><span>Milestones & Goals</span></NavLink></li>
          <li><NavLink to="/investment-request" className={getNavLinkClass}><FaMoneyBillWave /><span>Investment Request</span></NavLink></li>
          <li><NavLink to="/investors-interested" className={getNavLinkClass}><FaHandshake /><span>Investors Interested</span></NavLink></li>
          <li><NavLink to="/risk-analysis" className={getNavLinkClass}><FaShieldAlt /><span>Risk Analysis</span></NavLink></li>
          <li><NavLink to="/BusinessProfileForm" className={getNavLinkClass}><FaRocket /><span>BusinessProfileForm</span></NavLink></li>
          <li><NavLink to="/business-owner/settings" className={getNavLinkClass}><FaCog /><span>Business Settings</span></NavLink></li>
        </ul>

      </div>

      <div className="bo-sidebar__logout-container">
        <button
          onClick={handleLogout}
          className="bo-sidebar-link"
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
          <FaSignOutAlt /><span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
