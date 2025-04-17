import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './riskAnalysis.css';
import { PieChart, Pie, Cell } from 'recharts';
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaMoneyBillWave,
  FaWallet,
  FaChartPie,
} from 'react-icons/fa';

const data = [
  { name: 'Score', value: 74 },
  { name: 'Remaining', value: 26 }
];

const COLORS = ['#1d4ed8', '#e5e7eb'];

const RiskAnalysis = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`risk-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="risk-content">
        <TopBar />
        <h1><FaExclamationTriangle /> Risk Analysis</h1>

        {/* === Metrics === */}
        <div className="risk-metrics">
          {/* Total Expenses */}
          <div className="risk-metric-card green">
            <div className="top-icon-box">
              <FaWallet className="icon" />
            </div>
            <div className="info-box">
              <span>Total Expenses</span>
              <h3>$ 34,583</h3>
            </div>
            <FaInfoCircle className="info-icon" />
          </div>

          {/* Total Income */}
          <div className="risk-metric-card teal">
            <div className="top-icon-box">
              <FaMoneyBillWave className="icon" />
            </div>
            <div className="info-box">
              <span>Total Income</span>
              <h3>$ 24,583</h3>
            </div>
            <FaInfoCircle className="info-icon" />
          </div>

          {/* Score Pie */}
          <div className="pie-box">
            <PieChart width={160} height={160}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
            <div className="score-text">7.4/10</div>
          </div>
        </div>

        {/* === Risk Details === */}
        <div className="risk-cards">
          <div className="risk-card">
            <div className="risk-left">
              <h3>💸 EXPENSES RISK</h3>
              <p className="risk-level high">⚠️ High</p>
              <p>Your expenses are outweighing your revenue. Risk of cash flow shortage.</p>
            </div>
            <div className="risk-right">
              <FaChartPie className="risk-icon" />
            </div>
          </div>

          <div className="risk-card">
            <div className="risk-left">
              <h3>💰 INCOME RISK</h3>
              <p className="risk-level medium">⚠️ Medium</p>
              <p>Your income streams are steady but could be diversified further to lower future risks.</p>
            </div>
            <div className="risk-right">
              <FaChartPie className="risk-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
