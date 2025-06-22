import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './investmentRequests.css';
import { FaSearch, FaEdit, FaTrash, FaMoneyBillWave, FaBullseye, FaInfoCircle } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const InvestmentRequests = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investments, setInvestments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    image: '',
    purpose: '',
    reason: '',
    currentContribution: '',
    goalAmount: ''
  });

  const token = sessionStorage.getItem('token');

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const result = investments.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, investments]);

  const handleAddOrUpdate = async () => {
    const data = {
      ...newItem,
      currentContribution: parseFloat(newItem.currentContribution),
      goalAmount: parseFloat(newItem.goalAmount),
    };

    if (Object.values(data).some(v => v === '')) {
      toast.warning('Please fill all fields');
      return;
    }

    try {
      if (editIndex !== null) {
        await axios.patch(`${API_BASE_URL}/api/investments/${investments[editIndex]._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Investment updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/investments`, data,  {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Investment created successfully!');
      }
      fetchData();
      resetModal();
    } catch (err) {
      toast.error('Something went wrong while saving.');
    }
  };

  const handleEdit = (item, index) => {
    setNewItem(item);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="ir-toast-confirm">
        <p>Are you sure you want to delete this investment?</p>
        <div className="ir-toast-buttons">
          <button
            onClick={async () => {
              try {
                await axios.delete(`${API_BASE_URL}/api/investments/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
                toast.dismiss(t.id);
                toast.success('Investment deleted successfully!');
              } catch (err) {
                toast.dismiss(t.id);
                toast.error('Deletion failed!');
              }
            }}
            className="ir-toast-confirm-btn"
          >
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="ir-toast-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };
  

  const resetModal = () => {
    setShowModal(false);
    setNewItem({ title: '', image: '', purpose: '', reason: '', currentContribution: '', goalAmount: '' });
    setEditIndex(null);
  };

  const handleNumberChange = (field, value) => {
    if (/^\d*$/.test(value)) {
      setNewItem(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateProgress = (current, goal) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <div className={`ir-main-container ${darkMode ? 'ir-dark-mode' : ''}`}>
      <Sidebar />
      <div className="ir-content-wrapper">
        <h1 className="ir-main-title">Investment Requests</h1>
        <div className="ir-header-section">
          <div className="ir-search-container">
            <FaSearch className="ir-search-icon" />
            <input
              type="text"
              placeholder="Search Investment Requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ir-search-input"
            />
          </div>
          <div className="ir-showing-count">
            Showing <select className="ir-count-select"><option>{filtered.length}</option></select>
          </div>
          <motion.button 
            className="ir-add-button"
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            ✚ New Investment Request
          </motion.button>
        </div>

        <div className="ir-grid-layout">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.div 
                className="ir-card-item"
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="ir-card-header">
                  <h3 className="ir-card-title">{item.title}</h3>
                  <div className="ir-card-actions">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit className="ir-edit-icon" onClick={() => handleEdit(item, index)} />
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash className="ir-delete-icon" onClick={() => handleDelete(item._id)} />
                    </motion.div>
                  </div>
                </div>
                
                <div className="ir-image-container">
                  <img src={item.image || 'https://via.placeholder.com/300x180?text=Investment'} alt="Investment" className="ir-card-image" />
                </div>
                
                <div className="ir-card-section">
                  <div className="ir-section-label">
                    <FaInfoCircle className="ir-section-icon" />
                    <span>Purpose</span>
                  </div>
                  <input value={item.purpose} readOnly className="ir-section-input" />
                </div>
                
                <div className="ir-card-section">
                  <div className="ir-section-label">
                    <FaInfoCircle className="ir-section-icon" />
                    <span>Reason</span>
                  </div>
                  <input value={item.reason} readOnly className="ir-section-input" />
                </div>
                
                <div className="ir-progress-container">
                  <div className="ir-progress-bar">
                    <div 
                      className="ir-progress-fill"
                      style={{ width: `${calculateProgress(item.currentContribution, item.goalAmount)}%` }}
                    ></div>
                  </div>
                  <div className="ir-progress-text">
                    {calculateProgress(item.currentContribution, item.goalAmount)}% funded
                  </div>
                </div>
                
                <div className="ir-card-footer">
                  <div className="ir-contribution-box">
                    <div className="ir-footer-label">
                      <FaMoneyBillWave className="ir-footer-icon" />
                      <span>Current Contribution</span>
                    </div>
                    <div className="ir-contribution-value">${item.currentContribution.toLocaleString()}</div>
                  </div>
                  <div className="ir-goal-amount">
                    <div className="ir-footer-label">
                      <FaBullseye className="ir-footer-icon" />
                      <span>Goal Amount</span>
                    </div>
                    <div className="ir-goal-value">${item.goalAmount.toLocaleString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div 
              className="ir-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetModal}
            >
              <motion.div 
                className="ir-modal-content"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="ir-modal-title">{editIndex !== null ? 'Update Investment' : 'Add Investment Request'}</h3>

                <div className="ir-form-group">
                  <label className="ir-form-label">Title</label>
                  <input 
                    type="text" 
                    value={newItem.title} 
                    onChange={e => setNewItem({ ...newItem, title: e.target.value })} 
                    className="ir-form-input"
                  />
                </div>

                <div className="ir-form-group">
                  <label className="ir-form-label">Image URL</label>
                  <input 
                    type="text" 
                    value={newItem.image} 
                    onChange={e => setNewItem({ ...newItem, image: e.target.value })} 
                    className="ir-form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="ir-form-group">
                  <label className="ir-form-label">Purpose</label>
                  <input 
                    type="text" 
                    value={newItem.purpose} 
                    onChange={e => setNewItem({ ...newItem, purpose: e.target.value })} 
                    className="ir-form-input"
                  />
                </div>

                <div className="ir-form-group">
                  <label className="ir-form-label">Reason</label>
                  <input 
                    type="text" 
                    value={newItem.reason} 
                    onChange={e => setNewItem({ ...newItem, reason: e.target.value })} 
                    className="ir-form-input"
                  />
                </div>

                <div className="ir-form-group">
                  <label className="ir-form-label">Current Contribution ($)</label>
                  <input 
                    type="text" 
                    value={newItem.currentContribution} 
                    onChange={e => handleNumberChange('currentContribution', e.target.value)} 
                    className="ir-form-input"
                  />
                </div>

                <div className="ir-form-group">
                  <label className="ir-form-label">Goal Amount ($)</label>
                  <input 
                    type="text" 
                    value={newItem.goalAmount} 
                    onChange={e => handleNumberChange('goalAmount', e.target.value)} 
                    className="ir-form-input"
                  />
                </div>

                <div className="ir-modal-buttons">
                  <motion.button 
                    className="ir-save-button"
                    onClick={handleAddOrUpdate}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editIndex !== null ? 'Update' : 'Save'}
                  </motion.button>
                  <motion.button 
                    className="ir-cancel-button"
                    onClick={resetModal}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        
      </div>
    </div>
  );
};

export default InvestmentRequests;