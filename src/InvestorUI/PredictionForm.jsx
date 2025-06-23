import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import './PredictionForm.css';
import mlImage from '../assets/ml-bg.png';
import {
  FaBuilding, FaGlobe, FaCity, FaCalendarAlt,
  FaMoneyBillWave, FaChartLine, FaSpinner, 
  FaCheckCircle, FaExclamationTriangle, FaHandHoldingUsd,
  FaShieldAlt, FaTimesCircle, FaThumbsUp, FaChartBar, FaComment,
  FaHandshake
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
  const [investorProfile, setInvestorProfile] = useState({});
  const [currentRiskField, setCurrentRiskField] = useState(0);
  const [riskFields, setRiskFields] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const ML_API_BASE_URL = import.meta.env.VITE_ML_API_BASE_URL;

  useEffect(() => {
    const fetchInvestorProfile = async () => {
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/api/investor-profile`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setInvestorProfile(profileRes.data);
      } catch (err) {
        console.error("Failed to load investor profile");
      }
    };

    if (data) {
      setFormData(data);
      setRaisedAmount(Number(data.currentContribution || 0));
      setGoalAmount(data.goalAmount || 0);
      fetchInvestorProfile();
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (result) return;
    setLoading(true);
    setShowPopup(true);
    setResult(null);

    const payload = {
      name: formData.businessName || 'Unknown',
      market: formData.marketCategory || 'Unknown',
      founded_year: parseInt(formData.foundedYear) || 2000,
      funding_total_usd: parseFloat(formData.fundingTotalUSD) || 0,
      funding_rounds: parseInt(formData.fundingRounds) || 0,
      seed: parseFloat(formData.seedFunding) || 0,
      venture: parseFloat(formData.ventureFunding) || 0,
      angel: parseFloat(formData.angelFunding) || 0,
      debt_financing: parseFloat(formData.debtFinancing) || 0,
      convertible_note: parseFloat(formData.convertibleNote) || 0,
      equity_crowdfunding: parseFloat(formData.equityCrowdfunding) || 0,
      private_equity: parseFloat(formData.privateEquity) || 0,
      post_ipo_equity: parseFloat(formData.postIpoEquity) || 0,
      country_code: formData.countryCode || 'Unknown',
      city: formData.city || 'Unknown'
    };

    try {
      // Show loading for 10 seconds regardless of prediction type
      setTimeout(async () => {
        const response = await axios.post(`${ML_API_BASE_URL}/predict`, payload);
        setResult(response.data);
        
        // Generate risk fields based on actual model concerns
        const generatedRiskFields = generateRiskFields(response.data, formData);
        setRiskFields(generatedRiskFields);
        setCurrentRiskField(0);
        
        // Show animation based on the result
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
          setLoading(false);
        }, 2000); // Show animation for 2 seconds
      }, 10000); // 10 seconds delay

    } catch (err) {
      setLoading(false);
      setResult({
        prediction: 'error',
        message: err.response?.data?.error || 'Prediction failed. Please check the business details.'
      });
    }
  };

  const generateRiskFields = (predictionResult, formData) => {
    const fields = [];
    const businessAge = new Date().getFullYear() - formData.foundedYear;
    
    // Only include fields that are actually problematic based on model logic
    if (businessAge < 5) {
      fields.push({
        field: 'businessAge',
        title: 'Business Age',
        value: businessAge,
        description: `The business is relatively new with only ${businessAge} years in operation. Younger businesses typically have higher failure rates as they are still establishing their market position and revenue streams.`,
        icon: <FaCalendarAlt />
      });
    } else if (businessAge < 10) {
      fields.push({
        field: 'businessAge',
        title: 'Business Age',
        value: businessAge,
        description: `The business has been operating for ${businessAge} years. While it shows some stability, it may still face challenges in establishing a strong market position.`,
        icon: <FaCalendarAlt />
      });
    } else {
      fields.push({
        field: 'businessAge',
        title: 'Business Age',
        value: businessAge,
        description: `The business has been established for ${businessAge} years, indicating a more stable operation.`,
        icon: <FaCalendarAlt />
      });
    }

    if (formData.fundingRounds < 3) {
      fields.push({
        field: 'fundingRounds',
        title: 'Funding Rounds',
        value: formData.fundingRounds,
        description: 'With only {value} funding rounds, the business has limited investor validation. More established businesses typically have 3+ funding rounds showing sustained investor interest.',
        icon: <FaChartLine />
      });
    }
    
    if ((formData.fundingTotalUSD || 0) < 1000000) {
      fields.push({
        field: 'totalFunding',
        title: 'Total Funding',
        value: formData.fundingTotalUSD ? `$${formData.fundingTotalUSD.toLocaleString()}` : '$0',
        description: 'The total funding amount of {value} is relatively low for this market segment. This may indicate challenges in securing investor confidence or limited resources for growth.',
        icon: <FaMoneyBillWave />
      });
    }
    
    if (!predictionResult.explanation.some(e => e.includes(formData.marketCategory))) {
      fields.push({
        field: 'marketCategory',
        title: 'Market Category',
        value: formData.marketCategory,
        description: 'The {value} market is highly competitive with many established players. Breaking into this space requires significant differentiation and resources.',
        icon: <FaBuilding />
      });
    }
    
    return fields;
  };
  
  const handleInvest = async () => {
    if (!investmentAmount || isNaN(investmentAmount) || parseFloat(investmentAmount) <= 0) {
      toast.error("Please enter a valid investment amount greater than 0");
      return;
    }

    const amountToInvest = parseFloat(investmentAmount);
    const remainingAmount = (goalAmount ?? 0) - (raisedAmount ?? 0);

    if (amountToInvest > remainingAmount) {
      toast.error(`You cannot invest more than $${remainingAmount.toLocaleString()} (remaining amount)`);
      return;
    }

    if (raisedAmount >= goalAmount) {
      toast.error("This investment has already reached its funding goal");
      return;
    }
  
    if (!data?.user_id || !data?.investment_id) {
      toast.error("Missing business or investment information");
      return;
    }
  
    const token = sessionStorage.getItem('token');
  
    try {
      const myInvestmentPayload = {
        investment_id: data.investment_id,
        businessId: data.user_id,
        title: data.title,
        image: data.image,
        purpose: data.purpose,
        reason: data.reason,
        goalAmount: data.goalAmount,
        currentContribution: amountToInvest,
      };
  
      await axios.post(`${API_BASE_URL}/api/my-investments`, myInvestmentPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      const notificationPayload = {
        title: 'New Investment Request',
        message: customMessage || `Hi, I am ${investorProfile.business_name}. I want to invest $${investmentAmount} in your business.`,
        amount: amountToInvest,
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
        currentContribution: amountToInvest,
      };
  
      await axios.post(`${API_BASE_URL}/api/investors-interested`, interestPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      setRaisedAmount(prev => Number(prev) + amountToInvest);
      setInvestSuccessMessage('✅ Investment request sent successfully!');
      setInvestmentAmount('');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('You already sent an investment to this business for this product.');
        return;
      }
      console.error('Full error:', err);
      toast.error(err.response?.data?.message || 'Failed to send investment request');
    }
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

  const handleNextRiskField = () => {
    setCurrentRiskField((prev) => (prev + 1) % riskFields.length);
  };

  const handlePrevRiskField = () => {
    setCurrentRiskField((prev) => (prev - 1 + riskFields.length) % riskFields.length);
  };

  const renderPopupResult = () => {
    if (loading) {
      return (
        <div className="popup-overlay">
          <div className="popup-card loading">
            <FaSpinner className="spinner-icon" />
            <p>The machine is analyzing the business,<br />please wait a moment...</p>
            <button className="btn cancel" onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      );
    }

    const isSafe = result.prediction?.toLowerCase() === 'safe';
    const isFullyFunded = (raisedAmount ?? 0) >= (goalAmount ?? 0);

    const remainingAmount = (goalAmount ?? 0) - (raisedAmount ?? 0);

    const progressPercent = Math.min(100, (raisedAmount ?? 0) / (goalAmount ?? 1) * 100);

    return (
      <div className="popup-overlay">
        <div className={`popup-card ${isSafe ? 'safe' : 'risky'}`}>
          <div className="result-header">
            <div className="icon-container">
              {isSafe ? (
                <>
                  <FaShieldAlt className="icon-safe" />
                  <FaThumbsUp className="icon-safe" />
                </>
              ) : (
                <div className="animated-risk-icon">
                  <FaExclamationTriangle className="icon-risk" />
                  <FaTimesCircle className="icon-risk" />
                </div>
              )}
            </div>
            <h2>{isSafe ? 'This Business is SAFE to Invest' : 'Investment Risk Detected'}</h2>
            <button className="popup-close-btn" onClick={() => setShowPopup(false)}>×</button>
          </div>

          <div className={`result-content ${isSafe ? 'safe-content' : 'risky-content'}`}>
            {showAnimation && (
              <div className={`animation-message ${isSafe ? 'congratulations' : 'sad'}`}>
                {isSafe ? '🎉 Congratulations! This business is safe to invest!' : '😢 This business is risky!'}
              </div>
            )}
            {isSafe ? (
              <>
                <div className="funding-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="funding-info">
                    <p className="funding-amount">
                      <FaMoneyBillWave /> ${raisedAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()} goal
                    </p>
                    <p className="funding-percent">
                      {Math.round(progressPercent)}% funded
                    </p>
                  </div>
                </div>

                {isFullyFunded ? (
                  <div className="fully-funded-message">
                    <h4><FaCheckCircle /> Funding Goal Reached</h4>
                    <p>This investment has already reached its funding goal of ${goalAmount.toLocaleString()}.</p>
                    <p>Thank you for your interest!</p>
                  </div>
                ) : (
                  <>
                    <div className="motivation-text">
                      <h4><FaChartBar /> Why this is a good investment:</h4>
                      <p>Our advanced analysis shows this business has strong potential based on:</p>
                      <ul>
                          <li><FaCheckCircle className="icon-list" /> Established for {new Date().getFullYear() - formData.foundedYear} years - shows business longevity</li>
                          
                          {(formData.fundingTotalUSD || 0) > 1000 && (
                            <li>
                              <FaCheckCircle className="icon-list" /> Strong financial backing with ${formData.fundingTotalUSD.toLocaleString()} total funding
                            </li>
                          )}

                          {formData.fundingRounds > 0 && (
                            <li>
                              <FaCheckCircle className="icon-list" /> Multiple funding rounds ({formData.fundingRounds}) indicating investor confidence
                            </li>
                          )}
                          
                          <li>
                            <FaCheckCircle className="icon-list" /> Solid presence in the {formData.marketCategory} market
                          </li>
                        </ul>

                      
                      <div className="confidence-meter">
                        <div className="meter-label">
                          <span>Investment Confidence:</span>
                          <span>{Math.round(result.probability * 100)}%</span>
                        </div>
                        <div className="meter-bar">
                          <div 
                            className="meter-fill" 
                            style={{ width: `${Math.round(result.probability * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="investment-encouragement">
                        <FaHandHoldingUsd /> This business meets our strict safety criteria for investors. 
                        Early investors often see the highest returns as the business grows.
                      </p>
                    </div>

                    <div className="investment-form">
                      <div className="field-wrapper">
                        <label><FaMoneyBillWave /> Investment Amount ($)</label>
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseFloat(value) > 0 && parseFloat(value) <= remainingAmount)) {
                              setInvestmentAmount(value);
                            } else if (parseFloat(value) > remainingAmount) {
                              toast.error(`Maximum investment amount is $${remainingAmount.toLocaleString()}`);
                            }
                          }}
                          placeholder={`Enter amount (max $${remainingAmount.toLocaleString()})`}
                          min="1"
                          max={remainingAmount}
                        />

                          <small className="remaining-amount">
                            Remaining amount: ${remainingAmount.toLocaleString()}
                          </small>

                      </div>

                      <div className="field-wrapper">
                        <label><FaComment /> Message to Business Owner (Optional)</label>
                        <textarea
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          rows={3}
                          placeholder="Add a personal message to the business owner..."
                        />
                      </div>

                      <button className="btn invest" onClick={handleInvest}>
                        <FaHandshake /> Send Investment Request
                      </button>

                      {investSuccessMessage && (
                        <p className="success-msg">{investSuccessMessage}</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="risk-explanation">
                  <h4><FaExclamationTriangle /> Investment Risk Detected</h4>
                  <p>We strongly recommend conducting additional due diligence before considering investment in this business.</p>
                  
                  {riskFields.length > 0 && (
                    <div className="risk-field-container">
                      <div className="current-risk-field">
                        <div className="risk-field-header">
                          {riskFields[currentRiskField]?.icon}
                          <h5>{riskFields[currentRiskField]?.title}</h5>
                        </div>
                        <div className="risk-field-value">
                          {riskFields[currentRiskField]?.value}
                        </div>
                        <p className="risk-field-description">
                          {riskFields[currentRiskField]?.description.replace('{value}', riskFields[currentRiskField]?.value)}
                        </p>
                      </div>

                      <div className="risk-navigation">
                        <button className="btn prev-risk" onClick={handlePrevRiskField} disabled={currentRiskField === 0}>
                          Previous
                        </button>
                        <span className="risk-counter">{currentRiskField + 1} of {riskFields.length}</span>
                        <button className="btn next-risk" onClick={handleNextRiskField} disabled={currentRiskField === riskFields.length - 1}>
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button className="btn cancel" onClick={() => setShowPopup(false)}>
                  <FaTimesCircle /> I Understand, Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!formData) return null;

  return (
    <div className="ml-prediction-wrapper" style={{ backgroundImage: `url(${mlImage})` }}>
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
              {renderInput("Total Funding (USD)", <FaMoneyBillWave />, formData.fundingTotalUSD ? `${formData.fundingTotalUSD.toLocaleString()}` : '0')}
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
                  {loading ? 'Predicting...' : '🧠 Predict Investment Safety'}
                </button>
              )}
              <button className="btn cancel" type="button" onClick={onClose}>❌ Close</button>
            </div>
          </form>
        </div>
      </div>

      {showPopup && renderPopupResult()}
    </div>
  );
};

export default PredictionForm;