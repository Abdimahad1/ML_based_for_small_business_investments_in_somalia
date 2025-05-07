import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import './buyBusiness.css';
import TopBar from '../BuisnessOwner/TopBar';

const BuyBusiness = () => {
  const { darkMode } = useContext(ThemeContext);
  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    industry: 'All',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/sell-business/public');
        setBusinesses(res.data);
        setError(null);
      } catch (err) {
        console.error('Error loading businesses:', err);
        setError('Failed to load businesses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const filteredList = businesses.filter((biz) => {
      const matchesSearch = biz.business.toLowerCase().includes(filters.search.toLowerCase());
      const matchesIndustry =
        filters.industry === 'All' || biz.industry.toLowerCase() === filters.industry.toLowerCase();
      const matchesMinPrice = !filters.minPrice || biz.price >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || biz.price <= Number(filters.maxPrice);
      return matchesSearch && matchesIndustry && matchesMinPrice && matchesMaxPrice;
    });

    setFiltered(filteredList);
  }, [filters, businesses]);

  if (loading) {
    return (
      <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
        <TopBar />
        <div className="buy-business-loading">
          <FaSpinner className="spinner" />
          <p>Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
        <TopBar />
        <div className="buy-business-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
      <div className="buy-business-container">
        <div className="buy-business-header">
          <h1>🛒 Buy a Business</h1>
        </div>

        <div className="buy-business-filters">
          <div className="buy-business-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by business name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="buy-business-filter-group">
            <label>💰 Price Range</label>
            <div className="amount-inputs">
              <input
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="buy-business-filter-group">
            <label>Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            >
              <option>All</option>
              <option>Retailer</option>
              <option>Electronics</option>
              <option>Tech</option>
              <option>SAAS</option>
              <option>Services</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="buy-business-cards">
          {filtered.length > 0 ? (
            filtered.map((biz) => (
              <div className="buy-business-card" key={biz._id}>
                <img
                  src={biz.logo ? `http://localhost:5000/uploads/${biz.logo}` : '/assets/default-business.png'}
                  alt="business"
                  className="buy-business-image"
                />

                <div className="buy-business-info">
                  <label>🏢 Business:</label>
                  <input type="text" value={biz.business} readOnly />

                  <label>🏬 Industry:</label>
                  <input type="text" value={biz.industry} readOnly />

                  <label>💰 Price:</label>
                  <input type="text" value={`$${biz.price.toLocaleString()}`} readOnly />

                  <label>📝 Reason:</label>
                  <input type="text" value={biz.reason} readOnly />

                  <label>📧 Contact:</label>
                  <input type="text" value={biz.contact} readOnly />
                </div>

                <div className="buy-business-actions">
                  <button className="contact-btn">📞 Contact</button>
                  <button className="buy-btn">🛒 Buy</button>
                </div>
              </div>
            ))
          ) : (
            <div className="buy-business-no-results">
              <p>No businesses match your filters.</p>
              <button onClick={() => setFilters({ search: '', industry: 'All', minPrice: '', maxPrice: '' })}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyBusiness;
