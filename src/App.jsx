// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Header from './landing/heroSection';
import AboutSection from './landing/AboutSection';
import Features from './landing/features';
import Footer from './landing/footer';

import Dashboard from './BuisnessOwner/Dashboard';
import BusinessOverview from './BuisnessOwner/BusinessOverview';
import AuthPage from './authentication/logIn_SignUp';
import Sidebar from './BuisnessOwner/sidebar'; 
import Products from './BuisnessOwner/products'; 
import Goals from './BuisnessOwner/goals'; 
import InvestmentRequests from './BuisnessOwner/investmentRequests'; 
import InvestorsInterested from './BuisnessOwner/InvestorsInterested';
import RiskAnalysis from './BuisnessOwner/RiskAnalysis';
import SellMyBusiness from './BuisnessOwner/SellMyBusiness';
import Settings from './BuisnessOwner/settings'; 
import Notifications from './BuisnessOwner/Notifications'; 
import CustomerView from './BuisnessOwner/CustomerView';
import CustomerProductsPublic from './BuisnessOwner/CustomerProductsPublic';

// ✅ Investor imports
import InvestorSidebar from './InvestorUI/InvestorSidebar';
import InvestorDashboard from './InvestorUI/InvestorDashboard';
import FindInvestments from './InvestorUI/FindInvestments';
import MyInvestments from './InvestorUI/MyInvestments';
import Performance from './InvestorUI/Performance';
import BuyBusiness from './InvestorUI/BuyBusiness';
import InvestorSettings from './InvestorUI/InvestorSettings';

// ✅ Layout wrapper with sidebar + collapse state
function InvestorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsedInvestor');
    setCollapsed(saved === 'true');
  }, []);

  const handleToggle = (value) => {
    setCollapsed(value);
    localStorage.setItem('sidebarCollapsedInvestor', value);
  };

  return (
    <div className={`dashboard-container ${collapsed ? 'bo-collapsed' : ''}`}>
      <InvestorSidebar onToggle={handleToggle} />
      {children}
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Business Owner Routes */}
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/business-overview" element={<BusinessOverview />} />
        <Route path="/products" element={<Products />} />
        <Route path="/milestones" element={<Goals />} />
        <Route path="/investment-request" element={<InvestmentRequests />} />
        <Route path="/investors-interested" element={<InvestorsInterested />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/sell-my-business" element={<SellMyBusiness />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/customer-view" element={<CustomerView />} />
        <Route path="/customer-products" element={<CustomerProductsPublic />} />

        {/* Investor Routes */}
        <Route path="/investor/dashboard" element={<InvestorLayout><InvestorDashboard /></InvestorLayout>} />
        <Route path="/investor/find-investments" element={<InvestorLayout><FindInvestments /></InvestorLayout>} />
        <Route path="/investor/my-investments" element={<InvestorLayout><MyInvestments /></InvestorLayout>} />
        <Route path="/investor/performance" element={<InvestorLayout><Performance /></InvestorLayout>} />
        <Route path="/investor/buy-business" element={<InvestorLayout><BuyBusiness /></InvestorLayout>} />
        <Route path="/investor/account-settings" element={<InvestorLayout><InvestorSettings /></InvestorLayout>} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default App;

// Landing Page Component
function LandingPage() {
  const [activeLink, setActiveLink] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const home = document.getElementById("home");
      const about = document.getElementById("about");
      const features = document.getElementById("features");
      const footer = document.getElementById("footer");

      const scrollY = window.scrollY;

      if (footer && scrollY + window.innerHeight >= footer.offsetTop) {
        setActiveLink("footer");
      } else if (features && scrollY + window.innerHeight >= features.offsetTop) {
        setActiveLink("features");
      } else if (about && scrollY + window.innerHeight >= about.offsetTop) {
        setActiveLink("about");
      } else {
        setActiveLink("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header activeLink={activeLink} />
      <AboutSection />
      <Features />
      <Footer />
    </>
  );
}
