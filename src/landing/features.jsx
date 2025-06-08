import React from "react";
import "./features.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faChartPie, faBell, faMobileAlt, faCheckCircle, faChartLine } from '@fortawesome/free-solid-svg-icons';

const Features = () => {
  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <h2 className="features-heading">Key Features</h2>
        <p className="features-subheading">Powerful tools for investors and businesses</p>
      </div>
      <div className="features-container">
        <div className="feature-card">
          <div className="feature-icon-container">
            <FontAwesomeIcon icon={faRobot} className="feature-icon" />
          </div>
          <h3 className="feature-title">AI Recommendations</h3>
          <p className="feature-description">Tailored business matches for your investment profile</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-container">
            <FontAwesomeIcon icon={faChartPie} className="feature-icon" />
          </div>
          <h3 className="feature-title">Smart Analytics</h3>
          <p className="feature-description">Real-time tracking of investments and performance</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-container">
            <FontAwesomeIcon icon={faBell} className="feature-icon" />
          </div>
          <h3 className="feature-title">Funding Alerts</h3>
          <p className="feature-description">Instant notifications for new opportunities</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-container">
            <FontAwesomeIcon icon={faMobileAlt} className="feature-icon" />
          </div>
          <h3 className="feature-title">Mobile Ready</h3>
          <p className="feature-description">Seamless experience on all devices</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-container">
            <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
          </div>
          <h3 className="feature-title">Verified Profiles</h3>
          <p className="feature-description">Trusted network of businesses and investors</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-container">
            <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
          </div>
          <h3 className="feature-title">Growth Insights</h3>
          <p className="feature-description">Actionable reports to accelerate growth</p>
        </div>
      </div>
    </section>
  );
};

export default Features;