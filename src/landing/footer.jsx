// footer.jsx
import React from "react";
import "./footer.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <h2 className="footer-heading">CONTACT US</h2>
      <div className="footer-links">
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#features">Features</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Resources</h3>
          <ul>
            <li><a href="#developer-api">Developer API</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Info</h3>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#status">Status</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-subscribe">
        <h3>Get access to exclusive updates</h3>
        <input type="email" placeholder="Email address" />
        <button className="subscribe-btn">Subscribe</button>
      </div>
      <div className="footer-social">
        <h3>Social Media</h3>
        <div className="social-icons">
          <a href="#facebook"><FontAwesomeIcon icon={faFacebook} /></a>
          <a href="#instagram"><FontAwesomeIcon icon={faInstagram} /></a>
          <a href="#twitter"><FontAwesomeIcon icon={faTwitter} /></a>
          <a href="#linkedin"><FontAwesomeIcon icon={faLinkedin} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;