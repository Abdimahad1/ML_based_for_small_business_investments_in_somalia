// src/BuisnessOwner/BusinessOverview.jsx
import React, { useContext } from 'react';
import './BusinessOverview.css';
import {
  FaCalendarAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaArrowRight,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import TopBar from './TopBar';
import Sidebar from './sidebar';
import { ThemeContext } from '../context/ThemeContext'; // ✅ import theme context

const data = [
  { name: '2023', value: 25 },
  { name: '2024', value: 25 },
  { name: '2025', value: 50 },
];
const COLORS = ['#16a34a', '#16a34a', '#16a34a'];

const BusinessOverview = () => {
  const { darkMode } = useContext(ThemeContext); // ✅ get theme

  return (
    <div className={`overview-container ${darkMode ? 'dark' : ''}`}> {/* ✅ dynamic class */}
      <Sidebar />
      <div className="overview-content">
        <TopBar />
        <h1>Dahab shop</h1>

        {/* Filters */}
        <div className="filters">
          <div className="filter-box">
            <label>Auto Date Range</label>
            <div className="filter-value"><FaCalendarAlt /> This Week</div>
          </div>
          <div className="filter-box">
            <label>Category</label>
            <select>
              <option>All</option>
              <option>Electronics</option>
              <option>Clothes</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="metric-cards">
          <div className="metric-card green">
            <div className="metric-icon"><FaMoneyBillWave /></div>
            <div className="metric-details">
              <p>Total Expenses</p>
              <h3>$ 34,583</h3>
            </div>
            <FaArrowRight className="metric-arrow" />
          </div>

          <div className="metric-card purple">
            <div className="metric-icon"><FaShoppingCart /></div>
            <div className="metric-details">
              <p>Total Products Sold</p>
              <h3>560,583</h3>
            </div>
            <FaArrowRight className="metric-arrow" />
          </div>

          <div className="metric-card teal">
            <div className="metric-icon"><FaBoxOpen /></div>
            <div className="metric-details">
              <p>Total Income</p>
              <h3>$ 24,583</h3>
            </div>
            <FaArrowRight className="metric-arrow" />
          </div>

          <div className="metric-card dark-blue">
            <div className="metric-icon"><FaMapMarkerAlt /></div>
            <div className="metric-details">
              <p>Locations</p>
              <h3>3</h3>
            </div>
            <FaArrowRight className="metric-arrow" />
          </div>
        </div>

        {/* Risk + Growth Section */}
        <div className="lower-section">
          <div className="risk-box">
            <div className="risk-header">
              <h3>Risk Level</h3>
              <FaArrowRight />
            </div>
            <div className="risk-body">
              <div className="risk-warning">
                <FaExclamationTriangle className="warning-icon" />
                <span>Warning</span>
              </div>
              <p className="risk-text">
                High Risk Level detected, your income and profits are lower than your expenses,
                so you are at risk. <br /> Your income must proceed your Expenses
              </p>
              <img
                src="https://cdn-icons-png.flaticon.com/512/2630/2630492.png"
                alt="Risk"
                className="risk-img"
              />
            </div>
          </div>

          <div className="growth-box">
            <h3>Business Growth Last 3 Years</h3>
            <p>
              Last years your business is doing great, it is growing well and higher before it was
            </p>
            <div className="growth-chart">
              <PieChart width={200} height={200}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {data.map((entry, index) => (
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
      </div>
    </div>
  );
};

export default BusinessOverview;
