import React, { useState, useEffect } from 'react';
import './BusinessManagement.css';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaBan, 
  FaCheckCircle,
  FaRegBell,
  FaBuilding,
  FaChartLine,
  FaUserTie,
  FaStore,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { MdOutlineBusinessCenter } from 'react-icons/md';

const BusinessManagement = () => {
  // Mock data - replace with real API calls later
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    suspendedBusinesses: 0,
    businessGrowth: 0,
    verificationGrowth: 0
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockBusinesses = [
        { id: 1, name: 'Tech Solutions Inc.', owner: 'John Smith', category: 'Technology', status: 'active', verified: true, lastUpdated: '2 days ago' },
        { id: 2, name: 'Green Grocers', owner: 'Sarah Johnson', category: 'Retail', status: 'active', verified: true, lastUpdated: '1 week ago' },
        { id: 3, name: 'Urban Diner', owner: 'Michael Brown', category: 'Food', status: 'suspended', verified: false, lastUpdated: '3 days ago' },
        { id: 4, name: 'Creative Designs', owner: 'Emily Wilson', category: 'Design', status: 'active', verified: true, lastUpdated: 'Just now' },
        { id: 5, name: 'BuildRight Construction', owner: 'David Lee', category: 'Construction', status: 'active', verified: false, lastUpdated: '5 hours ago' },
        { id: 6, name: 'HealthPlus Clinic', owner: 'Dr. Robert Chen', category: 'Healthcare', status: 'active', verified: true, lastUpdated: '1 day ago' },
        { id: 7, name: 'Swift Logistics', owner: 'Jessica Martinez', category: 'Transport', status: 'suspended', verified: false, lastUpdated: '2 weeks ago' },
        { id: 8, name: 'EcoClean Services', owner: 'Daniel Kim', category: 'Cleaning', status: 'active', verified: true, lastUpdated: '30 minutes ago' },
      ];

      setBusinesses(mockBusinesses);
      setFilteredBusinesses(mockBusinesses);
      setIsLoading(false);
      
      setStats({
        totalBusinesses: mockBusinesses.length,
        activeBusinesses: mockBusinesses.filter(b => b.status === 'active').length,
        suspendedBusinesses: mockBusinesses.filter(b => b.status === 'suspended').length,
        businessGrowth: 8.2,
        verificationGrowth: 15.7
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter businesses based on search and filters
  useEffect(() => {
    let result = businesses;
    
    if (searchTerm) {
      result = result.filter(business => 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        business.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(business => business.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(business => business.category === categoryFilter);
    }
    
    setFilteredBusinesses(result);
  }, [searchTerm, statusFilter, categoryFilter, businesses]);

  const toggleBusinessStatus = (businessId) => {
    setBusinesses(businesses.map(business => 
      business.id === businessId 
        ? { ...business, status: business.status === 'active' ? 'suspended' : 'active' } 
        : business
    ));
  };

  const toggleVerificationStatus = (businessId) => {
    setBusinesses(businesses.map(business => 
      business.id === businessId 
        ? { ...business, verified: !business.verified } 
        : business
    ));
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bmgmt-content">
      {/* Header */}
      <div className="bmgmt-header">
        <div className="bmgmt-header-left">
          <MdOutlineBusinessCenter className="bmgmt-header-icon" />
          <h1 className="bmgmt-title">Business Management</h1>
        </div>
        <div className="bmgmt-header-right">
          <div className="bmgmt-notification">
            <FaRegBell className="bmgmt-notification-icon" />
            <span className="bmgmt-notification-badge">3</span>
          </div>
          <div className="bmgmt-profile">
            <div className="bmgmt-profile-avatar">A</div>
            <span className="bmgmt-profile-name">Admin</span>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bmgmt-welcome-banner bmgmt-fade-in">
        <div className="bmgmt-welcome-text">
          <h1 className="bmgmt-welcome-title">Welcome to <span className="bmgmt-welcome-highlight">Business Management</span></h1>
          <p className="bmgmt-welcome-description">View, manage, and maintain all business accounts on the platform.</p>
        </div>
        <div className="bmgmt-welcome-stats">
          <div className="bmgmt-stat-card">
            <span className="bmgmt-stat-label">Total Businesses</span>
            <span className="bmgmt-stat-value">{stats.totalBusinesses}</span>
            <span className="bmgmt-stat-change bmgmt-stat-positive">
              <FaArrowUp className="bmgmt-stat-arrow" /> {stats.businessGrowth}%
            </span>
          </div>
          <div className="bmgmt-stat-card">
            <span className="bmgmt-stat-label">Active</span>
            <span className="bmgmt-stat-value">{stats.activeBusinesses}</span>
          </div>
          <div className="bmgmt-stat-card">
            <span className="bmgmt-stat-label">Suspended</span>
            <span className="bmgmt-stat-value">{stats.suspendedBusinesses}</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bmgmt-controls bmgmt-fade-in bmgmt-delay-1">
        <div className="bmgmt-search-container">
          <div className="bmgmt-search-input">
            <FaSearch className="bmgmt-search-icon" />
            <input 
              type="text" 
              className="bmgmt-search-field"
              placeholder="Search businesses by name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bmgmt-filters">
          <div className="bmgmt-filter-group">
            <FaFilter className="bmgmt-filter-icon" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bmgmt-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div className="bmgmt-filter-group">
            <FaBuilding className="bmgmt-filter-icon" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bmgmt-filter-select"
            >
              <option value="all">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Retail">Retail</option>
              <option value="Food">Food</option>
              <option value="Design">Design</option>
              <option value="Construction">Construction</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Transport">Transport</option>
              <option value="Cleaning">Cleaning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bmgmt-table-container bmgmt-fade-in bmgmt-delay-2">
        {isLoading ? (
          <div className="bmgmt-loading">
            <div className="bmgmt-loading-spinner"></div>
            <p className="bmgmt-loading-text">Loading businesses...</p>
          </div>
        ) : (
          <>
            <div className="bmgmt-table-header">
              <div className="bmgmt-table-row">
                <div className="bmgmt-table-cell bmgmt-header-cell">Business</div>
                <div className="bmgmt-table-cell bmgmt-header-cell">Owner</div>
                <div className="bmgmt-table-cell bmgmt-header-cell">Category</div>
                <div className="bmgmt-table-cell bmgmt-header-cell">Status</div>
                <div className="bmgmt-table-cell bmgmt-header-cell">Verified</div>
                <div className="bmgmt-table-cell bmgmt-header-cell">Last Updated</div>
                <div className="bmgmt-table-cell bmgmt-header-cell">Actions</div>
              </div>
            </div>
            
            <div className="bmgmt-table-body">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map(business => (
                  <div className="bmgmt-table-row" key={business.id}>
                    <div className="bmgmt-table-cell">
                      <div className="bmgmt-business-info">
                        <div className={`bmgmt-business-icon bmgmt-category-${business.category.toLowerCase()}`}>
                          {business.category === 'Technology' && <FaChartLine />}
                          {business.category === 'Retail' && <FaStore />}
                          {business.category === 'Food' && <FaBuilding />}
                          {business.category === 'Design' && <FaUserTie />}
                          {['Construction', 'Healthcare', 'Transport', 'Cleaning'].includes(business.category) && <FaBuilding />}
                        </div>
                        <span className="bmgmt-business-name">{business.name}</span>
                      </div>
                    </div>
                    <div className="bmgmt-table-cell bmgmt-owner">{business.owner}</div>
                    <div className="bmgmt-table-cell bmgmt-category">{business.category}</div>
                    <div className="bmgmt-table-cell">
                      <span className={`bmgmt-status bmgmt-status-${business.status}`}>
                        {business.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="bmgmt-table-cell">
                      <span className={`bmgmt-verified bmgmt-verified-${business.verified ? 'yes' : 'no'}`}>
                        {business.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="bmgmt-table-cell bmgmt-updated">{business.lastUpdated}</div>
                    <div className="bmgmt-table-cell">
                      <div className="bmgmt-actions">
                        <button 
                          className={`bmgmt-action-btn bmgmt-action-${business.status === 'active' ? 'suspend' : 'activate'}`}
                          onClick={() => toggleBusinessStatus(business.id)}
                        >
                          {business.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                          {business.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          className="bmgmt-action-btn bmgmt-action-verify"
                          onClick={() => toggleVerificationStatus(business.id)}
                        >
                          <FaEdit /> {business.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bmgmt-no-results">
                  <MdOutlineBusinessCenter className="bmgmt-no-results-icon" />
                  <p className="bmgmt-no-results-text">No businesses found matching your criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessManagement;