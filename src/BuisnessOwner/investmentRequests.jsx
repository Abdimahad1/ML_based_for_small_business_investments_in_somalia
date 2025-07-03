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
        await axios.post(`${API_BASE_URL}/api/investments`, data, {
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
      <div className="invest-req-toast-confirm">
        <p>Are you sure you want to delete this investment?</p>
        <div className="invest-req-toast-buttons">
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
            className="invest-req-toast-confirm-btn"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="invest-req-toast-cancel-btn"
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

  const resetModal = () => {
    setShowModal(false);
    setNewItem({
      title: '',
      image: '',
      purpose: '',
      reason: '',
      currentContribution: '',
      goalAmount: ''
    });
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
    <div className={`invest-req-container ${darkMode ? 'invest-req-dark' : ''}`}>
      <Sidebar />
      <div className="invest-req-content">
        <h1 className="invest-req-title">Investment Requests</h1>
        <div className="invest-req-header">
          <div className="invest-req-search">
            <FaSearch className="invest-req-search-icon" />
            <input
              type="text"
              placeholder="Search Investment Requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="invest-req-search-input"
            />
          </div>
          <div className="invest-req-showing">
            Showing <select className="invest-req-count"><option>{filtered.length}</option></select>
          </div>
          <motion.button
            className="invest-req-add-btn"
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            ✚ New Investment
          </motion.button>
        </div>

        <div className="invest-req-grid">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.div
                className="invest-req-card"
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="invest-req-card-header">
                  <h3 className="invest-req-card-title">{item.title}</h3>
                  <div className="invest-req-card-actions">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <FaEdit className="invest-req-edit-icon" onClick={() => handleEdit(item, index)} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <FaTrash className="invest-req-delete-icon" onClick={() => handleDelete(item._id)} />
                    </motion.div>
                  </div>
                </div>

                <div className="invest-req-image-wrapper">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x180?text=Investment'}
                    alt="Investment"
                    className="invest-req-image"
                  />
                </div>

                <div className="invest-req-info">
                  <div className="invest-req-info-section">
                    <FaInfoCircle className="invest-req-info-icon" />
                    <span>Purpose</span>
                    <input value={item.purpose} readOnly className="invest-req-info-input" />
                  </div>
                  <div className="invest-req-info-section">
                    <FaInfoCircle className="invest-req-info-icon" />
                    <span>Reason</span>
                    <input value={item.reason} readOnly className="invest-req-info-input" />
                  </div>
                </div>

                <div className="invest-req-progress">
                  <div className="invest-req-progress-bar">
                    <div
                      className="invest-req-progress-fill"
                      style={{ width: `${calculateProgress(item.currentContribution, item.goalAmount)}%` }}
                    ></div>
                  </div>
                  <div className="invest-req-progress-text">
                    {calculateProgress(item.currentContribution, item.goalAmount)}% funded
                  </div>
                </div>

                <div className="invest-req-card-footer">
                  <div className="invest-req-contribution">
                    <FaMoneyBillWave className="invest-req-footer-icon" />
                    <span>${item.currentContribution.toLocaleString()}</span>
                  </div>
                  <div className="invest-req-goal">
                    <FaBullseye className="invest-req-footer-icon" />
                    <span>${item.goalAmount.toLocaleString()}</span>
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
              className="invest-req-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetModal}
            >
              <motion.div
                className="invest-req-modal"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="invest-req-modal-title">
                  {editIndex !== null ? 'Update Investment' : 'Add New Investment'}
                </h3>
                {['title', 'image', 'purpose', 'reason', 'currentContribution', 'goalAmount'].map((field) => (
                  <div key={field} className="invest-req-form-group">
                    <label className="invest-req-form-label">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      value={newItem[field]}
                      onChange={(e) =>
                        field === 'currentContribution' || field === 'goalAmount'
                          ? handleNumberChange(field, e.target.value)
                          : setNewItem({ ...newItem, [field]: e.target.value })
                      }
                      className="invest-req-form-input"
                    />
                  </div>
                ))}
                <div className="invest-req-modal-actions">
                  <motion.button
                    className="invest-req-save-btn"
                    onClick={handleAddOrUpdate}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {editIndex !== null ? 'Update' : 'Save'}
                  </motion.button>
                  <motion.button
                    className="invest-req-cancel-btn"
                    onClick={resetModal}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
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
