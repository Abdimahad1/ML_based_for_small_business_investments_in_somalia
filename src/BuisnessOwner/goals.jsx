import React, { useContext } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './goals.css';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext'; // ✅ import theme context
import trousers from '../assets/investor.png';
import shirt from '../assets/investor.png';
import shoe from '../assets/investor.png';
import belts from '../assets/investor.png';
import underwear from '../assets/investor.png';
import cap from '../assets/investor.png';

const products = [
  { name: 'Trousers', quantity: 200, price: 3546, dueDate: '2025-05-16', image: trousers, completed: false },
  { name: 'Shirts', quantity: 130, price: 2723, dueDate: '2025-05-16', image: shirt, completed: false },
  { name: 'Shoes', quantity: 200, price: 3546, dueDate: '2025-05-16', image: shoe, completed: false },
  { name: 'Belts', quantity: 200, price: 3546, dueDate: '2025-05-16', image: belts, completed: true },
  { name: 'Underwear', quantity: 130, price: 2723, dueDate: '2025-05-16', image: underwear, completed: true },
  { name: 'Caps', quantity: 200, price: 3546, dueDate: '2025-05-16', image: cap, completed: true },
];

const Goals = () => {
  const { darkMode } = useContext(ThemeContext); // ✅ apply theme
  return (
    <div className={`goals-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="goals-content">
        <TopBar />
        <h1>Milestones & Goals</h1>

        <div className="goals-header">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search Products here" />
          </div>
          <div className="showing-count">Showing <select><option>8</option></select></div>
          <button className="filter-btn">🧃 Filter</button>
          <button className="launch-btn">🟢 Launch New Product</button>
        </div>

        <div className="goal-section">
          <h3>Upcoming Goals</h3>
          <div className="goal-cards">
            {products.filter(p => !p.completed).map((item, index) => (
              <GoalCard key={index} item={item} />
            ))}
          </div>

          <h3>Completed Milestones</h3>
          <div className="goal-cards">
            {products.filter(p => p.completed).map((item, index) => (
              <GoalCard key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalCard = ({ item }) => (
  <div className="goal-card">
    <div className="goal-top">
      <span className="quantity-badge">{item.quantity}</span>
      <span className="price-badge">${item.price.toLocaleString()}</span>
    </div>

    <div className="goal-img-wrapper">
      <img src={item.image} alt={item.name} />
    </div>

    <div className="goal-info">
      <h4>{item.name}</h4>
      <small>Due-Date: {item.dueDate}</small>
    </div>

    <div className="goal-actions">
      <button className="update-btn">UPDATE</button>
      <button className="delete-btn"><FaTrash /></button>
    </div>
  </div>
);

export default Goals;
