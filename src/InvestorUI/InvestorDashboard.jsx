import React, { useState, useEffect, useContext } from 'react';
import TopBar from '../BuisnessOwner/TopBar';
import { ThemeContext } from '../context/ThemeContext';
import './investorDashboard.css';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

const InvestorDashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [myStats, setMyStats] = useState({
    totalAmount: 0,
    investmentCount: 0,
    totalROI: 0,
  });
  const [roiGrowth, setRoiGrowth] = useState([]);

  useEffect(() => {
    const loadInvestorStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/my-investments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const accepted = res.data.filter(inv => inv.status === 'accepted');

        const totalAmount = accepted.reduce((sum, inv) => sum + (inv.currentContribution || 0), 0);
        const investmentCount = accepted.length;

        const roiList = await Promise.all(
          accepted.map(async (inv) => {
            try {
              const overviewRes = await axios.get(
                `${API_BASE_URL}/api/overview/public/${inv.businessId}`
              );
              const { income = 0, expenses = 0 } = overviewRes.data;
              const incomeNum = parseFloat(income);
              const expensesNum = parseFloat(expenses);

              if (expensesNum >= 100 && incomeNum > expensesNum && !isNaN(incomeNum)) {
                let roi = ((incomeNum - expensesNum) / (incomeNum + expensesNum)) * 10;
                roi = Math.min(roi, 10);
                return { title: inv.title, roi: roi.toFixed(2) };
              }
            } catch (e) {
              console.warn(`⚠️ ROI fetch failed for ${inv.businessId}`, e.message);
            }
            return { title: inv.title, roi: 0 };
          })
        );

        const totalROI = roiList.reduce((sum, inv) => sum + parseFloat(inv.roi), 0);

        setMyStats({ totalAmount, investmentCount, totalROI });
        setRoiGrowth(roiList);
      } catch (err) {
        console.error('Failed to fetch investment stats:', err);
      }
    };

    const loadTopBusinesses = async () => {
      try {
        const overviewRes = await axios.get(`${API_BASE_URL}/api/overview/all`);
        const overviews = overviewRes.data;

        const withProfiles = await Promise.all(
          overviews.map(async (ov) => {
            try {
              const profileRes = await axios.get(`${API_BASE_URL}/api/profile/public/${ov.user_id}`);
              const profile = profileRes.data;

              const income = parseFloat(ov.income || 0);
              const expenses = parseFloat(ov.expenses || 0);

              let roi = 0;
              if (expenses >= 100 && income > expenses && !isNaN(income)) {
                roi = ((income - expenses) / (income + expenses)) * 10;
                roi = Math.min(roi, 10);
              }

              return {
                ...profile,
                roi: roi.toFixed(2),
                income: ov.income,
              };
            } catch (err) {
              console.warn(`⚠️ No profile found for user ${ov.user_id}`);
              return null;
            }
          })
        );

        const filtered = withProfiles.filter(biz => biz !== null);
        const sorted = filtered.sort((a, b) => b.roi - a.roi).slice(0, 3);
        setTopBusinesses(sorted);
      } catch (err) {
        console.error('Failed to load top businesses:', err);
      }
    };

    loadInvestorStats();
    loadTopBusinesses();
  }, []);

  const chartData = {
    labels: roiGrowth.map(item => item.title),
    datasets: [
      {
        label: 'ROI (%) per Investment',
        data: roiGrowth.map(item => parseFloat(item.roi)),
        fill: false,
        borderColor: '#4f46e5',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        max: 12,
      },
    },
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      <div className={`dashboard-content ${darkMode ? 'dark' : ''}`}>
        <TopBar />
        <h1>Investor Overview</h1>

        {/* Overview Stats */}
        <div className="overview-section-wrapper">
          <div className="dashboard-cards">
            <div className="overview-card income-card">
              <div className="overview-card__info">
                <div>
                  <h3>Total Investment Amount</h3>
                  <p>${myStats.totalAmount.toLocaleString()}</p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" alt="bag" />
              </div>
            </div>
            <div className="overview-card sold-card">
              <div className="overview-card__info">
                <div>
                  <h3>Number of Investments</h3>
                  <p>{myStats.investmentCount}</p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/3703/3703261.png" alt="house" />
              </div>
            </div>
            <div className="overview-card expenses-card">
              <div className="overview-card__info">
                <div>
                  <h3>Return On Investment</h3>
                  <p>+{myStats.totalROI.toFixed(2)}%</p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/2171/2171994.png" alt="roi" />
              </div>
            </div>
          </div>
        </div>

        {/* ROI Chart */}
        <div className="dashboard-charts">
          <div className="chart-box">
            <div className="investor-chart-header">
              <h3>📈 ROI Growth by Investment</h3>
            </div>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Top Performing Businesses */}
          <div className="product-box">
            <h3 className="product-box-title">🏆 Top Performing Businesses</h3>
            <ul className="top-business-enhanced-list">
              {topBusinesses.map((biz, index) => (
                <li key={index}>
                  <div className="business-logo">
                    <img src={`${API_BASE_URL}/uploads/${biz.logo}`} alt={biz.business_name} />
                  </div>
                  <div className="business-info">
                    <h4>{biz.business_name}</h4>
                    <span className="roi">+{biz.roi}% ROI</span>
                  </div>
                </li>
              ))}
            </ul>
            <button className="investor-view-all-btn" onClick={() => setShowModal(true)}>
              🔍 View All
            </button>
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
                    <img className="biz-card-logo" src={`${API_BASE_URL}/uploads/${biz.logo}`} alt={biz.business_name} />
                    <div className="biz-card-info">
                      <h3>{biz.business_name}</h3>
                      <p><strong>Location:</strong> {biz.location}</p>
                      <p><strong>Email:</strong> {biz.business_email}</p>
                      <p><strong>ROI:</strong> {biz.roi}%</p>
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
