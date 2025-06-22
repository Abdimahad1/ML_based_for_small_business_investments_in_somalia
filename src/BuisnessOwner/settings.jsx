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
  const [showPassword, setShowPassword] = useState({ 
    current: false, 
    new: false, 
    confirm: false 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const token = sessionStorage.getItem('token');

  const [business, setBusiness] = useState({
    business_name: '',
    location: '',
    business_email: '',
    logo: ''
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: '',
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
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update both business and profile image state
      const updatedLogo = res.data.logo;
      setBusiness(prev => ({ ...prev, logo: updatedLogo }));
      
      const newImageUrl = updatedLogo 
        ? `${API_BASE_URL}/uploads/${updatedLogo}`
        : '/assets/default-profile.png';
      setProfileImage(newImageUrl);
      
      toast.success('Profile image updated successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload image.');
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
  
        // --- Fetch business profile ---
        try {
          const bRes = await axios.get(`${API_BASE_URL}/api/profile`, config);
          
          setBusiness({
            business_name: bRes.data.business_name || '',
            location: bRes.data.location || '',
            business_email: bRes.data.business_email || '',
            logo: bRes.data.logo || ''
          });
  
          if (bRes.data.logo) {
            setProfileImage(`${API_BASE_URL}/uploads/${bRes.data.logo}`);
          }
  
          setIsNewUser(false);
        } catch (profileErr) {
          if (profileErr.response?.status === 404) {
            setIsNewUser(true);
            console.log('Business profile not found — will create on first save');
          } else {
            throw profileErr;
          }
        }
  
        // --- Fetch notification settings ---
        try {
          const notifRes = await axios.get(`${API_BASE_URL}/api/notification-settings`, config);
          const notifData = notifRes?.data || {};
          setNotificationToggles({
            email_alerts: notifData.email_alerts !== false,
            in_app: notifData.in_app !== false,
            sound: notifData.sound || false
          });
        } catch (notifErr) {
          console.warn('Notifications not found, using defaults');
          setNotificationToggles({
            email_alerts: true,
            in_app: true,
            sound: false
          });
        }
  
        // --- Fetch user info (name, email, role) ---
        try {
          const userRes = await axios.get(`${API_BASE_URL}/api/auth/users`, config);
          const userData = userRes?.data || {};
          setUserInfo(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || '',
          }));
        } catch (userErr) {
          console.error('Error loading user info:', userErr);
          toast.error(userErr.response?.data?.message || 'Failed to load user info.');
        }
  
      } catch (err) {
        console.error('Error loading profile data:', err);
        toast.error(err.response?.data?.message || 'Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfileData();
  }, [token]);

  const handleSaveBusiness = async () => {
    try {
      const method = isNewUser ? 'post' : 'put';
      const res = await axios[method](`${API_BASE_URL}/api/profile`, business, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update profile image if logo was included in response
      if (res.data.logo) {
        setProfileImage(`${API_BASE_URL}/uploads/${res.data.logo}`);
        setBusiness(prev => ({ ...prev, logo: res.data.logo }));
      }

      setIsNewUser(false);
      toast.success('Business profile saved successfully!');
    } catch (err) {
      console.error('Error saving business profile:', err);
      toast.error(err.response?.data?.message || 'Failed to save business profile.');
    }
  };

  const handleSaveUser = async () => {
    // Password validation
    if (userInfo.newPassword && userInfo.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!userInfo.currentPassword && (userInfo.newPassword || userInfo.confirmPassword)) {
      toast.error('Please enter your current password to make changes');
      return;
    }

    if (userInfo.newPassword !== userInfo.confirmPassword) {
      toast.error('New passwords do not match');
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
      
      toast.success('Account updated successfully!');
      setUserInfo(prev => ({ 
        ...prev, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      }));
    } catch (err) {
      console.error('Error updating account:', err);
      toast.error(err.response?.data?.message || 'Failed to update account.');
    }
  };

  const handleToggleNotification = async (key) => {
    const updatedToggles = { 
      ...notificationToggles, 
      [key]: !notificationToggles[key] 
    };
    
    try {
      await axios.put(`${API_BASE_URL}/api/notification-settings`, updatedToggles, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotificationToggles(updatedToggles);
      toast.success('Notification settings updated!');
    } catch (err) {
      console.error('Error updating notifications:', err);
      toast.error('Failed to update notification settings.');
      // Revert on error
      setNotificationToggles(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  if (isLoading) {
    return (
      <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
        <Sidebar />
        <div className="settings-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="settings-content">
        <div className="settings-header no-cover">
          <div className="profile-row">
            <div className="profile-card">
              <img 
                className="profile-img" 
                src={profileImage} 
                alt="Profile" 
                onError={(e) => {
                  e.target.src = '/assets/default-profile.png';
                  setProfileImage('/assets/default-profile.png');
                }}
              />
              <label className="edit-profile">
                <FaPen color="#4f46e5" />
                <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
              </label>
            </div>
            <div className="profile-info">
              <h2>{userInfo.name}</h2>
              <p className="email">{userInfo.email}</p>
              <span className="role-badge">
                {userInfo.role?.charAt(0).toUpperCase() + userInfo.role?.slice(1)}
              </span>
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
              value={business.business_name}
              onChange={e => setBusiness({ ...business, business_name: e.target.value })}
              placeholder="Your business name"
            />

            <label><FaMapMarkerAlt color="#4f46e5" /> Location:</label>
            <input
              type="text"
              value={business.location}
              onChange={e => setBusiness({ ...business, location: e.target.value })}
              placeholder="Your location"
            />

            <label><FaEnvelope color="#4f46e5" /> Business Email:</label>
            <input
              type="email"
              value={business.business_email}
              onChange={e => setBusiness({ ...business, business_email: e.target.value })}
              placeholder="Business contact email"
            />

            <button className="save-btn" onClick={handleSaveBusiness}>
              <FaSave /> {isNewUser ? 'Create Profile' : 'Save Profile'}
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
      placeholder="Your full name"
    />

    <label><FaEnvelope color="#4f46e5" /> Email:</label>
    <input
      type="email"
      value={userInfo.email}
      onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
      placeholder="Your email address"
    />
    
    <label><FaKey color="#4f46e5" /> Current Password:</label>
    <div className="password-group">
      <input
        type={showPassword.current ? 'text' : 'password'}
        value={userInfo.currentPassword}
        onChange={e => setUserInfo({ ...userInfo, currentPassword: e.target.value })}
        placeholder="Required for password changes"
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
        placeholder="At least 8 characters"
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
        placeholder="Confirm your new password"
      />
      <span onClick={() => togglePassword('confirm')}>
        {showPassword.confirm ? <FaEye color="#4f46e5" /> : <FaEyeSlash color="#4f46e5" />}
      </span>
    </div>
    
    <button className="save-btn" onClick={handleSaveUser}>
      <FaSave /> Save Account Changes
    </button>
  </div>
)}


        {activeTab === 'notifications' && (
          <div className="tab-content notifications">
            <div className="notification-row" style={{ cursor: 'pointer' }}>
              <label>
                <FaBell color="#4f46e5" />
                <strong>Email Alerts</strong>
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
                <strong>In App Notifications</strong>
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
                <strong>Notification Sounds</strong>
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