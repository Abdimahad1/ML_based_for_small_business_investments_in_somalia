import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PredictionForm.css';
import mlImage from '../assets/ml-bg.png';
import {
  FaCity, FaGlobe, FaBriefcase, FaCalendarAlt,
  FaBalanceScale, FaMoneyBill, FaChartLine, FaShieldAlt
} from 'react-icons/fa';

const PredictionForm = ({ data, onClose }) => {
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    risk_score: '',
    founded_year: '',
    category_list: '',
    country_code: '',
    city: '',
    status: 'operating'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [investSuccessMessage, setInvestSuccessMessage] = useState('');
  const [investorProfile, setInvestorProfile] = useState({});
  const [alreadySent, setAlreadySent] = useState(false); // ✅ NEW
  const API_BASE_URL = 'http://localhost:3000';

  const showToast = (message, type = 'error') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      pauseOnHover: true,
      draggable: true,
    });
  };

  useEffect(() => {
    const loadFormFields = async () => {
      try {
        const businessUserId = typeof data.user_id === 'object' ? data.user_id._id : data.user_id;
        if (!businessUserId) {
          showToast('Missing user ID for business profile');
          return;
        }
  
        const [businessRes, investorRes, overviewRes, notifRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/profile/public/${businessUserId}`),
          axios.get(`http://localhost:5000/api/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`http://localhost:5000/api/overview/public/${businessUserId}`),
          axios.get(`http://localhost:5000/api/notifications`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
  
        const business = businessRes.data;
        const investor = investorRes.data;
        const overview = overviewRes.data;
  
        const income = overview.income || 0;
        const expenses = overview.expenses || 0;
        const risk_score = income - expenses;
  
        setFormData({
          income,
          expenses,
          risk_score,
          founded_year: business.founded_year || '',
          category_list: business.industry || 'General',
          country_code: business.country || '',
          city: business.city || '',
          status: business.status || 'operating'
        });
  
        setInvestorProfile({
          name: investor.business_name || 'Investor',
          email: investor.email || '',
          phone: investor.phone || '',
          logo: investor.logo || ''
        });
  
        if (data.goalAmount) {
          setInvestmentAmount(data.goalAmount);
        }
  
        const existing = notifRes.data.find(
          n => n.user_id === businessUserId && n.title === 'New Investment Request'
        );
  
        if (existing) {
          setAlreadySent(true);
          setInvestSuccessMessage('⚠️ You already sent an investment request to this business.');
        }
  
      } catch (err) {
        showToast(`Error loading profile: ${err.message}`);
      }
    };
  
    if (data?.user_id) {
      loadFormFields();
    } else {
      showToast('Missing user ID for business profile');
    }
  }, [data]);
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowPopup(true);

    try {
      const [res] = await Promise.all([
        axios.post(`${API_BASE_URL}/predict`, formData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }),
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);

      if (!res.data?.prediction) {
        throw new Error('Invalid prediction response');
      }

      setResult(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Prediction failed';
      showToast(errorMessage);
      setResult({ status: 'error', error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (alreadySent) {
      const duplicateMsg = '⚠️ You already sent an investment request to this business.';
      setInvestSuccessMessage(duplicateMsg);
      showToast(duplicateMsg, 'info');
      return;
    }
  
    if (!investmentAmount || isNaN(investmentAmount)) {
      const errorMsg = 'Please enter a valid investment amount.';
      setInvestSuccessMessage(`❌ ${errorMsg}`);
      showToast(errorMsg, 'error');
      return;
    }
  
    try {
      const rawId = data.userId || data.user_id;
      const userId = typeof rawId === 'object' && rawId._id ? rawId._id : String(rawId);
  
      if (!userId || !investorProfile?.name) {
        throw new Error('Missing required user data');
      }
  
      const investmentId = `inv-${Date.now()}-${userId.slice(-6)}`;
      const token = localStorage.getItem('token');
  
      // 1. Send investment request notification
      const payload = {
        title: 'New Investment Request',
        message: customMessage || `Hi, I am ${investorProfile.name}. I want to invest $${investmentAmount} in your ${formData.category_list} business.`,
        user_id: userId,
        investment_id: investmentId,
        sender_name: investorProfile.name,
        sender_logo: investorProfile.logo || '',
        sender_email: investorProfile.email || '',
        amount: parseFloat(investmentAmount),
        createdAt: new Date().toISOString()
      };
  
      await axios.post('http://localhost:5000/api/notifications', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // 2. Save to "My Investments"
      const myInvestmentPayload = {
        businessId: userId,
        investment_id: investmentId,
        title: data.title || 'Untitled Business',
        image: data.image || '',
        purpose: data.purpose || 'N/A',
        reason: data.reason || 'N/A',
        goalAmount: data.goalAmount || 0,
        currentContribution: parseFloat(investmentAmount),
        status: 'pending'
      };
  
      await axios.post('http://localhost:5000/api/my-investments', myInvestmentPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // 3. Save to "Interested Investors"
      const interestedInvestorPayload = {
        investment_id: investmentId,
        name: investorProfile.name,
        email: investorProfile.email,
        message: customMessage || `Hi, I am ${investorProfile.name}. I want to invest $${investmentAmount}`,
        image: investorProfile.logo || '',
        title: data.title || 'Untitled Business',
        purpose: data.purpose || 'N/A',
        goalAmount: data.goalAmount || 0,
        currentContribution: parseFloat(investmentAmount),
      };
  
      await axios.post('http://localhost:5000/api/investors-interested', interestedInvestorPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      setInvestSuccessMessage('✅ Investment request sent and saved successfully!');
      setAlreadySent(true);
      showToast('Investment request and record saved!', 'success');
  
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send investment request';
      setInvestSuccessMessage(`❌ ${errorMessage}`);
      showToast(errorMessage, 'error');
    }
  };
  
  
  
  
  
  
  

  const renderInput = (label, icon, value, mask = false) => (
    <div className="field-wrapper" key={label}>
      <label>{label}</label>
      <div className="input-box">
        {icon}
        <input type="text" readOnly value={mask ? '*****' : value} />
      </div>
    </div>
  );

  const closePopup = () => {
    setShowPopup(false);
    setResult(null);
    setInvestmentAmount('');
    setCustomMessage('');
    setInvestSuccessMessage('');
  };

  const getResultMessage = () => {
    if (!result) return null;
  
    if (result.status === 'error' || result.error) {
      return (
        <>
          <h4>❌ Prediction Error</h4>
          <p>{result.error || 'Something went wrong during prediction.'}</p>
        </>
      );
    }
  
    const { business_rule_check } = result;
    const income = parseFloat(formData.income);
    const expenses = parseFloat(formData.expenses);
    const riskScore = income - expenses;
  
    const passesIncomeCheck = income >= expenses + 6;
    const passesRiskScoreCheck = riskScore > 0;
    const passesBusinessRules = business_rule_check;
  
    const reasons = [];
  
    if (passesIncomeCheck) reasons.push("✅ Income exceeds expenses with a healthy buffer.");
    else reasons.push("❌ Income does not sufficiently exceed expenses.");
  
    if (passesRiskScoreCheck) reasons.push("✅ Risk score is positive, indicating profit potential.");
    else reasons.push("❌ Risk score is negative — potential financial risk.");
  
    if (passesBusinessRules) reasons.push("✅ Business rules passed (e.g., valid status, age, and region).");
    else reasons.push("❌ One or more business rules were not met.");
  
    const isTrulySafe = passesIncomeCheck && passesRiskScoreCheck && passesBusinessRules;
  
    const handleAmountChange = (e) => {
      const value = e.target.value;
      if (!isNaN(value) && parseFloat(value) > data.goalAmount) {
        showToast(`❌ You can't invest more than the goal ($${data.goalAmount})`, 'error');
        return;
      }
      setInvestmentAmount(value);
    };
  
    return (
      <>
        <h4>{isTrulySafe ? '✅ Safe Investment' : '❌ Risky Investment'}</h4>
        <p><strong>Status:</strong> {isTrulySafe ? 'This business is likely a safe investment.' : 'This business may be risky for investment.'}</p>
        <div style={{ textAlign: 'left', marginTop: '15px' }}>
          <p><strong>Why this result?</strong></p>
          <ul style={{ paddingLeft: '20px' }}>
            {reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
  
        {isTrulySafe && (
          <>
            <div className="field-row-inline">
              <div className="field-wrapper small">
                <label>🎯 Goal</label>
                <div className="input-box">
                  <input type="text" readOnly value={`$${data.goalAmount?.toLocaleString() || 0}`} />
                </div>
              </div>

              <div className="field-wrapper small">
                <label>📈 Raised</label>
                <div className="input-box">
                  <input type="text" readOnly value={`$${data.currentContribution?.toLocaleString() || 0}`} />
                </div>
              </div>
            </div>


  
            <div className="field-wrapper">
              <label>💸 Investment Amount</label>
              <div className="input-box">
                <input
                  type="number"
                  min="1"
                  value={investmentAmount}
                  onChange={handleAmountChange}
                  placeholder="Enter your amount"
                />
              </div>
            </div>
  
            <div className="field-wrapper">
              <label>📝 Custom Message (Optional)</label>
              <div className="input-box">
                <textarea
                  placeholder="Write a message to the business owner..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
  
            <div className="btn-row">
              <button className="btn invest-btn-safe" onClick={handleInvest}>
                🤝 Request Invest
              </button>
            </div>
          </>
        )}
  
        {investSuccessMessage && (
          <p style={{ marginTop: '20px', color: '#4ade80', fontWeight: 'bold', textAlign: 'center' }}>
            {investSuccessMessage}
          </p>
        )}
  
        <div className="btn-row">
          <button className="btn close" onClick={closePopup}>Close</button>
        </div>
      </>
    );
  };
  

  return (
    <div className="ml-prediction-wrapper">
      <ToastContainer />
      <div className="prediction-outer-card" style={{ backgroundImage: `url(${mlImage})` }}>
        <div className="glass-form-box">
          <h2>🚀 ML PREDICTION</h2>
          <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {renderInput("Category", <FaBriefcase />, formData.category_list)}
            {renderInput("Status", <FaShieldAlt />, formData.status)}
            {renderInput("Country", <FaGlobe />, formData.country_code)}
            {renderInput("City", <FaCity />, formData.city)}
            {renderInput("Founded Year", <FaCalendarAlt />, formData.founded_year)}
            {renderInput("Income", <FaMoneyBill />, formData.income, true)}
            {renderInput("Expenses", <FaBalanceScale />, formData.expenses, true)}
            {renderInput("Risk Score", <FaChartLine />, formData.risk_score, true)}

          </div>
          <div className="btn-row">
            <button className="btn predict" type="submit" disabled={loading}>
              {loading ? 'Predicting...' : '🧠 PREDICT'}
            </button>
            <button className="btn cancel" type="button" onClick={onClose}>❌ CANCEL</button>
          </div>
        </form>

        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            {loading ? (
              <div className="analyzing-animation">
                <div className="loading-dots"></div>
                <p>Machine is analyzing the business data...</p>
              </div>
            ) : (
              <div className="result-message">{getResultMessage()}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
