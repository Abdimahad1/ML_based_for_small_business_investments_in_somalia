// src/BuisnessOwner/products.jsx
import React, { useState, useContext } from 'react';
import './products.css';
import { FaSearch, FaFilter, FaPlus, FaEllipsisV } from 'react-icons/fa';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import { ThemeContext } from '../context/ThemeContext';

const products = [
  { name: 'watch', price: '$20', stock: 30, sold: 20, status: 'Active', type: 'Electronics' },
  { name: 'Erapods', price: '$20', stock: 0, sold: 20, status: 'Inactive', type: 'Electronics' },
  { name: 'Samsung TV', price: '$20', stock: 30, sold: 20, status: 'Active', type: 'Electronics' },
  { name: 'iPhone 15 Pro Max', price: '$20', stock: 0, sold: 20, status: 'Inactive', type: 'Electronics' },
  { name: 'Canon EOS 90D', price: '$20', stock: 30, sold: 20, status: 'Active', type: 'Electronics' },
  { name: 'MacBook Air M2', price: '$20', stock: 30, sold: 20, status: 'Active', type: 'Electronics' },
  { name: 'Sony WH-1000X', price: '$20', stock: 30, sold: 20, status: 'Inactive', type: 'Electronics' },
  { name: 'PlayStation 5', price: '$20', stock: 30, sold: 20, status: 'Active', type: 'Electronics' },
];

const categories = ['All', 'Electronics', 'Clothes', 'Accessories'];

const Products = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeAction, setActiveAction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleEdit = (product) => {
    console.log('Edit:', product);
    setActiveAction(null);
  };

  const handleDelete = (product) => {
    console.log('Delete:', product);
    setActiveAction(null);
  };

  return (
    <div className={`products-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="products-content">
        <TopBar />
        <h1>Products & Inventory</h1>

        <div className="products-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search Products here" />
          </div>

          <div className="right-controls">
            <div className="dropdown">
              <label>Showing</label>
              <select>
                <option>8</option>
                <option>16</option>
                <option>24</option>
              </select>
            </div>

            <div className="filter-dropdown">
              <button className="btn filter-btn" onClick={() => setShowFilters(!showFilters)}>
                <FaFilter /> Filter
              </button>
              {showFilters && (
                <div className="filter-menu">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowFilters(false);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn add-btn"><FaPlus /> Add New Product</button>
          </div>
        </div>

        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, index) => (
                <tr key={index}>
                  <td>{prod.name}</td>
                  <td>{prod.price}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.sold}</td>
                  <td>
                    <span className={`status-badge ${prod.status.toLowerCase()}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td>{prod.type}</td>
                  <td className="action-cell">
                    <div className="action-wrapper">
                      <FaEllipsisV onClick={() => setActiveAction(activeAction === index ? null : index)} />
                      {activeAction === index && (
                        <div className="action-menu">
                          <button onClick={() => handleEdit(prod)}>Edit</button>
                          <button onClick={() => handleDelete(prod)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
