import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './InvestorSettings.css';
import axios from 'axios';
import {
  FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe,
  FaSave, FaPen, FaUser, FaKey, FaEye, FaEyeSlash,
  FaBell, FaInbox, FaVolumeUp
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

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = sessionStorage.getItem('token');

  // Initialize state with user data
  const [profileImage, setProfileImage] = useState(
    user?.logo 
      ? `${API_BASE_URL}/uploads/${user.logo}`
      : '/assets/default-profile.png'
  );

  const [profile, setProfile] = useState({
    business_name: '',
    location: '',
    business_email: user?.email || '',
    website_url: '',
    logo: user?.logo || ''
  });

  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationToggles, setNotificationToggles] = useState({
    email_alerts: true,
    in_app: true,
    sound: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const togglePassword = (key) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await axios.put(`${API_BASE_URL}/api/investor-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update both profile and profile image state
      const updatedLogo = res.data.logo;
      setProfile(prev => ({ ...prev, logo: updatedLogo }));
      
      const newImageUrl = updatedLogo 
        ? `${API_BASE_URL}/uploads/${updatedLogo}`
        : '/assets/default-profile.png';
      setProfileImage(newImageUrl);
      
      // Update user in localStorage
      if (user) {
        const updatedUser = { ...user, logo: updatedLogo };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
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
  
        // --- Fetch investor profile ---
        try {
          const profileRes = await axios.get(`${API_BASE_URL}/api/investor-profile`, config);
          
          setProfile({
            business_name: profileRes.data.business_name || '',
            location: profileRes.data.location || '',
            business_email: profileRes.data.business_email || '',
            website_url: profileRes.data.website_url || '',
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
  

  const handleSaveProfile = async () => {
    try {
      const method = isNewUser ? 'post' : 'put';
      const res = await axios[method](`${API_BASE_URL}/api/investor-profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update profile image if logo was included in response
      if (res.data.logo) {
        setProfileImage(`${API_BASE_URL}/uploads/${res.data.logo}`);
        setProfile(prev => ({ ...prev, logo: res.data.logo }));
        
        // Update localStorage if this was the first save
        if (isNewUser && user) {
          const updatedUser = { ...user, logo: res.data.logo };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      setIsNewUser(false);
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.response?.data?.message || 'Failed to save profile.');
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
      
      // Update localStorage if name changed
      if (userInfo.name !== user?.name) {
        const updatedUser = { ...user, name: userInfo.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

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
      <div className={`investor-settings-container ${darkMode ? 'dark' : ''}`}>
        <div className="dashboard-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`investor-settings-container ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard-content">
        <div className="investor-settings-content">
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
                  <FaPen />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileChange} 
                    hidden 
                  />
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

          <div className="investor-settings-tabs">
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              Investor Profile
            </button>
            <button 
              className={activeTab === 'account' ? 'active' : ''} 
              onClick={() => setActiveTab('account')}
            >
              User Account
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''} 
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="investor-tab-content profile">
              <label><FaBriefcase /> Investor Name:</label>
              <input 
                type="text" 
                value={profile.business_name} 
                onChange={e => setProfile({ ...profile, business_name: e.target.value })} 
                placeholder="Your investor/business name"
              />
              
              <label><FaMapMarkerAlt /> Location:</label>
              <input 
                type="text" 
                value={profile.location} 
                onChange={e => setProfile({ ...profile, location: e.target.value })} 
                placeholder="Your location"
              />
              
              <label><FaEnvelope /> Email:</label>
              <input 
                type="email" 
                value={profile.business_email} 
                onChange={e => setProfile({ ...profile, business_email: e.target.value })} 
                placeholder="Business contact email"
              />
              
              <label><FaGlobe /> Website:</label>
              <input 
                type="url" 
                value={profile.website_url} 
                onChange={e => setProfile({ ...profile, website_url: e.target.value })} 
                placeholder="https://yourwebsite.com"
              />
              
              <button className="investor-save-btn" onClick={handleSaveProfile}>
                <FaSave /> {isNewUser ? 'Create Profile' : 'Save Profile'}
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="investor-tab-content account">
              <label><FaUser /> Full Name:</label>
              <input 
                type="text" 
                value={userInfo.name} 
                onChange={e => setUserInfo({ ...userInfo, name: e.target.value })} 
                placeholder="Your full name"
              />
              
              <label><FaKey /> Current Password:</label>
              <div className="investor-password-group">
                <input 
                  type={showPassword.current ? 'text' : 'password'} 
                  value={userInfo.currentPassword} 
                  onChange={e => setUserInfo({ ...userInfo, currentPassword: e.target.value })} 
                  placeholder="Required for password changes"
                />
                <span onClick={() => togglePassword('current')}>
                  {showPassword.current ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              
              <label><FaKey /> New Password:</label>
              <div className="investor-password-group">
                <input 
                  type={showPassword.new ? 'text' : 'password'} 
                  value={userInfo.newPassword} 
                  onChange={e => setUserInfo({ ...userInfo, newPassword: e.target.value })} 
                  placeholder="At least 8 characters"
                />
                <span onClick={() => togglePassword('new')}>
                  {showPassword.new ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              
              <label><FaKey /> Confirm Password:</label>
              <div className="investor-password-group">
                <input 
                  type={showPassword.confirm ? 'text' : 'password'} 
                  value={userInfo.confirmPassword} 
                  onChange={e => setUserInfo({ ...userInfo, confirmPassword: e.target.value })} 
                  placeholder="Confirm your new password"
                />
                <span onClick={() => togglePassword('confirm')}>
                  {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              
              <button className="investor-save-btn" onClick={handleSaveUser}>
                <FaSave /> Save Account Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="investor-tab-content notifications">
              <div className="investor-notification-row">
                <label>
                  <FaBell />
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
                  <FaInbox />
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
                  <FaVolumeUp />
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