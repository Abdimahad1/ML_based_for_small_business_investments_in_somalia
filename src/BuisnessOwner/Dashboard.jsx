import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './dashboard.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiArrowUp, FiArrowDown } from 'react-icons/fi';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = ['#ef4444', '#22c55e'];

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    expenses: 0,
    income: 0,
    products_sold: 0,
    previous_period: {
      expenses: 0,
      income: 0,
      products_sold: 0
    }
  });

  const [products, setProducts] = useState([]);

  const fetchOverview = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOverview({
        expenses: res.data.expenses,
        income: res.data.income,
        products_sold: res.data.products_sold,
        previous_period: res.data.previous_period || {
          expenses: 0,
          income: 0,
          products_sold: 0
        }
      });
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, {
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

  const calculateChange = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <TopBar />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Overview
        </motion.h1>

        <AnimatePresence>
          {loading ? (
            <motion.div 
              className="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner"></div>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="overview-section-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="dashboard-cards">
                  <motion.div 
                    className="overview-card expenses-card"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="overview-card__info">
                      <div>
                        <h3>Expenses</h3>
                        <p>${overview.expenses.toLocaleString()}</p>
                        <div className="trend-indicator">
                          {calculateChange(overview.expenses, overview.previous_period.expenses) > 0 ? (
                            <FiArrowUp className="trend-up" />
                          ) : (
                            <FiArrowDown className="trend-down" />
                          )}
                          <span>
                            {Math.abs(calculateChange(overview.expenses, overview.previous_period.expenses)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <motion.img
                        src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
                        alt="expenses"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="overview-card income-card"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="overview-card__info">
                      <div>
                        <h3>Income</h3>
                        <p>${overview.income.toLocaleString()}</p>
                        <div className="trend-indicator">
                          {calculateChange(overview.income, overview.previous_period.income) > 0 ? (
                            <FiArrowUp className="trend-up" />
                          ) : (
                            <FiArrowDown className="trend-down" />
                          )}
                          <span>
                            {Math.abs(calculateChange(overview.income, overview.previous_period.income)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <motion.img
                        src="https://cdn-icons-png.flaticon.com/512/4290/4290854.png"
                        alt="income"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="overview-card sold-card"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="overview-card__info">
                      <div>
                        <h3>Product Sold</h3>
                        <p>{overview.products_sold.toLocaleString()}</p>
                        <div className="trend-indicator">
                          {calculateChange(overview.products_sold, overview.previous_period.products_sold) > 0 ? (
                            <FiArrowUp className="trend-up" />
                          ) : (
                            <FiArrowDown className="trend-down" />
                          )}
                          <span>
                            {Math.abs(calculateChange(overview.products_sold, overview.previous_period.products_sold)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <motion.img
                        src="https://cdn-icons-png.flaticon.com/512/9343/9343756.png"
                        alt="sold"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="dashboard-charts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div 
                  className="chart-box"
                  whileHover={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                >
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
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  className="product-box"
                  whileHover={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="product-box__header">
                    <h3>Top Products</h3>
                    <div className="trending-icon">
                      <FiTrendingUp size={20} />
                    </div>
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
                          <motion.tr 
                            key={product._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                          >
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>
                              <div className="progress-bar">
                                <motion.div
                                  className="progress"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: highestSold ? `${(product.sold / highestSold) * 100}%` : '0%'
                                  }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                ></motion.div>
                              </div>
                            </td>
                            <td>{product.sold}</td>
                          </motion.tr>
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
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;