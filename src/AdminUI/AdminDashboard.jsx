import React, { useState, useEffect } from "react";
import "./adminDashboard.css";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isBetween from "dayjs/plugin/isBetween";
import {
  FaUsers,
  FaChartLine,
  FaBriefcase,
  FaMoneyBillWave,
  FaUserCheck,
  FaUserSlash,
  FaArrowUp,
  FaRegBell,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaInbox
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isBetween);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    totalBusinesses: 0,
    activeUsers: 0,
    blockedUsers: 0,
    userGrowth: 0,
    investmentGrowth: 0,
    businessGrowth: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [
          userRes,
          investmentRes,
          businessRes,
          recentRes,
          allUsersRes
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user-count`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/investments/count`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile/count`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/recent-registrations`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/all-users`, { headers }),
        ]);

        // Update recent users with status from allUsersRes
        const usersWithStatus = recentRes.data.map(recentUser => {
          const fullUser = allUsersRes.data.find(u => u._id === recentUser._id);
          return {
            ...recentUser,
            status: fullUser?.status || 'active' // default to active if status not found
          };
        });

        const activeCount = allUsersRes.data.filter(u => u.status === "active").length;
        const blockedCount = allUsersRes.data.filter(u => u.status === "blocked").length;

        setStats({
          totalUsers: userRes.data.count,
          totalInvestments: investmentRes.data.count,
          totalBusinesses: businessRes.data.count,
          activeUsers: activeCount,
          blockedUsers: blockedCount,
          userGrowth: 12.5,
          investmentGrowth: 8.3,
          businessGrowth: 5.7,
        });

        setRecentUsers(usersWithStatus);
        setFilteredUsers(usersWithStatus);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const applyFilter = (type) => {
    setFilter(type);
    if (type === "All") {
      setFilteredUsers(recentUsers);
    } else if (type === "Today") {
      const todayUsers = recentUsers.filter(u => dayjs(u.createdAt).isToday());
      setFilteredUsers(todayUsers);
    } else if (type === "This Week") {
      const startOfWeek = dayjs().startOf("week");
      const endOfWeek = dayjs().endOf("week");
      const weekUsers = recentUsers.filter(u => dayjs(u.createdAt).isBetween(startOfWeek, endOfWeek, null, "[]"));
      setFilteredUsers(weekUsers);
    }
  };

  const handleBlockUnblock = async () => {
    if (!selectedUser) return;

    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const endpoint = selectedUser.status === "active"
        ? `/api/auth/block-user/${selectedUser._id}`
        : `/api/auth/unblock-user/${selectedUser._id}`;
      
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {}, { headers });

      // Update the status locally
      const updatedStatus = selectedUser.status === "active" ? "blocked" : "active";
      const updatedUser = {
        ...selectedUser,
        status: updatedStatus
      };

      // Update the selected user in the modal
      setSelectedUser(updatedUser);

      // Update the user in the recent users list
      const updatedRecentUsers = recentUsers.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      );
      setRecentUsers(updatedRecentUsers);

      // Update the filtered users list
      const updatedFilteredUsers = filteredUsers.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      );
      setFilteredUsers(updatedFilteredUsers);

      // Update the stats counts
      setStats(prevStats => ({
        ...prevStats,
        activeUsers: updatedStatus === "active" ? prevStats.activeUsers + 1 : prevStats.activeUsers - 1,
        blockedUsers: updatedStatus === "blocked" ? prevStats.blockedUsers + 1 : prevStats.blockedUsers - 1
      }));
    } catch (err) {
      console.error("Failed to toggle block/unblock:", err);
    }
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
        <div className="stat-card animate-slide-up delay-1">
          <div className="card-icon users-icon"><FaUsers /></div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-value">{formatNumber(stats.totalUsers)}</p>
            <div className="card-growth"><FaArrowUp /> {stats.userGrowth}%</div>
          </div>
        </div>
        <div className="stat-card animate-slide-up delay-2">
          <div className="card-icon investments-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <h3>Total Investments</h3>
            <p className="card-value">{formatNumber(stats.totalInvestments)}</p>
            <div className="card-growth"><FaArrowUp /> {stats.investmentGrowth}%</div>
          </div>
        </div>
        <div className="stat-card animate-slide-up delay-3">
          <div className="card-icon businesses-icon"><FaBriefcase /></div>
          <div className="card-content">
            <h3>Total Businesses</h3>
            <p className="card-value">{formatNumber(stats.totalBusinesses)}</p>
            <div className="card-growth"><FaArrowUp /> {stats.businessGrowth}%</div>
          </div>
        </div>
        <div className="stat-card wide-card animate-slide-up delay-4">
          <div className="card-content">
            <h3>User Status</h3>
            <div className="status-container">
              <div className="status-item active">
                <FaUserCheck />
                <p>{formatNumber(stats.activeUsers)} Active</p>
              </div>
              <div className="status-item blocked">
                <FaUserSlash />
                <p>{formatNumber(stats.blockedUsers)} Blocked</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent User Registrations */}
      <div className="recent-activity-container animate-fade-in delay-5">
        <div className="section-header">
          <h2>Recent User Registrations</h2>
          <div className="activity-tabs">
            {["All", "Today", "This Week"].map((t) => (
              <button
                key={t}
                className={filter === t ? "tab-active" : ""}
                onClick={() => applyFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="activity-cards">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div className="activity-card" key={user._id}>
                <div className="card-header">
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" />
                    ) : (
                      <div className="avatar-fallback">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <span className="registration-time">
                      Joined {dayjs(user.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewUser(user)}
                  >
                    View Details
                  </button>
                  <button
                    className={`status-btn ${
                      user.status === "active" ? "active-status" : "blocked-status"
                    }`}
                  >
                    {user.status === "active" ? "Active" : "Blocked"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <FaInbox size={40} />
              <p>No registrations found for {filter.toLowerCase()}.</p>
            </div>
          )}
        </div>
      </div>


      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="user-modal-overlay">
          <div className="user-modal">
            <button onClick={closeModal} className="modal-close-btn"><FaTimes /></button>
            <div className="modal-header">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt="avatar" className="modal-avatar" />
              ) : (
                <div className="avatar-fallback"><FaUser /></div>
              )}
              <h3>{selectedUser.name}</h3>
              <p className={`user-status ${selectedUser.status}`}>
                Status: {selectedUser.status === "active" ? "Active" : "Blocked"}
              </p>
            </div>
            <div className="modal-body">
              <div className="info-row"><FaEnvelope /><p>{selectedUser.email}</p></div>
              <div className="info-row"><FaPhone /><p>{selectedUser.phone || "Not provided"}</p></div>
              <div className="info-row">
                <FaUser /><p>Registered on {dayjs(selectedUser.createdAt).format("MMM D, YYYY h:mm A")}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className={`action-btn ${selectedUser.status === "active" ? "block-btn" : "unblock-btn"}`} 
                onClick={handleBlockUnblock}
              >
                {selectedUser.status === "active" ? "Block User" : "Unblock User"}
              </button>
              <button className="action-btn primary-btn">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;