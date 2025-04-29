import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useContext, useEffect } from 'react';
import './sidebar.css';
import {
  FaHome,
  FaBoxes,
  FaBullseye,
  FaMoneyBillWave,
  FaHandshake,
  FaShieldAlt,
  FaStoreAlt,
  FaCog,
  FaSignOutAlt,
  FaRocket,
  FaBars,
  FaChevronLeft,
  FaUsers
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    isActive ? 'active sidebar-link' : 'sidebar-link';

  const handleLogout = () => {
    toast.warning(
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to logout?</p>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={confirmLogout} 
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
            onClick={() => toast.dismiss()} 
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
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: 'top-center', // ⭐ Always top-center
      }
    );
  };

  const confirmLogout = () => {
    localStorage.removeItem('token'); // Clear only token (or use localStorage.clear() if you prefer)
    toast.dismiss();
    navigate('/auth');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${darkMode ? 'dark' : ''}`}>
      <div className="sidebar__toggle" onClick={toggleSidebar}>
        {collapsed ? <FaBars /> : <FaChevronLeft />}
      </div>

      <div>
        <div className="sidebar__logo">
          <FaRocket className="sidebar__logo-icon" />
          <h2 className="sidebar__system-name">SBM System</h2>
        </div>

        <div className="sidebar__separator"></div>

        <ul className="sidebar__menu">
          <li><NavLink to="/dashboard" className={getNavLinkClass}><FaHome /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/business-overview" className={getNavLinkClass}><FaStoreAlt /><span>Business Overview</span></NavLink></li>
          <li><NavLink to="/products" className={getNavLinkClass}><FaBoxes /><span>Products & Inventory</span></NavLink></li>
          <li><NavLink to="/customer-view" className={getNavLinkClass}><FaUsers /><span>Customer View</span></NavLink></li>
          <li><NavLink to="/milestones" className={getNavLinkClass}><FaBullseye /><span>Milestones & Goals</span></NavLink></li>
          <li><NavLink to="/investment-request" className={getNavLinkClass}><FaMoneyBillWave /><span>Investment Request</span></NavLink></li>
          <li><NavLink to="/investors-interested" className={getNavLinkClass}><FaHandshake /><span>Investors Interested</span></NavLink></li>
          <li><NavLink to="/risk-analysis" className={getNavLinkClass}><FaShieldAlt /><span>Risk Analysis</span></NavLink></li>
          <li><NavLink to="/sell-my-business" className={getNavLinkClass}><FaRocket /><span>Sell My Business</span></NavLink></li>
          <li><NavLink to="/settings" className={getNavLinkClass}><FaCog /><span>Settings</span></NavLink></li>
        </ul>
      </div>

      <div className="sidebar__logout">
        <div onClick={handleLogout} className="sidebar-link" style={{ cursor: 'pointer' }}>
          <FaSignOutAlt /><span>Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
