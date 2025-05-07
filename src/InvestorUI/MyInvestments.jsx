import React, { useContext } from 'react';
import {
  FaSearch,
  FaChartLine,
  FaDollarSign,
  FaCheckCircle,
  FaPercentage
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import TopBar from '../BuisnessOwner/TopBar';
import './MyInvestments.css';

const MyInvestments = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const investments = [
    {
      id: 1,
      title: "Expansion of Local Grocery Store",
      amount: 25000,
      roi: 18,
      risk: 'Low',
      image: '/grocery-store.png'
    },
    {
      id: 2,
      title: "Rural Tech Hub Development",
      amount: 32000,
      roi: 22,
      risk: 'Medium',
      image: '/tech-hub.png'
    },
    {
      id: 3,
      title: "Sustainable Farming Initiative",
      amount: 18000,
      roi: 15,
      risk: 'Low',
      image: '/farming.png'
    }
  ];

  return (
    <div className={`my-investments-dashboard ${darkMode ? 'dark' : ''}`}>
      <TopBar />

      <div className="my-investments-wrapper">
        <h1 className="my-investments-title">My Investments</h1>

        {/* Search Bar */}
        <div className="my-investments-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search investments..."
            className="my-investments-search-input"
          />
        </div>

        {/* Stat Boxes */}
        <div className="my-investments-stats-section">
          <div className="stat-box orange">
            <div className="stat-text">
              <p>Active</p>
              <h3>3</h3>
            </div>
            <FaCheckCircle className="stat-icon" />
          </div>
          <div className="stat-box green">
            <div className="stat-text">
              <p>Total Invested</p>
              <h3>$120,000</h3>
            </div>
            <FaDollarSign className="stat-icon" />
          </div>
          <div className="stat-box blue">
            <div className="stat-text">
              <p>ROI</p>
              <h3>12%</h3>
            </div>
            <FaChartLine className="stat-icon" />
          </div>
        </div>

        {/* Investment Cards */}
        <div className="my-investments-cards">
          {investments.map((inv) => (
            <div key={inv.id} className="my-investments-card">
              <h3 className="my-investments-card-title">{inv.title}</h3>
              <div className="my-investments-image-container">
                <img src={inv.image} alt={inv.title} className="my-investments-img" />
              </div>
              <div className="my-investments-metrics">
                <div className="my-investments-metric">
                  <span className="metric-label">Amount</span>
                  <span className="metric-value">${inv.amount}</span>
                </div>
                <div className="my-investments-metric">
                  <span className="metric-label">ROI</span>
                  <span className="metric-value">{inv.roi}%</span>
                </div>
                <div className="my-investments-metric">
                  <span className="metric-label">Risk</span>
                  <span className="metric-value">{inv.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyInvestments;
