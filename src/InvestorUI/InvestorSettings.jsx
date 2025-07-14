import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './InvestorSettings.css';
import axios from 'axios';
import {
  FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe,
  FaSave, FaPen, FaUser, FaKey, FaEye, FaEyeSlash,
  FaBell, FaInbox, FaVolumeUp, FaBars, FaChevronLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const InvestorSettings = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({ 
    current: false, 
    new: false, 
    confirm: false 
  });
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Get user data from localStorage
  // const user = JSON.parse(localStorage.getItem('user'));
  const token = sessionStorage.getItem('token');

  // start fresh default profile image
  const [profileImage, setProfileImage] = useState('/assets/default-profile.png');

  // start fresh profile state
  const [profile, setProfile] = useState({
    investor_name: '',
    investor_location: '',
    investor_email: '',
    investor_website: '',
    logo: ''
  });

  // start fresh user info
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
    sound: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

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
    formData.append('investor_name', profile.investor_name);
    formData.append('investor_location', profile.investor_location);
    formData.append('investor_email', profile.investor_email);
    formData.append('investor_website', profile.investor_website);
    formData.append('logo', file);
  
    try {
      const res = await axios.put(`${API_BASE_URL}/api/investor-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedLogo = res.data.logo;
      setProfile(prev => ({ ...prev, logo: updatedLogo }));
      
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
          const profileRes = await axios.get(`${API_BASE_URL}/api/investor-profile`, config);
          
          setProfile({
            investor_name: profileRes.data.investor_name || '',
            investor_location: profileRes.data.investor_location || '',
            investor_email: profileRes.data.investor_email || '',
            investor_website: profileRes.data.investor_website || '',
            logo: profileRes.data.logo || ''
          });
          
          if (profileRes.data.logo) {
            setProfileImage(`${API_BASE_URL}/uploads/${profileRes.data.logo}`);
          }
  
          setIsNewUser(false);
        } catch (profileErr) {
          if (profileErr.response?.status === 404) {
            setIsNewUser(true);
            console.log('New user detected - profile will be created on first save');
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

  const handleSaveProfile = async () => {
    try {
      const method = isNewUser ? 'post' : 'put';
  
      const payload = {
        investor_name: profile.investor_name,
        investor_location: profile.investor_location,
        investor_email: profile.investor_email,
        investor_website: profile.investor_website,
        logo: profile.logo
      };
  
      const res = await axios[method](`${API_BASE_URL}/api/investor-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (res.data.logo) {
        setProfileImage(`${API_BASE_URL}/uploads/${res.data.logo}`);
        setProfile(prev => ({ ...prev, logo: res.data.logo }));
      }
  
      setIsNewUser(false);
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.response?.data?.message || 'Failed to save profile.');
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
      <div className={`investor-settings-container ${darkMode ? 'dark' : ''}`}>
        <div className="investor-settings-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`investor-settings-container ${darkMode ? 'dark' : ''}`}>
      <div className="investor-settings-content">
        {/* Mobile App Bar */}
        {isMobileView && (
          <div className="investor-mobile-appbar">
            <button 
              className="investor-mobile-menu-btn"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              <FaBars />
            </button>
            <h1 className="investor-mobile-title">
              {activeTab === 'profile' && 'Investor Profile'}
              {activeTab === 'account' && 'User Account'}
              {activeTab === 'notifications' && 'Notifications'}
            </h1>
            <div className="investor-mobile-avatar">
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
          <div className="investor-mobile-sidebar-overlay">
            <div className="investor-mobile-sidebar">
              <button 
                className="investor-mobile-close-btn"
                onClick={() => setShowMobileSidebar(false)}
              >
                <FaChevronLeft />
              </button>
              {/* Your sidebar component would go here */}
            </div>
          </div>
        )}

        {/* Profile Header - Hidden on mobile when in tab view */}
        {!isMobileView && (
          <div className="investor-settings-header no-cover">
            <div className="investor-profile-row">
              <div className="investor-profile-card">
                <img 
                  className="investor-profile-img" 
                  src={profileImage} 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.src = '/assets/default-profile.png';
                    setProfileImage('/assets/default-profile.png');
                  }}
                />
                <label className="investor-edit-profile">
                  <FaPen color="#4f46e5" />
                  <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                </label>
              </div>
              <div className="investor-profile-info">
                <h2>{userInfo.name}</h2>
                <p className="investor-email">{userInfo.email}</p>
                <span className="investor-role-badge">
                  {userInfo.role?.charAt(0).toUpperCase() + userInfo.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Horizontal on desktop, vertical on mobile */}
        {!isMobileView ? (
          <div className="investor-settings-tabs">
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              <FaBriefcase color={activeTab === 'profile' ? '#4f46e5' : '#64748b'} /> Investor Profile
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
          <div className="investor-mobile-tab-buttons">
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              <FaBriefcase /> Profile
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
        <div className={`investor-tab-content ${activeTab}`}>
          {activeTab === 'profile' && (
            <div className="investor-tab-pane">
              {isMobileView && (
                <div className="investor-mobile-profile-header">
                  <div className="investor-mobile-profile-img-container">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.src = '/assets/default-profile.png';
                        setProfileImage('/assets/default-profile.png');
                      }}
                    />
                    <label className="investor-mobile-edit-profile">
                      <FaPen color="#4f46e5" />
                      <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                    </label>
                  </div>
                  <h2>{userInfo.name}</h2>
                  <p className="investor-mobile-email">{userInfo.email}</p>
                </div>
              )}
              
              <label><FaBriefcase color="#4f46e5" /> Investor Name:</label>
              <input
                type="text"
                value={profile.investor_name}
                onChange={e => setProfile({ ...profile, investor_name: e.target.value })}
                placeholder="Your name"
              />

              <label><FaMapMarkerAlt color="#4f46e5" /> Location:</label>
              <input
                type="text"
                value={profile.investor_location}
                onChange={e => setProfile({ ...profile, investor_location: e.target.value })}
                placeholder="Your location"
              />

              <label><FaEnvelope color="#4f46e5" /> Email:</label>
              <input
                type="email"
                value={profile.investor_email}
                onChange={e => setProfile({ ...profile, investor_email: e.target.value })}
                placeholder="Your email"
              />

              <label><FaGlobe color="#4f46e5" /> Website:</label>
              <input
                type="url"
                value={profile.investor_website}
                onChange={e => setProfile({ ...profile, investor_website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />

              <button className="investor-save-btn" onClick={handleSaveProfile}>
                <FaSave /> {isNewUser ? 'Create Profile' : 'Save Profile'}
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="investor-tab-pane">
              {isMobileView && (
                <div className="investor-mobile-profile-header">
                  <div className="investor-mobile-profile-img-container">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.src = '/assets/default-profile.png';
                        setProfileImage('/assets/default-profile.png');
                      }}
                    />
                    <label className="investor-mobile-edit-profile">
                      <FaPen color="#4f46e5" />
                      <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                    </label>
                  </div>
                  <h2>{userInfo.name}</h2>
                  <p className="investor-mobile-email">{userInfo.email}</p>
                </div>
              )}
              
              <label><FaUser color="#4f46e5" /> Full Name:</label>
              <input
                type="text"
                value={userInfo.name}
                onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                placeholder="Your full name"
              />

              <label><FaKey color="#4f46e5" /> Current Password:</label>
              <div className="investor-password-group">
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
              <div className="investor-password-group">
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
              <div className="investor-password-group">
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
              
              <button className="investor-save-btn" onClick={handleSaveUser}>
                <FaSave /> Save Account Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="investor-tab-pane">
              {isMobileView && (
                <div className="investor-mobile-profile-header">
                  <div className="investor-mobile-profile-img-container">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.src = '/assets/default-profile.png';
                        setProfileImage('/assets/default-profile.png');
                      }}
                    />
                    <label className="investor-mobile-edit-profile">
                      <FaPen color="#4f46e5" />
                      <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                    </label>
                  </div>
                  <h2>{userInfo.name}</h2>
                  <p className="investor-mobile-email">{userInfo.email}</p>
                </div>
              )}
              
              <div className="investor-notification-row">
                <label>
                  <FaBell color="#4f46e5" />
                  <strong>Email Alerts</strong>
                </label>
                <div
                  className={`investor-toggle-switch ${notificationToggles.email_alerts ? 'on' : 'off'}`}
                  onClick={() => handleToggleNotification('email_alerts')}
                >
                  {notificationToggles.email_alerts ? 'ON' : 'OFF'}
                </div>
              </div>
              
              <div className="investor-notification-row">
                <label>
                  <FaInbox color="#4f46e5" />
                  <strong>In App Notifications</strong>
                </label>
                <div
                  className={`investor-toggle-switch ${notificationToggles.in_app ? 'on' : 'off'}`}
                  onClick={() => handleToggleNotification('in_app')}
                >
                  {notificationToggles.in_app ? 'ON' : 'OFF'}
                </div>
              </div>
              
              <div className="investor-notification-row">
                <label>
                  <FaVolumeUp color="#4f46e5" />
                  <strong>Notification Sounds</strong>
                </label>
                <div
                  className={`investor-toggle-switch ${notificationToggles.sound ? 'on' : 'off'}`}
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

export default InvestorSettings;