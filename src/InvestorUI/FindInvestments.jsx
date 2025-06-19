import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './findInvestments.css';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaSpinner, FaFilter, FaClock, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
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
    maxAmount: '',
    fundingStatus: 'All' // New filter: All, New, Funding, FullyFunded
  });
  const [predictionData, setPredictionData] = useState(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/investments/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sort by newest first
        const sortedInvestments = res.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setInvestments(sortedInvestments);
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
      const matchesMinAmount = !filters.minAmount || investment.goalAmount >= Number(filters.minAmount);
      const matchesMaxAmount = !filters.maxAmount || investment.goalAmount <= Number(filters.maxAmount);
      
      // New funding status filter
      const matchesFundingStatus = () => {
        if (filters.fundingStatus === 'All') return true;
        const isNew = new Date(investment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const isFullyFunded = investment.currentContribution >= investment.goalAmount;
        
        if (filters.fundingStatus === 'New') return isNew;
        if (filters.fundingStatus === 'Funding') return !isFullyFunded;
        if (filters.fundingStatus === 'FullyFunded') return isFullyFunded;
        return true;
      };

      return matchesSearch && matchesRisk && 
             matchesMinAmount && matchesMaxAmount && matchesFundingStatus();
    });
    setFilteredInvestments(filtered);
  }, [investments, filters]);

  const handlePredict = async (investment) => {
    const userId = typeof investment.user_id === 'object' ? investment.user_id._id : investment.user_id;
  
    try {
      const res = await axios.get(`${API_BASE_URL}/profile-form/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (!res.data || !res.data._id) {
        alert('Prediction data is not available yet for this business.');
        return;
      }
  
      setPredictionData({
        ...res.data,
        user_id: investment.user_id,
        investment_id: investment._id,
        title: investment.title,
        image: investment.image,
        purpose: investment.purpose,
        reason: investment.reason,
        goalAmount: investment.goalAmount,
        currentContribution: investment.currentContribution
      });
      
      setShowPredictionModal(true);
    } catch (err) {
      console.error('Error fetching prediction fields:', err);
      alert(err.response?.data?.message || 'Failed to load prediction fields.');
    }
  };

  const handleCloseModal = () => {
    setShowPredictionModal(false);
    setPredictionData(null);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      riskLevel: 'All',
      category: 'All',
      minAmount: '',
      maxAmount: '',
      fundingStatus: 'All'
    });
  };

  const getFundingStatus = (investment) => {
    if (investment.currentContribution >= investment.goalAmount) {
      return 'Fully Funded';
    }
    const isNew = new Date(investment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return isNew ? 'New' : 'Funding';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return '#3b82f6';
      case 'Funding': return '#f59e0b';
      case 'Fully Funded': return '#10b981';
      default: return '#6b7280';
    }
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
      <div className="find-investments-header">
        <h1>💡 Find Investment Opportunities</h1>
        <button 
          className="mobile-filter-btn"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <FaFilter /> Filters
        </button>
      </div>

      <div className="find-investments-content">
        {/* Mobile Filters */}
        <div className={`mobile-filters ${showMobileFilters ? 'active' : ''}`}>
          <div className="filter-group">
            <label>🔍 Search</label>
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by title..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
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
            <label>📊 Funding Status</label>
            <select
              value={filters.fundingStatus}
              onChange={e => setFilters({ ...filters, fundingStatus: e.target.value })}
            >
              <option value="All">All Statuses</option>
              <option value="New">Newly Added</option>
              <option value="Funding">Still Funding</option>
              <option value="FullyFunded">Fully Funded</option>
            </select>
          </div>
        </div>

        {/* Desktop Filters */}
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
            <label>📊 Funding Status</label>
            <select
              value={filters.fundingStatus}
              onChange={e => setFilters({ ...filters, fundingStatus: e.target.value })}
            >
              <option value="All">All Statuses</option>
              <option value="New">Newly Added</option>
              <option value="Funding">Still Funding</option>
              <option value="FullyFunded">Fully Funded</option>
            </select>
          </div>
        </div>

        <div className="investment-grid">
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map(investment => {
              const fundingStatus = getFundingStatus(investment);
              const statusColor = getStatusColor(fundingStatus);
              const progressPercent = Math.min(100, (investment.currentContribution / investment.goalAmount) * 100);
              
              return (
                <div className="investment-card" key={investment._id}>
                  <div className="card-header">
                    <h3>{investment.title}</h3>
                    <div className="card-header-right">
                      <span 
                        className="investment-status"
                        style={{ backgroundColor: statusColor }}
                      >
                        {fundingStatus}
                      </span>
                      <span className={`investment-category ${investment.category?.toLowerCase()}`}>
                        {investment.category || 'Business'}
                      </span>
                    </div>
                  </div>
                  <img src={investment.image} alt={investment.title} />
                  
                  <div className="funding-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progressPercent}%`, backgroundColor: statusColor }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span>${investment.currentContribution?.toLocaleString() || '0'} raised</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                  </div>
                  
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
                      <span>Goal Amount:</span>
                      <strong>${investment.goalAmount?.toLocaleString() || '0'}</strong>
                    </div>
                    <div className="amount-info">
                      <span>Created:</span>
                      <strong>{new Date(investment.createdAt).toLocaleDateString()}</strong>
                    </div>
                  </div>
                  <div className="card-actions only-predict">
                    <button 
                      className="predict-btn" 
                      onClick={() => handlePredict(investment)}
                      disabled={fundingStatus === 'Fully Funded'}
                    >
                      <span className="robot-icon" role="img" aria-label="robot">🤖</span> 
                      {fundingStatus === 'Fully Funded' ? 'Fully Funded' : 'Predict'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              <p>No investment opportunities match your filters.</p>
              <button className="clear-filters-btn" onClick={clearFilters}>
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