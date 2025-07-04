import React, { useState, useEffect } from "react";
import "./userManagement.css";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaBan,
  FaCheckCircle,
  FaUserCog,
  FaRegBell,
  FaUserAlt,
  FaUserTimes,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/all-users`, { headers });
        setUsers(res.data);
        setFilteredUsers(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch users", err);
        toast.error("Failed to fetch users");
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role.toLowerCase() === roleFilter.toLowerCase());
    }
    setFilteredUsers(result);
  }, [searchTerm, statusFilter, roleFilter, users]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint =
        currentStatus === "active"
          ? `/api/auth/block-user/${userId}`
          : `/api/auth/unblock-user/${userId}`;
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {}, { headers });

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/all-users`, { headers });
      setUsers(res.data);
      setFilteredUsers(res.data);

      toast.success(`User ${currentStatus === "active" ? "blocked" : "unblocked"} successfully`);
    } catch (err) {
      console.error("Failed to toggle user status", err);
      toast.error("Failed to update user status");
    }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, password, confirmPassword } = newAdmin;

    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email address");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/create-admin`,
        {
          name,
          email,
          phone,
          password,
          role: "Admin",
        },
        { headers }
      );
      

      toast.success("Admin added successfully");
      setShowAddAdminModal(false);
      setNewAdmin({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/all-users`, { headers });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Failed to add admin", err);
      toast.error(err.response?.data?.message || "Failed to create admin");
    }
  };

  return (
    <div className="user-management-content">
      <ToastContainer />
      {/* Header */}
      <div className="user-management-header">
        <div className="user-header-left">
          <MdOutlineManageAccounts className="user-management-icon" />
          <h1>User Management</h1>
        </div>
        <div className="user-header-right">
          <div className="user-notification-bell">
            <FaRegBell />
            <span className="user-notification-badge">2</span>
          </div>
          <div className="user-admin-profile">
            <div className="user-profile-avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="user-welcome-banner user-animate-fade-in">
        <div className="user-welcome-text">
          <h1>Welcome to <span className="user-highlight">User Management</span></h1>
          <p>Manage all platform users, roles, and statuses below.</p>
        </div>
        <div className="user-welcome-stats">
          <div className="user-stat-item">
            <span className="user-stat-label">Total Users</span>
            <span className="user-stat-value">{users.length}</span>
          </div>
          <div className="user-stat-item">
            <span className="user-stat-label">Active</span>
            <span className="user-stat-value">{users.filter((u) => u.status === "active").length}</span>
          </div>
          <div className="user-stat-item">
            <span className="user-stat-label">Blocked</span>
            <span className="user-stat-value">{users.filter((u) => u.status === "blocked").length}</span>
          </div>
        </div>
        <button
          className="add-admin-btn animated"
          onClick={() => setShowAddAdminModal(true)}
        >
          <FaPlus /> Add New Admin
        </button>
      </div>

      {/* Controls */}
      <div className="user-controls-section user-animate-fade-in user-delay-1">
        <div className="user-search-container">
          <div className="user-search-input">
            <FaSearch className="user-search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="user-filter-container">
          <div className="user-filter-group">
            <FaFilter className="user-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="user-filter-group">
            <FaUserCog className="user-filter-icon" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="BusinessOwner">Business Owner</option>
              <option value="Investor">Investor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="user-table-container user-animate-fade-in user-delay-2">
        {isLoading ? (
          <div className="user-loading-state">
            <div className="user-loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <div className="user-table-header">
              <div className="user-table-row">
                <div className="user-table-cell">User</div>
                <div className="user-table-cell">Email</div>
                <div className="user-table-cell">Role</div>
                <div className="user-table-cell">Status</div>
                <div className="user-table-cell">Actions</div>
              </div>
            </div>
            <div className="user-table-body">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div className="user-table-row" key={user._id}>
                    <div className="user-table-cell">
                      <FaUserAlt /> {user.name}
                    </div>
                    <div className="user-table-cell">{user.email}</div>
                    <div className="user-table-cell">{user.role}</div>
                    <div className="user-table-cell">
                      <span className={`user-status-badge ${user.status}`}>
                        {user.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </div>
                    <div className="user-table-cell">
                      <button
                        className={`user-action-btn ${user.status === "active" ? "block-btn" : "activate-btn"}`}
                        onClick={() => toggleUserStatus(user._id, user.status)}
                      >
                        {user.status === "active" ? (
                          <>
                            <FaBan /> Block
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Unblock
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="user-no-results">
                  <FaUserTimes size={32} />
                  <p>No users found matching your criteria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="add-admin-modal-overlay">
          <div className="add-admin-modal">
            <button
              className="modal-close-btn"
              onClick={() => setShowAddAdminModal(false)}
            >
              <FaTimes />
            </button>
            <h3>Add New Admin</h3>
            <form onSubmit={handleAddAdminSubmit}>
              <input
                placeholder="Name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
              <input
                placeholder="Email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
              <input
                placeholder="Phone"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
              />
              <input
                placeholder="Password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
              <input
                placeholder="Confirm Password"
                type="password"
                value={newAdmin.confirmPassword}
                onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
              />
              <button type="submit" className="submit-btn">Create Admin</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
