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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    website_url: '',
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
      const res = await axios.put('http://localhost:5000/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setBusiness(prev => ({ ...prev, logo: res.data.logo }));
      setProfileImage(`http://localhost:5000/uploads/${res.data.logo}`);
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
          axios.get('http://localhost:5000/api/profile', config),
          axios.get('http://localhost:5000/api/notifications', config),
          axios.get('http://localhost:5000/api/auth/users', config)
        ]);

        if (bRes.data) {
          setBusiness(bRes.data);
          if (bRes.data.logo) {
            setProfileImage(`http://localhost:5000/uploads/${bRes.data.logo}`);
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
      await axios.put('http://localhost:5000/api/profile', business, {
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
      await axios.patch('http://localhost:5000/api/auth/users', {
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
    const newToggles = { ...notificationToggles, [key]: !notificationToggles[key] };
    setNotificationToggles(newToggles);
    await axios.put('http://localhost:5000/api/notifications', newToggles, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="settings-content">
        <TopBar />

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
              <h2>{user?.name}</h2>
              <p className="email">{user?.email}</p>
              <span className="role-badge">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="settings-tabs">
          <button className={activeTab === 'business' ? 'active' : ''} onClick={() => setActiveTab('business')}>Business Profile</button>
          <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>User Account</button>
          <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifications</button>
        </div>

        {activeTab === 'business' && (
          <div className="tab-content business">
            <label><FaBriefcase /> Business Name:</label>
            <input type="text" value={business.business_name || ''} onChange={e => setBusiness({ ...business, business_name: e.target.value })} />
            <label><FaMapMarkerAlt /> Location:</label>
            <input type="text" value={business.location || ''} onChange={e => setBusiness({ ...business, location: e.target.value })} />
            <label><FaEnvelope /> Business Email:</label>
            <input type="email" value={business.business_email || ''} onChange={e => setBusiness({ ...business, business_email: e.target.value })} />
            <label><FaGlobe /> Website URL:</label>
            <input type="text" value={business.website_url || ''} onChange={e => setBusiness({ ...business, website_url: e.target.value })} />
            <button className="save-btn" onClick={handleSaveBusiness}><FaSave /> Save</button>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="tab-content account">
            <label><FaUser /> Full Name:</label>
            <input
              type="text"
              value={userInfo.name}
              onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
              placeholder="Full Name"
            />
            <label><FaKey /> Current Password:</label>
            <div className="password-group">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={userInfo.currentPassword}
                onChange={e => setUserInfo({ ...userInfo, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              <span onClick={() => togglePassword('current')}>
                {showPassword.current ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <label><FaKey /> New Password:</label>
            <div className="password-group">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={userInfo.newPassword}
                onChange={e => setUserInfo({ ...userInfo, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <span onClick={() => togglePassword('new')}>
                {showPassword.new ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <label><FaKey /> Confirm Password:</label>
            <div className="password-group">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={userInfo.confirmPassword}
                onChange={e => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
              <span onClick={() => togglePassword('confirm')}>
                {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <button className="save-btn" onClick={handleSaveUser}><FaSave /> Save</button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="tab-content notifications">
            {['email_alerts', 'in_app', 'sound'].map((key, i) => (
              <div className="notification-row" key={i}>
                <label>
                  {key === 'email_alerts' && <FaBell />}
                  {key === 'in_app' && <FaInbox />}
                  {key === 'sound' && <FaVolumeUp />}
                  <strong>{key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong>
                </label>
                <div
                  className={`toggle-switch ${notificationToggles[key] ? 'on' : 'off'}`}
                  onClick={() => handleToggleNotification(key)}
                >
                  {notificationToggles[key] ? 'ON' : 'OFF'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default Settings;
