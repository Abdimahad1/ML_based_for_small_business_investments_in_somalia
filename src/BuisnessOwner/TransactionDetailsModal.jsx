// src/components/TransactionDetailsModal.jsx

import React, { useEffect, useState } from 'react';
import './TransactionDetailsModal.css';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TransactionDetailsModal = ({ show, onClose, type }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (show) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProducts(res.data); // backend already filtered by user
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

  const totalAmount = products.reduce((sum, product) => sum + calculateValue(product), 0);

  const generateTransactionPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(
      type === 'expense' ? 'Expenses Report' : 
      type === 'income' ? 'Income Report' : 'Sold Products Report', 
      105, 20, { align: 'center' }
    );
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    if (type === 'sold') {
      const tableData = products
        .filter(product => product.sold > 0)
        .map(product => [
          product.name,
          product.sold,
          `$${product.price.toLocaleString()}`,
          `$${(product.price * product.sold).toLocaleString()}`
        ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Product Name', 'Units Sold', 'Price', 'Total Revenue']],
        body: tableData,
        theme: 'grid'
      });
    } else {
      const tableData = products.map(product => [
        product.name,
        `$${calculateValue(product).toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [[
          'Product Name', 
          type === 'expense' ? 'Total Expenses' : 'Total Income'
        ]],
        body: tableData,
        theme: 'grid'
      });
      
      doc.text(
        `Total ${type === 'expense' ? 'Expenses' : 'Income'}: $${totalAmount.toLocaleString()}`,
        14, doc.lastAutoTable.finalY + 10
      );
    }
    
    doc.save(`${type}_report.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>
            {type === 'expense' && 'Total Expenses Details'}
            {type === 'income' && 'Total Income Details'}
            {type === 'sold' && 'Sold Products List'}
          </h2>
          <FaTimes className="close-btn" onClick={onClose} />
          <button 
            onClick={generateTransactionPDF}
            className="print-btn"
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '5px 10px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Print
          </button>
        </div>

        {loading ? (
          <div className="loading-text">Loading...</div> 
        ) : (
          <div className="transaction-content">

            {/* ✅ Sold Products List */}
            {type === 'sold' ? (
              <>
                {products.length > 0 ? (
                  <ul className="sold-products-list">
                    {products
                      .filter(product => product.sold > 0)
                      .map(product => (
                        <li key={product._id}>
                          {product.name}
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                  <p>No sold products found.</p>
                )}
              </>
            ) : (
              // ✅ Income or Expense Table
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
            )}

            {/* ✅ Grand Total for Income/Expense */}
            {products.length > 0 && type !== 'sold' && (
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
