import React, { useContext } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './investmentRequests.css';
import { FaSearch, FaEdit } from 'react-icons/fa';
import groceryImage from '../assets/grocery-store.png';
import { ThemeContext } from '../context/ThemeContext'; // ✅ Import ThemeContext

const investmentData = Array(6).fill({
  title: 'Expansion of Local Grocery Store',
  image: groceryImage,
  purpose: 'To increase inventory capacity and introduce fresh produce section.',
  reason: 'We aim to meet the growing demand in the community and improve food availability.',
  currentContribution: '$5,000',
  goalAmount: '$20,000',
});

const InvestmentRequests = () => {
  const { darkMode } = useContext(ThemeContext); // ✅ Get theme
  return (
    <div className={`investment-container${darkMode ? ' dark' : ''}`}> {/* ✅ Dynamic theme class */}
      <Sidebar />
      <div className="investment-content">
        <TopBar />
        <h1>Investments</h1>
        <div className="investment-header">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search Products here" />
          </div>
          <div className="showing-count">Showing <select><option>8</option></select></div>
          <button className="filter-btn">🧃 Filter</button>
          <button className="add-btn">🟢 New Investment Request</button>
        </div>
        <div className="investment-grid">
          {investmentData.map((item, index) => (
            <div className="investment-card" key={index}>
              <div className="card-header">
                <h3>{item.title}</h3>
                <div className="edit-icon"><FaEdit /></div>
              </div>
              <div className="investment-img">
                <img src={item.image} alt="Investment Project" />
              </div>
              <div className="card-section">
                <label>Purpose</label>
                <input value={item.purpose} readOnly />
              </div>
              <div className="card-section">
                <label>Reason</label>
                <input value={item.reason} readOnly />
              </div>
              <div className="card-footer">
                <div className="contribution-box">
                  <label>Current Contribution</label>
                  <div className="current-value">{item.currentContribution}</div>
                </div>
                <div className="goal-amount">
                  <label>Amount</label>
                  <div>{item.goalAmount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestmentRequests;
