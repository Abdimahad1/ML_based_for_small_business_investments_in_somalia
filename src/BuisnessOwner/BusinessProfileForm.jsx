import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from './sidebar';
import { FaBuilding, FaChartLine, FaGlobe, FaCalendarAlt, FaMoneyBillWave, FaTrash, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './businessProfileForm.css';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the API

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

  // Updated useEffect to handle 404 errors and reset form state
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Debug: Check token

        if (!token) {
          toast.error('No authentication token found');
          return;
        }

        // Attempt to fetch the user's profile
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
          
          setFormData(profileData);
          
          if (profileResponse.data.prediction) {
            setPrediction(profileResponse.data.prediction);
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // If the profile is not found, allow the user to create a new one without clearing the fields
          console.log('No existing profile found, user can create a new one.');
          // Do not reset formData here, keep it editable
        } else {
          console.error('Error loading profile:', error);
          toast.error(`Error ${error.response?.status}: ${error.response?.data?.message || 'Failed to load business profile'}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, []);

  // Handle number input changes
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
      'countryCode', 'city', 'fundingTotalUSD', 'fundingRounds'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill all required fields`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug: Check token

      if (!token) {
        toast.error('No authentication token found');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/profile-form`, formData, {
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
      console.error('Error saving profile:', error);
      
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || 'Failed to save business profile'}`);
      } else {
        toast.error('Network error. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your business profile? This action cannot be undone.');
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Debug: Check token

        if (!token) {
          toast.error('No authentication token found');
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
        console.error('Error deleting profile:', error);
        if (error.response) {
          toast.error(`Error: ${error.response.data.message || 'Failed to delete business profile'}`);
        } else {
          toast.error('Network error. Please try again later.');
        }
      }
    }
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
                    <span className="tooltip-icon" title="The total number of funding rounds the business has completed.">
                      <FaInfoCircle />
                    </span>
                  </label>
                  <input
                    type="number"
                    id="fundingRounds"
                    name="fundingRounds"
                    value={formData.fundingRounds}
                    onChange={handleNumberChange}
                    placeholder="Enter number of rounds"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <h3 className="busprof-subsection-title">
                <FaChartLine className="busprof-subsection-icon" />
                Funding Breakdown (USD)
              </h3>
              
              <div className="busprof-form-grid">
                {Object.entries(FUNDING_DESCRIPTIONS).map(([field, description]) => (
                  <div className="busprof-form-group" key={field}>
                    <label htmlFor={field}>
                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      <span className="tooltip-icon" title={description}>
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
                        onChange={handleNumberChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
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