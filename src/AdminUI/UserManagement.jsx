import React, { useState, useEffect } from 'react';
import './userManagement.css';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaBan, 
  FaCheckCircle,
  FaUserCog,
  FaRegBell,
  FaUserShield,
  FaUserAlt,
  FaUserTimes
} from 'react-icons/fa';
import { MdOutlineManageAccounts } from 'react-icons/md';

const UserManagement = () => {
  // Mock data - replace with real API calls later
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', lastActive: '2 hours ago' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', lastActive: '5 minutes ago' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'blocked', lastActive: '3 days ago' },
        { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'moderator', status: 'active', lastActive: '1 hour ago' },
        { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'active', lastActive: '30 minutes ago' },
        { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'user', status: 'blocked', lastActive: '1 week ago' },
        { id: 7, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'moderator', status: 'active', lastActive: 'Just now' },
        { id: 8, name: 'Fiona Green', email: 'fiona@example.com', role: 'user', status: 'active', lastActive: '45 minutes ago' },
        { id: 9, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', lastActive: '2 hours ago' },
        { id: 10, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', lastActive: '5 minutes ago' },
        { id: 11, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'blocked', lastActive: '3 days ago' },
        { id: 12, name: 'Alice Williams', email: 'alice@example.com', role: 'moderator', status: 'active', lastActive: '1 hour ago' },
        { id: 13, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'active', lastActive: '30 minutes ago' },
        { id: 14, name: 'Diana Prince', email: 'diana@example.com', role: 'user', status: 'blocked', lastActive: '1 week ago' },
        { id: 15, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'moderator', status: 'active', lastActive: 'Just now' },
        { id: 16, name: 'Fiona Green', email: 'fiona@example.com', role: 'user', status: 'active', lastActive: '45 minutes ago' },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, statusFilter, roleFilter, users]);

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' } 
        : user
    ));
  };

  const changeUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole } 
        : user
    ));
  };

  return (
    <div className="user-management-content">
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
          <p>Manage all platform users, their roles, and account statuses here.</p>
        </div>
        <div className="user-welcome-stats">
          <div className="user-stat-item">
            <span className="user-stat-label">Total Users</span>
            <span className="user-stat-value">{users.length}</span>
          </div>
          <div className="user-stat-item">
            <span className="user-stat-label">Active</span>
            <span className="user-stat-value">{users.filter(u => u.status === 'active').length}</span>
          </div>
          <div className="user-stat-item">
            <span className="user-stat-label">Blocked</span>
            <span className="user-stat-value">{users.filter(u => u.status === 'blocked').length}</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="user-controls-section user-animate-fade-in user-delay-1">
        <div className="user-search-container">
          <div className="user-search-input">
            <FaSearch className="user-search-icon" />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
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
              className="user-filter-select"
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
              className="user-filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
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
                <div className="user-table-cell user-header-cell">User</div>
                <div className="user-table-cell user-header-cell">Email</div>
                <div className="user-table-cell user-header-cell">Role</div>
                <div className="user-table-cell user-header-cell">Status</div>
                <div className="user-table-cell user-header-cell">Last Active</div>
                <div className="user-table-cell user-header-cell">Actions</div>
              </div>
            </div>
            
            <div className="user-table-body">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div className="user-table-row" key={user.id}>
                    <div className="user-table-cell">
                      <div className="user-avatar-cell">
                        <div className="user-avatar-icon">
                          <FaUserAlt />
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </div>
                    <div className="user-table-cell">{user.email}</div>
                    <div className="user-table-cell">
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className="user-role-select"
                      >
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <div className="user-table-cell">
                      <span className={`user-status-badge ${user.status}`}>
                        {user.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                    <div className="user-table-cell">{user.lastActive}</div>
                    <div className="user-table-cell">
                      <div className="user-action-buttons">
                        <button 
                          className={`user-action-btn ${user.status === 'active' ? 'block-btn' : 'activate-btn'}`}
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                          {user.status === 'active' ? 'Block' : 'Activate'}
                        </button>
                        <button className="user-action-btn edit-btn">
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="user-no-results">
                  <FaUserTimes className="user-no-results-icon" />
                  <p>No users found matching your criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;