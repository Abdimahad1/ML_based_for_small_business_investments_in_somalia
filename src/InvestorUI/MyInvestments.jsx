import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { FaBriefcase, FaMoneyBillWave } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import './MyInvestments.css';
import { ThemeContext } from '../context/ThemeContext';

const MyInvestments = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investments, setInvestments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/my-investments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestments(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch investments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  // Filtered list based on search term
  const filteredInvestments = investments.filter((inv) =>
    (inv.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = investments.length;
  const acceptedCount = investments.filter(inv => inv.status === 'accepted').length;
  const rejectedCount = investments.filter(inv => inv.status === 'rejected').length;
  const totalContributed = investments
    .filter(inv => inv.status === 'accepted')
    .reduce((sum, inv) => sum + (inv.currentContribution || 0), 0);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return { backgroundColor: '#4ade80', color: '#064e3b' };
      case 'pending': return { backgroundColor: '#facc15', color: '#92400e' };
      case 'rejected': return { backgroundColor: '#f87171', color: '#7f1d1d' };
      default: return {};
    }
  };

  return (
    <div className={`My-investments-page ${darkMode ? 'dashboard-content dark' : ''}`}>
      <div className="My-investments-header">
        <h1>My Investments - Overview</h1>
        <div className="My-investments-search-box">
          <FiSearch className="My-investments-search-icon" />
          <input
            type="text"
            placeholder="Search by title, purpose, or reason"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="My-investments-stats">
        <div className="My-investments-stat-box My-investments-orange">
          <FaBriefcase className="My-investments-stat-icon" />
          <div className="My-investments-stat-value">{activeCount}</div>
          <div className="My-investments-stat-label">Active</div>
        </div>
        <div className="My-investments-stat-box My-investments-green">
          <FaMoneyBillWave className="My-investments-stat-icon" />
          <div className="My-investments-stat-value">{acceptedCount}</div>
          <div className="My-investments-stat-label">Accepted</div>
        </div>
        <div className="My-investments-stat-box My-investments-red">
          <FaMoneyBillWave className="My-investments-stat-icon" />
          <div className="My-investments-stat-value">{rejectedCount}</div>
          <div className="My-investments-stat-label">Rejected</div>
        </div>
        <div className="My-investments-stat-box My-investments-blue">
          <FaMoneyBillWave className="My-investments-stat-icon" />
          <div className="My-investments-stat-value">
            ${totalContributed.toLocaleString()}
          </div>
          <div className="My-investments-stat-label">Total Contributed</div>
        </div>
      </div>

      {/* Cards */}
      <div className="My-investments-cards-container">
        {loading ? (
          <p>Loading investments...</p>
        ) : filteredInvestments.length === 0 ? (
          <p>No matching investments found.</p>
        ) : (
          filteredInvestments.map((inv) => (
            <div key={inv._id} className="My-investments-card">
              <div className="My-investments-card-header">
                <h3>{inv.title}</h3>
                <span
                  className="My-investments-category"
                  style={{
                    ...getStatusStyle(inv.status),
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </div>

              {inv.image && (
                <img
                  src={inv.image}
                  alt="Investment"
                  className="My-investments-card-image"
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                />
              )}

              <div className="My-investments-card-info">
                <div className="My-investments-info-row">
                  <label>Purpose</label>
                  <input type="text" readOnly value={inv.purpose || 'N/A'} />
                </div>
                <div className="My-investments-info-row">
                  <label>Reason</label>
                  <input type="text" readOnly value={inv.reason || 'N/A'} />
                </div>
                <div className="My-investments-info-row">
                  <label>Goal</label>
                  <input
                    type="text"
                    readOnly
                    value={`$${inv.goalAmount?.toLocaleString() || 0}`}
                  />
                </div>
                <div className="My-investments-info-row">
                  <label>Contributed</label>
                  <input
                    type="text"
                    readOnly
                    value={`$${inv.currentContribution?.toLocaleString() || 0}`}
                  />
                </div>
              </div>

              <div className="My-investments-card-actions">
                <button className="My-investments-view-btn">View</button>
                <button className="My-investments-track-btn">Track</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyInvestments;
