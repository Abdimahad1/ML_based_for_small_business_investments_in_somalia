import { NavLink } from 'react-router-dom';
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
  FaUsers // Using FaUsers for Customer View (or FaEye if you prefer)
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const { darkMode } = useContext(ThemeContext);

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
          {/* ✅ NEW CUSTOMER VIEW LINK ADDED AS MAIN MENU ITEM */}
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
        <NavLink to="/auth" className={getNavLinkClass}>
          <FaSignOutAlt /><span>Log Out</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;