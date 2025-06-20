import React, { useContext, useEffect, useState } from 'react';
import './TopBar.css';
import { FaMoon, FaCog, FaBell } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TopBar = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inAppEnabled, setInAppEnabled] = useState(true); // ✅ new
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 🔥 First: Fetch notification settings
      const settingsRes = await axios.get(`${API_BASE_URL}/api/notification-settings`, config);
      if (!settingsRes.data?.in_app) {
        setInAppEnabled(false);
        setUnreadCount(0); // 🧹 Clear notifications count if in-app is OFF
        return;
      }
      setInAppEnabled(true);

      // ✅ Now fetch notifications
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, config);
      const unread = res.data.filter(n => !n.read);
      setUnreadCount(unread.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  return (
    <div className="topbar">
      <div className={`theme-toggle ${darkMode ? 'dark' : 'light'}`} onClick={toggleTheme}>
        <FaCog className="sun-icon" />
        <FaMoon className="moon-icon" />
        <div className="toggle-ball" />
      </div>

      <div className="notification">
        <Link to="/notifications" className="notification-link">
          <FaBell />
          {/* Only show badge if notifications are ON and there are unread ones */}
          {inAppEnabled && unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
