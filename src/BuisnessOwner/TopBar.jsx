import React, { useContext } from 'react';
import './TopBar.css';
import { FaMoon, FaCog, FaBell } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

const TopBar = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="topbar">
      <div className={`theme-toggle ${darkMode ? 'dark' : 'light'}`} onClick={toggleTheme}>
        <FaCog className="sun-icon" />
        <FaMoon className="moon-icon" />
        <div className="toggle-ball" />
      </div>

      <div className="notification">
        <FaBell />
        {/* Notifications will be added later */}
      </div>
    </div>
  );
};

export default TopBar;
