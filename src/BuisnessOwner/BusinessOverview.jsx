// src/BusinessOwner/BusinessOverview.jsx

import React, { useContext, useState, useEffect } from 'react';
import './BusinessOverview.css';
import {
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArchive,
} from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import TopBar from './TopBar';
import Sidebar from './sidebar';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import TransactionDetailsModal from './TransactionDetailsModal'; // ✅ Correct path

const COLORS = ['#16a34a', '#16a34a', '#16a34a'];

const BusinessOverview = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = localStorage.getItem('token');

  const [overview, setOverview] = useState({
    expenses: 0,
    income: 0,
    products_sold: 0,
    products_total: 0,
    locations: 0,
  });

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState(''); // 'expense', 'income', 'sold'

  const fetchOverview = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverview({
        expenses: res.data.expenses,
        income: res.data.income,
        products_sold: res.data.products_sold,
        products_total: res.data.products_total || 0,
        locations: res.data.locations,
      });
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [token]);

  const openTransactionModal = (type) => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setTransactionType('');
  };

  // === Risk Calculation ===
  const isRisky = overview.expenses > overview.income;
  const RiskIcon = isRisky ? FaExclamationTriangle : FaCheckCircle;
  const riskTitle = isRisky ? "Warning" : "Good Standing";
  const riskMessage = isRisky
    ? "Your expenses are higher than your income. You are at financial risk."
    : "Your income exceeds expenses. Business is financially healthy.";
  const riskTextColor = isRisky ? "red" : "green";

  const growthData = [
    { name: '2023', value: 25 },
    { name: '2024', value: 25 },
    { name: '2025', value: 50 },
  ];

  return (
    <div className={`overview-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="overview-content">
        <TopBar />
        <h1>Dahab shop</h1>

        {/* Overview Cards */}
        <div className="metric-cards">
          {/* Total Expenses */}
          <div className="metric-card green">
            <FaInfoCircle
              className="metric-info-icon"
              onClick={() => openTransactionModal('expense')}
              title="View Expenses Details"
            />
            <div className="metric-icon"><FaMoneyBillWave /></div>
            <div className="metric-details">
              <p>Total Expenses</p>
              <h3>${overview.expenses.toLocaleString()}</h3>
            </div>
          </div>

          {/* Total Products Sold */}
          <div className="metric-card purple">
            <FaInfoCircle
              className="metric-info-icon"
              onClick={() => openTransactionModal('sold')}
              title="View Products Sold Details"
            />
            <div className="metric-icon"><FaShoppingCart /></div>
            <div className="metric-details">
              <p>Total Products Sold</p>
              <h3>{overview.products_sold.toLocaleString()}</h3>
            </div>
          </div>

          {/* Total Income */}
          <div className="metric-card teal">
            <FaInfoCircle
              className="metric-info-icon"
              onClick={() => openTransactionModal('income')}
              title="View Income Details"
            />
            <div className="metric-icon"><FaBoxOpen /></div>
            <div className="metric-details">
              <p>Total Income</p>
              <h3>${overview.income.toLocaleString()}</h3>
            </div>
          </div>

          {/* Locations */}
          <div className="metric-card dark-blue">
            <div className="metric-icon"><FaMapMarkerAlt /></div>
            <div className="metric-details">
              <p>Locations</p>
              <h3>{overview.locations}</h3>
            </div>
          </div>
        </div>

        {/* Risk + Growth Section */}
        <div className="lower-section">
          <div className="risk-box">
            <div className="risk-header">
              <h3 style={{ color: riskTextColor }}>Risk Level</h3>
              <RiskIcon style={{ color: riskTextColor }} />
            </div>
            <div className="risk-body">
              <div className="risk-warning" style={{ color: riskTextColor }}>
                <RiskIcon className="warning-icon" />
                <span>{riskTitle}</span>
              </div>
              <p className="risk-text">
                {riskMessage}
              </p>
              <img
                src={isRisky
                  ? "https://cdn-icons-png.flaticon.com/512/2630/2630492.png"
                  : "https://cdn-icons-png.flaticon.com/512/595/595728.png"
                }
                alt="Risk Level"
                className="risk-img"
              />
            </div>
          </div>

          <div className="growth-box">
            <h3>Business Growth Last 3 Years</h3>
            <p>Last years your business is doing great, it is growing well and higher than before.</p>
            <div className="growth-chart">
              <PieChart width={200} height={200}>
                <Pie
                  data={growthData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="growth-legend">
                <p><strong>2023</strong> (25% ↑)</p>
                <p><strong>2024</strong> (25% ↑)</p>
                <p><strong>2025</strong> (50% ↑)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Modal */}
        <TransactionDetailsModal
          show={showTransactionModal}
          onClose={closeTransactionModal}
          type={transactionType}
        />
      </div>
    </div>
  );
};

export default BusinessOverview;
