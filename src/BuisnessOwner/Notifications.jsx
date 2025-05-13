import React, { useEffect, useState, useContext } from 'react';
import './notifications.css';
import { FaArrowLeft, FaExclamationTriangle, FaCalendarAlt, FaStoreAlt, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGoalsAndNotifications();
    const interval = setInterval(() => {
      fetchGoalsAndNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchGoalsAndNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const settingsRes = await axios.get('http://localhost:5000/api/notification-settings', config);
      if (!settingsRes.data?.in_app) {
        setInAppEnabled(false);
        return;
      }
      setInAppEnabled(true);

      const [goalsRes, notifRes, overviewRes, productsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/goals', config),
        axios.get('http://localhost:5000/api/notifications', config),
        axios.get('http://localhost:5000/api/overview', config),
        axios.get('http://localhost:5000/api/products', config)
      ]);

      const goals = goalsRes.data;
      const existingNotifications = notifRes.data;
      const overview = overviewRes.data;
      const products = productsRes.data;

      const dismissedList = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const formatDate = (date) => date.toISOString().split('T')[0];
      const todayStr = formatDate(today);
      const tomorrowStr = formatDate(tomorrow);

      const createdGoals = new Set();
      const promises = [];

      for (const goal of goals) {
        if (goal.dueDate === todayStr || goal.dueDate === tomorrowStr) {
          const alreadyExists = existingNotifications.some(
            n => n.message.includes(goal.name) && n.message.includes(goal.dueDate)
          );
          const alreadyDismissed = dismissedList.some(
            d => d.goalName === goal.name && d.dueDate === goal.dueDate
          );
          const goalKey = `${goal.name}-${goal.dueDate}`;

          if (!alreadyExists && !alreadyDismissed && !createdGoals.has(goalKey)) {
            promises.push(createNotification(`Goal Reminder`, `The due date for "${goal.name}" is ${goal.dueDate}.`));
            createdGoals.add(goalKey);
          }
        }
      }

      if (overview.expenses > overview.income) {
        const alreadyExists = existingNotifications.some(
          n => n.title === 'Warning' && n.message.includes('expenses exceed income')
        );
        if (!alreadyExists) {
          promises.push(createNotification('Warning', 'Your expenses exceed your income. Financial risk detected!'));
        }
      }

      if (products.length > 0) {
        const topProduct = [...products].sort((a, b) => b.sold - a.sold)[0];
        if (topProduct && topProduct.sold > 0) {
          const alreadyExists = existingNotifications.some(
            n => n.title === 'Top Seller' && n.message.includes(topProduct.name)
          );
          if (!alreadyExists) {
            promises.push(createNotification(
              'Top Seller',
              `🔥 The product "${topProduct.name}" is the best-seller with ${topProduct.sold} units sold!`
            ));
          }
        }
      }

      await Promise.all(promises);
      const refreshedNotif = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(refreshedNotif.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const createNotification = async (title, message) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/notifications', { title, message }, config);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, config);
      toast.success('✅ Notification rejected!');
      setNotifications(prev => prev.filter(notif => notif._id !== id));
    } catch (err) {
      console.error('❌ Failed to reject notification:', err.response?.data || err.message);
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await Promise.all(
        notifications.filter(n => !n.read).map(n =>
          axios.patch(`http://localhost:5000/api/notifications/${n._id}`, {}, config)
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`http://localhost:5000/api/notifications/${id}`, {}, config);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const dismissNotification = async (id, title, message) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p>⚠️ Are you sure you want to dismiss this notification?</p>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={async () => {
                try {
                  const config = { headers: { Authorization: `Bearer ${token}` } };
                  await axios.delete(`http://localhost:5000/api/notifications/${id}`, config);

                  const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
                  dismissed.push({ goalName: extractGoalName(message), dueDate: extractDueDate(message) });
                  localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));

                  setNotifications(prev => prev.filter(n => n._id !== id));
                  toast.dismiss();
                  toast.success('✅ Notification dismissed!');
                } catch (error) {
                  console.error('Failed to dismiss notification:', error);
                  toast.error('❌ Failed to dismiss notification.');
                }
              }}
              style={{ marginRight: 10, backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 6 }}
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              style={{ backgroundColor: '#e5e7eb', padding: '6px 12px', borderRadius: 6, border: 'none', marginLeft: 5 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) {
      toast.info('No notifications to delete.');
      return;
    }
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p>⚠️ Are you sure you want to delete all notifications?</p>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={async () => {
                try {
                  const config = { headers: { Authorization: `Bearer ${token}` } };
                  const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
                  const newDismissed = notifications.map(n => ({
                    goalName: extractGoalName(n.message),
                    dueDate: extractDueDate(n.message)
                  }));
                  const updatedDismissed = [...dismissed, ...newDismissed];
                  localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
                  await Promise.all(
                    notifications.map(n =>
                      axios.delete(`http://localhost:5000/api/notifications/${n._id}`, config)
                    )
                  );
                  setNotifications([]);
                  toast.dismiss();
                  toast.success('✅ All notifications deleted!');
                } catch (error) {
                  console.error('Failed to delete notifications:', error);
                  toast.error('❌ Failed to delete notifications.');
                }
              }}
              style={{ marginRight: 10, backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 6 }}
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              style={{ backgroundColor: '#e5e7eb', padding: '6px 12px', borderRadius: 6, border: 'none', marginLeft: 5 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const extractGoalName = (message) => {
    const match = message.match(/"([^\"]+)"/);
    return match ? match[1] : null;
  };

  const extractDueDate = (message) => {
    const match = message.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  };

  const getNotificationIcon = (title) => {
    if (title.toLowerCase().includes('goal')) return <FaCalendarAlt className="notif-icon" color="#fbbf24" />;
    if (title.toLowerCase().includes('warning')) return <FaExclamationTriangle className="notif-icon" color="#f87171" />;
    if (title.toLowerCase().includes('branch')) return <FaStoreAlt className="notif-icon" color="#60a5fa" />;
    if (title.toLowerCase().includes('top seller')) return <FaShoppingCart className="notif-icon" color="#34d399" />;
    if (title.toLowerCase().includes('income') || title.toLowerCase().includes('expense')) return <FaMoneyBillWave className="notif-icon" color="#34d399" />;
    return <FaCalendarAlt className="notif-icon" color="#fbbf24" />;
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.read
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
          <button className="delete-all-btn" onClick={deleteAllNotifications}>🗑️ Delete All</button>
        </div>
      </div>

      <div className="notif-list">
        {filteredNotifications.length === 0 ? (
          <p className="empty-msg">No notifications to show.</p>
        ) : (
          filteredNotifications.map(n => (
            <div key={n._id} className={`notif-card ${!n.read ? 'unread' : ''}`}>
              <div className="notif-content">
                {getNotificationIcon(n.title)}
                <p><strong>{n.title}</strong> {n.message}</p>
                {n.createdAt && (
                  <p className="notif-timestamp">
                    🕒 <em>{new Date(n.createdAt).toLocaleString()}</em>
                  </p>
                )}
                <div className="notif-buttons">
                  {n.title === 'New Investment Request' ? (
                    <>
                      <button className="dismiss-btn" onClick={() => handleRejectRequest(n._id)}>Deny</button>
                    </>
                  ) : (
                    !n.read && <button className="view-btn" onClick={() => markSingleAsRead(n._id)}>Mark Read</button>
                  )}
                </div>
              </div>
              {!n.read && <span className="red-dot"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;