import React, { useContext, useEffect, useState } from 'react';
import './investorsInterested.css';
import Sidebar from './sidebar';
import { FaEnvelope, FaCommentDots, FaUser } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const InvestorsInterested = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investors, setInvestors] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
  
        const res = await axios.get(`${API_BASE_URL}/api/investors-interested`, config);
  
        const investorsWithVerifiedStatus = await Promise.all(
          res.data.map(async (inv) => {
            let email = '';
            let status = inv.status || 'pending';
  
            try {
              const profileRes = await axios.get(
                `${API_BASE_URL}/api/profile/public/${inv.user_id}`,
                config
              );
              email = profileRes.data.business_email || '';
            } catch (err) {
              console.warn(`Failed to fetch email for investor ${inv.user_id}:`, err);
            }
  
            try {
              const investmentRes = await axios.get(
                `${API_BASE_URL}/api/my-investments/by-investment-id/${inv.investment_id}`,
                config
              );
              status = investmentRes.data?.status || status;
  
              if (investmentRes.data?.status && investmentRes.data.status !== inv.status) {
                await axios.patch(
                  `${API_BASE_URL}/api/interested-investors/update-status`,
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
      }
    };
  
    fetchInvestors();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(fetchInvestors, 30000);
    return () => clearInterval(interval);
  }, [token, refetchTrigger]);
  

  const filteredInvestors = investors.filter(inv =>
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (investorId, investmentId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      await axios.patch(
        `${API_BASE_URL}/api/my-investments/update-status`,
        { investment_id: investmentId, status: newStatus },
        config
      );
  
      try {
        await axios.patch(
          `${API_BASE_URL}/api/interested-investors/update-status`,
          { investment_id: investmentId, status: newStatus },
          config
        );
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('interested-investors update error:', err);
          toast.error(`Failed to update interested-investors: ${err.response?.data?.message || err.message}`);
        }
      }
  
      setInvestors(prev =>
        prev.map(inv =>
          inv._id === investorId ? { ...inv, status: newStatus } : inv
        )
      );
  
      toast.success(`Status updated to ${newStatus}`);
      setTimeout(() => setRefetchTrigger(prev => prev + 1), 1000);
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };
  

  const handleAccept = (investorId, investmentId) => {
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to accept this investor?</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => {
              handleStatusUpdate(investorId, investmentId, 'accepted');
              toast.dismiss(t.id);
            }}
            style={{
              marginRight: '8px',
              padding: '5px 10px',
              backgroundColor: '#10b981',
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

  const handleReject = (investorId, investmentId) => {
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p>Are you sure you want to reject this investor?</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => {
              handleStatusUpdate(investorId, investmentId, 'rejected');
              toast.dismiss(t.id);
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

        {filteredInvestors.length === 0 ? (
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
                        src={`${API_BASE_URL}/uploads/${inv.image}`}
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
