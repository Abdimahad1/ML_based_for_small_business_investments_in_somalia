import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Goals from './BuisnessOwner/goals'; // ✅ added
import InvestmentRequests from './BuisnessOwner/investmentRequests'; // add this
import InvestorsInterested from './BuisnessOwner/InvestorsInterested';
import RiskAnalysis from './BuisnessOwner/RiskAnalysis';
import SellMyBusiness from './BuisnessOwner/SellMyBusiness';




function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/sidebar" element={<Sidebar />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/business-overview" element={<BusinessOverview />} />
      <Route path="/products" element={<Products />} /> 
      <Route path="/milestones" element={<Goals />} /> {/* ✅ added */}
      <Route path="/investment-request" element={<InvestmentRequests />} />
      <Route path="/investors-interested" element={<InvestorsInterested />} />
      <Route path="/risk-analysis" element={<RiskAnalysis />} />
      <Route path="/sell-my-business" element={<SellMyBusiness />} />



    </Routes>
  );
}

export default App;

// Landing Page component
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
