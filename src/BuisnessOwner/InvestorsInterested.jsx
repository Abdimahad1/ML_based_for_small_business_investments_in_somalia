import React, { useContext, useEffect, useState } from 'react';
import './investorsInterested.css';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import { FaEnvelope, FaCommentDots, FaChevronCircleRight, FaUser } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { toast, Slide } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InvestorsInterested = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Step 1: Get list of interested investors
        const res = await axios.get('http://localhost:5000/api/investors-interested', config);

        // Step 2: For each investor, fetch business_email from their public profile
        const investorsWithEmail = await Promise.all(
          res.data.map(async (inv) => {
            try {
              const profileRes = await axios.get(`http://localhost:5000/api/profile/public/${inv.user_id}`);
              return {
                ...inv,
                email: profileRes.data.business_email || ''
              };
            } catch (err) {
              console.warn('Failed to fetch business_email for investor:', err);
              return { ...inv, email: '' };
            }
          })
        );

        setInvestors(investorsWithEmail);
      } catch (err) {
        console.error('❌ Failed to fetch interested investors:', err);
        toast.error('Failed to load investors');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, [token, refetchTrigger]);


  const showConfirmToast = ({ message, onConfirm }) => {
    const id = toast.info(
      ({ closeToast }) => (
        <div>
          <p style={{ marginBottom: '10px' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px' }}
              onClick={() => {
                onConfirm();
                toast.dismiss(id);
              }}
            >
              Yes
            </button>
            <button
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px' }}
              onClick={() => toast.dismiss(id)}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        transition: Slide,
        position: 'top-center'
      }
    );
  };
  
  const handleAccept = (investorId) => {
    showConfirmToast({
      message: 'Are you sure you want to accept this investor?',
      onConfirm: async () => {
        try {
          await axios.patch(
            `http://localhost:5000/api/investors-interested/${investorId}`,
            { status: 'accepted' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('✅ Investor accepted!');
          setRefetchTrigger(prev => prev + 1);
        } catch (err) {
          toast.error('❌ Failed to accept investor');
        }
      }
    });
  };
  
  const handleReject = (investorId) => {
    showConfirmToast({
      message: 'Are you sure you want to reject this investor?',
      onConfirm: async () => {
        try {
          await axios.delete(
            `http://localhost:5000/api/investors-interested/${investorId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('✅ Investor removed');
          setInvestors(prev => prev.filter(inv => inv._id !== investorId));
        } catch (err) {
          toast.error('❌ Failed to reject investor');
        }
      }
    });
  };
  
  

  return (
    <div className={`investors-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="investors-content">
        <TopBar />
        <h1>Investors</h1>

        <div className="investors-header">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search investors..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="showing-count">
            Showing <span className="count-badge">{investors.length}</span> investors
          </div>
          <button className="filter-btn">Filter</button>
          
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            Loading investors...
          </div>
        ) : investors.length === 0 ? (
          <div className="empty-state">
            <FaUser size={48} />
            <p>No investors found</p>
  
          </div>
        ) : (
          <div className="investor-grid">
            {investors.map((inv) => (
              <div className="investor-card" key={inv._id}>
                <div className="card-header">
                  {inv.image ? (
                    <img 
                      className="avatar" 
                      src={`http://localhost:5000/uploads/${inv.image}`} 
                      alt={inv.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {inv.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="name-box">
                    {inv.name || 'Unknown Investor'}
                  </div>
                  <div className="detail-icon">
                    <FaChevronCircleRight />
                  </div>
                </div>

                <div className="contact-info">
                  <p>
                    <FaEnvelope /> 
                    {inv.email ? (
                      <a href={`mailto:${inv.email}`}>{inv.email}</a>
                    ) : (
                      <span>No email provided</span>
                    )}
                  </p>
                  {inv.message && (
                    <>
                      <p><FaCommentDots /> <strong>Message</strong></p>
                      <p className="message">"{inv.message}"</p>
                    </>
                  )}
                </div>

                <div className="action-btns">
                  <button 
                    className="accept-btn"
                    onClick={() => handleAccept(inv._id)}
                    disabled={inv.status === 'accepted'}
                  >
                    {inv.status === 'accepted' ? 'Accepted' : 'Accept'}
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(inv._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorsInterested;
