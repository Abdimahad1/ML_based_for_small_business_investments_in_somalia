import React, { useEffect, useState, useContext } from 'react';
import './notifications.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    setNotifications([
      {
        id: 1,
        user: 'Investor Ahmed',
        img: '/profile.jpg',
        message: 'is interested in your investment request for $10,000.',
        icon: '💬',
        unread: true,
        actions: ['View', 'Dismiss'],
      },
      {
        id: 2,
        user: 'Investor Nasteexo',
        img: '/profile.jpg',
        message: 'sent a message about your growth report.',
        icon: '📈',
        unread: false,
        actions: ['View Report'],
      },
    ]);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? n.unread : !n.unread
  );

  return (
    <div className={`notifications-container ${darkMode ? 'dark' : ''}`}>
      <div className="notif-header">
        <div className="notif-title">
          <button className="back-btn" onClick={() => navigate(from)}>
            <FaArrowLeft />
          </button>
          <h2>🔔 <strong>Notifications</strong></h2>
        </div>

        <div className="notif-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-btn">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button className="mark-read-btn" onClick={markAllAsRead}>📬 Mark all as read</button>
        </div>
      </div>

      <div className="notif-list">
        {filteredNotifications.length === 0 ? (
          <p className="empty-msg">No notifications to show.</p>
        ) : (
          filteredNotifications.map(n => (
            <div key={n.id} className={`notif-card ${n.unread ? 'unread' : ''}`}>
              <img src={n.img} alt="User" className="notif-avatar" />
              <div className="notif-content">
                <p><span className="icon">{n.icon}</span> <strong>{n.user}</strong> {n.message}</p>
                <div className="notif-buttons">
                  {n.actions.includes('View') && <button className="view-btn">View</button>}
                  {n.actions.includes('View Report') && <button className="view-btn">View Report</button>}
                  {n.actions.includes('Dismiss') && <button className="dismiss-btn">Dismiss</button>}
                </div>
              </div>
              {n.unread && <span className="red-dot"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
