// features.jsx
import React from "react";
import "./features.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faChartPie, faBell, faMobileAlt, faCheckCircle, faChartLine, faRocket } from '@fortawesome/free-solid-svg-icons';

const Features = () => {
  return (
    <section className="features-section" id="features">
      <h2 className="features-heading">Key Features</h2>
      <div className="features-container">
        <div className="feature-card">
          <FontAwesomeIcon icon={faRobot} className="feature-icon" />
          <h3 className="feature-title">AI-Based Recommendations</h3>
          <p className="feature-description">Discover businesses tailored to your investment preferences.</p>
        </div>
        <div className="feature-card">
          <FontAwesomeIcon icon={faChartPie} className="feature-icon" />
          <h3 className="feature-title">Smart Dashboard & Analytics</h3>
          <p className="feature-description">Track investments, funding, and business performance in real-time.</p>
        </div>
        <div className="feature-card">
          <FontAwesomeIcon icon={faBell} className="feature-icon" />
          <h3 className="feature-title">Personalized Funding Alerts</h3>
          <p className="feature-description">Get instant notifications for new investment opportunities.</p>
        </div>
        <div className="feature-card">
          <FontAwesomeIcon icon={faMobileAlt} className="feature-icon" />
          <h3 className="feature-title">Dark Mode & Mobile Responsive</h3>
          <p className="feature-description">Enjoy a seamless experience on desktop and mobile screens.</p>
        </div>
        <div className="feature-card">
          <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
          <h3 className="feature-title">Verified Business & Investors</h3>
          <p className="feature-description">Ensure trust with verified investor and business profiles.</p>
        </div>
        <div className="feature-card">
          <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
          <h3 className="feature-title">Business Growth Insights & Reports</h3>
          <p className="feature-description">Make your business grow rapidly by seeking investors.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;