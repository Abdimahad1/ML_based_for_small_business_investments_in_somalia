import React, { useState, useEffect, useContext } from 'react';
import './CustomerView.css';
import axios from 'axios';
import { FaSearch, FaStar, FaShoppingCart, FaShareAlt, FaCopy } from 'react-icons/fa';
import Sidebar from './sidebar';
import { ThemeContext } from '../context/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const categories = ['All', 'Electronics', 'Clothes', 'Accessories', 'Foods', 'Other'];

const CustomerView = () => {
  const { darkMode } = useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [businessOwner, setBusinessOwner] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchBusinessOwner = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setBusinessOwner(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.log('Failed to fetch business owner info');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchProducts = async (ownerId) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/customer-view/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          business: ownerId,
          category: selectedCategory,
          search: searchTerm,
        },
      });
      setProducts(res.data);
    } catch {
      console.log('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchBusinessOwner();
  }, []);

  useEffect(() => {
    if (businessOwner && businessOwner._id) {
      fetchProducts(businessOwner._id);
    }
  }, [businessOwner, selectedCategory, searchTerm]);

  const copyLink = () => {
    if (!businessOwner) return;
    const shareLink = `${window.location.origin}/customer-products?business=${businessOwner._id}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
    setShowShareModal(false);
  };

  const handleOrderNow = () => {
    if (businessOwner?.phone) {
      const phoneWithCountryCode = `252${businessOwner.phone}`;
      window.open(`https://wa.me/${phoneWithCountryCode}`, '_blank');
    } else {
      toast.error('Business owner phone number not available!');
    }
  };

  return (
    <div className={`cust-view-container ${darkMode ? 'cust-dark-mode' : ''}`}>
      <Sidebar />
      <div className="cust-view-content">
        <h1 className="cust-view-title">Customer View</h1>

        <div className="cust-controls-container">
          <div className="cust-search-container">
            <FaSearch className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cust-search-input"
            />
          </div>

          <div className="cust-category-dropdown">
            <label className="cust-category-label">Category</label>
            <select
              className="cust-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="cust-share-btn" 
            onClick={() => setShowShareModal(true)}
          >
            <FaShareAlt /> Share Link
          </button>
        </div>

        <div className="cust-products-grid">
          {loadingUser ? (
            <div className="cust-loading-message">
              <p>Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="cust-product-card">
                {product.discount > 0 && (
                  <div className="cust-discount-badge">-{product.discount}%</div>
                )}
                <div
                  className="cust-product-image-container"
                  onClick={() => setImagePreview(product.image_url)}
                >
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="cust-product-image" 
                    />
                  ) : (
                    <div className="cust-no-image">No Image</div>
                  )}
                </div>

                <div className="cust-product-info">
                  <h3 className="cust-product-name">{product.name}</h3>
                  <div className="cust-product-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="cust-original-price">${product.price}</span>
                        <span className="cust-discounted-price">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span>${product.price}</span>
                    )}
                  </div>

                  <div className="cust-product-stock">
                    <span
                      className={`cust-stock-indicator ${product.stock > 0 ? 'cust-in-stock' : 'cust-out-of-stock'}`}
                    >
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className={`cust-product-status cust-status-${product.status.toLowerCase()}`}>
                    {product.status}
                  </div>

                  <div className="cust-product-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`cust-star ${i < 4 ? 'cust-filled' : ''}`} 
                      />
                    ))}
                    <span>(24)</span>
                  </div>

                  <button 
                    className="cust-order-btn" 
                    onClick={handleOrderNow}
                  >
                    <FaShoppingCart /> Order Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="cust-no-products">
              No products found. Try adjusting your filters or search term.
            </div>
          )}
        </div>
      </div>

      {imagePreview && (
        <div 
          className="cust-image-modal-overlay" 
          onClick={() => setImagePreview(null)}
        >
          <div 
            className="cust-image-modal-container" 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={imagePreview} 
              alt="Full Preview" 
              className="cust-image-modal-img" 
            />
          </div>
        </div>
      )}

      {showShareModal && businessOwner && (
        <div 
          className="cust-share-modal-overlay" 
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="cust-share-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="cust-share-modal-title">Share Product Link</h3>
            <input
              type="text"
              className="cust-share-input"
              value={`${window.location.origin}/customer-products?business=${businessOwner._id}`}
              readOnly
            />
            <button 
              onClick={copyLink} 
              className="cust-copy-btn"
            >
              <FaCopy className="cust-copy-icon" /> Copy Link
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default CustomerView;