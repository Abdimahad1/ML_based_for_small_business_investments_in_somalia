import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from './sidebar';
import { FaBuilding, FaChartLine, FaGlobe, FaCalendarAlt, FaMoneyBillWave, FaTrash, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import './businessProfileForm.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tooltip descriptions for funding fields
const FUNDING_DESCRIPTIONS = {
  seedFunding: "Initial funding used to start the business, typically from founders' personal savings or friends/family",
  ventureFunding: "Investment from venture capital firms in exchange for equity",
  angelFunding: "Investment from wealthy individuals (angels) in early-stage companies",
  debtFinancing: "Funding through loans that must be repaid with interest",
  convertibleNote: "Short-term debt that converts into equity, typically in future financing round",
  equityCrowdfunding: "Raising small amounts of money from many people, typically via online platforms",
  privateEquity: "Investment in companies not listed on a public exchange",
  postIpoEquity: "Additional equity funding raised after the company has gone public"
};

// Funding maturity stages
const FUNDING_STAGES = {
  Early: ['seedFunding', 'angelFunding'],
  Growth: ['ventureFunding', 'convertibleNote', 'equityCrowdfunding'],
  Mature: ['debtFinancing', 'privateEquity', 'postIpoEquity']
};

const BusinessProfileForm = () => {
  const { darkMode } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  const [formData, setFormData] = useState({
    businessName: '',
    foundedYear: '',
    businessStatus: 'operating',
    marketCategory: '',
    countryCode: '',
    city: '',
    fundingTotalUSD: '',
    fundingRounds: '',
    seedFunding: '0',
    ventureFunding: '0',
    angelFunding: '0',
    debtFinancing: '0',
    convertibleNote: '0',
    equityCrowdfunding: '0',
    privateEquity: '0',
    postIpoEquity: '0'
  });

  // Calculate funding maturity score
  const calculateMaturityScore = (data) => {
    const fundingFields = Object.keys(FUNDING_DESCRIPTIONS);
    return fundingFields.reduce((score, field) => {
      return score + (parseFloat(data[field]) > 0 ? 1 : 0);
    }, 0);
  };

  // Calculate funding rounds automatically
  const calculateFundingRounds = (data) => {
    const fundingFields = Object.keys(FUNDING_DESCRIPTIONS);
    return fundingFields.reduce((rounds, field) => {
      return rounds + (parseFloat(data[field]) > 0 ? 1 : 0);
    }, 0);
  };

  // Get funding stage based on funding types
  const getFundingStage = (data) => {
    const activeStages = Object.entries(FUNDING_STAGES).reduce((acc, [stage, fields]) => {
      const hasStageFunding = fields.some(field => parseFloat(data[field]) > 0);
      return hasStageFunding ? [...acc, stage] : acc;
    }, []);

    if (activeStages.includes('Mature')) return 'Mature';
    if (activeStages.includes('Growth')) return 'Growth';
    return 'Early';
  };

  // Handle funding field changes
  const handleFundingChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only positive numbers or empty string
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      const updatedData = {
        ...formData,
        [name]: value
      };
      
      // Calculate and update funding rounds automatically
      const calculatedRounds = calculateFundingRounds(updatedData);
      updatedData.fundingRounds = calculatedRounds.toString();
      
      setFormData(updatedData);
    }
  };

  // Updated useEffect to handle 404 errors and reset form state
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token');

        if (!token) {
          toast.error('No authentication token found');
          return;
        }

        const profileResponse = await axios.get(`${API_BASE_URL}/api/profile-form`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (profileResponse.data) {
          const profileData = {
            businessName: profileResponse.data.businessName || '',
            foundedYear: profileResponse.data.foundedYear || '',
            businessStatus: profileResponse.data.businessStatus || 'operating',
            marketCategory: profileResponse.data.marketCategory || '',
            countryCode: profileResponse.data.countryCode || '',
            city: profileResponse.data.city || '',
            fundingTotalUSD: profileResponse.data.fundingTotalUSD || '',
            fundingRounds: profileResponse.data.fundingRounds || '',
            seedFunding: profileResponse.data.seedFunding || '0',
            ventureFunding: profileResponse.data.ventureFunding || '0',
            angelFunding: profileResponse.data.angelFunding || '0',
            debtFinancing: profileResponse.data.debtFinancing || '0',
            convertibleNote: profileResponse.data.convertibleNote || '0',
            equityCrowdfunding: profileResponse.data.equityCrowdfunding || '0',
            privateEquity: profileResponse.data.privateEquity || '0',
            postIpoEquity: profileResponse.data.postIpoEquity || '0'
          };
          
          if (!profileResponse.data.fundingRounds) {
            profileData.fundingRounds = calculateFundingRounds(profileData).toString();
          }
          
          setFormData(profileData);
          
          if (profileResponse.data.prediction) {
            setPrediction(profileResponse.data.prediction);
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error('No existing profile found, user can create a new one.');
        } else {
          toast.error(`Error ${error.response?.status}: ${error.response?.data?.message || 'Failed to load business profile'}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, []);

  // Handle number input changes (for non-funding fields)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Allow only positive numbers or empty string
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle text input changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Validate required fields
    const requiredFields = [
      'businessName', 'foundedYear', 'marketCategory', 
      'countryCode', 'city'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill all required fields`);
        setIsSubmitting(false);
        return;
      }
    }
  
    try {
      const token = sessionStorage.getItem('token');
  
      if (!token) {
        toast.error('No authentication token found');
        setIsSubmitting(false);
        return;
      }
  
      // 👉 Fix fundingTotalUSD empty string → 0
      const postData = {
        ...formData,
        fundingTotalUSD:
          formData.fundingTotalUSD === '' || formData.fundingTotalUSD == null
            ? 0
            : parseFloat(formData.fundingTotalUSD)
      };
  
      const response = await axios.post(`${API_BASE_URL}/api/profile-form`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.prediction) {
        setPrediction(response.data.prediction);
      }
      toast.success('Business profile saved successfully!');
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || 'Failed to save business profile'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDelete = async () => {
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to delete your business profile? This action cannot be undone.</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  toast.error('No authentication token found');
                  toast.dismiss(t.id);
                  return;
                }
  
                await axios.delete(`${API_BASE_URL}/api/profile-form`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
  
                // Reset form
                setFormData({
                  businessName: '',
                  foundedYear: '',
                  businessStatus: 'operating',
                  marketCategory: '',
                  countryCode: '',
                  city: '',
                  fundingTotalUSD: '',
                  fundingRounds: '',
                  seedFunding: '0',
                  ventureFunding: '0',
                  angelFunding: '0',
                  debtFinancing: '0',
                  convertibleNote: '0',
                  equityCrowdfunding: '0',
                  privateEquity: '0',
                  postIpoEquity: '0'
                });
                setPrediction(null);
  
                toast.success('Business profile deleted successfully');
              } catch (error) {
                if (error.response) {
                  toast.error(`Error: ${error.response.data.message || 'Failed to delete business profile'}`);
                } else {
                  toast.error('Network error. Please try again later.');
                }
              } finally {
                toast.dismiss(t.id);
              }
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
    ), {
      duration: Infinity,
      position: 'top-center'
    });
  };
  

  if (isLoading) {
    return (
      <div className={`busprof-container ${darkMode ? 'busprof-dark' : ''}`}>
        <Sidebar />
        <div className="busprof-content">
          <div className="busprof-loading">
            Loading your business profile...
          </div>
        </div>
      </div>
    );
  }

  // Calculate current metrics
  const maturityScore = calculateMaturityScore(formData);
  const fundingStage = getFundingStage(formData);
  const maxMaturityScore = Object.keys(FUNDING_DESCRIPTIONS).length;

  return (
    <div className={`busprof-container ${darkMode ? 'busprof-dark' : ''}`}>
      <Sidebar />
      <div className="busprof-content">
        <div className="busprof-form-wrapper">
          <div className="busprof-header">
            <div className="busprof-header-content">
              <FaBuilding className="busprof-header-icon" />
              <h1>Business Profile</h1>
            </div>
            <p className="busprof-subtitle">
              Complete your business profile to enable investment predictions and personalized recommendations.
              All fields are required unless marked as optional.
            </p>
          </div>

          {prediction && prediction.result !== 'Unknown' && (
            <div className={`busprof-prediction ${prediction.result === 'Safe' ? 'safe' : 'not-safe'}`}>
              <h3>Investment Prediction:</h3>
              <p>
                {prediction.result} {prediction.probability ? `(${Math.round(prediction.probability * 100)}% confidence)` : ''}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="busprof-form">
            {/* Basic Information Section */}
            <div className="busprof-section">
              <h2 className="busprof-section-title">
                <FaBuilding className="busprof-section-icon" />
                Basic Information
              </h2>
              
              <div className="busprof-form-grid">
                <div className="busprof-form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleTextChange}
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                
                <div className="busprof-form-group">
                  <label htmlFor="foundedYear">Founded Year</label>
                  <input
                    type="number"
                    id="foundedYear"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleNumberChange}
                    placeholder="YYYY"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                
                <div className="busprof-form-group">
                  <label htmlFor="businessStatus">Business Status</label>
                  <select
                    id="businessStatus"
                    name="businessStatus"
                    value={formData.businessStatus}
                    onChange={handleTextChange}
                    required
                  >
                    <option value="operating">Operating</option>
                    <option value="acquired">Acquired</option>
                    <option value="closed">Closed</option>
                    <option value="ipo">IPO</option>
                  </select>
                </div>
                
                <div className="busprof-form-group">
                  <label htmlFor="marketCategory">Market Category</label>
                  <select
                    id="marketCategory"
                    name="marketCategory"
                    value={formData.marketCategory}
                    onChange={handleTextChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Technology">Technology</option>
                    <option value="Retail">Retail</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Energy">Energy</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Location Information Section */}
            <div className="busprof-section">
              <h2 className="busprof-section-title">
                <FaGlobe className="busprof-section-icon" />
                Location Information
              </h2>
              
              <div className="busprof-form-grid">
                <div className="busprof-form-group">
                  <label htmlFor="countryCode">Country</label>
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleTextChange}
                    required
                  >
                    <option value="">Select country</option>
                    <option value="SOM">Somalia</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CAN">Canada</option>
                    <option value="AUS">Australia</option>
                    <option value="DEN">Denmark</option>
                    <option value="FRA">France</option>
                    <option value="JAP">Japan</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="busprof-form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleTextChange}
                    placeholder="Enter business headquarters city"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Funding Information Section */}
            <div className="busprof-section">
              <h2 className="busprof-section-title">
                <FaMoneyBillWave className="busprof-section-icon" />
                Funding Information
              </h2>
              
              {/* Funding Metrics */}
              <div className="busprof-metrics-container">
                <div className="busprof-metric">
                  <div className="busprof-metric-label">Funding Stage</div>
                  <div className="busprof-metric-value">{fundingStage}</div>
                </div>
                <div className="busprof-metric">
                  <div className="busprof-metric-label">Maturity Score</div>
                  <div className="busprof-metric-value">
                    {maturityScore} <span className="busprof-metric-max">/ {maxMaturityScore}</span>
                  </div>
                </div>
              </div>
              
              <div className="busprof-form-grid">
              <div className="busprof-form-group">
                <label htmlFor="fundingTotalUSD">
                  Total Funding Received (USD)
                  <span className="tooltip-icon" title="The total amount of funding received by the business in USD.">
                    <FaInfoCircle />
                  </span>
                </label>
                <div className="busprof-input-with-symbol">
                  <span>$</span>
                  <input
                    type="number"
                    id="fundingTotalUSD"
                    name="fundingTotalUSD"
                    value={formData.fundingTotalUSD}
                    placeholder="Enter total amount"
                    min="0"
                    step="1000"
                    required
                    readOnly
                    className="busprof-readonly-input"
                  />
                </div>
              </div>             
                <div className="busprof-form-group">
                  <label htmlFor="fundingRounds">
                    Number of Funding Rounds
                    <span className="tooltip-icon" title="Automatically calculated based on the number of funding types with non-zero amounts">
                      <FaInfoCircle />
                    </span>
                  </label>
                  <input
                    type="number"
                    id="fundingRounds"
                    name="fundingRounds"
                    value={formData.fundingRounds}
                    onChange={handleNumberChange}
                    placeholder="Calculated automatically"
                    min="0"
                    required
                    readOnly
                    className="busprof-readonly-input"
                  />
                </div>
              </div>
              
              <h3 className="busprof-subsection-title">
                <FaChartLine className="busprof-subsection-icon" />
                Funding Breakdown (USD)
                <span className="busprof-subsection-note">Enter amounts to automatically calculate rounds</span>
              </h3>
              
              <div className="busprof-funding-stage-group">
                <h4 className="busprof-funding-stage-title">Early Stage</h4>
                <div className="busprof-form-grid">
                  {FUNDING_STAGES.Early.map(field => (
                    <div className="busprof-form-group" key={field}>
                      <label htmlFor={field}>
                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        <span className="tooltip-icon" title={FUNDING_DESCRIPTIONS[field]}>
                          <FaInfoCircle />
                        </span>
                      </label>
                      <div className="busprof-input-with-symbol">
                        <span>$</span>
                        <input
                          type="number"
                          id={field}
                          name={field}
                          value={formData[field]}
                          onChange={handleFundingChange}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="busprof-funding-stage-group">
                <h4 className="busprof-funding-stage-title">Growth Stage</h4>
                <div className="busprof-form-grid">
                  {FUNDING_STAGES.Growth.map(field => (
                    <div className="busprof-form-group" key={field}>
                      <label htmlFor={field}>
                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        <span className="tooltip-icon" title={FUNDING_DESCRIPTIONS[field]}>
                          <FaInfoCircle />
                        </span>
                      </label>
                      <div className="busprof-input-with-symbol">
                        <span>$</span>
                        <input
                          type="number"
                          id={field}
                          name={field}
                          value={formData[field]}
                          onChange={handleFundingChange}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="busprof-funding-stage-group">
                <h4 className="busprof-funding-stage-title">Mature Stage</h4>
                <div className="busprof-form-grid">
                  {FUNDING_STAGES.Mature.map(field => (
                    <div className="busprof-form-group" key={field}>
                      <label htmlFor={field}>
                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        <span className="tooltip-icon" title={FUNDING_DESCRIPTIONS[field]}>
                          <FaInfoCircle />
                        </span>
                      </label>
                      <div className="busprof-input-with-symbol">
                        <span>$</span>
                        <input
                          type="number"
                          id={field}
                          name={field}
                          value={formData[field]}
                          onChange={handleFundingChange}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="busprof-form-actions">
              <button 
                type="submit" 
                className="busprof-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Business Profile'}
              </button>
              
              {formData.businessName && (
                <button 
                  type="button" 
                  className="busprof-delete-btn"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <FaTrash className="busprof-delete-icon" /> Delete Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileForm;