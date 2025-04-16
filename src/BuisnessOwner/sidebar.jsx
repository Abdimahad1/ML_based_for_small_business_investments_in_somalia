// src/BuisnessOwner/sidebar.jsx
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import './sidebar.css';
import {
  FaHome,
  FaBoxOpen,
  FaBullseye,
  FaChartBar,
  FaUsers,
  FaExclamationTriangle,
  FaTags,
  FaCog,
  FaSignOutAlt,
  FaStore,
  FaBars,
  FaChevronLeft
} from 'react-icons/fa';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
  {/* Toggle icon top-right */}
  <div className="sidebar__toggle" onClick={toggleSidebar}>
    {collapsed ? <FaBars /> : <FaChevronLeft />}
  </div>

  <div>
    <div className="sidebar__logo">
      <FaChartBar className="sidebar__logo-icon" />
      <h2 className="sidebar__system-name">SBM System</h2>
    </div>

    <div className="sidebar__separator"></div>

    <ul className="sidebar__menu">
  <li>
    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaHome /><span>Dashboard</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/business-overview" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaStore /><span>Business Overview</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaBoxOpen /><span>Products & Inventory</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/milestones" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaBullseye /><span>Milestones & Goals</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/investment-request" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaChartBar /><span>Investment Request</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/investors-interested" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaUsers /><span>Investors Interested</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/risk-analysis" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaExclamationTriangle /><span>Risk Analysis</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/sell-my-business" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaTags /><span>Sell My Business</span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
      <FaCog /><span>Settings</span>
    </NavLink>
  </li>
</ul>

  </div>

  <div className="sidebar__logout">
    <Link to="/auth">
      <FaSignOutAlt /><span>Log Out</span>
    </Link>
  </div>
</div>

  );
};

export default Sidebar;
