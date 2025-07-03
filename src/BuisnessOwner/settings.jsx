import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './settings.css';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import axios from 'axios';
import {
  FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe,
  FaSave, FaPen, FaUser, FaKey, FaEye, FaEyeSlash,
  FaBell, FaInbox, FaVolumeUp, FaBars, FaChevronLeft
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
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {!isMobileView && <Sidebar />}
      
      <div className="settings-content">
        {/* Mobile App Bar */}
        {isMobileView && (
          <div className="settings-mobile-appbar">
            <button 
              className="settings-mobile-menu-btn"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              <FaBars />
            </button>
            <h1 className="settings-mobile-title">
              {activeTab === 'business' && 'Business Profile'}
              {activeTab === 'account' && 'User Account'}
              {activeTab === 'notifications' && 'Notifications'}
            </h1>
            <div className="settings-mobile-avatar">
              <img 
                src={profileImage} 
                alt="Profile" 
                onError={(e) => {
                  e.target.src = '/assets/default-profile.png';
                  setProfileImage('/assets/default-profile.png');
                }}
              />
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobileView && showMobileSidebar && (
          <div className="settings-mobile-sidebar-overlay">
            <div className="settings-mobile-sidebar">
              <button 
                className="settings-mobile-close-btn"
                onClick={() => setShowMobileSidebar(false)}
              >
                <FaChevronLeft />
              </button>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Profile Header - Hidden on mobile when in tab view */}
        {!isMobileView && (
          <div className="settings-header no-cover">
            <div className="settings-profile-row">
              <div className="settings-profile-card">
                <img 
                  className="settings-profile-img" 
                  src={profileImage} 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.src = '/assets/default-profile.png';
                    setProfileImage('/assets/default-profile.png');
                  }}
                />
                <label className="settings-edit-profile">
                  <FaPen color="#4f46e5" />
                  <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                </label>
              </div>
              <div className="settings-profile-info">
                <h2>{userInfo.name}</h2>
                <p className="settings-email">{userInfo.email}</p>
                <span className="settings-role-badge">
                  {userInfo.role?.charAt(0).toUpperCase() + userInfo.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Horizontal on desktop, vertical on mobile */}
        {!isMobileView ? (
          <div className="settings-tabs">
            <button 
              className={activeTab === 'business' ? 'active' : ''} 
              onClick={() => setActiveTab('business')}
            >
              <FaBriefcase color={activeTab === 'business' ? '#4f46e5' : '#64748b'} /> Business Profile
            </button>
            <button 
              className={activeTab === 'account' ? 'active' : ''} 
              onClick={() => setActiveTab('account')}
            >
              <FaUser color={activeTab === 'account' ? '#4f46e5' : '#64748b'} /> User Account
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''} 
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell color={activeTab === 'notifications' ? '#4f46e5' : '#64748b'} /> Notifications
            </button>
          </div>
        ) : (
          <div className="settings-mobile-tab-buttons">
            <button 
              className={activeTab === 'business' ? 'active' : ''} 
              onClick={() => setActiveTab('business')}
            >
              <FaBriefcase /> Business
            </button>
            <button 
              className={activeTab === 'account' ? 'active' : ''} 
              onClick={() => setActiveTab('account')}
            >
              <FaUser /> Account
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''} 
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell /> Notifications
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className={`settings-tab-content ${activeTab}`}>
          {activeTab === 'business' && (
            <div className="settings-tab-pane">
              {isMobileView && (
                <div className="settings-mobile-profile-header">
                  <div className="settings-mobile-profile-img-container">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.src = '/assets/default-profile.png';
                        setProfileImage('/assets/default-profile.png');
                      }}
                    />
                    <label className="settings-mobile-edit-profile">
                      <FaPen color="#4f46e5" />
                      <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                    </label>
                  </div>
                  <h2>{userInfo.name}</h2>
                  <p className="settings-mobile-email">{userInfo.email}</p>
                </div>
              )}
              
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

              <button className="settings-save-btn" onClick={handleSaveBusiness}>
                <FaSave /> {isNewUser ? 'Create Profile' : 'Save Profile'}
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-tab-pane">
              {isMobileView && (
                <div className="settings-mobile-profile-header">
                  <div className="settings-mobile-profile-img-container">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.src = '/assets/default-profile.png';
                        setProfileImage('/assets/default-profile.png');
                      }}
                    />
                    <label className="settings-mobile-edit-profile">
                      <FaPen color="#4f46e5" />
                      <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                    </label>
                  </div>
                  <h2>{userInfo.name}</h2>
                  <p className="settings-mobile-email">{userInfo.email}</p>
                </div>
              )}
              
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
              <div className="settings-password-group">
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
              <div className="settings-password-group">
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
              <div className="settings-password-group">
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
              
              <button className="settings-save-btn" onClick={handleSaveUser}>
                <FaSave /> Save Account Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-tab-pane">
              {isMobileView && (
                <div className="settings-mobile-profile-header">
                  <div className="settings-mobile-profile-img-container">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.src = '/assets/default-profile.png';
                        setProfileImage('/assets/default-profile.png');
                      }}
                    />
                    <label className="settings-mobile-edit-profile">
                      <FaPen color="#4f46e5" />
                      <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                    </label>
                  </div>
                  <h2>{userInfo.name}</h2>
                  <p className="settings-mobile-email">{userInfo.email}</p>
                </div>
              )}
              
              <div className="settings-notification-row">
                <label>
                  <FaBell color="#4f46e5" />
                  <strong>Email Alerts</strong>
                </label>
                <div
                  className={`settings-toggle-switch ${notificationToggles.email_alerts ? 'on' : 'off'}`}
                  onClick={() => handleToggleNotification('email_alerts')}
                >
                  {notificationToggles.email_alerts ? 'ON' : 'OFF'}
                </div>
              </div>
              
              <div className="settings-notification-row">
                <label>
                  <FaInbox color="#4f46e5" />
                  <strong>In App Notifications</strong>
                </label>
                <div
                  className={`settings-toggle-switch ${notificationToggles.in_app ? 'on' : 'off'}`}
                  onClick={() => handleToggleNotification('in_app')}
                >
                  {notificationToggles.in_app ? 'ON' : 'OFF'}
                </div>
              </div>
              
              <div className="settings-notification-row">
                <label>
                  <FaVolumeUp color="#4f46e5" />
                  <strong>Notification Sounds</strong>
                </label>
                <div
                  className={`settings-toggle-switch ${notificationToggles.sound ? 'on' : 'off'}`}
                  onClick={() => handleToggleNotification('sound')}
                >
                  {notificationToggles.sound ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;