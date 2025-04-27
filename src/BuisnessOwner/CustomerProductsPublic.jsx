import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './CustomerProductsPublic.css';
import { FaSearch, FaSync, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';

const categories = ['All', 'Electronics', 'Clothes', 'Accessories'];

const CustomerProductsPublic = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const businessId = queryParams.get('business');

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [businessOwnerPhone, setBusinessOwnerPhone] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/customer-view/products', {
        params: { business: businessId },
      });
      setProducts(res.data);
      setFiltered(res.data);
      setTimeout(() => setLoading(false), 500);
    } catch {
      console.log('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchBusinessOwnerPhone = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/customer-view/business-info?business=${businessId}`);
      if (res.data.phone) {
        setBusinessOwnerPhone(res.data.phone);
      }
    } catch {
      console.log('Failed to fetch business owner phone');
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchProducts();
      fetchBusinessOwnerPhone(); // 👈 Fetch phone when businessId exists
    }
  }, [businessId]);

  useEffect(() => {
    const filteredList = products
      .filter((p) => selectedCategory === 'All' || p.type === selectedCategory)
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFiltered(filteredList);
  }, [searchTerm, selectedCategory, products]);

  const handleOrderNow = () => {
    if (businessOwnerPhone) {
      const phoneWithCountryCode = `252${businessOwnerPhone}`;
      window.open(`https://wa.me/${phoneWithCountryCode}`, '_blank');
    } else {
      alert('Business owner phone number not available!');
    }
  };

  return (
    <div className="customer-view-content">
      <div className="top-bar">
        <h2>Available Products</h2>
      </div>

      <div className="public-controls">
        {/* Search */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter and Refresh Inline */}
        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-btn"
            style={{ backgroundColor: '#4338ca', color: 'white', fontWeight: 'bold' }}
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            className={`refresh-btn ${loading ? 'rotating' : ''}`}
            onClick={fetchProducts}
            disabled={loading}
          >
            <FaSync className="refresh-icon" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Product Cards */}
      <div className="product-cards-grid">
        {filtered.map((product) => (
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
                  <span key={i} className={`star ${i < 4 ? 'filled' : ''}`}>★</span>
                ))}
                <span>(24)</span>
              </div>

              <button className="add-to-cart-btn" onClick={handleOrderNow}>
                <FaShoppingCart /> Order Now
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="no-products-message">
            No products found. Try adjusting your filters or search.
          </div>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="modal-overlay" onClick={() => setImagePreview(null)}>
          <div className="modal-image-container" onClick={(e) => e.stopPropagation()}>
            <img src={imagePreview} alt="Full Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProductsPublic;
