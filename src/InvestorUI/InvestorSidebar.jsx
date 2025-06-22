// src/Investor/InvestorSidebar.jsx

import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useContext, useEffect } from 'react';
import {
  FaRocket,
  FaHome,
  FaLightbulb,
  FaSearchDollar,
  FaChartPie,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft,
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import './investorSidebar.css';

const InvestorSidebar = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsedInvestor');
    return saved === 'true';
  });

  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsedInvestor', newState);
    if (onToggle) onToggle(newState); // ✅ Sync with parent
  };

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsedInvestor');
    if (saved !== null) {
      const isCollapsed = saved === 'true';
      setCollapsed(isCollapsed);
      if (onToggle) onToggle(isCollapsed); // ✅ Initial sync on mount
    }
  }, [onToggle]);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'active investor-sidebar-link' : 'investor-sidebar-link';

  const handleLogout = () => {
    toast.dismiss();
    toast(
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to logout?</p>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={confirmLogout}
            style={{
              padding: '5px 15px',
              backgroundColor: '#ef4444',
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
              padding: '5px 15px',
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
        id: 'logout-confirm',
        duration: Infinity,
        position: 'top-center'
      }
    );
  };

  const confirmLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    toast.dismiss();

    setTimeout(() => {
      navigate('/auth');
    }, 100); // ⏳ Delay to allow Toast cleanup
  };

  return (
    <div className={`investor-sidebar ${collapsed ? 'collapsed' : ''} ${darkMode ? 'dark' : ''}`}>
      <div className="investor-sidebar__toggle" onClick={toggleSidebar}>
        {collapsed ? <FaBars /> : <FaChevronLeft />}
      </div>

      <div>
        <div className="investor-sidebar__logo">
          <FaRocket className="investor-sidebar__logo-icon" />
          <h2 className="investor-sidebar__system-name">SBM System</h2>
        </div>

        <div className="investor-sidebar__separator"></div>

        <ul className="investor-sidebar__menu">
          <li>
            <NavLink to="/investor/dashboard" className={getNavLinkClass}>
              <FaHome /><span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/investor/find-investments" className={getNavLinkClass}>
              <FaSearchDollar /><span>Find Investments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/investor/my-investments" className={getNavLinkClass}>
              <FaChartPie /><span>My Investments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/investor/performance" className={getNavLinkClass}>
              <FaChartBar /><span>Performance</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/investor/account-settings" className={getNavLinkClass}>
              <FaCog /><span>Account Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="investor-sidebar__logout">
        <div onClick={handleLogout} className="investor-sidebar-link" style={{ cursor: 'pointer' }}>
          <FaSignOutAlt /><span>Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default InvestorSidebar;
