import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PredictionForm.css';
import mlImage from '../assets/ml-bg.png';
import {
  FaBuilding, FaGlobe, FaCity, FaCalendarAlt,
  FaMoneyBillWave, FaChartLine, FaSpinner, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';

const PredictionForm = ({ onClose, data, showPredict = true }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [investSuccessMessage, setInvestSuccessMessage] = useState('');
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [alreadySent, setAlreadySent] = useState(false);
  const [investorProfile, setInvestorProfile] = useState({});
 
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const ML_API_BASE_URL = import.meta.env.VITE_ML_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchInvestorProfile = async () => {
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setInvestorProfile(profileRes.data);
      } catch (err) {
        toast.error("Failed to load investor profile");
      }
    };

    if (data) {
      setFormData(data);
      setRaisedAmount(Number(data.currentContribution || 0));
      setGoalAmount(data.goalAmount || 0);
      fetchInvestorProfile();
    }
  }, [data]);

  const validateForm = () => {
    if (!formData.businessName) return 'Business Name is required.';
    if (!formData.marketCategory) return 'Market Category is required.';
    if (!formData.foundedYear) return 'Founded Year is required.';
    if (!formData.fundingTotalUSD) return 'Total Funding is required.';
    if (!formData.fundingRounds) return 'Funding Rounds are required.';
    if (!formData.countryCode) return 'Country is required.';
    if (!formData.city) return 'City is required.';
    return ''; // Return an empty string if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (result) return;
    setLoading(true);
    setShowPopup(true);
    setResult(null);

    // Wait for 10 seconds before proceeding with the prediction
    setTimeout(async () => {
      const errorMsg = validateForm();
      if (errorMsg) {
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${ML_API_BASE_URL}/predict`, {
          name: formData.businessName,
          market: formData.marketCategory,
          founded_year: formData.foundedYear,
          funding_total_usd: formData.fundingTotalUSD,
          funding_rounds: formData.fundingRounds,
          seed: formData.seedFunding,
          venture: formData.ventureFunding,
          angel: formData.angelFunding,
          debt_financing: formData.debtFinancing,
          convertible_note: formData.convertibleNote,
          equity_crowdfunding: formData.equityCrowdfunding,
          private_equity: formData.privateEquity,
          post_ipo_equity: formData.postIpoEquity,
          country_code: formData.countryCode,
          city: formData.city
        });

        setResult(response.data);
        setLoading(false);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Prediction failed');
        setLoading(false);
        setShowPopup(false);
      }
    }, 10000); // 10 seconds delay
  };

  const handleInvest = async () => {
    if (!investmentAmount || isNaN(investmentAmount) || parseFloat(investmentAmount) <= 0) {
      toast.error("Please enter a valid investment amount greater than 0");
      return;
    }
  
    if (!data?.user_id || !data?.investment_id) {
      toast.error("Missing business or investment information");
      return;
    }
  
    const token = localStorage.getItem('token');
  
    try {
      // 1. 💰 Create MyInvestment first (enforces uniqueness)
      const myInvestmentPayload = {
        investment_id: data.investment_id,
        businessId: data.user_id,
        title: data.title,
        image: data.image,
        purpose: data.purpose,
        reason: data.reason,
        goalAmount: data.goalAmount,
        currentContribution: parseFloat(investmentAmount),
      };
  
      await axios.post(`${API_BASE_URL}/api/my-investments`, myInvestmentPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      // 2. 🔔 Send notification only after MyInvestment creation success
      const notificationPayload = {
        title: 'New Investment Request',
        message: customMessage || `Hi, I am ${investorProfile.business_name}. I want to invest $${investmentAmount} in your business.`,
        amount: parseFloat(investmentAmount),
        createdAt: new Date().toISOString(),
        user_id: data.user_id,
        sender_name: investorProfile.business_name,
        sender_logo: investorProfile.logo,
        sender_email: investorProfile.email,
      };
  
      await axios.post(`${API_BASE_URL}/api/notifications`, notificationPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      // 3. 📥 Create InterestedInvestor after notification success
      const interestPayload = {
        investment_id: data.investment_id,
        businessId: data.user_id,
        name: investorProfile.business_name,
        email: investorProfile.email,
        image: investorProfile.logo,
        message: customMessage || `I want to invest $${investmentAmount} in your business.`,
        title: data.title,
        purpose: data.purpose,
        goalAmount: data.goalAmount,
        currentContribution: parseFloat(investmentAmount),
      };
  
      await axios.post(`${API_BASE_URL}/api/investors-interested`, interestPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      setRaisedAmount(prev => Number(prev) + Number(investmentAmount));
      setInvestSuccessMessage('✅ Investment request sent successfully!');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('You already sent an investment to this business for this product.');
        return;
      }
      console.error('Full error:', err);
      toast.error(err.response?.data?.message || 'Failed to send investment request');
    }
  };
  
  
  
  

  const renderProgressBar = () => {
    const percentage = Math.min((raisedAmount / goalAmount) * 100, 100);
    return (
      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div className="filled" style={{ width: `${percentage}%` }} />
        </div>
        <p className="progress-label">
  ${raisedAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()} goal
</p>
      </div>
    );
  };

  const renderInput = (label, icon, value) => (
    <div className="field-wrapper" key={label}>
      <label>{label}</label>
      <div className="input-box readonly">
        {icon && <span className="icon">{icon}</span>}
        <input type="text" value={value || ''} readOnly />
      </div>
    </div>
  );

  const renderCheckbox = (label, value) => (
    <label className="checkbox-label" key={label}>
      <input type="checkbox" checked={!!parseFloat(value)} readOnly />
      {label}
    </label>
  );

  const renderPopupResult = () => {
    if (loading) {
      return (
        <div className="popup-overlay">
          <div className="popup-card loading">
            <FaSpinner className="spinner-icon" />
            <p>The machine is analyzing the business,<br />please wait a moment...</p>
          </div>
        </div>
      );
    }

    if (!result) return null;

    const isSafe = result.prediction?.toLowerCase() === 'safe';

    return (
      <div className="popup-overlay">
        <div className="popup-card">
          <div className="result-header">
            {isSafe ? <FaCheckCircle className="icon-safe" /> : <FaExclamationTriangle className="icon-risk" />}
            {isSafe ? 'This Business is SAFE to Invest ✅' : 'This Business is RISKY ⚠️'}
          </div>

          <div className="result-box">
            {isSafe ? (
              <>
                <p>Our system believes this business shows good investment indicators such as:</p>
                <ul>
                  <li>✅ Stable founding year and market presence</li>
                  <li>✅ Sufficient funding rounds and sources</li>
                  <li>✅ Strong regional indicators</li>
                </ul>

                {renderProgressBar()}  {/* Correct spot */}

                <div className="field-wrapper">
                  <label>💸 Investment Amount</label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="field-wrapper">
                  <label>📝 Custom Message (Optional)</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <button className="btn invest" onClick={handleInvest}>
                  🤝 Proceed with Investment
                </button>

                {investSuccessMessage && (
                  <p className="success-msg">{investSuccessMessage}</p>
                )}
              </>
            ) : (
              <>
                <p>This business may be high-risk due to:</p>
                <ul>
                  <li>⚠️ Low or irregular funding history</li>
                  <li>⚠️ Limited presence in stable markets</li>
                  <li>⚠️ Unfavorable founding date or business age</li>
                </ul>
              </>
            )}
          </div>

          <div className="btn-row">
            <button className="btn cancel" onClick={() => setShowPopup(false)}>❌ Close Result</button>
          </div>
        </div>
      </div>
    );
  };

  if (!formData) return null;

  return (
    <div className="ml-prediction-wrapper" style={{ backgroundImage: `url(${mlImage})` }}>
      <ToastContainer />
      <div className="prediction-outer-card" style={{ maxHeight: '95vh', overflowY: 'auto' }}>
        <div className="glass-form-box">
          <form onSubmit={handleSubmit} className="compact-form">
            <h2 className="form-title">📊 Investment Risk Prediction</h2>

            <div className="form-section">
              <h3>🧾 Business Profile</h3>
              <div className="form-grid">
                {renderInput("Business Name", <FaBuilding />, formData.businessName)}
                {renderInput("Founded Year", <FaCalendarAlt />, formData.foundedYear)}
                {renderInput("Category", <FaChartLine />, formData.marketCategory)}
                {renderInput("Business Status", null, formData.businessStatus)}
              </div>
            </div>

            <div className="form-section">
              <h3>💰 Funding Information</h3>
              <div className="form-grid">
                {renderInput("Total Funding (USD)", <FaMoneyBillWave />, `$${formData.fundingTotalUSD}`)}
                {renderInput("Funding Rounds", <FaChartLine />, formData.fundingRounds)}
              </div>
              <div className="checkbox-grid">
                {renderCheckbox("Seed", formData.seedFunding)}
                {renderCheckbox("Venture", formData.ventureFunding)}
                {renderCheckbox("Angel", formData.angelFunding)}
                {renderCheckbox("Debt Financing", formData.debtFinancing)}
                {renderCheckbox("Convertible Note", formData.convertibleNote)}
                {renderCheckbox("Equity Crowdfunding", formData.equityCrowdfunding)}
                {renderCheckbox("Private Equity", formData.privateEquity)}
                {renderCheckbox("Post-IPO Equity", formData.postIpoEquity)}
              </div>
            </div>

            <div className="form-section">
              <h3>🌍 Location Information</h3>
              <div className="form-grid">
                {renderInput("Country", <FaGlobe />, formData.countryCode)}
                {renderInput("City", <FaCity />, formData.city)}
              </div>
            </div>

            <div className="btn-row">
              {showPredict && (
                <button className="btn predict" type="submit" disabled={loading || result !== null}>
                  {loading ? 'Predicting...' : '🧠 Predict'}
                </button>
              )}
              <button className="btn cancel" type="button" onClick={onClose}>❌ Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {showPopup && renderPopupResult()}
    </div>
  );
};

export default PredictionForm;