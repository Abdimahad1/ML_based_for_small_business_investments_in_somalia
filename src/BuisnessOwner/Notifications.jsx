import React, { useEffect, useState, useContext } from 'react';
import './notifications.css';
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaStoreAlt,
  FaMoneyBillWave,
  FaShoppingCart
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user'));
  const role = user?.role || 'BusinessOwner';

  useEffect(() => {
    fetchGoalsAndNotifications();
    const interval = setInterval(() => {
      fetchGoalsAndNotifications();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchGoalsAndNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const currentUserId = user._id;
      const notifRes = await axios.get(`${API_BASE_URL}/api/notifications`, config);

      if (role === 'Investor') {
        const investmentUpdates = notifRes.data.filter(n =>
          n.title === 'Investment Status Update' &&
          (n.message.includes('accepted') || n.message.includes('rejected'))
        );
        setNotifications(investmentUpdates);
        return;
      }

      const settingsRes = await axios.get(`${API_BASE_URL}/api/notification-settings`, config);
      if (!settingsRes.data?.in_app) return setInAppEnabled(false);
      setInAppEnabled(true);

      const [goalsRes, overviewRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/goals`, config),
        axios.get(`${API_BASE_URL}/api/overview`, config),
        axios.get(`${API_BASE_URL}/api/products`, config)
      ]);

      const goals = goalsRes.data;
      const existingNotifications = notifRes.data;
      const overview = overviewRes.data;
      const products = productsRes.data;

      const dismissedList = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const createdGoals = new Set();
      const promises = [];

      for (const goal of goals) {
        if (goal.user_id === currentUserId && (goal.dueDate === todayStr || goal.dueDate === tomorrowStr)) {
          const alreadyExists = existingNotifications.some(
            n => n.message.includes(goal.name) && n.message.includes(goal.dueDate) && n.user_id === currentUserId
          );
          const alreadyDismissed = dismissedList.some(
            d => d.goalName === goal.name && d.dueDate === goal.dueDate
          );
          const goalKey = `${goal.name}-${goal.dueDate}`;

          if (!alreadyExists && !alreadyDismissed && !createdGoals.has(goalKey)) {
            promises.push(
              createNotification(
                `Goal Reminder`,
                `The due date for "${goal.name}" is ${goal.dueDate}.`,
                currentUserId
              )
            );
            createdGoals.add(goalKey);
          }
        }
      }

      if (overview.expenses > overview.income) {
        const alreadyExists = existingNotifications.some(
          n => n.title === 'Warning' && n.message.includes('expenses exceed income') && n.user_id === currentUserId
        );
        if (!alreadyExists) {
          promises.push(
            createNotification(
              'Warning',
              'Your expenses exceed your income. Financial risk detected!',
              currentUserId
            )
          );
        }
      }

      if (products.length > 0) {
        const topProduct = [...products].sort((a, b) => b.sold - a.sold)[0];
        const alreadyExists = existingNotifications.some(
          n => n.title === 'Top Seller' && n.message.includes(topProduct.name) && n.user_id === currentUserId
        );
        if (!alreadyExists) {
          promises.push(
            createNotification(
              'Top Seller',
              `🔥 The product "${topProduct.name}" is the best-seller with ${topProduct.sold} units sold!`,
              currentUserId
            )
          );
        }
      }

      await Promise.all(promises);

      const refreshedNotif = await axios.get(`${API_BASE_URL}/api/notifications`, {
        ...config,
        params: { user_id: currentUserId }
      });
      setNotifications(refreshedNotif.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const createNotification = async (title, message, userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE_URL}/api/notifications`, {
        title,
        message,
        user_id: userId
      }, config);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await Promise.all(
        notifications.filter(n => !n.read).map(n =>
          axios.patch(`${API_BASE_URL}/api/notifications/${n._id}`, {}, config)
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
      await axios.patch(`${API_BASE_URL}/api/notifications/${id}`, {}, config);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      toast.success('📬 Marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteSingleNotification = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, config);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('🗑️ Notification dismissed');
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, config);
      toast.success('✅ Notification rejected!');
      setNotifications(prev => prev.filter(notif => notif._id !== id));
    } catch (err) {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const extractGoalName = (message) => {
    const match = message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  };

  const extractDueDate = (message) => {
    const match = message.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  };

  let isDeletingAll = false;

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return toast('No notifications to delete.', { icon: 'ℹ️' });
  
    toast.custom((t) => (
      <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fff', color: '#111', maxWidth: '320px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>⚠️ Are you sure you want to delete all notifications?</p>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={async () => {
              if (isDeletingAll) return;
              isDeletingAll = true;
  
              try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const newDismissed = notifications.map(n => ({
                  goalName: extractGoalName(n.message),
                  dueDate: extractDueDate(n.message)
                }));
                localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  
                await Promise.all(notifications.map(n =>
                  axios.delete(`${API_BASE_URL}/api/notifications/${n._id}`, config)
                ));
  
                setNotifications([]);
                toast.dismiss(t.id);
                toast.success('✅ All notifications deleted!');
              } catch (error) {
                toast.error('❌ Failed to delete notifications.');
              }
              isDeletingAll = false;
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#111',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center'
    });
  };
  
  

  const getNotificationIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('goal')) return <FaCalendarAlt className="notif-icon" color="#fbbf24" />;
    if (lower.includes('warning')) return <FaExclamationTriangle className="notif-icon" color="#f87171" />;
    if (lower.includes('branch')) return <FaStoreAlt className="notif-icon" color="#60a5fa" />;
    if (lower.includes('top seller')) return <FaShoppingCart className="notif-icon" color="#34d399" />;
    if (lower.includes('income') || lower.includes('expense')) return <FaMoneyBillWave className="notif-icon" color="#34d399" />;
    return <FaCalendarAlt className="notif-icon" color="#fbbf24" />;
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.read
  );

  const goBackToDashboard = () => {
    if (role === 'Investor') navigate('/investor/dashboard');
    else if (role === 'BusinessOwner') navigate('/dashboard');
    else {
      toast.error('Unknown role. Cannot navigate.');
      navigate('/');
    }
  };

  return (
    <div className={`notifications-container ${darkMode ? 'dark' : ''}`}>
      <div className="notif-header">
        <div className="notif-title">
          <button className="back-btn" onClick={goBackToDashboard}>
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
                  {!n.read && (
                    <button
                      className="view-btn"
                      onClick={() => markSingleAsRead(n._id)}
                    >
                      ✔️ Mark Read
                    </button>
                  )}
                  <button
                    className="dismiss-btn"
                    onClick={() => deleteSingleNotification(n._id)}
                  >
                    ❌ Dismiss
                  </button>
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
