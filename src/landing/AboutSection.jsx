import React from "react";
import "./AboutSection.css";
import aboutImage from "../assets/about-left.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faChartLine, faEye, faGlobe } from '@fortawesome/free-solid-svg-icons';

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-text-section">
        <h1 className="about-main-heading">Our Mission</h1>
        <h2 className="about-sub-heading">Empowering Somali Entrepreneurs</h2>
        <p className="about-description">
          We connect investors with Somali small businesses using machine learning-based financial risk assessment. Our platform ensures reliable, secure, and impactful investment decisions.
        </p>
        <div className="card-container">
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faMoneyBillWave} className="icon" />
            </div>
            <h3 className="card-title">Smart funding for SMEs</h3>
            <p className="card-description">Tailored funding solutions to empower small businesses</p>
          </div>
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faChartLine} className="icon" />
            </div>
            <h3 className="card-title">AI Risk prediction</h3>
            <p className="card-description">AI-powered financial risk assessment</p>
          </div>
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faEye} className="icon" />
            </div>
            <h3 className="card-title">Transparent tracking</h3>
            <p className="card-description">Real-time investment performance tracking</p>
          </div>
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faGlobe} className="icon" />
            </div>
            <h3 className="card-title">Local growth focus</h3>
            <p className="card-description">Supporting local economic development</p>
          </div>
        </div>
      </div>
      <div className="about-image-section">
        <div className="shape-wrapper">
          <div className="shape base"></div>
          <div className="shape top"></div>
          <img src={aboutImage} alt="About" className="about-image" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;