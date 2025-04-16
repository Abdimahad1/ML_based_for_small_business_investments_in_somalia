// src/BuisnessOwner/Dashboard.jsx
import React from 'react';
import Sidebar from './sidebar';
import './dashboard.css';
import { FaEllipsisH } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Saturday', income: 40000, expenses: 30000 },
  { day: 'Sunday', income: 52000, expenses: 41000 },
  { day: 'Monday', income: 35000, expenses: 40000 },
  { day: 'Tuesday', income: 12000, expenses: 39000 },
  { day: 'Wednesday', income: 39000, expenses: 28000 },
  { day: 'Thursday', income: 45000, expenses: 7000 },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <h1>Overview</h1>

        {/* Overview Cards */}
        <div className="dashboard-cards">
          <div className="overview-card">
            <FaEllipsisH className="overview-card__menu" />
            <div className="overview-card__info">
              <div>
                <h3>Customers</h3>
                <p>23,000</p>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/3771/3771539.png" alt="customers" />
            </div>
          </div>

          <div className="overview-card">
            <FaEllipsisH className="overview-card__menu" />
            <div className="overview-card__info">
              <div>
                <h3>Income</h3>
                <p>$ 40,456</p>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/4290/4290854.png" alt="income" />
            </div>
          </div>

          <div className="overview-card">
            <FaEllipsisH className="overview-card__menu" />
            <div className="overview-card__info">
              <div>
                <h3>Product Sold</h3>
                <p>90,457</p>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/9343/9343756.png" alt="sold" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts">
          <div className="chart-box">
            <h3>Total Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expenses" fill="#14532d" name="Expenses" />
                <Bar dataKey="income" fill="#4338ca" name="Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="product-box">
  <div className="product-box__header">
    <h3>Top Products</h3>
    <button className="view-all-btn">
      View All Products <span role="img" aria-label="eye">👁️</span>
    </button>
  </div>

  <table className="top-products-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Popularity</th>
        <th>Sold</th>
      </tr>
    </thead>
    <tbody>
      {[
        { name: "School Uniforms", percent: 96 },
        { name: "Dirac", percent: 84 },
        { name: "Hijab", percent: 76 },
        { name: "Khamis", percent: 62 },
        { name: "T-shirts & Jeans", percent: 45 },
        { name: "Macawiis", percent: 34 },
      ].map((product, index) => (
        <tr key={index}>
          <td>#</td>
          <td>{product.name}</td>
          <td>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${product.percent}%` }}></div>
            </div>
          </td>
          <td>
            <span className="sold-badge">{product.percent}%</span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
