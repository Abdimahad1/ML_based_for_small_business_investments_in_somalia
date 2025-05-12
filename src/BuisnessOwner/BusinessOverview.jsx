// src/BusinessOwner/BusinessOverview.jsx

import React, { useContext, useState, useEffect } from 'react';
import './BusinessOverview.css';
import {
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaEllipsisV,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import TopBar from './TopBar';
import Sidebar from './sidebar';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import TransactionDetailsModal from './TransactionDetailsModal';
import LocationModal from './LocationModal';

const COLORS = ['#16a34a', '#16a34a', '#16a34a'];

const BusinessOverview = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = localStorage.getItem('token');

  const [overview, setOverview] = useState({
    expenses: 0,
    income: 0,
    products_sold: 0,
    products_total: 0,
  });

  const [locationsCount, setLocationsCount] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    fetchOverview();
    fetchLocations();
  }, [token]);

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
      });
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocationsCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const openTransactionModal = (type) => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setTransactionType('');
  };

  const openLocationModal = () => {
    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
  };

  // 🛠 Now handle location update and send notification
  const handleLocationUpdate = async (newLocation) => {
    try {
      await fetchLocations();
      if (newLocation) {
        await createNotification(
          'New Branch Opened',
          `You opened a new branch "${newLocation.name}" in ${newLocation.city}.`
        );
      }
    } catch (error) {
      console.error('Failed to update locations:', error);
    }
  };

  const createNotification = async (title, message) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/notifications', { title, message }, config);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const openProductsModal = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const soldProducts = res.data
        .filter(product => product.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 20);
      setProductsList(soldProducts);
      setShowProductsModal(true);
    } catch (err) {
      console.error('Failed to fetch sold products:', err);
    }
  };

  const closeProductsModal = () => {
    setShowProductsModal(false);
  };

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
        <h1>Dahab Shop</h1>

        {/* Metric Cards */}
        <div className="metric-cards">
          {/* Expenses */}
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

          {/* Products Sold */}
          <div className="metric-card purple">
            <FaInfoCircle
              className="metric-info-icon"
              onClick={openProductsModal}
              title="View Products Sold"
            />
            <div className="metric-icon"><FaShoppingCart /></div>
            <div className="metric-details">
              <p>Total Products Sold</p>
              <h3>{overview.products_sold.toLocaleString()}</h3>
            </div>
          </div>

          {/* Income */}
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
            <FaEllipsisV
              className="metric-info-icon"
              onClick={openLocationModal}
              title="Manage Locations"
            />
            <div className="metric-icon"><FaMapMarkerAlt /></div>
            <div className="metric-details">
              <p>Locations</p>
              <h3>{locationsCount}</h3>
            </div>
          </div>
        </div>

        {/* Risk Section */}
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
              <p className="risk-text">{riskMessage}</p>
              <img
                src={isRisky
                  ? "https://cdn-icons-png.flaticon.com/512/2630/2630492.png"
                  : "https://cdn-icons-png.flaticon.com/512/595/595728.png"}
                alt="Risk Level"
                className="risk-img"
              />
            </div>
          </div>

          {/* Growth Section */}
          <div className="growth-box">
            <h3>Business Growth Last 3 Years</h3>
            <p>Last years your business is growing steadily.</p>
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

        {/* Modals */}
        <TransactionDetailsModal
          show={showTransactionModal}
          onClose={closeTransactionModal}
          type={transactionType}
        />
        <LocationModal
          show={showLocationModal}
          onClose={closeLocationModal}
          onLocationUpdate={handleLocationUpdate}
        />
        {showProductsModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>Sold Products</h2>
                <button onClick={closeProductsModal} className="close-btn">X</button>
              </div>
              <div className="modal-content">
                {productsList.length > 0 ? (
                  <ul>
                    {productsList.map((product) => (
                      <li key={product._id}>{product.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No sold products found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOverview;
