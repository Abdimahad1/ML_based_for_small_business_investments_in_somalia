import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './sellMyBusiness.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStoreAlt } from 'react-icons/fa';

const SellMyBusiness = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    business: '',
    price: '',
    reason: '',
    contact: '',
  });

  const [listingId, setListingId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePost = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/sell-business', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Business posted successfully!');
      setListingId(res.data._id);
    } catch (err) {
      toast.error('Failed to post business');
    }
  };

  const handleUpdate = async () => {
    if (!listingId) return toast.warning(' No listing to update');
    try {
      await axios.patch(`http://localhost:5000/api/sell-business/${listingId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✏️ Business updated!');
    } catch (err) {
      toast.error('❌ Update failed');
    }
  };

  const confirmDelete = () => {
    toast.warning(
      <div>
        <strong>Are you sure you want to delete?</strong>
        <div style={{ marginTop: '8px' }}>
          <button onClick={handleDelete} style={{ marginRight: '10px', background: '#dc2626', color: '#fff', padding: '5px 10px' }}>
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss()} style={{ padding: '5px 10px' }}>
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const handleDelete = async () => {
    if (!listingId) return toast.warning('⚠️ No listing to delete');
    try {
      await axios.delete(`http://localhost:5000/api/sell-business/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Business deleted!');
      setForm({
        business: '',
        price: '',
        reason: '',
        contact: '',
      });
      setListingId(null);
      toast.dismiss();
    } catch (err) {
      toast.error('❌ Delete failed');
    }
  };

  const fetchMyBusiness = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sell-business', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.length > 0) {
        setForm(res.data[0]);
        setListingId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyBusiness();
  }, []);

  return (
    <div className={`sell-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="sell-content">
        <div className="sell-center">
          <div className="form-box">
            <div className="form-title">
              <FaStoreAlt className="form-title-icon" />
              <h1>Sell My Business</h1>
              <p className="subtitle">📄 List your business clearly and attract buyers.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🏢 Business:</label>
                <input
                  type="text"
                  name="business"
                  value={form.business}
                  onChange={handleChange}
                  placeholder="Ex: Dahab Electronics Ltd."
                />
              </div>

              <div className="form-group">
                <label>💰 Price (USD):</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Ex: 25000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>📝 Reason for Selling:</label>
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Why are you selling?"
                />
              </div>

              <div className="form-group">
                <label>📞 Contact Info:</label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Phone or Email"
                />
              </div>
            </div>

            <div className="button-group">
              <button className="btn update" onClick={handleUpdate}>✅ UPDATE</button>
              <button className="btn delete" onClick={confirmDelete}>🗑️ DELETE</button>
              <button className="btn post" onClick={handlePost}>✚ POST</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default SellMyBusiness;
