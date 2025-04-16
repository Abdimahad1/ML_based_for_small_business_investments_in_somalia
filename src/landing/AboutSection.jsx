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
            <div className="card-description">
              <p>We provide tailored funding solutions to empower small businesses.</p>
            </div>
          </div>
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faChartLine} className="icon" />
            </div>
            <h3 className="card-title">Risk prediction powered by AI</h3>
            <div className="card-description">
              <p>Utilizing AI to assess and mitigate financial risks effectively.</p>
            </div>
          </div>
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faEye} className="icon" />
            </div>
            <h3 className="card-title">Transparent and real-time tracking</h3>
            <div className="card-description">
              <p>Track investments and performance in real-time with transparency.</p>
            </div>
          </div>
          <div className="card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faGlobe} className="icon" />
            </div>
            <h3 className="card-title">Designed for local economic growth</h3>
            <div className="card-description">
              <p>Supporting initiatives that foster local economic development.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="image-section">
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