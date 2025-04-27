// src/components/TransactionDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import './TransactionDetailsModal.css';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const TransactionDetailsModal = ({ show, onClose, type }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (show) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProducts(res.data); // Only user-specific products because backend filters by user_id
        } catch (err) {
          console.error('Failed to fetch products', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [show, token]);

  if (!show) return null;

  const calculateValue = (product) => {
    if (type === 'expense') {
      return (product.original_price || 0) * (product.sold || 0);
    } else if (type === 'income') {
      return (product.price || 0) * (product.sold || 0);
    }
    return 0;
  };

  // ✅ Calculate Total Sum
  const totalAmount = products.reduce((sum, product) => sum + calculateValue(product), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{type === 'expense' ? 'Total Expenses Details' : 'Total Income Details'}</h2>
          <FaTimes className="close-btn" onClick={onClose} />
        </div>

        {loading ? (
          <div className="loading-text">Loading transactions...</div> 
        ) : (
          <div className="transaction-content">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>{type === 'expense' ? 'Total Paid' : 'Total Earned'}</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>${calculateValue(product).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center' }}>No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ✅ Show Grand Total */}
            {products.length > 0 && (
              <div className="transaction-total">
                <strong>Total {type === 'expense' ? 'Expenses' : 'Income'}:</strong> 
                <span>${totalAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
