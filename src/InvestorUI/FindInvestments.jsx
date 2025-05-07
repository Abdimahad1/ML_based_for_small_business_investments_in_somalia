import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './findInvestments.css';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import TopBar from '../BuisnessOwner/TopBar';

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

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/investments/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestments(res.data);
        setError(null);
      } catch (err) {
        console.error('Error loading investments:', err);
        setError('Failed to load investments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [token]);

  useEffect(() => {
    // Apply all filters
    const filtered = investments.filter(investment => {
      const matchesSearch = investment.title.toLowerCase().includes(filters.search.toLowerCase());
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

  const handlePredict = async (investmentId) => {
    try {
      // Add your prediction logic here
      console.log('Predicting for investment:', investmentId);
      // You would typically call your prediction API here
    } catch (err) {
      console.error('Prediction failed:', err);
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
      </div>

      <div className="find-investments-content">
        <div className="filters-row">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>💰 Amount Range</label>
            <div className="amount-inputs">
              <input 
                type="number" 
                placeholder="Min $" 
                value={filters.minAmount}
                onChange={e => setFilters({...filters, minAmount: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Max $" 
                value={filters.maxAmount}
                onChange={e => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Filter By</label>
            <select
              value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}
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
                    <strong>${investment.goalAmount.toLocaleString()}</strong>
                  </div>
                  <div className="amount-info">
                    <span>Raised:</span>
                    <strong>${investment.currentContribution.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="view-btn">🔍 View</button>
                  <button 
                    className="predict-btn"
                    onClick={() => handlePredict(investment._id)}
                  >
                    🧠 Predict
                  </button>
                  <button className="invest-btn">💰 Invest</button>
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
    </div>
  );
};

export default FindInvestments;