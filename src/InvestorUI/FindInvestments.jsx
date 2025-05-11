import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './findInvestments.css';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import TopBar from '../BuisnessOwner/TopBar';
import PredictionForm from './PredictionForm';
import './PredictionForm.css';

const FindInvestments = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    riskLevel: 'All',
    category: 'All',
    minAmount: '',
    maxAmount: ''
  });
  const [predictionData, setPredictionData] = useState(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/investments/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestments(res.data);
        setError(null);
      } catch (err) {
        console.error('Error loading investments:', err);
        setError(err.response?.data?.message || 'Failed to load investments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [token]);

  useEffect(() => {
    const filtered = investments.filter(investment => {
      const matchesSearch = investment.title?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRisk = filters.riskLevel === 'All' ||
        (investment.riskLevel && investment.riskLevel.toLowerCase() === filters.riskLevel.toLowerCase());
      const matchesCategory = filters.category === 'All' ||
        (investment.category && investment.category === filters.category);
      const matchesMinAmount = !filters.minAmount || investment.goalAmount >= Number(filters.minAmount);
      const matchesMaxAmount = !filters.maxAmount || investment.goalAmount <= Number(filters.maxAmount);
      return matchesSearch && matchesRisk && matchesCategory && matchesMinAmount && matchesMaxAmount;
    });
    setFilteredInvestments(filtered);
  }, [investments, filters]);

  const handlePredict = async (userId, goalAmount) => {
    const id = typeof userId === 'object' && userId._id ? userId._id : userId;
    if (!id) {
      alert('Invalid user ID');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/prediction-fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.data || !res.data._id) {
        const msg = res.data?.message || 'Prediction data is not available yet for this business.';
        alert(msg);
        return;
      }

      setPredictionData({ ...res.data, goalAmount });
      setShowPredictionModal(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load prediction data. Please try again.';
      alert(msg);
    }
  };

  const handleCloseModal = () => {
    setShowPredictionModal(false);
    setPredictionData(null);
  };

  if (loading) {
    return (
      <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
        <TopBar />
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading investment opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
        <TopBar />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
      <TopBar />
      <div className="find-investments-header">
        <h1>💡 Find Investment Opportunities</h1>
      </div>

      <div className="find-investments-content">
        <div className="filters-row">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>💰 Amount Range</label>
            <div className="amount-inputs">
              <input
                type="number"
                placeholder="Min $"
                value={filters.minAmount}
                onChange={e => setFilters({ ...filters, minAmount: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxAmount}
                onChange={e => setFilters({ ...filters, maxAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Filter By</label>
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
            >
              <option>All Categories</option>
              <option>SAAS</option>
              <option>Retail</option>
              <option>Energy</option>
              <option>Electronics</option>
            </select>
          </div>
        </div>

        <div className="investment-grid">
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map(investment => (
              <div className="investment-card" key={investment._id}>
                <div className="card-header">
                  <h3>{investment.title}</h3>
                  <span className={`investment-category ${investment.category?.toLowerCase()}`}>
                    {investment.category || 'Business'}
                  </span>
                </div>
                <img src={investment.image} alt={investment.title} />
                <div className="card-field">
                  <strong>📌 Purpose:</strong>
                  <p>{investment.purpose}</p>
                </div>
                <div className="card-field">
                  <strong>📙 Reason:</strong>
                  <p>{investment.reason}</p>
                </div>
                <div className="card-footer">
                  <div className="amount-info">
                    <span>Goal:</span>
                    <strong>${investment.goalAmount?.toLocaleString() || '0'}</strong>
                  </div>
                  <div className="amount-info">
                    <span>Raised:</span>
                    <strong>${investment.currentContribution?.toLocaleString() || '0'}</strong>
                  </div>
                </div>
                <div className="card-actions only-predict">
                  <button className="predict-btn" onClick={() => handlePredict(investment.user_id, investment.goalAmount)}>
                    <span className="robot-icon" role="img" aria-label="robot">🤖</span> Predict
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No investment opportunities match your filters.</p>
              <button onClick={() => setFilters({
                search: '',
                riskLevel: 'All',
                category: 'All',
                minAmount: '',
                maxAmount: ''
              })}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {showPredictionModal && predictionData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PredictionForm data={predictionData} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindInvestments;