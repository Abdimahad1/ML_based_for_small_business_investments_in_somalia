import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './investmentRequests.css';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/investments', {
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
        await axios.patch(`http://localhost:5000/api/investments/${investments[editIndex]._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Investment updated!');
      } else {
        await axios.post('http://localhost:5000/api/investments', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Investment created!');
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

  const handleDelete = async (id) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          Are you sure you want to delete?
          <div style={{ marginTop: 10 }}>
            <button
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:5000/api/investments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  fetchData();
                  toast.dismiss();
                  toast.success('Deleted successfully!');
                } catch (err) {
                  toast.error('Deletion failed!');
                }
              }}
              style={{ marginRight: 10, backgroundColor: '#ef4444', color: 'white', padding: '5px 12px', border: 'none', borderRadius: 5 }}
            >
              Yes
            </button>
            <button onClick={closeToast} style={{ padding: '5px 12px', borderRadius: 5 }}>Cancel</button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
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

  return (
    <div className={`investment-container${darkMode ? ' dark' : ''}`}>
      <Sidebar />
      <div className="investment-content">
        <h1>Investments</h1>
        <div className="investment-header">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search Investment Requests"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="showing-count">Showing <select><option>{filtered.length}</option></select></div>
          <button className="add-btn" onClick={() => setShowModal(true)}> ✚ New Investment Request</button>
        </div>

        <div className="investment-grid">
          {filtered.map((item, index) => (
            <div className="investment-card" key={item._id}>
              <div className="card-header">
                <h3>{item.title}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <FaEdit className="edit-icon" onClick={() => handleEdit(item, index)} />
                  <FaTrash className="delete-icon" onClick={() => handleDelete(item._id)} />
                </div>
              </div>
              <div className="investment-img">
                <img src={item.image} alt="Investment" />
              </div>
              <div className="card-section">
                <label>Purpose</label>
                <input value={item.purpose} readOnly />
              </div>
              <div className="card-section">
                <label>Reason</label>
                <input value={item.reason} readOnly />
              </div>
              <div className="card-footer">
                <div className="contribution-box">
                  <label>Current Contribution</label>
                  <div className="current-value">${item.currentContribution.toLocaleString()}</div>
                </div>
                <div className="goal-amount">
                  <label>Amount</label>
                  <div>${item.goalAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-form">
              <h3>{editIndex !== null ? 'Update Investment' : 'Add Investment Request'}</h3>

              <div className="form-group">
                <label>Title</label>
                <input type="text" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input type="text" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Purpose</label>
                <input type="text" value={newItem.purpose} onChange={e => setNewItem({ ...newItem, purpose: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input type="text" value={newItem.reason} onChange={e => setNewItem({ ...newItem, reason: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Current Contribution</label>
                <input type="text" value={newItem.currentContribution} onChange={e => handleNumberChange('currentContribution', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Goal Amount</label>
                <input type="text" value={newItem.goalAmount} onChange={e => handleNumberChange('goalAmount', e.target.value)} />
              </div>

              <div className="modal-buttons">
                <button className="save-btn" onClick={handleAddOrUpdate}>Save</button>
                <button className="cancel-btn" onClick={resetModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
};

export default InvestmentRequests;
