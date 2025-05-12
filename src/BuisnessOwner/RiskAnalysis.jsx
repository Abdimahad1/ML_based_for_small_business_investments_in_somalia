// src/BusinessOwner/RiskAnalysis.jsx

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

const COLORS = ['#1d4ed8', '#e5e7eb'];

const RiskAnalysis = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = localStorage.getItem('token');

  const [overview, setOverview] = useState({
    expenses: 0,
    income: 0
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOverview({
          expenses: res.data.expenses,
          income: res.data.income
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
    { name: 'Remaining', value: 10 - (Math.round(score * 10) / 10) }
  ];

  const isRisky = expenses > income;

  const expenseRiskTitle = isRisky ? "⚠️ High" : "✅ Stable";
  const incomeRiskTitle = isRisky ? "⚠️ Medium" : "✅ Safe";

  const expenseRiskMessage = isRisky
    ? "Your expenses are outweighing your revenue. Risk of cash flow shortage."
    : "Your expenses are well-managed compared to your income.";

  const incomeRiskMessage = isRisky
    ? "Your income streams are steady but could be diversified further to lower future risks."
    : "Your income exceeds your expenses. Business is financially healthy.";

  const ExpenseIcon = isRisky ? FaExclamationTriangle : FaCheckCircle;
  const IncomeIcon = isRisky ? FaExclamationTriangle : FaCheckCircle;

  return (
    <div className={`risk-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="risk-content">
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
              <h3>${expenses.toLocaleString()}</h3>
            </div>
          </div>

          {/* Total Income */}
          <div className="risk-metric-card teal">
            <div className="top-icon-box">
              <FaMoneyBillWave className="icon" />
            </div>
            <div className="info-box">
              <span>Total Income</span>
              <h3>${income.toLocaleString()}</h3>
            </div>
          </div>

          {/* Score Pie */}
          <div className="pie-box">
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
            <div className="score-text">{score.toFixed(1)}/10</div>
          </div>
        </div>

        {/* === Risk Details === */}
        <div className="risk-cards">
          {/* Expenses Risk */}
          <div className="risk-card">
            <div className="risk-left">
              <h3>💸 EXPENSES RISK</h3>
              <p className={`risk-level ${isRisky ? 'high' : 'stable'}`}>
                <ExpenseIcon className="risk-icon-mini" /> {expenseRiskTitle}
              </p>
              <p>{expenseRiskMessage}</p>
            </div>
            <div className="risk-right">
              <FaChartPie className="risk-icon" />
            </div>
          </div>

          {/* Income Risk */}
          <div className="risk-card">
            <div className="risk-left">
              <h3>💰 INCOME RISK</h3>
              <p className={`risk-level ${isRisky ? 'medium' : 'safe'}`}>
                <IncomeIcon className="risk-icon-mini" /> {incomeRiskTitle}
              </p>
              <p>{incomeRiskMessage}</p>
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
