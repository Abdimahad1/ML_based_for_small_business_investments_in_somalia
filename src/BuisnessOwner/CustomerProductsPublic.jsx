import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './CustomerProductsPublic.css';
import { FaSearch, FaSync, FaShoppingCart, FaWhatsapp, FaStar, FaRegStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const categories = ['All', 'Electronics', 'Clothes', 'Accessories', 'Foods', 'Other'];

const CustomerProductsPublic = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const businessId = queryParams.get('business');

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [businessOwnerPhone, setBusinessOwnerPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  const token = sessionStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/customer-view/products`, {
        params: { business: businessId },
      });
      
      setProducts(res.data);
      setFiltered(res.data);
    } catch {
      console.log('Failed to fetch products');
    }
  };

  const fetchBusinessInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/customer-view/business-info`, {
        params: { business: businessId },
      });
      if (res.data.phone) {
        setBusinessOwnerPhone(res.data.phone);
      }
      if (res.data.businessName) {
        setBusinessName(res.data.businessName);
      }
    } catch {
      console.log('Failed to fetch business info');
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchProducts();
      fetchBusinessInfo();
      
      // Refresh data periodically (every 30 seconds)
      const interval = setInterval(() => {
        fetchProducts();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [businessId]);

  useEffect(() => {
    const filteredList = products
      .filter((p) => selectedCategory === 'All' || p.type === selectedCategory)
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFiltered(filteredList);
  }, [searchTerm, selectedCategory, products]);

  const handleOrderNow = (productName) => {
    if (businessOwnerPhone) {
      const phoneWithCountryCode = `252${businessOwnerPhone}`;
      const message = `Hello! I'm interested in purchasing ${productName} from ${businessName}. Could you provide more details?`;
      window.open(`https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert('Business owner phone number not available!');
    }
  };

  return (
    <div className="customer-public-container">
      {/* Hero Section */}
      <div className="public-hero">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="business-name"
        >
          {businessName || 'Our Products'}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="business-tagline"
        >
          Browse our collection and order directly via WhatsApp
        </motion.p>
      </div>

      {/* Search and Filter Section */}
      <motion.div 
        className="public-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            className="refresh-btn"
            onClick={fetchProducts}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSync className="refresh-icon" />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="products-grid-container">
        {filtered.length > 0 ? (
          <motion.div 
            className="products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <AnimatePresence>
              {filtered.map((product) => (
                <motion.div
                  key={product._id}
                  className="product-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                >
                  {product.discount > 0 && (
                    <div className="discount-badge">-{product.discount}% OFF</div>
                  )}

                  <motion.div
                    className="product-image-container"
                    onClick={() => setImagePreview(product.image_url)}
                    whileHover={{ scale: 1.03 }}
                  >
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="product-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <div className="image-icon">🛒</div>
                        No Image Available
                      </div>
                    )}
                  </motion.div>

                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="price-section">
                      {product.discount > 0 ? (
                        <>
                          <span className="original-price">${product.price}</span>
                          <span className="discounted-price">
                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">${product.price}</span>
                      )}
                    </div>

                    <div className="stock-section">
                      <div className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                      </div>
                      <div className={`status-badge ${product.status.toLowerCase()}`}>
                        {product.status}
                      </div>
                    </div>

                    <div className="rating-section">
                      {[...Array(5)].map((_, i) => (
                        i < 4 ? <FaStar key={i} className="star filled" /> : <FaRegStar key={i} className="star" />
                      ))}
                      <span className="rating-count">(24)</span>
                    </div>

                    <motion.button
                      className="order-button"
                      onClick={() => handleOrderNow(product.name)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={product.stock <= 0}
                    >
                      <FaWhatsapp className="whatsapp-icon" />
                      Order via WhatsApp
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="no-products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="no-products-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            className="image-modal-overlay"
            onClick={() => setImagePreview(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <img src={imagePreview} alt="Product Preview" className="modal-image" />
              <button 
                className="close-modal"
                onClick={() => setImagePreview(null)}
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="public-footer">
        <p>© {new Date().getFullYear()} {businessName || 'Business Name'}. All rights reserved.</p>
        {businessOwnerPhone && (
          <a 
            href={`https://wa.me/252${businessOwnerPhone}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            Contact us via WhatsApp
          </a>
        )}
      </footer>
    </div>
  );
};

export default CustomerProductsPublic;