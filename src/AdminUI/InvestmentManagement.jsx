import React, { useState, useEffect } from 'react';
import './InvestmentManagement.css';
import { 
  FaSearch, 
  FaFilter, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaMoneyBillWave,
  FaUndo,
  FaChartLine,
  FaRegBell,
  FaUserTie,
  FaBuilding,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { MdOutlineAttachMoney } from 'react-icons/md';

const InvestmentManagement = () => {
  // Mock data - replace with real API calls later
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvestments: 0,
    pendingInvestments: 0,
    approvedInvestments: 0,
    rejectedInvestments: 0,
    refundedInvestments: 0,
    investmentGrowth: 0,
    approvalGrowth: 0
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockInvestments = [
        { 
          id: 1, 
          investor: 'John Smith', 
          business: 'Tech Solutions Inc.', 
          amount: 25000, 
          date: '2023-05-15', 
          status: 'approved', 
          type: 'equity',
          roi: '12%',
          duration: '3 years'
        },
        { 
          id: 2, 
          investor: 'Sarah Johnson', 
          business: 'Green Grocers', 
          amount: 15000, 
          date: '2023-06-20', 
          status: 'pending', 
          type: 'debt',
          roi: '8%',
          duration: '2 years'
        },
        { 
          id: 3, 
          investor: 'Michael Brown', 
          business: 'Urban Diner', 
          amount: 50000, 
          date: '2023-04-10', 
          status: 'rejected', 
          type: 'equity',
          roi: '15%',
          duration: '5 years'
        },
        { 
          id: 4, 
          investor: 'Emily Wilson', 
          business: 'Creative Designs', 
          amount: 30000, 
          date: '2023-07-05', 
          status: 'approved', 
          type: 'revenue-share',
          roi: '10%',
          duration: '3 years'
        },
        { 
          id: 5, 
          investor: 'David Lee', 
          business: 'BuildRight Construction', 
          amount: 75000, 
          date: '2023-03-22', 
          status: 'refunded', 
          type: 'equity',
          roi: '18%',
          duration: '7 years'
        },
        { 
          id: 6, 
          investor: 'Dr. Robert Chen', 
          business: 'HealthPlus Clinic', 
          amount: 100000, 
          date: '2023-08-12', 
          status: 'approved', 
          type: 'debt',
          roi: '7%',
          duration: '4 years'
        },
        { 
          id: 7, 
          investor: 'Jessica Martinez', 
          business: 'Swift Logistics', 
          amount: 45000, 
          date: '2023-09-01', 
          status: 'pending', 
          type: 'equity',
          roi: '14%',
          duration: '6 years'
        },
        { 
          id: 8, 
          investor: 'Daniel Kim', 
          business: 'EcoClean Services', 
          amount: 20000, 
          date: '2023-07-30', 
          status: 'approved', 
          type: 'revenue-share',
          roi: '9%',
          duration: '2 years'
        },
      ];

      setInvestments(mockInvestments);
      setFilteredInvestments(mockInvestments);
      setIsLoading(false);
      
      setStats({
        totalInvestments: mockInvestments.length,
        pendingInvestments: mockInvestments.filter(i => i.status === 'pending').length,
        approvedInvestments: mockInvestments.filter(i => i.status === 'approved').length,
        rejectedInvestments: mockInvestments.filter(i => i.status === 'rejected').length,
        refundedInvestments: mockInvestments.filter(i => i.status === 'refunded').length,
        investmentGrowth: 12.5,
        approvalGrowth: 8.3
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter investments based on search and filters
  useEffect(() => {
    let result = investments;
    
    if (searchTerm) {
      result = result.filter(investment => 
        investment.investor.toLowerCase().includes(searchTerm.toLowerCase()) || 
        investment.business.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(investment => investment.status === statusFilter);
    }
    
    if (amountFilter !== 'all') {
      if (amountFilter === 'small') {
        result = result.filter(investment => investment.amount < 25000);
      } else if (amountFilter === 'medium') {
        result = result.filter(investment => investment.amount >= 25000 && investment.amount < 75000);
      } else if (amountFilter === 'large') {
        result = result.filter(investment => investment.amount >= 75000);
      }
    }
    
    setFilteredInvestments(result);
  }, [searchTerm, statusFilter, amountFilter, investments]);

  const updateInvestmentStatus = (investmentId, newStatus) => {
    setInvestments(investments.map(investment => 
      investment.id === investmentId 
        ? { ...investment, status: newStatus } 
        : investment
    ));
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="invmgmt-content">
      {/* Header */}
      <div className="invmgmt-header">
        <div className="invmgmt-header-left">
          <MdOutlineAttachMoney className="invmgmt-header-icon" />
          <h1 className="invmgmt-title">Investment Management</h1>
        </div>
        <div className="invmgmt-header-right">
          <div className="invmgmt-notification">
            <FaRegBell className="invmgmt-notification-icon" />
            <span className="invmgmt-notification-badge">3</span>
          </div>
          <div className="invmgmt-profile">
            <div className="invmgmt-profile-avatar">A</div>
            <span className="invmgmt-profile-name">Admin</span>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="invmgmt-welcome-banner invmgmt-fade-in">
        <div className="invmgmt-welcome-text">
          <h1 className="invmgmt-welcome-title">Welcome to <span className="invmgmt-welcome-highlight">Investment Management</span></h1>
          <p className="invmgmt-welcome-description">Monitor, approve, reject, or refund all investment activities from this section.</p>
        </div>
        <div className="invmgmt-welcome-stats">
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Total Investments</span>
            <span className="invmgmt-stat-value">{stats.totalInvestments}</span>
            <span className="invmgmt-stat-change invmgmt-stat-positive">
              <FaArrowUp className="invmgmt-stat-arrow" /> {stats.investmentGrowth}%
            </span>
          </div>
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Approved</span>
            <span className="invmgmt-stat-value">{stats.approvedInvestments}</span>
          </div>
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Pending</span>
            <span className="invmgmt-stat-value">{stats.pendingInvestments}</span>
          </div>
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Rejected/Refunded</span>
            <span className="invmgmt-stat-value">{stats.rejectedInvestments + stats.refundedInvestments}</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="invmgmt-controls invmgmt-fade-in invmgmt-delay-1">
        <div className="invmgmt-search-container">
          <div className="invmgmt-search-input">
            <FaSearch className="invmgmt-search-icon" />
            <input 
              type="text" 
              className="invmgmt-search-field"
              placeholder="Search by investor or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="invmgmt-filters">
          <div className="invmgmt-filter-group">
            <FaFilter className="invmgmt-filter-icon" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="invmgmt-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div className="invmgmt-filter-group">
            <FaMoneyBillWave className="invmgmt-filter-icon" />
            <select 
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="invmgmt-filter-select"
            >
              <option value="all">All Amounts</option>
              <option value="small">Small (&lt; $25K)</option>
              <option value="medium">Medium ($25K-$75K)</option>
              <option value="large">Large (&gt; $75K)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="invmgmt-table-container invmgmt-fade-in invmgmt-delay-2">
        {isLoading ? (
          <div className="invmgmt-loading">
            <div className="invmgmt-loading-spinner"></div>
            <p className="invmgmt-loading-text">Loading investments...</p>
          </div>
        ) : (
          <>
            <div className="invmgmt-table-header">
              <div className="invmgmt-table-row">
                <div className="invmgmt-table-cell invmgmt-header-cell">Investor</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">Business</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">Amount</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">Date</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">Type</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">ROI/Duration</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">Status</div>
                <div className="invmgmt-table-cell invmgmt-header-cell">Actions</div>
              </div>
            </div>
            
            <div className="invmgmt-table-body">
              {filteredInvestments.length > 0 ? (
                filteredInvestments.map(investment => (
                  <div className="invmgmt-table-row" key={investment.id}>
                    <div className="invmgmt-table-cell">
                      <div className="invmgmt-investor-info">
                        <div className="invmgmt-investor-icon">
                          <FaUserTie />
                        </div>
                        <span className="invmgmt-investor-name">{investment.investor}</span>
                      </div>
                    </div>
                    <div className="invmgmt-table-cell invmgmt-business">
                      <div className="invmgmt-business-icon">
                        <FaBuilding />
                      </div>
                      {investment.business}
                    </div>
                    <div className="invmgmt-table-cell invmgmt-amount">
                      ${formatNumber(investment.amount)}
                    </div>
                    <div className="invmgmt-table-cell invmgmt-date">
                      {formatDate(investment.date)}
                    </div>
                    <div className="invmgmt-table-cell invmgmt-type">
                      {investment.type.replace('-', ' ')}
                    </div>
                    <div className="invmgmt-table-cell invmgmt-roi">
                      {investment.roi} / {investment.duration}
                    </div>
                    <div className="invmgmt-table-cell">
                      <span className={`invmgmt-status invmgmt-status-${investment.status}`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </span>
                    </div>
                    <div className="invmgmt-table-cell">
                      <div className="invmgmt-actions">
                        {investment.status !== 'approved' && (
                          <button 
                            className="invmgmt-action-btn invmgmt-action-approve"
                            onClick={() => updateInvestmentStatus(investment.id, 'approved')}
                          >
                            <FaCheckCircle /> Approve
                          </button>
                        )}
                        {investment.status !== 'rejected' && (
                          <button 
                            className="invmgmt-action-btn invmgmt-action-reject"
                            onClick={() => updateInvestmentStatus(investment.id, 'rejected')}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        )}
                        {investment.status === 'approved' && (
                          <button 
                            className="invmgmt-action-btn invmgmt-action-refund"
                            onClick={() => updateInvestmentStatus(investment.id, 'refunded')}
                          >
                            <FaUndo /> Refund
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="invmgmt-no-results">
                  <MdOutlineAttachMoney className="invmgmt-no-results-icon" />
                  <p className="invmgmt-no-results-text">No investments found matching your criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvestmentManagement;