import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './goals.css';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Goals = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = sessionStorage.getItem('token');
  const [goals, setGoals] = useState([]);
  const [search, setSearch] = useState('');
  const [showing, setShowing] = useState(8);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editGoalId, setEditGoalId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '', quantity: '', price: '', dueDate: '', image: '', category: ''
  });

  const categories = ['All', 'Electronics', 'Clothes', 'Accessories', 'Foods', 'Other'];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data);
    } catch (err) {
      toast.error('Failed to fetch goals');
    }
  };

  const handleAddOrUpdate = async () => {
    const { name, quantity, price, dueDate, image, category } = newItem;
    if (!name || !quantity || !price || !dueDate || !image || !category) {
      toast.warning("Please fill all fields");
      return;
    }
  
    const user = JSON.parse(localStorage.getItem('user'));
    const goalData = {
      ...newItem,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      completed: false,
      user_id: user._id
    };
  
    try {
      if (editGoalId) {
        const res = await axios.patch(`${API_BASE_URL}/api/goals/${editGoalId}`, goalData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGoals(goals.map(g => g._id === editGoalId ? res.data : g));
        toast.success('Goal updated!');
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/goals`, goalData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGoals([res.data, ...goals]);
        toast.success('Goal added!');
  
        await axios.post(`${API_BASE_URL}/api/notifications`, {
          title: 'Goal Reminder',
          message: `The due date for "${res.data.name}" is ${res.data.dueDate}.`,
          user_id: user._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goal');
    }
  
    resetForm();
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to delete this goal?</p>
        <div style={{ marginTop: 10 }}>
          <button
            onClick={async () => {
              try {
                await axios.delete(`${API_BASE_URL}/api/goals/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setGoals(prev => prev.filter(g => g._id !== id));
                toast.success('Goal deleted!');
              } catch {
                toast.error('Failed to delete goal');
              }
              toast.dismiss(t.id);
            }}
            style={{
              marginRight: 10,
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              backgroundColor: '#e5e7eb',
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  const handleEdit = (goal) => {
    setNewItem(goal);
    setEditGoalId(goal._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setNewItem({
      name: '', quantity: '', price: '', dueDate: '', image: '', category: ''
    });
    setEditGoalId(null);
    setShowModal(false);
  };

  const filtered = goals.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCategory === 'All' || item.category === filterCategory)
  );

  const displayGoals = filtered.slice(0, Math.min(showing, filtered.length));

  return (
    <div className={`goals-main-container ${darkMode ? 'goals-dark' : ''}`}>
      <Sidebar />
      <div className="goals-main-content">
        <h1 className="goals-title">Milestones & Goals</h1>

        <div className="goals-header-wrapper">
          <div className="goals-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search products here"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="goals-showing">
            Showing
            <select value={showing} onChange={(e) => setShowing(Number(e.target.value))}>
              {[1, 3, 5, 8, 10, goals.length].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="goals-category">
            Category
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button className="goals-launch-btn" onClick={() => setShowModal(true)}>🟢 Launch New Product</button>
        </div>

        <div className="goals-section">
          <div className="goals-cards">
            {displayGoals.map((item) => (
              <div className="goals-card" key={item._id}>
                <div className="goals-card-top">
                  <div><div className="goals-badge">{item.quantity}</div><small>Quantity</small></div>
                  <div><div className="goals-badge">${item.price}</div><small>Price</small></div>
                </div>
                <div className="goals-card-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="goals-card-info">
                  <h4>{item.name}</h4>
                  <small>Due: {item.dueDate}</small>
                </div>
                <div className="goals-card-actions">
                  <button className="goals-update-btn" onClick={() => handleEdit(item)}>UPDATE</button>
                  <button className="goals-delete-btn" onClick={() => handleDelete(item._id)}><FaTrash /></button>
                </div>
              </div>
            ))}
            {displayGoals.length === 0 && <p className="goals-no-data">No products found.</p>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="goals-modal-overlay">
          <div className="goals-modal-form">
            <h3>{editGoalId ? 'Update Product' : 'Add New Product'}</h3>
            <input type="text" placeholder="Product Name" value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input type="number" placeholder="Quantity" value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
            <input type="number" placeholder="Price" value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            <input type="date" placeholder="Due Date" value={newItem.dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })} />
            <input type="text" placeholder="Image URL" value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} />
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
              <option value="">Select Category</option>
              {categories.filter(cat => cat !== 'All').map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="goals-modal-buttons">
              <button className="goals-update-btn" onClick={handleAddOrUpdate}>Save</button>
              <button className="goals-delete-btn" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Goals;
