import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './riskAnalysis.css';
import { PieChart, Pie, Cell } from 'recharts';
import {
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaWallet,
  FaChartPie,
  FaCheckCircle,
} from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COLORS = ['#1d4ed8', '#e5e7eb'];

const RiskAnalysis = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = sessionStorage.getItem('token');

  const [overview, setOverview] = useState({ expenses: 0, income: 0 });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOverview({
          expenses: res.data.expenses,
          income: res.data.income,
        });
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      }
    };
    fetchOverview();
  }, [token]);

  const { expenses, income } = overview;
  const total = expenses + income;
  const score = total > 0 ? (income / total) * 10 : 0;

  const pieData = [
    { name: 'Score', value: Math.round(score * 10) / 10 },
    { name: 'Remaining', value: 10 - (Math.round(score * 10) / 10) },
  ];

  const isRisky = expenses > income;
  const expenseRiskTitle = isRisky ? '⚠️ High' : '✅ Stable';
  const incomeRiskTitle = isRisky ? '⚠️ Medium' : '✅ Safe';

  const expenseRiskMessage = isRisky
    ? 'Your expenses are outweighing your revenue. Risk of cash flow shortage.'
    : 'Your expenses are well-managed compared to your income.';
  const incomeRiskMessage = isRisky
    ? 'Your income streams are steady but could be diversified further to lower future risks.'
    : 'Your income exceeds your expenses. Business is financially healthy.';

  const ExpenseIcon = isRisky ? FaExclamationTriangle : FaCheckCircle;
  const IncomeIcon = isRisky ? FaExclamationTriangle : FaCheckCircle;

  return (
    <div className={`risk-anly-container ${darkMode ? 'risk-anly-dark' : ''}`}>
      <Sidebar />
      <div className="risk-anly-content">
        <h1 className="risk-anly-header-title">
          <FaExclamationTriangle /> Risk Analysis
        </h1>

        {/* === Metrics === */}
        <div className="risk-anly-metrics">
          <div className="risk-anly-metric-card green">
            <div className="risk-anly-icon-box">
              <FaWallet className="risk-anly-icon" />
            </div>
            <div className="risk-anly-info-box">
              <span>Total Expenses</span>
              <h3>${expenses.toLocaleString()}</h3>
            </div>
          </div>

          <div className="risk-anly-metric-card teal">
            <div className="risk-anly-icon-box">
              <FaMoneyBillWave className="risk-anly-icon" />
            </div>
            <div className="risk-anly-info-box">
              <span>Total Income</span>
              <h3>${income.toLocaleString()}</h3>
            </div>
          </div>

          <div className="risk-anly-pie-box">
            <PieChart width={160} height={160}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
            <div className="risk-anly-score-text">{score.toFixed(1)}/10</div>
          </div>
        </div>

        {/* === Risk Details === */}
        <div className="risk-anly-risk-cards">
          <div className="risk-anly-risk-card">
            <div className="risk-anly-left">
              <h3>💸 EXPENSES RISK</h3>
              <p className={`risk-anly-level ${isRisky ? 'high' : 'stable'}`}>
                <ExpenseIcon className="risk-anly-icon-mini" /> {expenseRiskTitle}
              </p>
              <p>{expenseRiskMessage}</p>
            </div>
            <div className="risk-anly-right">
              <FaChartPie className="risk-anly-right-icon" />
            </div>
          </div>

          <div className="risk-anly-risk-card">
            <div className="risk-anly-left">
              <h3>💰 INCOME RISK</h3>
              <p className={`risk-anly-level ${isRisky ? 'medium' : 'safe'}`}>
                <IncomeIcon className="risk-anly-icon-mini" /> {incomeRiskTitle}
              </p>
              <p>{incomeRiskMessage}</p>
            </div>
            <div className="risk-anly-right">
              <FaChartPie className="risk-anly-right-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
