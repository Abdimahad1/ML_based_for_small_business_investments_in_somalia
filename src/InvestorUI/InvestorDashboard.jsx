import React, { useState, useEffect, useContext } from 'react';
import TopBar from '../BuisnessOwner/TopBar';
import { ThemeContext } from '../context/ThemeContext';
import './investorDashboard.css';
import axios from 'axios';

const InvestorDashboard = () => {
  const [toggle, setToggle] = useState('monthly');
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  const roiData = {
    monthly: [
      { month: 'Jan', value: '5%' },
      { month: 'Feb', value: '8%' },
      { month: 'Mar', value: '11%' },
      { month: 'Apr', value: '6%' },
      { month: 'May', value: '9%' },
      { month: 'Jun', value: '10%' }
    ],
    yearly: [
      { month: '2022', value: '50%' },
      { month: '2023', value: '66%' }
    ]
  };

  useEffect(() => {
    const loadTopBusinesses = async () => {
      try {
        const overviewRes = await axios.get('http://localhost:5000/api/overview/all');
        const overviews = overviewRes.data;

        const withProfiles = await Promise.all(
          overviews.map(async (ov) => {
            try {
              const profileRes = await axios.get(`http://localhost:5000/api/profile/public/${ov.user_id}`);
              const profile = profileRes.data;

              const sellRes = await axios.get(`http://localhost:5000/api/sell-business/public`);
              const sellBusiness = sellRes.data.find(biz => biz.user_id === ov.user_id);

              const roi = ov.expenses > 0 ? ((ov.income - ov.expenses) / ov.expenses) * 100 : 0;

              return {
                ...profile,
                roi: roi.toFixed(2),
                income: ov.income,
                industry: sellBusiness?.industry || 'N/A',
                contact: sellBusiness?.contact || 'N/A'
              };
            } catch (err) {
              console.warn(`⚠️ No profile found for user ${ov.user_id}`);
              return null;
            }
          })
        );

        const filtered = withProfiles.filter((biz) => biz !== null);
        const sorted = filtered.sort((a, b) => b.roi - a.roi).slice(0, 3);
        setTopBusinesses(sorted);
      } catch (err) {
        console.error('Failed to load top businesses:', err);
      }
    };

    loadTopBusinesses();
  }, []);

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
        <TopBar />
        <h1>Investor Overview</h1>

        {/* Overview Section */}
        <div className="overview-section-wrapper">
          <div className="dashboard-cards">
            <div className="overview-card income-card">
              <div className="overview-card__info">
                <div>
                  <h3>Total Investment Amount</h3>
                  <p>$40,456</p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" alt="bag" />
              </div>
            </div>
            <div className="overview-card sold-card">
              <div className="overview-card__info">
                <div>
                  <h3>Number of Investments</h3>
                  <p>20</p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/3703/3703261.png" alt="house" />
              </div>
            </div>
            <div className="overview-card expenses-card">
              <div className="overview-card__info">
                <div>
                  <h3>Return On Investment</h3>
                  <p>+2%</p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/2171/2171994.png" alt="roi" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts">
          <div className="chart-box">
            <div className="investor-chart-header">
              <h3>📊 ROI (%) over Time</h3>
              <div className="investor-toggle-group">
                <button className={toggle === 'monthly' ? 'active' : ''} onClick={() => setToggle('monthly')}>Monthly</button>
                <button className={toggle === 'yearly' ? 'active' : ''} onClick={() => setToggle('yearly')}>Yearly</button>
              </div>
            </div>
            <div className="investor-roi-bars">
              {roiData[toggle].map((item) => (
                <div className="investor-roi-bar" key={item.month}>
                  <span className="bar-label">{item.month}</span>
                  <div className="investor-bar-track">
                    <div className="investor-bar-fill" style={{ width: item.value }}></div>
                  </div>
                  <span className="bar-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="product-box">
            <h3 className="product-box-title">🏆 Top Performing Businesses</h3>
            <ul className="top-business-enhanced-list">
              {topBusinesses.map((biz, index) => (
                <li key={index}>
                  <div className="business-logo">
                    <img src={`http://localhost:5000/uploads/${biz.logo}`} alt={biz.business_name} />
                  </div>
                  <div className="business-info">
                    <h4>{biz.business_name}</h4>
                    <span className="roi">+{biz.roi}% ROI</span>
                  </div>
                  <div className="business-meta">
                    <span className="badge">{biz.industry}</span>
                    <button className="view-icon">👁️</button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="investor-view-all-btn" onClick={() => setShowModal(true)}>🔍 View All</button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box wide">
              <div className="modal-header">
                <h2>Top Performing Businesses</h2>
                <button onClick={() => setShowModal(false)} className="close-btn">✖</button>
              </div>
              <div className="modal-content grid-view">
                {topBusinesses.map((biz, index) => (
                  <div className="business-card-modal" key={index}>
                    <img className="biz-card-logo" src={`http://localhost:5000/uploads/${biz.logo}`} alt={biz.business_name} />
                    <div className="biz-card-info">
                      <h3>{biz.business_name}</h3>
                      <p><strong>Location:</strong> {biz.location}</p>
                      <p><strong>Email:</strong> {biz.business_email}</p>
                      <p><strong>Industry:</strong> {biz.industry}</p>
                      <p><strong>ROI:</strong> {biz.roi}%</p>
                      <p><strong>Contact:</strong> {biz.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;
