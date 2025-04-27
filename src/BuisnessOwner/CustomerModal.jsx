// src/components/CustomerModal.jsx
import React from 'react';
import './CustomerModal.css';

const CustomerModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h3>{customer.name}'s Purchase Summary</h3>

        <table className="modal-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order, index) => (
              <tr key={index}>
                <td>{order.product_name}</td>
                <td>{order.quantity}</td>
                <td>${order.total_price}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerModal;
