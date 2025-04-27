// src/BusinessOwner/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './dashboard.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#ef4444', '#22c55e']; // Red for Expenses, Green for Income

const Dashboard = () => {
  const token = localStorage.getItem('token');

  const [overview, setOverview] = useState({
    expenses: 0,
    income: 0,
    products_sold: 0
  });

  const [products, setProducts] = useState([]);

  const fetchOverview = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOverview({
        expenses: res.data.expenses,
        income: res.data.income,
        products_sold: res.data.products_sold
      });
    } catch (err) {
      console.error('Failed to load overview data', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchProducts();
  }, [token]);

  const sortedProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6);
  const highestSold = sortedProducts.length > 0 ? sortedProducts[0].sold : 0;

  const pieData = [
    { name: 'Expenses', value: overview.expenses },
    { name: 'Income', value: overview.income }
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <TopBar />
        <h1>Overview</h1>

        {/* Cards */}
        <div className="dashboard-cards">
          {/* Expenses Card */}
          <div className="overview-card expenses-card">
            <div className="overview-card__info">
              <div>
                <h3>Expenses</h3>
                <p>${overview.expenses.toLocaleString()}</p>
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
                alt="expenses"
              />
            </div>
          </div>

          {/* Income Card */}
          <div className="overview-card income-card">
            <div className="overview-card__info">
              <div>
                <h3>Income</h3>
                <p>${overview.income.toLocaleString()}</p>
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/4290/4290854.png"
                alt="income"
              />
            </div>
          </div>

          {/* Product Sold Card */}
          <div className="overview-card sold-card">
            <div className="overview-card__info">
              <div>
                <h3>Product Sold</h3>
                <p>{overview.products_sold.toLocaleString()}</p>
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/9343/9343756.png"
                alt="sold"
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="dashboard-charts">
          {/* ✅ Dynamic Pie Chart */}
          <div className="chart-box">
            <h3>Expenses vs Income</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="product-box">
            <div className="product-box__header">
              <h3>Top Products</h3>
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
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>{product.name}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{
                              width: highestSold ? `${(product.sold / highestSold) * 100}%` : '0%'
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>{product.sold}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      No top products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
