import React, { useContext, useEffect, useState } from 'react';
import './investorsInterested.css';
import Sidebar from './sidebar';
import { FaEnvelope, FaCommentDots, FaUser, FaSearch, FaClock, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const InvestorsInterested = () => {
  const { darkMode } = useContext(ThemeContext);
  const [investors, setInvestors] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const token = sessionStorage.getItem('token');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_BASE_URL}/api/investors-interested`, config);

        const investorsWithEmail = await Promise.all(
          res.data.map(async (inv) => {
            const profileRes = await axios.get(
              `${API_BASE_URL}/api/investor-profile/public/${inv.user_id}`,
              config
            );
            return {
              ...inv,
              email: profileRes.data.investor_email || '',
              createdAt: new Date(inv.createdAt) // Ensure createdAt is a Date object
            };
          })
        );

        setInvestors(investorsWithEmail);
      } catch (err) {
        console.error('Failed to fetch interested investors:', err);
        toast.error('Failed to load investors');
      }
    };
  
    fetchInvestors();
    
    const interval = setInterval(fetchInvestors, 30000);
    return () => clearInterval(interval);
  }, [token, refetchTrigger]);

  const filteredInvestors = investors.filter(inv =>
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInvestors = [...filteredInvestors].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.createdAt - a.createdAt; // Newest first
    } else {
      return a.createdAt - b.createdAt; // Oldest first
    }
  });

  const handleStatusUpdate = async (investorId, investmentId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      await axios.patch(
        `${API_BASE_URL}/api/investors-interested/update-status`,
        { investment_id: investmentId, status: newStatus },
        config
      );
  
      setInvestors(prev =>
        prev.map(inv =>
          inv._id === investorId ? { ...inv, status: newStatus } : inv
        )
      );
  
      toast.success(`Status updated to ${newStatus}`);
      setTimeout(() => setRefetchTrigger(prev => prev + 1), 1000);
  
      if (newStatus === 'accepted') {
        const profileResponse = await axios.get(`${API_BASE_URL}/api/profile-form`, config);
        setFormData(profileResponse.data);
      }
  
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

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`investors_interested_container_ ${darkMode ? 'dark_mode_' : ''}`}>
      <Sidebar />
      <div className="investors_interested_content_">
        <h1 className="investors_interested_title_">Investors Interested</h1>

        <div className="investors_interested_header_">
          <div className="investors_interested_search_wrapper_">
            <FaSearch className="investors_interested_search_icon_" />
            <input
              type="text"
              placeholder="Search investors..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="investors_interested_search_input_"
            />
          </div>
          <div className="investors_interested_filter_wrapper_">
            <button 
              onClick={toggleSortOrder}
              className="investors_interested_sort_btn_"
            >
              {sortOrder === 'newest' ? (
                <>
                  <FaSortAmountDown className="investors_interested_sort_icon_" />
                  Newest First
                </>
              ) : (
                <>
                  <FaSortAmountUp className="investors_interested_sort_icon_" />
                  Oldest First
                </>
              )}
            </button>
            <div className="investors_interested_count_wrapper_">
              Showing <span className="investors_interested_count_badge_">{sortedInvestors.length}</span> investors
            </div>
          </div>
        </div>

        {sortedInvestors.length === 0 ? (
          <div className="investors_interested_empty_state_">
            <FaUser size={48} className="investors_interested_empty_icon_" />
            <p>No investors found</p>
          </div>
        ) : (
          <div className="investors_interested_grid_">
            {sortedInvestors.map((inv) => (
              <div className={`investors_interested_card_ ${inv.status}`} key={inv._id}>
                <div className="investors_interested_card_header_">
                  <div className="investors_interested_avatar_wrapper_">
                    {inv.image ? (
                      <img
                        className="investors_interested_avatar_"
                        src={`${API_BASE_URL}/uploads/${inv.image}`}
                        alt={inv.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="investors_interested_avatar_placeholder_">
                        {inv.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="investors_interested_info_wrapper_">
                    <h3 className="investors_interested_name_" title={inv.name || 'Unknown Investor'}>
                      {inv.name || 'Unknown Investor'}
                    </h3>
                    <div className="investors_interested_meta_">
                      <div className={`investors_interested_status_ ${inv.status}`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </div>
                      <div className="investors_interested_date_">
                        <FaClock className="investors_interested_date_icon_" />
                        {formatDate(inv.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="investors_interested_card_body_">
                  <div className="investors_interested_contact_wrapper_">
                    <p className="investors_interested_email_">
                      <FaEnvelope className="investors_interested_contact_icon_" /> 
                      {inv.email || 'No email provided'}
                    </p>
                  </div>

                  <div className="investors_interested_details_wrapper_">
                    {inv.title && (
                      <div className="investors_interested_detail_item_">
                        <span>Title:</span>
                        <span>{inv.title}</span>
                      </div>
                    )}
                    {inv.purpose && (
                      <div className="investors_interested_detail_item_">
                        <span>Purpose:</span>
                        <span>{inv.purpose}</span>
                      </div>
                    )}
                    {inv.goalAmount && (
                      <div className="investors_interested_detail_item_">
                        <span>Goal:</span>
                        <span>${inv.goalAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {inv.currentContribution && (
                      <div className="investors_interested_detail_item_">
                        <span>Contributed:</span>
                        <span>${inv.currentContribution.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {inv.message && (
                    <div className="investors_interested_message_wrapper_">
                      <p className="investors_interested_message_label_">
                        <FaCommentDots className="investors_interested_message_icon_" /> 
                        <span>Message</span>
                      </p>
                      <div className="investors_interested_message_text_">{inv.message}</div>
                    </div>
                  )}
                </div>

                <div className="investors_interested_actions_wrapper_">
                  <button
                    className={`investors_interested_action_btn_ accept_ ${inv.status === 'accepted' ? 'disabled_' : ''}`}
                    onClick={() => handleAccept(inv._id, inv.investment_id)}
                    disabled={inv.status === 'accepted'}
                  >
                    {inv.status === 'accepted' ? 'Accepted' : 'Accept'}
                  </button>

                  <button
                    className={`investors_interested_action_btn_ reject_ ${inv.status === 'rejected' ? 'disabled_' : ''}`}
                    onClick={() => handleReject(inv._id, inv.investment_id)}
                    disabled={inv.status === 'rejected'}
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