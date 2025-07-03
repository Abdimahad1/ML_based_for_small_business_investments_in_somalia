import React, { useState, useEffect, useContext } from 'react';
import './products.css';
import axios from 'axios';
import { FaSearch, FaFilter, FaPlus, FaEllipsisV, FaTimes } from 'react-icons/fa';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const categories = ['All', 'Electronics', 'Clothes', 'Accessories', 'Foods', 'Other'];

const typeOptions = {
  Electronics: ['Phone', 'Laptop', 'Tablet', 'TV', 'Headphones', 'Other'],
  Clothes: ['T-Shirt', 'Jeans', 'Dress', 'Shoes', 'Hat', 'Other'],
  Accessories: ['Watch', 'Bag', 'Belt', 'Glasses', 'Jewelry', 'Other'],
  Foods: ['Bread', 'Milk', 'Egg', 'Meat', 'Vegetable', 'Fruit', 'Other'],
  Other: ['Other', 'Other', 'Other', 'Other', 'Other', 'Other', 'Other']
};

const Products = () => {
  const { darkMode } = useContext(ThemeContext);
  const token = sessionStorage.getItem('token');
  const [products, setProducts] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [formError, setFormError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    original_price: '',
    total: '',
    sold: '',
    stock: '',
    discount: '',
    status: 'Active',
    type: 'Electronics',
    image_url: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const resetForm = () => {
    setNewProduct({
      name: '',
      price: '',
      original_price: '',
      total: '',
      sold: '',
      stock: '',
      discount: '',
      status: 'Active',
      type: 'Electronics',
      image_url: ''
    });
    setEditProductId(null);
    setFormError('');
  };

  const openAddForm = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmitProduct = async () => {
    const { name, price, original_price, total, sold, status, type, image_url, discount } = newProduct;
    if (!name || !price || !original_price || total === '' || sold === '' || !status || !type) {
      setFormError('All fields are required.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const data = {
      name,
      price: Number(price),
      original_price: Number(original_price),
      total: Number(total),
      sold: Number(sold),
      stock: Math.max(0, Number(total) - Number(sold)),
      status,
      type,
      discount: Number(discount) || 0,
      image_url,
      user_id: user._id
    };

    try {
      if (editProductId) {
        await axios.put(`${API_BASE_URL}/api/products/${editProductId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated!');
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/products`, data,  {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created!');

        if (res.data.sold > 0) {
          await axios.post(`${API_BASE_URL}/api/notifications`, {
              title: 'Product Created',
              message: `Your product "${res.data.name}" has been created!`,
              user_id: user._id
          },{
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product.');
    }
  };

  const handleEdit = (product) => {
    setNewProduct({
      ...product,
      price: product.price,
      original_price: product.original_price?.toString() || '',
      total: product.total.toString(),
      sold: product.sold.toString(),
      discount: product.discount?.toString() || '',
      image_url: product.image_url || '',
    });
    setEditProductId(product._id);
    setShowModal(true);
    setActiveAction(null);
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to delete this product?</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={async () => {
              try {
                await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Product deleted!');
                fetchProducts();
              } catch (err) {
                toast.error('Failed to delete product.');
              }
              toast.dismiss(t.id);
              setActiveAction(null);
            }}
            style={{
              marginRight: '8px',
              padding: '5px 10px',
              backgroundColor: '#f87171',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const handleTotalOrSoldChange = (field, value) => {
    const updated = { ...newProduct, [field]: value };
    const total = Number(field === 'total' ? value : updated.total);
    const sold = Number(field === 'sold' ? value : updated.sold);
    updated.stock = total - sold >= 0 ? total - sold : 0;
    setNewProduct(updated);
  };

  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.type === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, showLimit);

  return (
    <div className={`bo-products-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="bo-products-content">
        <TopBar />
        <h1>Products & Inventory</h1>

        {/* Controls */}
        <div className="bo-products-controls">
          <div className="bo-search-bar">
            <FaSearch className="bo-search-icon" />
            <input type="text" placeholder="Search Products here" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className="bo-right-controls">
            <div className="bo-dropdown">
              <label>Showing</label>
              <select value={showLimit} onChange={e => setShowLimit(Number(e.target.value))}>
                {[1, 3, 5, 8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="bo-filter-dropdown">
              <button className="bo-btn bo-filter-btn" onClick={() => setShowFilters(!showFilters)}>
                <FaFilter /> Filter
              </button>
              {showFilters && (
                <div className="bo-filter-menu">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      className={`bo-filter-item ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory(cat); setShowFilters(false); }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="bo-btn bo-add-btn" onClick={openAddForm}><FaPlus /> Add Product</button>
          </div>
        </div>

        {/* Table */}
        <div className="bo-products-table-wrapper">
          <table className="bo-products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Original Price</th>
                <th>Price</th>
                <th>Total</th>
                <th>Sold</th>
                <th>Stock</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod, index) => (
                <tr key={index}>
                  <td>{prod.image_url ? <img src={prod.image_url} alt={prod.name} style={{ width: '40px', height: '40px', borderRadius: '4px' }} /> : 'No Image'}</td>
                  <td>{prod.name}</td>
                  <td>${prod.original_price}</td>
                  <td>${prod.price}</td>
                  <td>{prod.total}</td>
                  <td>{prod.sold}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.discount || 0}%</td>
                  <td><span className={`bo-status-badge ${prod.status.toLowerCase()}`}>{prod.status}</span></td>
                  <td>{prod.type}</td>
                  <td className="bo-action-cell">
                    <div className="bo-action-wrapper">
                      <FaEllipsisV onClick={() => setActiveAction(activeAction === index ? null : index)} />
                      {activeAction === index && (
                        <div className="bo-action-menu">
                          <button onClick={() => handleEdit(prod)}>Edit</button>
                          <button onClick={() => handleDelete(prod._id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="bo-modal-overlay">
            <div className="bo-modal-form">
              <div className="bo-modal-header">
                <h3>{editProductId ? 'Edit Product' : 'Add Product'}</h3>
                <FaTimes className="bo-close-btn" onClick={() => setShowModal(false)} />
              </div>

              {[
                ['Product Name', 'name'],
                ['Original Price', 'original_price'],
                ['Current Price', 'price'],
                ['Total', 'total'],
                ['Sold', 'sold'],
                ['Discount %', 'discount'],
                ['Product Image URL', 'image_url']
              ].map(([label, field]) => (
                <div className="bo-form-group" key={field}>
                  <label>{label}</label>
                  <input
                    type={field.includes('price') || field === 'total' || field === 'sold' || field === 'discount' ? 'number' : 'text'}
                    value={newProduct[field]}
                    onChange={e => {
                      if (field === 'total' || field === 'sold') {
                        handleTotalOrSoldChange(field, e.target.value);
                      } else {
                        setNewProduct({ ...newProduct, [field]: e.target.value });
                      }
                    }}
                  />
                </div>
              ))}

              <div className="bo-form-group"><label>Status</label>
                <select value={newProduct.status} onChange={e => setNewProduct({ ...newProduct, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="bo-form-group"><label>Type</label>
                <select value={newProduct.type} onChange={e => setNewProduct({ ...newProduct, type: e.target.value })}>
                  {Object.keys(typeOptions).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {formError && <p className="bo-form-error">{formError}</p>}
              <button className="bo-btn bo-add-btn" onClick={handleSubmitProduct}>
                {editProductId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
