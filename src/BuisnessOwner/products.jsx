import React, { useState, useContext } from 'react';
import './products.css';
import { FaSearch, FaFilter, FaPlus, FaEllipsisV, FaTimes } from 'react-icons/fa';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import { ThemeContext } from '../context/ThemeContext';

const initialProducts = [];

const categories = ['All', 'Electronics', 'Clothes', 'Accessories'];

const Products = () => {
  const { darkMode } = useContext(ThemeContext);
  const [products, setProducts] = useState(initialProducts);
  const [activeAction, setActiveAction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formError, setFormError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    sold: '',
    status: 'Active',
    type: 'Electronics',
    initialStock: '' // Used for stock calculation when editing sold
  });

  const resetForm = () => {
    setNewProduct({
      name: '',
      price: '',
      stock: '',
      sold: '',
      status: 'Active',
      type: 'Electronics',
      initialStock: ''
    });
    setEditIndex(null);
    setFormError('');
  };

  const filteredProducts = products
    .filter((p) => selectedCategory === 'All' || p.type === selectedCategory)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, showLimit);

  const openAddForm = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmitProduct = () => {
    const { name, price, stock, sold, status, type } = newProduct;
    if (!name || !price || stock === '' || sold === '' || !status || !type) {
      setFormError('All fields are required.');
      return;
    }

    const formatted = {
      name,
      price: `$${price}`,
      stock: Number(stock),
      sold: Number(sold),
      status,
      type
    };

    if (editIndex !== null) {
      const updated = [...products];
      updated[editIndex] = formatted;
      setProducts(updated);
    } else {
      setProducts([formatted, ...products]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (product, index) => {
    setNewProduct({
      ...product,
      price: product.price.replace('$', ''),
      initialStock: Number(product.stock) + Number(product.sold)
    });
    setEditIndex(index);
    setShowModal(true);
    setActiveAction(null);
  };

  const handleDelete = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
    setActiveAction(null);
  };

  const handleSoldChange = (soldValue) => {
    const sold = Number(soldValue);
    const total = Number(newProduct.initialStock);
    const newStock = total - sold;
    setNewProduct({
      ...newProduct,
      sold: soldValue,
      stock: newStock >= 0 ? newStock : 0
    });
  };

  return (
    <div className={`products-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="products-content">
        <TopBar />
        <h1>Products & Inventory</h1>

        {/* === Top Controls === */}
        <div className="products-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Products here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="right-controls">
            <div className="dropdown">
              <label>Showing</label>
              <select value={showLimit} onChange={(e) => setShowLimit(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
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

            <button className="btn add-btn" onClick={openAddForm}>
              <FaPlus /> Add New Product
            </button>
          </div>
        </div>

        {/* === Product Table === */}
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
              {filteredProducts.map((prod, index) => (
                <tr key={index}>
                  <td>{prod.name}</td>
                  <td>{prod.price}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.sold}</td>
                  <td>
                    <span className={`status-badge ${prod.status.toLowerCase()}`}>{prod.status}</span>
                  </td>
                  <td>{prod.type}</td>
                  <td className="action-cell">
                    <div className="action-wrapper">
                      <FaEllipsisV onClick={() => setActiveAction(activeAction === index ? null : index)} />
                      {activeAction === index && (
                        <div className="action-menu">
                          <button onClick={() => handleEdit(prod, index)}>Edit</button>
                          <button onClick={() => handleDelete(index)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* === Modal Form === */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-form">
              <div className="modal-header">
                <h3>{editIndex !== null ? 'Edit Product' : 'Add New Product'}</h3>
                <FaTimes className="close-btn" onClick={() => setShowModal(false)} />
              </div>

              <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              <input type="number" placeholder="Price (e.g. 25)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              <input type="number" placeholder="Sold" value={newProduct.sold} onChange={(e) => handleSoldChange(e.target.value)} />
              <input type="number" placeholder="Stock (auto-calculated)" value={newProduct.stock} readOnly />

              <select value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}>
                <option value="Electronics">Electronics</option>
                <option value="Clothes">Clothes</option>
                <option value="Accessories">Accessories</option>
              </select>

              {formError && <p className="form-error">{formError}</p>}
              <button className="btn add-btn" onClick={handleSubmitProduct}>
                {editIndex !== null ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
