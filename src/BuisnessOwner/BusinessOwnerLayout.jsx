import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import './businessOwnerLayout.css';

const BusinessOwnerLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('boSidebarCollapsed');
    return saved === 'true';
  });

  const handleToggle = (value) => {
    setCollapsed(value);
    localStorage.setItem('boSidebarCollapsed', value);
  };

  return (
    <div className={`bo-layout-container ${collapsed ? 'bo-sidebar-collapsed' : ''}`}>
      <Sidebar onToggle={handleToggle} collapsed={collapsed} />
      <div className="bo-main-content">
        {children}
      </div>
    </div>
  );
};

export default BusinessOwnerLayout;
