import React, { useContext, useState, useEffect, useMemo } from 'react';
import './BusinessOverview.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import TopBar from './TopBar';
import Sidebar from './sidebar';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import TransactionDetailsModal from './TransactionDetailsModal';
import LocationModal from './LocationModal';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BusinessOverview = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = localStorage.getItem('token');

  const [overview, setOverview] = useState({
    expenses: 0,
    income: 0,
    products_sold: 0,
    products_total: 0,
  });

  const [products, setProducts] = useState([]);
  const [locationsCount, setLocationsCount] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [highlightedProduct, setHighlightedProduct] = useState(null);

  useEffect(() => {
    fetchOverview();
    fetchLocations();
    fetchProducts();
  }, [token]);

  const fetchOverview = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/overview`, { headers: { Authorization: `Bearer ${token}` } });

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
      const res = await axios.get(`${API_BASE_URL}/api/locations`, { headers: { Authorization: `Bearer ${token}` } });

      setLocationsCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } });

      setProducts(res.data);
      setProductsList(res.data.filter(product => product.sold > 0));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const productSalesData = useMemo(() => {
    let filteredProducts = [...products];
    
    const now = new Date();
    if (timeRange === 'year') {
      filteredProducts = filteredProducts.filter(p => 
        new Date(p.updatedAt).getFullYear() === now.getFullYear()
      );
    } else if (timeRange === 'month') {
      filteredProducts = filteredProducts.filter(p => {
        const updated = new Date(p.updatedAt);
        return updated.getFullYear() === now.getFullYear() && 
               updated.getMonth() === now.getMonth();
      });
    } else if (timeRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredProducts = filteredProducts.filter(p => 
        new Date(p.updatedAt) >= oneWeekAgo
      );
    }

    let revenue = 0;
    let expenses = 0;
    
    const productData = filteredProducts
      .filter(p => p.sold > 0)
      .map(p => {
        const productRevenue = p.price * p.sold;
        const productExpenses = p.original_price * p.sold;
        revenue += productRevenue;
        expenses += productExpenses;
        
        return {
          id: p._id,
          name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
          Revenue: productRevenue,
          Expenses: productExpenses,
          Profit: productRevenue - productExpenses,
          highlight: p._id === highlightedProduct
        };
      })
      .sort((a, b) => b.Revenue - a.Revenue)
      .slice(0, 10);

    setTotalRevenue(revenue);
    setTotalExpenses(expenses);
    setTotalProfit(revenue - expenses);

    return productData;
  }, [products, timeRange, highlightedProduct]);

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

  const openProductsModal = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } });

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

  const handleBarHover = (data, index) => {
    if (data && data.activePayload) {
      setHighlightedProduct(data.activePayload[0].payload.id);
    }
  };

  const handleBarLeave = () => {
    setHighlightedProduct(null);
  };

  const isRisky = overview.expenses > overview.income;
  const RiskIcon = isRisky ? FaExclamationTriangle : FaCheckCircle;
  const riskTitle = isRisky ? "Warning" : "Good Standing";
  const riskMessage = isRisky
    ? "Your expenses are higher than your income. You are at financial risk."
    : "Your income exceeds expenses. Business is financially healthy.";
  const riskTextColor = isRisky ? "red" : "green";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Business Overview Report', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add summary section
    doc.setFontSize(16);
    doc.text('Financial Summary', 14, 45);
    
    doc.setFontSize(12);
    doc.text(`Total Income: $${overview.income.toLocaleString()}`, 14, 55);
    doc.text(`Total Expenses: $${overview.expenses.toLocaleString()}`, 14, 65);
    doc.text(`Net Profit: $${(overview.income - overview.expenses).toLocaleString()}`, 14, 75);
    doc.text(`Products Sold: ${overview.products_sold.toLocaleString()}`, 14, 85);
    
    // Add risk assessment
    doc.setFontSize(16);
    doc.text('Risk Assessment', 14, 105);
    
    doc.setFontSize(12);
    doc.text(isRisky ? '⚠️ Warning: Expenses exceed income' : '✅ Healthy: Income exceeds expenses', 14, 115);
    doc.text(riskMessage, 14, 125, { maxWidth: 180 });
    
    // Add top products table
    doc.setFontSize(16);
    doc.text('Top Selling Products', 14, 145);
    
    const topProducts = products
      .filter(p => p.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
    
    if (topProducts.length > 0) {
      const tableData = topProducts.map(product => [
        product.name,
        product.sold,
        `$${product.price.toLocaleString()}`,
        `$${(product.price * product.sold).toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: 155,
        head: [['Product Name', 'Units Sold', 'Price', 'Total Revenue']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: darkMode ? [50, 50, 50] : [200, 200, 200],
          textColor: darkMode ? [255, 255, 255] : [0, 0, 0]
        },
        styles: {
          cellPadding: 5,
          fontSize: 10,
          textColor: darkMode ? [255, 255, 255] : [0, 0, 0],
          fillColor: darkMode ? [30, 30, 30] : [255, 255, 255]
        }
      });
    } else {
      doc.text('No products sold yet', 14, 155);
    }
    
    // Save the PDF
    doc.save('business_overview_report.pdf');
  };

  return (
    <div className={`overview-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="overview-content">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
        >
          Business Overview
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`print-btn ${darkMode ? 'dark' : ''}`}
            onClick={generatePDFReport}
          >
            Generate Business Report
          </motion.button>
        </motion.h1>

        {/* Metric Cards */}
        <motion.div 
          className="metric-cards"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Expenses */}
          <motion.div 
            className="metric-card green"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
          >
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
          </motion.div>

          {/* Products Sold */}
          <motion.div 
            className="metric-card purple"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
          >
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
          </motion.div>

          {/* Income */}
          <motion.div 
            className="metric-card teal"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
          >
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
          </motion.div>

          {/* Locations */}
          <motion.div 
            className="metric-card dark-blue"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
          >
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
          </motion.div>
        </motion.div>

        {/* Risk Section */}
        <motion.div 
          className="lower-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="risk-box"
            whileHover={{ y: -5 }}
          >
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
          </motion.div>

          {/* Sales Analytics Section */}
          <motion.div 
            className="growth-box"
            whileHover={{ y: -5 }}
          >
            <h3>Product Sales Analytics</h3>
            <p>Detailed revenue and expenses by product</p>
            
            {loading ? (
              <div className="loading-spinner">Loading sales data...</div>
            ) : productsList.length > 0 ? (
              <>
                <div className="chart-controls">
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="time-selector"
                  >
                    <option value="all">All Time</option>
                    <option value="year">This Year</option>
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={productSalesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    layout="vertical"
                    onMouseMove={handleBarHover}
                    onMouseLeave={handleBarLeave}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Revenue') return [`$${value.toLocaleString()}`, name];
                        if (name === 'Expenses') return [`$${value.toLocaleString()}`, name];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="Revenue" 
                      fill="#16a34a" 
                      name="Revenue (Price × Sold)"
                      animationDuration={1500}
                    >
                      {productSalesData.map((entry, index) => (
                        <Cell 
                          key={`revenue-cell-${index}`} 
                          fill={entry.highlight ? '#f59e0b' : '#16a34a'}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="Expenses" 
                      fill="#ef4444" 
                      name="Expenses (Cost × Sold)"
                      animationDuration={1500}
                    >
                      {productSalesData.map((entry, index) => (
                        <Cell 
                          key={`expense-cell-${index}`} 
                          fill={entry.highlight ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="sales-summary">
                  <div className="summary-card">
                    <h5>Total Revenue</h5>
                    <p>${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="summary-card">
                    <h5>Total Expenses</h5>
                    <p>${totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="summary-card">
                    <h5>Total Profit</h5>
                    <p style={{ color: totalProfit >= 0 ? '#16a34a' : '#ef4444' }}>
                      ${Math.abs(totalProfit).toLocaleString()} 
                      {totalProfit >= 0 ? ' Profit' : ' Loss'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data-message">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No data" />
                <h4>Your business growth data will appear here</h4>
                <p>Start selling products to see your revenue and expenses analysis</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Modals */}
        <TransactionDetailsModal
          show={showTransactionModal}
          onClose={closeTransactionModal}
          type={transactionType}
        />
        <LocationModal
          show={showLocationModal}
          onClose={closeLocationModal}
          onLocationUpdate={fetchLocations}
        />
        {showProductsModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>Top Sold Products</h2>
                <button onClick={closeProductsModal} className="close-btn">X</button>
              </div>
              <div className="modal-content">
                {productsList.length > 0 ? (
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>${product.price.toLocaleString()}</td>
                          <td>{product.sold.toLocaleString()}</td>
                          <td>${(product.price * product.sold).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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