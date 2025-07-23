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

const distributeTotalFunding = (data) => {
  if (!data) return {};
  
  if (!data.fundingTotalUSD || data.fundingTotalUSD === '0') {
    return {
      ...data,
      seedFunding: '0',
      ventureFunding: '0',
      angelFunding: '0',
      debtFinancing: '0',
      convertibleNote: '0',
      equityCrowdfunding: '0',
      privateEquity: '0',
      postIpoEquity: '0',
      fundingRounds: '0'
    };
  }

  if (data.fundingTotalUSD > 0 && 
      Object.keys(FUNDING_DESCRIPTIONS).every(field => !data[field] || data[field] === '0')) {
    const distributedData = {...data};
    let remaining = parseFloat(data.fundingTotalUSD);
    const roundGoals = {
      seedFunding: 5000,
      angelFunding: 10000,
      ventureFunding: 20000,
      convertibleNote: 40000,
      equityCrowdfunding: 50000,
      debtFinancing: 60000,
      privateEquity: 70000,
      postIpoEquity: 80000
    };

    let fundingRounds = 0;
    let currentRound = data.currentFundingRound || 'seedFunding';

    for (const field of Object.keys(FUNDING_DESCRIPTIONS)) {
      if (remaining <= 0) break;
      
      const goal = roundGoals[field] || 0;
      const allocated = Math.min(remaining, goal);
      
      if (allocated > 0) {
        distributedData[field] = allocated.toString();
        remaining -= allocated;
        fundingRounds++;
        currentRound = field;
      }
    }

    if (remaining > 0) {
      const lastRound = Object.keys(FUNDING_DESCRIPTIONS).pop();
      distributedData[lastRound] = (parseFloat(distributedData[lastRound]) + remaining).toString();
      distributedData[lastRound] = distributedData[lastRound].toString();
    }

    distributedData.fundingRounds = fundingRounds.toString();
    distributedData.currentFundingRound = currentRound;
    return distributedData;
  }

  return {
    ...data,
    seedFunding: data.seedFunding || '0',
    ventureFunding: data.ventureFunding || '0',
    angelFunding: data.angelFunding || '0',
    debtFinancing: data.debtFinancing || '0',
    convertibleNote: data.convertibleNote || '0',
    equityCrowdfunding: data.equityCrowdfunding || '0',
    privateEquity: data.privateEquity || '0',
    postIpoEquity: data.postIpoEquity || '0'
  };
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
    fundingTotalUSD: '0',
    fundingRounds: '0',
    seedFunding: '0',
    ventureFunding: '0',
    angelFunding: '0',
    debtFinancing: '0',
    convertibleNote: '0',
    equityCrowdfunding: '0',
    privateEquity: '0',
    postIpoEquity: '0'
  });

  // Auto-save functionality
  useEffect(() => {
    const saveData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          toast.error('No authentication token found');
          return;
        }

        await axios.put(`${API_BASE_URL}/api/profile-form`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Auto-save error:', error);
        toast.error('Failed to auto-save your data');
      }
    };

    // Set a timeout to save data after a delay (e.g., 2 seconds)
    const timeoutId = setTimeout(() => {
      saveData();
    }, 2000);

    // Cleanup function to clear the timeout if the component unmounts or formData changes
    return () => clearTimeout(timeoutId);
  }, [formData]); // Trigger auto-save on formData change

  const calculateMaturityScore = (data) => {
    const fundingFields = Object.keys(FUNDING_DESCRIPTIONS);
    return fundingFields.reduce((score, field) => {
      return score + (parseFloat(data[field]) > 0 ? 1 : 0);
    }, 0);
  };

  const calculateFundingRounds = (data) => {
    const fundingFields = Object.keys(FUNDING_DESCRIPTIONS);
    return fundingFields.reduce((rounds, field) => {
      return rounds + (parseFloat(data[field]) > 0 ? 1 : 0);
    }, 0);
  };

  const getFundingStage = (data) => {
    const activeStages = Object.entries(FUNDING_STAGES).reduce((acc, [stage, fields]) => {
      const hasStageFunding = fields.some(field => parseFloat(data[field]) > 0);
      return hasStageFunding ? [...acc, stage] : acc;
    }, []);

    if (activeStages.includes('Mature')) return 'Mature';
    if (activeStages.includes('Growth')) return 'Growth';
    return 'Early';
  };

  const handleFundingChange = (e) => {
    const { name, value } = e.target;
    
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      const updatedData = {
        ...formData,
        [name]: value
      };
      
      const calculatedRounds = calculateFundingRounds(updatedData);
      updatedData.fundingRounds = calculatedRounds.toString();

      const calculatedTotal = Object.keys(FUNDING_DESCRIPTIONS).reduce((total, field) => {
        return total + (parseFloat(updatedData[field]) || 0);
      }, 0);
      updatedData.fundingTotalUSD = calculatedTotal.toString();
      
      setFormData(updatedData);
    }
  };

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token');

        if (!token) {
          toast.error('No authentication token found');
          return;
        }

        console.log('Fetching from:', `${API_BASE_URL}/api/profile-form`);
        const profileResponse = await axios.get(`${API_BASE_URL}/api/profile-form`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Handle successful response
        if (profileResponse.data) {
          let profileData = distributeTotalFunding(profileResponse.data);
          
          const stringifiedData = {
            businessName: profileData.businessName || '',
            foundedYear: profileData.foundedYear || '',
            businessStatus: profileData.businessStatus || 'operating',
            marketCategory: profileData.marketCategory || '',
            countryCode: profileData.countryCode || '',
            city: profileData.city || '',
            fundingTotalUSD: profileData.fundingTotalUSD?.toString() || '0',
            fundingRounds: profileData.fundingRounds?.toString() || '0',
            seedFunding: profileData.seedFunding?.toString() || '0',
            ventureFunding: profileData.ventureFunding?.toString() || '0',
            angelFunding: profileData.angelFunding?.toString() || '0',
            debtFinancing: profileData.debtFinancing?.toString() || '0',
            convertibleNote: profileData.convertibleNote?.toString() || '0',
            equityCrowdfunding: profileData.equityCrowdfunding?.toString() || '0',
            privateEquity: profileData.privateEquity?.toString() || '0',
            postIpoEquity: profileData.postIpoEquity?.toString() || '0'
          };

          setFormData(stringifiedData);
          
          if (profileResponse.data.prediction) {
            setPrediction(profileResponse.data.prediction);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        
        if (error.response?.status === 404) {
          // It's okay if no profile exists yet
          setFormData({
            businessName: '',
            foundedYear: '',
            businessStatus: 'operating',
            marketCategory: '',
            countryCode: '',
            city: '',
            fundingTotalUSD: '0',
            fundingRounds: '0',
            seedFunding: '0',
            ventureFunding: '0',
            angelFunding: '0',
            debtFinancing: '0',
            convertibleNote: '0',
            equityCrowdfunding: '0',
            privateEquity: '0',
            postIpoEquity: '0'
          });
        } else {
          let errorMessage = `Error ${error.response?.status || ''}: ${error.response?.data?.message || 'Failed to load business profile'}`;
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, []);

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'businessName', 'foundedYear', 'marketCategory', 
      'countryCode', 'city'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        errors[field] = 'This field is required.';
      }
    }

    const fundingFields = Object.keys(FUNDING_DESCRIPTIONS);
    for (const field of fundingFields) {
      if (parseFloat(formData[field]) < 0) {
        errors[field] = 'Amount cannot be negative.';
      }
    }

    if (parseFloat(formData.fundingTotalUSD) < 0) {
      errors.fundingTotalUSD = 'Total funding cannot be negative.';
    }

    if (parseFloat(formData.fundingRounds) < 0) {
      errors.fundingRounds = 'Number of funding rounds cannot be negative.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  };

  const showValidationErrors = (errors) => {
    const sectionErrors = {
      'Basic Information': [],
      'Location Information': [],
      'Funding Information': []
    };

    Object.entries(errors).forEach(([field, error]) => {
      if (['businessName', 'foundedYear', 'businessStatus', 'marketCategory'].includes(field)) {
        sectionErrors['Basic Information'].push(`${field}: ${error}`);
      } else if (['countryCode', 'city'].includes(field)) {
        sectionErrors['Location Information'].push(`${field}: ${error}`);
      } else {
        sectionErrors['Funding Information'].push(`${field}: ${error}`);
      }
    });

    let errorMessage = 'Please fix the following errors:\n\n';
    Object.entries(sectionErrors).forEach(([section, errors]) => {
      if (errors.length > 0) {
        errorMessage += `• ${section}:\n${errors.join('\n')}\n\n`;
      }
    });

    toast.error(errorMessage, {
      duration: 8000,
      position: 'top-center',
      style: {
        maxWidth: '500px',
        whiteSpace: 'pre-line'
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      showValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = sessionStorage.getItem('token');
  
      if (!token) {
        toast.error('No authentication token found');
        setIsSubmitting(false);
        return;
      }
  
      // Prepare the data
      const postData = {
        ...formData,
        // Convert funding fields to numbers
        ...Object.fromEntries(
          Object.keys(FUNDING_DESCRIPTIONS).map(key => [
            key, 
            parseFloat(formData[key]) || 0
          ])
        ),
        fundingTotalUSD: parseFloat(formData.fundingTotalUSD) || 0,
        fundingRounds: calculateFundingRounds(formData),
        currentFundingRound: formData.currentFundingRound || getCurrentFundingRound(formData)
      };

      console.log('Attempting to save to:', `${API_BASE_URL}/api/profile-form`);
      
      // First try POST (create new)
      let response;
      try {
        response = await axios.post(`${API_BASE_URL}/api/profile-form`, postData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (postError) {
        // If POST fails with 404, try PUT (update existing)
        if (postError.response?.status === 404) {
          console.log('POST failed with 404, trying PUT...');
          response = await axios.put(`${API_BASE_URL}/api/profile-form`, postData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } else {
          throw postError; // Re-throw other errors
        }
      }

      // Handle successful response
      if (response.data.prediction) {
        setPrediction(response.data.prediction);
      }
      
      if (response.data.data) {
        const updatedData = distributeTotalFunding(response.data.data);
        setFormData(updatedData);
      }
    
      toast.success('Business profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      
      let errorMessage = 'Failed to save business profile';
      
      if (error.response) {
        // Handle different HTTP status codes
        switch (error.response.status) {
          case 401:
            errorMessage = 'Unauthorized - Please login again';
            break;
          case 404:
            errorMessage = 'Endpoint not found - Please check the server URL';
            break;
          case 500:
            errorMessage = 'Server error - Please try again later';
            break;
          default:
            if (error.response.data?.errors) {
              errorMessage = Object.values(error.response.data.errors).join('\n');
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
        }
      } else if (error.request) {
        errorMessage = 'Network error - Could not connect to server';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      });
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
  
                setFormData({
                  businessName: '',
                  foundedYear: '',
                  businessStatus: 'operating',
                  marketCategory: '',
                  countryCode: '',
                  city: '',
                  fundingTotalUSD: '0',
                  fundingRounds: '0',
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
                      onChange={handleNumberChange}
                      placeholder="Enter total amount"
                      min="0"
                      step="1000"
                      required
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

// Helper function to get current funding round
const getCurrentFundingRound = (data) => {
  const fundingSequence = [
    'seedFunding',
    'angelFunding',
    'ventureFunding',
    'convertibleNote',
    'equityCrowdfunding',
    'debtFinancing',
    'privateEquity',
    'postIpoEquity'
  ];

  // Find the last funding round with amount > 0
  for (let i = fundingSequence.length - 1; i >= 0; i--) {
    if (parseFloat(data[fundingSequence[i]]) > 0) {
      return fundingSequence[i];
    }
  }
  return 'seedFunding'; // default
};