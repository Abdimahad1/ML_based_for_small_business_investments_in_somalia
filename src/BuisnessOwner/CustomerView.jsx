import React, { useState, useEffect, useContext } from 'react';
import './CustomerView.css';
import axios from 'axios';
import { FaSearch, FaStar, FaShoppingCart, FaShareAlt, FaCopy } from 'react-icons/fa';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import { ThemeContext } from '../context/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = ['All', 'Electronics', 'Clothes', 'Accessories', 'Foods', 'Other'];

const CustomerView = () => {
  const { darkMode } = useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [businessOwner, setBusinessOwner] = useState(null); // 👈 NEW (store whole owner)
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchBusinessOwner = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setBusinessOwner(res.data); // 👈 save whole user
        localStorage.setItem('user', JSON.stringify(res.data)); // update localStorage
      }
    } catch (err) {
      console.log('Failed to fetch business owner info');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchProducts = async (ownerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/customer-view/products', {
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

  if (loadingUser) {
    return <div className="customer-view-content"><h2>Loading...</h2></div>;
  }

  return (
    <div className={`customer-view-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="customer-view-content">
        <h1>Customer View</h1>

        <div className="customer-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dropdown">
            <label>Category</label>
            <select
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

          <button className="btn filter-btn" onClick={() => setShowShareModal(true)}>
            <FaShareAlt /> Share Link
          </button>
        </div>

        <div className="product-cards-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              {product.discount > 0 && (
                <div className="discount-badge">-{product.discount}%</div>
              )}
              <div
                className="product-image-container"
                onClick={() => setImagePreview(product.image_url)}
                style={{ cursor: 'pointer' }}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="product-image" />
                ) : (
                  <div className="no-image-placeholder">No Image</div>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  {product.discount > 0 ? (
                    <>
                      <span className="original-price">${product.price}</span>
                      <span className="discounted-price">
                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span>${product.price}</span>
                  )}
                </div>

                <div className="product-stock">
                  <span
                    className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className={`product-status ${product.status.toLowerCase()}`}>
                  {product.status}
                </div>

                <div className="product-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`star ${i < 4 ? 'filled' : ''}`} />
                  ))}
                  <span>(24)</span>
                </div>

                <button className="add-to-cart-btn" onClick={handleOrderNow}>
                  <FaShoppingCart /> Order Now
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="no-products-message">
              No products found. Try adjusting your filters or search term.
            </div>
          )}
        </div>
      </div>

      {imagePreview && (
        <div className="modal-overlay" onClick={() => setImagePreview(null)}>
          <div className="modal-image-container" onClick={(e) => e.stopPropagation()}>
            <img src={imagePreview} alt="Full Preview" />
          </div>
        </div>
      )}

      {showShareModal && businessOwner && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <h3>Share Product Link</h3>
            <input
              type="text"
              value={`${window.location.origin}/customer-products?business=${businessOwner._id}`}
              readOnly
              style={{ marginBottom: '10px', padding: '8px', width: '100%', borderRadius: '6px' }}
            />
            <button onClick={copyLink} className="btn filter-btn" style={{ width: '100%' }}>
              <FaCopy style={{ marginRight: '8px' }} /> Copy Link
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default CustomerView;