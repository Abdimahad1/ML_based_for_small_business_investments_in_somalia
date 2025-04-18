import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './settings.css';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import {
  FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe,
  FaSave, FaPen, FaUser, FaKey, FaEye, FaEyeSlash,
  FaBell, FaInbox, FaVolumeUp
} from 'react-icons/fa';

const Settings = () => {
  const { darkMode } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState('/profile.jpg');
  const [activeTab, setActiveTab] = useState('business');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [notificationToggles, setNotificationToggles] = useState({
    email: true,
    app: true,
    sound: false
  });

  const togglePassword = (key) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="settings-content">
        <TopBar />

        {/* HEADER */}
        <div className="settings-header no-cover">
          <div className="profile-row">
            <div className="profile-card">
              <img className="profile-img" src={profileImage} alt="Profile" />
              <label className="edit-profile">
                <FaPen />
                <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
              </label>
            </div>
            <div className="profile-info">
              <h2>Abdimahad</h2>
              <p className="email">abimahad@gmail.com</p>
              <span className="role-badge">Retailer</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="settings-tabs">
          <button className={activeTab === 'business' ? 'active' : ''} onClick={() => setActiveTab('business')}>Business Profile</button>
          <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>User Account</button>
          <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifications</button>
        </div>

        {/* BUSINESS PROFILE TAB */}
        {activeTab === 'business' && (
          <div className="tab-content business">
            <label><FaBriefcase style={{ color: '#3b82f6' }} /> Business Name:</label>
            <input type="text" placeholder="Dahab Group Ltd." />

            <label><FaMapMarkerAlt style={{ color: '#ef4444' }} /> Location:</label>
            <input type="text" placeholder="Mogadishu, Somalia" />

            <label><FaEnvelope style={{ color: '#6366f1' }} /> Business Email:</label>
            <input type="email" placeholder="contact@dahab.so" />

            <label><FaGlobe style={{ color: '#22c55e' }} /> Website URL:</label>
            <input type="text" placeholder="https://www.dahab.so" />

            <button className="save-btn"><FaSave /> Save</button>
          </div>
        )}

        {/* USER ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="tab-content account">
            <label><FaUser style={{ color: '#0ea5e9' }} /> Full Name:</label>
            <input type="text" placeholder="Abdimahad" />

            <label><FaKey style={{ color: '#facc15' }} /> Current Password:</label>
            <div className="password-group">
              <input type={showPassword.current ? 'text' : 'password'} placeholder="************" />
              <span onClick={() => togglePassword('current')}>
                {showPassword.current ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <label><FaKey style={{ color: '#4ade80' }} /> New Password:</label>
            <div className="password-group">
              <input type={showPassword.new ? 'text' : 'password'} placeholder="New password" />
              <span onClick={() => togglePassword('new')}>
                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <label><FaKey style={{ color: '#f87171' }} /> Confirm Password:</label>
            <div className="password-group">
              <input type={showPassword.confirm ? 'text' : 'password'} placeholder="Confirm password" />
              <span onClick={() => togglePassword('confirm')}>
                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="save-btn"><FaSave /> Save</button>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="tab-content notifications">
            <div className="notification-row">
              <label><FaBell style={{ color: '#facc15' }} /><strong>Email Alerts:</strong></label>
              <div
                className={`toggle-switch ${notificationToggles.email ? 'on' : 'off'}`}
                onClick={() =>
                  setNotificationToggles(prev => ({ ...prev, email: !prev.email }))
                }
              >
                {notificationToggles.email ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="notification-row">
              <label><FaInbox style={{ color: '#0ea5e9' }} /><strong>In-App Notifications:</strong></label>
              <div
                className={`toggle-switch ${notificationToggles.app ? 'on' : 'off'}`}
                onClick={() =>
                  setNotificationToggles(prev => ({ ...prev, app: !prev.app }))
                }
              >
                {notificationToggles.app ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="notification-row">
              <label><FaVolumeUp style={{ color: '#f87171' }} /><strong>Notification Sounds:</strong></label>
              <div
                className={`toggle-switch ${notificationToggles.sound ? 'on' : 'off'}`}
                onClick={() =>
                  setNotificationToggles(prev => ({ ...prev, sound: !prev.sound }))
                }
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
