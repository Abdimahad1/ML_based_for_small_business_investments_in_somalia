import React, { useState, useEffect } from 'react';
import './adminDashboard.css';
import axios from 'axios';
import { 
  FaUsers, 
  FaChartLine, 
  FaBriefcase, 
  FaMoneyBillWave, 
  FaUserCheck, 
  FaUserSlash,
  FaArrowUp,
  FaArrowDown,
  FaRegBell
} from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    totalBusinesses: 0,
    activeUsers: 0, // optional if you track them
    blockedUsers: 0, // optional if you track them
    userGrowth: 0,
    investmentGrowth: 0,
    businessGrowth: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // get total users
        const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user-count`, { headers });

        // get total investments
        const investmentRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/investments/count`, { headers });

        // get total businesses
        const businessRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile/count`, { headers });

        // you can simulate growth numbers for now:
        setStats({
          totalUsers: userRes.data.count,
          totalInvestments: investmentRes.data.count,
          totalBusinesses: businessRes.data.count,
          activeUsers: 1024, // you could replace with real if you add more data
          blockedUsers: 219,
          userGrowth: 12.5,
          investmentGrowth: 8.3,
          businessGrowth: 5.7
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <MdOutlineDashboard className="dashboard-icon" />
          <h1>Dashboard Overview</h1>
        </div>
        <div className="header-right">
          <div className="notification-bell">
            <FaRegBell />
            <span className="notification-badge">3</span>
          </div>
          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="welcome-banner animate-fade-in">
        <div className="welcome-text">
          <h1>Welcome back, <span className="highlight">Admin</span>!</h1>
          <p>Here's what's happening with your platform today.</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-label">Today's Visitors</span>
            <span className="stat-value">1,024</span>
            <span className="stat-change positive">
              <FaArrowUp /> 12%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">New Signups</span>
            <span className="stat-value">48</span>
            <span className="stat-change positive">
              <FaArrowUp /> 5%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {/* Total Users */}
        <div className="stat-card animate-slide-up delay-1">
          <div className="card-icon users-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-value">{formatNumber(stats.totalUsers)}</p>
            <div className="card-growth">
              <span className="growth-rate positive">
                <FaArrowUp /> {stats.userGrowth}%
              </span>
              <span className="growth-label">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Investments */}
        <div className="stat-card animate-slide-up delay-2">
          <div className="card-icon investments-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Total Investments</h3>
            <p className="card-value">{formatNumber(stats.totalInvestments)}</p>
            <div className="card-growth">
              <span className="growth-rate positive">
                <FaArrowUp /> {stats.investmentGrowth}%
              </span>
              <span className="growth-label">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Businesses */}
        <div className="stat-card animate-slide-up delay-3">
          <div className="card-icon businesses-icon">
            <FaBriefcase />
          </div>
          <div className="card-content">
            <h3>Total Businesses</h3>
            <p className="card-value">{formatNumber(stats.totalBusinesses)}</p>
            <div className="card-growth">
              <span className="growth-rate positive">
                <FaArrowUp /> {stats.businessGrowth}%
              </span>
              <span className="growth-label">vs last month</span>
            </div>
          </div>
        </div>

        {/* Active vs Blocked Users */}
        <div className="stat-card wide-card animate-slide-up delay-4">
          <div className="card-content">
            <h3>User Status</h3>
            <div className="status-container">
              <div className="status-item active">
                <div className="status-icon">
                  <FaUserCheck />
                </div>
                <div className="status-details">
                  <p className="status-value">{formatNumber(stats.activeUsers)}</p>
                  <p className="status-label">Active Users</p>
                </div>
              </div>
              <div className="status-item blocked">
                <div className="status-icon">
                  <FaUserSlash />
                </div>
                <div className="status-details">
                  <p className="status-value">{formatNumber(stats.blockedUsers)}</p>
                  <p className="status-label">Blocked Users</p>
                </div>
              </div>
            </div>
          </div>
          <div className="sparkline-chart">
            <div className="chart-placeholder">
              <FaChartLine className="chart-icon" />
              <p>User Activity Sparkline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity animate-fade-in delay-5">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {[1, 2, 3, 4, 5].map((item) => (
            <div className="activity-item" key={item}>
              <div className="activity-icon">
                <div className="icon-bg"></div>
                <FaUsers className="activity-type-icon" />
              </div>
              <div className="activity-details">
                <p className="activity-title">New user registration</p>
                <p className="activity-time">2 hours ago</p>
              </div>
              <div className="activity-more">
                <button className="view-button">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
