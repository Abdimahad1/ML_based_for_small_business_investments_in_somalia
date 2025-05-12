import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './investorSettings.css';
import TopBar from '../BuisnessOwner/TopBar';
import axios from 'axios';
import {
  FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe,
  FaSave, FaPen, FaUser, FaKey, FaEye, FaEyeSlash,
  FaBell, FaInbox, FaVolumeUp
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InvestorSettings = () => {
  const { darkMode } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState('/assets/default-profile.png');
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const [profile, setProfile] = useState({
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
      setProfile(prev => ({ ...prev, logo: res.data.logo }));
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
        const [pRes, nRes, uRes] = await Promise.all([
          axios.get('http://localhost:5000/api/profile', config),
          axios.get('http://localhost:5000/api/notification-settings', config),
          axios.get('http://localhost:5000/api/auth/users', config)
        ]);

        if (pRes.data) {
          setProfile(pRes.data);
          if (pRes.data.logo) {
            setProfileImage(`http://localhost:5000/uploads/${pRes.data.logo}`);
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

  const handleSaveProfile = async () => {
    try {
      await axios.put('http://localhost:5000/api/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile.');
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
      setUserInfo(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user info.');
    }
  };

  const handleToggleNotification = async (key) => {
    const updatedToggles = { ...notificationToggles, [key]: !notificationToggles[key] };
    setNotificationToggles(updatedToggles);

    try {
      await axios.put('http://localhost:5000/api/notification-settings', updatedToggles, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification settings updated!');
    } catch (err) {
      toast.error('Failed to update notification settings.');
    }
  };

  return (
    <div className={`investor-settings-container ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard-content">
        <div className="investor-settings-content">
          <div className="investor-settings-header no-cover">
            <div className="investor-profile-row">
              <div className="investor-profile-card">
                <img className="investor-profile-img" src={profileImage} alt="Profile" />
                <label className="investor-edit-profile">
                  <FaPen />
                  <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                </label>
              </div>
              <div className="investor-profile-info">
                <h2>{user?.name}</h2>
                <p className="investor-email">{user?.email}</p>
                <span className="investor-role-badge">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="investor-settings-tabs">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Investor Profile</button>
            <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>User Account</button>
            <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifications</button>
          </div>

          {activeTab === 'profile' && (
            <div className="investor-tab-content profile">
              <label><FaBriefcase /> Investor Name:</label>
              <input type="text" value={profile.business_name} onChange={e => setProfile({ ...profile, business_name: e.target.value })} />
              <label><FaMapMarkerAlt /> Location:</label>
              <input type="text" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} />
              <label><FaEnvelope /> Email:</label>
              <input type="email" value={profile.business_email} onChange={e => setProfile({ ...profile, business_email: e.target.value })} />
              <label><FaGlobe /> Website:</label>
              <input type="text" value={profile.website_url} onChange={e => setProfile({ ...profile, website_url: e.target.value })} />
              <button className="investor-save-btn" onClick={handleSaveProfile}><FaSave /> Save</button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="investor-tab-content account">
              <label><FaUser /> Full Name:</label>
              <input type="text" value={userInfo.name} onChange={e => setUserInfo({ ...userInfo, name: e.target.value })} />
              <label><FaKey /> Current Password:</label>
              <div className="investor-password-group">
                <input type={showPassword.current ? 'text' : 'password'} value={userInfo.currentPassword} onChange={e => setUserInfo({ ...userInfo, currentPassword: e.target.value })} />
                <span onClick={() => togglePassword('current')}>{showPassword.current ? <FaEye /> : <FaEyeSlash />}</span>
              </div>
              <label><FaKey /> New Password:</label>
              <div className="investor-password-group">
                <input type={showPassword.new ? 'text' : 'password'} value={userInfo.newPassword} onChange={e => setUserInfo({ ...userInfo, newPassword: e.target.value })} />
                <span onClick={() => togglePassword('new')}>{showPassword.new ? <FaEye /> : <FaEyeSlash />}</span>
              </div>
              <label><FaKey /> Confirm Password:</label>
              <div className="investor-password-group">
                <input type={showPassword.confirm ? 'text' : 'password'} value={userInfo.confirmPassword} onChange={e => setUserInfo({ ...userInfo, confirmPassword: e.target.value })} />
                <span onClick={() => togglePassword('confirm')}>{showPassword.confirm ? <FaEye /> : <FaEyeSlash />}</span>
              </div>
              <button className="investor-save-btn" onClick={handleSaveUser}><FaSave /> Save</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="investor-tab-content notifications">
              {['email_alerts', 'in_app', 'sound'].map((key, index) => (
                <div className="investor-notification-row" key={index}>
                  <label>
                    {key === 'email_alerts' && <FaBell />}
                    {key === 'in_app' && <FaInbox />}
                    {key === 'sound' && <FaVolumeUp />}
                    <strong>{key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                  </label>
                  <div className={`investor-toggle-switch ${notificationToggles[key] ? 'on' : 'off'}`} onClick={() => handleToggleNotification(key)}>
                    {notificationToggles[key] ? 'ON' : 'OFF'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <ToastContainer position="top-center" autoClose={2500} />
      </div>
    </div>
  );
};

export default InvestorSettings;
