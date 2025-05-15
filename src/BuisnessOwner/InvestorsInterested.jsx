import React, { useContext, useEffect, useState } from 'react';
import './investorsInterested.css';
import Sidebar from './sidebar';
import { FaEnvelope, FaCommentDots, FaUser } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { toast, Slide } from 'react-toastify';

const InvestorsInterested = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
  
        // Fetch investors from interested-investors endpoint
        const res = await axios.get('http://localhost:5000/api/investors-interested', config);
        
        // For each investor, verify status with my-investments endpoint
        const investorsWithVerifiedStatus = await Promise.all(
          res.data.map(async (inv) => {
            let email = '';
            let status = inv.status || 'pending';

            try {
              // Get investor email from profile
              const profileRes = await axios.get(
                `http://localhost:5000/api/profile/public/${inv.user_id}`,
                config
              );
              email = profileRes.data.business_email || '';
            } catch (err) {
              console.warn(`Failed to fetch email for investor ${inv.user_id}:`, err);
            }

            try {
              // Verify status with my-investments collection
              const investmentRes = await axios.get(
                `http://localhost:5000/api/my-investments/by-investment-id/${inv.investment_id}`,
                config
              );
              status = investmentRes.data?.status || status;
              
              // If status is different, update the interested-investor record
              if (investmentRes.data?.status && investmentRes.data.status !== inv.status) {
                await axios.patch(
                  'http://localhost:5000/api/interested-investors/update-status',
                  { investment_id: inv.investment_id, status: investmentRes.data.status },
                  config
                );
              }
            } catch (err) {
              console.warn(`Failed to verify status for investment ${inv.investment_id}:`, err);
            }

            return {
              ...inv,
              email,
              status
            };
          })
        );

        setInvestors(investorsWithVerifiedStatus);
      } catch (err) {
        console.error('Failed to fetch interested investors:', err);
        toast.error('Failed to load investors');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, [token, refetchTrigger]);

  const filteredInvestors = investors.filter(inv => 
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleStatusUpdate = async (investorId, investmentId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // First try updating through my-investments endpoint (which we know works)
      await axios.patch(
        'http://localhost:5000/api/my-investments/update-status',
        { investment_id: investmentId, status: newStatus },
        config
      );
  
      // Then try updating interested-investors if endpoint exists
      try {
        await axios.patch(
          'http://localhost:5000/api/interested-investors/update-status',
          { investment_id: investmentId, status: newStatus },
          config
        );
      } catch (err) {
        console.log('Interested-investors update endpoint not available, proceeding...');
      }
  
      // Immediately update UI without waiting for refresh
      setInvestors(prev => prev.map(inv => 
        inv._id === investorId ? { ...inv, status: newStatus } : inv
      ));
  
      toast.success(`Status updated to ${newStatus}`);
      
      // Optional: trigger a refetch after a short delay to ensure sync
      setTimeout(() => setRefetchTrigger(prev => prev + 1), 1000);
      
    } catch (err) {
      console.error('Status update error:', {
        investorId,
        investmentId,
        error: err.response?.data || err.message
      });
      
      toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`);
      
      // Revert UI if update failed
      setInvestors(prev => prev);
    }
  };

  const handleAccept = (investorId, investmentId) => {
    showConfirmToast({
      message: 'Are you sure you want to accept this investor?',
      onConfirm: () => handleStatusUpdate(investorId, investmentId, 'accepted')
    });
  };

  const handleReject = (investorId, investmentId) => {
    showConfirmToast({
      message: 'Are you sure you want to reject this investor?',
      onConfirm: () => handleStatusUpdate(investorId, investmentId, 'rejected')
    });
  };

  return (
    <div className={`investors-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="investors-content">
        <h1>Investors Interested</h1>
  
        <div className="investors-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search investors..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="showing-count">
            Showing <span className="count-badge">{filteredInvestors.length}</span> investors
          </div>
        </div>
  
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            Loading investors...
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="empty-state">
            <FaUser size={48} />
            <p>No investors found</p>
          </div>
        ) : (
          <div className="investor-grid">
            {filteredInvestors.map((inv) => (
              <div className="investor-card" key={inv._id}>
                <div className="card-header">
                  <div className="avatar-container">
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
                  </div>
                  <div className="name-box" title={inv.name || 'Unknown Investor'}>
                    {inv.name || 'Unknown Investor'}
                  </div>

                  <div className={`status-badge ${inv.status}`}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </div>
                </div>

                <div className="card-content">
                  <div className="contact-info">
                    <p>
                      <FaEnvelope /> {inv.email || 'No email provided'}
                    </p>
                  </div>

                  <div className="investment-details">
                    {inv.title && <p><strong>Title:</strong> <span>{inv.title}</span></p>}
                    {inv.purpose && <p><strong>Purpose:</strong> <span>{inv.purpose}</span></p>}
                    {inv.goalAmount && <p><strong>Goal:</strong> <span>${inv.goalAmount.toLocaleString()}</span></p>}
                    {inv.currentContribution && <p><strong>Contributed:</strong> <span>${inv.currentContribution.toLocaleString()}</span></p>}
                  </div>

                  {inv.message && (
                    <div className="message-container">
                      <p><FaCommentDots /> <strong>Message</strong></p>
                      <div className="message">{inv.message}</div>
                    </div>
                  )}
                </div>

                <div className="action-btns">
                  <button 
                    className="accept-btn" 
                    onClick={() => handleAccept(inv._id, inv.investment_id)}
                    disabled={inv.status === 'accepted'}
                    style={inv.status === 'accepted' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    {inv.status === 'accepted' ? 'Accepted' : 'Accept'}
                  </button>

                  <button 
                    className="reject-btn" 
                    onClick={() => handleReject(inv._id, inv.investment_id)}
                    disabled={inv.status === 'rejected'}
                    style={inv.status === 'rejected' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    {inv.status === 'rejected' ? 'Rejected' : 'Reject'}
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