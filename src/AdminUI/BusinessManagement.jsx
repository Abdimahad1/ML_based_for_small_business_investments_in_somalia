import React, { useState, useEffect } from 'react';
import './BusinessManagement.css';
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaBan,
  FaCheckCircle,
  FaRegBell,
  FaBuilding,
  FaArrowUp
} from 'react-icons/fa';
import { MdOutlineBusinessCenter } from 'react-icons/md';

const BusinessManagement = () => {
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

  const token = sessionStorage.getItem('token');

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [businessRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/businesses/all`, { headers }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/businesses/stats`, { headers })
      ]);

      const formattedBusinesses = businessRes.data.map(b => ({
        id: b._id,
        name: b.business_name,
        owner: b.user_id?.name || 'Unknown',
        ownerEmail: b.user_id?.email || '',
        category: b.category || 'General',
        status: b.status || 'active',
        verified: b.verified || false,
        lastUpdated: new Date(b.updatedAt).toLocaleString()
      }));

      setBusinesses(formattedBusinesses);
      setFilteredBusinesses(formattedBusinesses);
      setStats(statsRes.data);

    } catch (err) {
      console.error('Error loading businesses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  // Filtering
  useEffect(() => {
    let result = businesses;

    if (searchTerm) {
      result = result.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(b => b.category === categoryFilter);
    }

    setFilteredBusinesses(result);
  }, [searchTerm, statusFilter, categoryFilter, businesses]);

  const toggleBusinessStatus = async (businessId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/businesses/${businessId}/status`, {}, { headers });
      await fetchAll();
    } catch (err) {
      console.error('Failed to toggle business status:', err);
    }
  };

  const toggleVerificationStatus = async (businessId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/businesses/${businessId}/verification`, {}, { headers });
      await fetchAll();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
          <h1 className="bmgmt-welcome-title">
            Welcome to <span className="bmgmt-welcome-highlight">Business Management</span>
          </h1>
          <p className="bmgmt-welcome-description">View, manage, and maintain all business accounts on the platform.</p>
        </div>
        <div className="bmgmt-welcome-stats">
          <div className="bmgmt-stat-card">
            <span className="bmgmt-stat-label">Total Businesses</span>
            <span className="bmgmt-stat-value">{formatNumber(stats.totalBusinesses)}</span>
            <span className="bmgmt-stat-change bmgmt-stat-positive">
              <FaArrowUp className="bmgmt-stat-arrow" /> {stats.businessGrowth}%
            </span>
          </div>
          <div className="bmgmt-stat-card">
            <span className="bmgmt-stat-label">Active</span>
            <span className="bmgmt-stat-value">{formatNumber(stats.activeBusinesses)}</span>
          </div>
          <div className="bmgmt-stat-card">
            <span className="bmgmt-stat-label">Suspended</span>
            <span className="bmgmt-stat-value">{formatNumber(stats.suspendedBusinesses)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
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
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <div className="bmgmt-table-cell">Business</div>
                <div className="bmgmt-table-cell">Owner</div>
                <div className="bmgmt-table-cell">Category</div>
                <div className="bmgmt-table-cell">Status</div>
                <div className="bmgmt-table-cell">Verified</div>
                <div className="bmgmt-table-cell">Last Updated</div>
                <div className="bmgmt-table-cell">Actions</div>
              </div>
            </div>
            <div className="bmgmt-table-body">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map(b => (
                  <div className="bmgmt-table-row" key={b.id}>
                    <div className="bmgmt-table-cell">{b.name}</div>
                    <div className="bmgmt-table-cell">{b.owner}</div>
                    <div className="bmgmt-table-cell">{b.category}</div>
                    <div className="bmgmt-table-cell">
                      <span className={`bmgmt-status bmgmt-status-${b.status}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="bmgmt-table-cell">
                      <span className={`bmgmt-verified bmgmt-verified-${b.verified ? 'yes' : 'no'}`}>
                        {b.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="bmgmt-table-cell">{b.lastUpdated}</div>
                    <div className="bmgmt-table-cell">
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className={`bmgmt-action-btn bmgmt-action-${b.status === 'active' ? 'suspend' : 'activate'}`}
                          onClick={() => toggleBusinessStatus(b.id)}
                        >
                          {b.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                          {b.status === 'active' ? ' Suspend' : ' Activate'}
                        </button>
                        <button
                          className="bmgmt-action-btn bmgmt-action-verify"
                          onClick={() => toggleVerificationStatus(b.id)}
                        >
                          <FaEdit /> {b.verified ? ' Unverify' : ' Verify'}
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
