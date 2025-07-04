import React, { useState, useEffect } from "react";
import "./InvestmentManagement.css";
import axios from "axios";

import {
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaRegBell,
  FaUserTie,
  FaBuilding,
  FaArrowUp,
} from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";

const InvestmentManagement = () => {
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvestments: 0,
    pendingInvestments: 0,
    approvedInvestments: 0,
    rejectedInvestments: 0,
    investmentGrowth: 0,
    approvalGrowth: 0,
  });

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // using your new controller:
        const [myInvestmentsRes, statsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/my-investments/all`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/investments/stats`, { headers }),
        ]);

        const formatted = myInvestmentsRes.data.map((i) => ({
          id: i._id,
          investor: i.investorId?.name || "Unknown",
          business: i.title || "Untitled",
          amount: i.goalAmount || 0,
          date: i.createdAt,
          status: i.status || "pending",
        }));

        setInvestments(formatted);
        setFilteredInvestments(formatted);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching investments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let result = investments;

    if (searchTerm) {
      result = result.filter(
        (i) =>
          i.investor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.business.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    if (amountFilter !== "all") {
      if (amountFilter === "small") {
        result = result.filter((i) => i.amount < 25000);
      } else if (amountFilter === "medium") {
        result = result.filter((i) => i.amount >= 25000 && i.amount < 75000);
      } else if (amountFilter === "large") {
        result = result.filter((i) => i.amount >= 75000);
      }
    }

    setFilteredInvestments(result);
  }, [searchTerm, statusFilter, amountFilter, investments]);

  const formatNumber = (num) => num?.toLocaleString();
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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

      {/* Stats */}
      <div className="invmgmt-welcome-banner invmgmt-fade-in">
        <div className="invmgmt-welcome-text">
          <h1 className="invmgmt-welcome-title">
            Welcome to{" "}
            <span className="invmgmt-welcome-highlight">Investment Management</span>
          </h1>
          <p className="invmgmt-welcome-description">
            Monitor all investment activities — view approvals, rejections, and pending statuses.
          </p>
        </div>
        <div className="invmgmt-welcome-stats">
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Total Investments</span>
            <span className="invmgmt-stat-value">{formatNumber(stats.totalInvestments)}</span>
            <span className="invmgmt-stat-change invmgmt-stat-positive">
              <FaArrowUp className="invmgmt-stat-arrow" /> {stats.investmentGrowth}%
            </span>
          </div>
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Approved</span>
            <span className="invmgmt-stat-value">{formatNumber(stats.approvedInvestments)}</span>
          </div>
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Pending</span>
            <span className="invmgmt-stat-value">{formatNumber(stats.pendingInvestments)}</span>
          </div>
          <div className="invmgmt-stat-card">
            <span className="invmgmt-stat-label">Rejected</span>
            <span className="invmgmt-stat-value">{formatNumber(stats.rejectedInvestments)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
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
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
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

      {/* Table */}
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
                <div className="invmgmt-table-cell">Investor</div>
                <div className="invmgmt-table-cell">Business</div>
                <div className="invmgmt-table-cell">Amount</div>
                <div className="invmgmt-table-cell">Date</div>
                <div className="invmgmt-table-cell">Status</div>
              </div>
            </div>
            <div className="invmgmt-table-body">
              {filteredInvestments.length > 0 ? (
                filteredInvestments.map((i) => (
                  <div className="invmgmt-table-row" key={i.id}>
                    <div className="invmgmt-table-cell">
                      <div className="invmgmt-investor-info">
                        <FaUserTie className="invmgmt-investor-icon" />
                        <span className="invmgmt-investor-name">{i.investor}</span>
                      </div>
                    </div>
                    <div className="invmgmt-table-cell">
                      <FaBuilding className="invmgmt-business-icon" /> {i.business}
                    </div>
                    <div className="invmgmt-table-cell">${formatNumber(i.amount)}</div>
                    <div className="invmgmt-table-cell">{formatDate(i.date)}</div>
                    <div className="invmgmt-table-cell">
                      <span className={`invmgmt-status invmgmt-status-${i.status}`}>
                        {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="invmgmt-no-results">
                  <MdOutlineAttachMoney className="invmgmt-no-results-icon" />
                  <p className="invmgmt-no-results-text">
                    No investments found matching your criteria
                  </p>
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
