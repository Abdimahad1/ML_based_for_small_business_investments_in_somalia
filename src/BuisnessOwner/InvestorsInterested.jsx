import React, { useContext } from 'react';
import './investorsInterested.css';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import { FaEnvelope, FaPhoneAlt, FaCommentDots, FaChevronCircleRight } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext'; // ✅ theme context
import profilePic from '../assets/profile.png'; // ✅ make sure you have a profile.png

const investors = Array(8).fill({
  name: 'Abdimahad',
  email: 'abimahad@gmail.com',
  phone: '+252 613797852',
  message: 'I am interested in supporting local SMEs focused on Electronics.',
  image: profilePic,
});

const InvestorsInterested = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`investors-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="investors-content">
        <TopBar />
        <h1>Investors</h1>

        <div className="investors-header">
          <div className="search-bar">
            <input type="text" placeholder="Search Products here" />
          </div>
          <div className="showing-count">Showing <select><option>8</option></select></div>
          <button className="filter-btn">🧃 Filter</button>
          <button className="add-btn">➕ New Investment Request</button>
        </div>

        <div className="investor-grid">
          {investors.map((inv, index) => (
            <div className="investor-card" key={index}>
              <div className="card-header">
                <img className="avatar" src={inv.image} alt="profile" />
                <div className="name-box">{inv.name}</div>
                <div className="detail-icon"><FaChevronCircleRight /></div>
              </div>
              <div className="contact-info">
                <p><FaEnvelope /> <a href={`mailto:${inv.email}`}>{inv.email}</a></p>
                <p><FaPhoneAlt /> <a href={`tel:${inv.phone}`}>{inv.phone}</a></p>
                <p><FaCommentDots /> <strong>Message</strong></p>
                <p className="message">"{inv.message}"</p>
              </div>
              <div className="action-btns">
                <button className="accept-btn">Accept</button>
                <button className="reject-btn">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestorsInterested;
