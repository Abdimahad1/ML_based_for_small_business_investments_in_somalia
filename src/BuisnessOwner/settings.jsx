import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './settings.css';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import axios from 'axios';
import {
  FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe,
  FaSave, FaPen, FaUser, FaKey, FaEye, FaEyeSlash,
  FaBell, FaInbox, FaVolumeUp
} from 'react-icons/fa';
import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const Settings = () => {
  const { darkMode } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState('/assets/default-profile.png');
  const [activeTab, setActiveTab] = useState('business');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const [business, setBusiness] = useState({
    business_name: '',
    location: '',
    business_email: '',
    logo: ''
  });

  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationToggles, setNotificationToggles] = useState({
    email_alerts: true,
    in_app: true,
    sound: false
  });

  const togglePassword = (key) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await axios.put(`${API_BASE_URL}/api/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setBusiness(prev => ({ ...prev, logo: res.data.logo }));
      setProfileImage(`${API_BASE_URL}/uploads/${res.data.logo}`);
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error('Failed to upload image.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [bRes, nRes, uRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/profile`, config),
          axios.get(`${API_BASE_URL}/api/notification-settings`, config),
          axios.get(`${API_BASE_URL}/api/auth/users`, config)
        ]);

        if (bRes.data) {
          setBusiness(bRes.data);
          if (bRes.data.logo) {
            setProfileImage(`${API_BASE_URL}/uploads/${bRes.data.logo}`);
          }
        }

        if (nRes.data) setNotificationToggles(nRes.data);
        if (uRes.data) setUserInfo(prev => ({ ...prev, name: uRes.data.name }));
      } catch (err) {
        toast.error("Failed to load profile data.");
      }
    };

    fetchData();
  }, [token]);

  const handleSaveBusiness = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/profile`, business, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Business profile updated!');
    } catch (err) {
      toast.error('Failed to update business profile.');
    }
  };

  const handleSaveUser = async () => {
    if (!userInfo.currentPassword && (userInfo.newPassword || userInfo.confirmPassword)) {
      toast.error("Please enter your current password.");
      return;
    }

    if (userInfo.newPassword && userInfo.newPassword !== userInfo.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/api/auth/users`, {
        name: userInfo.name,
        currentPassword: userInfo.currentPassword,
        password: userInfo.newPassword,
        confirmPassword: userInfo.confirmPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Account updated!');
      setUserInfo(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user info.');
    }
  };

  const handleToggleNotification = async (key) => {
    const updatedToggles = { ...notificationToggles, [key]: !notificationToggles[key] };
    setNotificationToggles(updatedToggles);

    try {
      await axios.put(`${API_BASE_URL}/api/notification-settings`, updatedToggles, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification settings updated!');
    } catch (err) {
      toast.error('Failed to update notification settings.');
    }
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="settings-content">
        <div className="settings-header no-cover">
          <div className="profile-row">
            <div className="profile-card">
              <img className="profile-img" src={profileImage} alt="Profile" />
              <label className="edit-profile">
                <FaPen color="#4f46e5" />
                <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
              </label>
            </div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p className="email">{user?.email}</p>
              <span className="role-badge">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="settings-tabs">
          <button className={activeTab === 'business' ? 'active' : ''} onClick={() => setActiveTab('business')}>
            <FaBriefcase color={activeTab === 'business' ? '#4f46e5' : '#64748b'} /> Business Profile
          </button>
          <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>
            <FaUser color={activeTab === 'account' ? '#4f46e5' : '#64748b'} /> User Account
          </button>
          <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
            <FaBell color={activeTab === 'notifications' ? '#4f46e5' : '#64748b'} /> Notifications
          </button>
        </div>

        {activeTab === 'business' && (
          <div className="tab-content business">
            <label><FaBriefcase color="#4f46e5" /> Business Name:</label>
            <input
              type="text"
              value={business.business_name || ''}
              onChange={e => setBusiness({ ...business, business_name: e.target.value })}
            />

            <label><FaMapMarkerAlt color="#4f46e5" /> Location:</label>
            <input
              type="text"
              value={business.location || ''}
              onChange={e => setBusiness({ ...business, location: e.target.value })}
            />

            <label><FaEnvelope color="#4f46e5" /> Business Email:</label>
            <input
              type="email"
              value={business.business_email || ''}
              onChange={e => setBusiness({ ...business, business_email: e.target.value })}
            />

            <button className="save-btn" onClick={handleSaveBusiness}>
              <FaSave /> Save
            </button>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="tab-content account">
            <label><FaUser color="#4f46e5" /> Full Name:</label>
            <input
              type="text"
              value={userInfo.name}
              onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
              placeholder="Full Name"
            />
            <label><FaKey color="#4f46e5" /> Current Password:</label>
            <div className="password-group">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={userInfo.currentPassword}
                onChange={e => setUserInfo({ ...userInfo, currentPassword: e.target.value })}
                placeholder="Enter current password to change your password"
              />
              <span onClick={() => togglePassword('current')}>
                {showPassword.current ? <FaEye color="#4f46e5" /> : <FaEyeSlash color="#4f46e5" />}
              </span>
            </div>

            <label><FaKey color="#4f46e5" /> New Password:</label>
            <div className="password-group">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={userInfo.newPassword}
                onChange={e => setUserInfo({ ...userInfo, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <span onClick={() => togglePassword('new')}>
                {showPassword.new ? <FaEye color="#4f46e5" /> : <FaEyeSlash color="#4f46e5" />}
              </span>
            </div>

            <label><FaKey color="#4f46e5" /> Confirm Password:</label>
            <div className="password-group">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={userInfo.confirmPassword}
                onChange={e => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
              <span onClick={() => togglePassword('confirm')}>
                {showPassword.confirm ? <FaEye color="#4f46e5" /> : <FaEyeSlash color="#4f46e5" />}
              </span>
            </div>

            <button className="save-btn" onClick={handleSaveUser}><FaSave /> Save</button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="tab-content notifications">
            <div className="notification-row" style={{ cursor: 'pointer' }}>
              <label>
                <FaBell color="#4f46e5" />
                <strong>Email Alerts:</strong>
              </label>
              <div
                className={`toggle-switch ${notificationToggles.email_alerts ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('email_alerts')}
              >
                {notificationToggles.email_alerts ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="notification-row" style={{ cursor: 'pointer' }}>
              <label>
                <FaInbox color="#4f46e5" />
                <strong>In App:</strong>
              </label>
              <div
                className={`toggle-switch ${notificationToggles.in_app ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('in_app')}
              >
                {notificationToggles.in_app ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="notification-row" style={{ cursor: 'pointer' }}>
              <label>
                <FaVolumeUp color="#4f46e5" />
                <strong>Sound:</strong>
              </label>
              <div
                className={`toggle-switch ${notificationToggles.sound ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('sound')}
              >
                {notificationToggles.sound ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;