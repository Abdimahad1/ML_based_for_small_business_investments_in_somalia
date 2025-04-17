import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './sellMyBusiness.css';

const SellMyBusiness = () => {
  const { darkMode } = useContext(ThemeContext);

  const [form, setForm] = useState({
    business: '',
    industry: '',
    price: '',
    reason: '',
    contact: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePost = () => {
    alert('✅ Business posted!');
  };

  const handleUpdate = () => {
    alert('✏️ Business updated!');
  };

  const handleDelete = () => {
    alert('🗑️ Business deleted!');
  };

  return (
    <div className={`sell-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="sell-content">
        <div className="topbar-wrapper">
          <TopBar />
        </div>

        <div className="sell-center">
          <h1>🪙 SELL MY BUSINESS</h1>
          <p className="subtitle">
            📄 Fill in the form to list your business for sale. Be clear and honest for better buyer interest.
          </p>

          <div className="form-box">
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
              <label>💼 Industry:</label>
              <input
                type="text"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="Ex: Retail, Tech, Restaurant..."
              />
            </div>

            <div className="form-group">
              <label>💰 Price:</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Ex: 25000 (USD)"
              />
            </div>

            <div className="form-group">
              <label>📝 Reason:</label>
              <input
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Why are you selling? (e.g. relocating, retiring...)"
              />
            </div>

            <div className="form-group">
              <label>📞 Contact:</label>
              <input
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Phone or email (e.g. +2526..., you@example.com)"
              />
            </div>

            <div className="button-group">
              <button className="btn update" onClick={handleUpdate}>✅ UPDATE</button>
              <button className="btn delete" onClick={handleDelete}>🗑️ DELETE</button>
              <button className="btn post" onClick={handlePost}>➕ POST</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellMyBusiness;
