import React, { useState, useEffect } from 'react';
import InvestorSidebar from './InvestorSidebar';
import './investorLayout.css';

const InvestorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('investorSidebarCollapsed');
    return saved === 'true';
  });

  const handleToggle = (value) => {
    setCollapsed(value);
    localStorage.setItem('investorSidebarCollapsed', value);
  };

  return (
    <div className={`investor-layout-container ${collapsed ? 'investor-sidebar-collapsed' : ''}`}>
      <InvestorSidebar onToggle={handleToggle} collapsed={collapsed} />
      <div className="investor-main-content">
        {children}
      </div>
    </div>
  );
};

export default InvestorLayout;
