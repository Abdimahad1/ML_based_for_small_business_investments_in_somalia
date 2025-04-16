import React, { useState } from 'react';
import './logIn_SignUp.css';
import investorImage from '../assets/investor.png';
import ownerImage from '../assets/business-owner.png';
import bgImage from '../assets/login-bg.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const LogIn_SignUp = () => {
  const [role, setRole] = useState('investor');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const welcomeText =
    role === 'investor'
      ? {
          title: `WELCOME INVESTOR`,
          message: `Join us in empowering businesses. Track your investments and make smart decisions.`,
        }
      : {
          title: `WELCOME BUSINESS OWNER`,
          message: `Grow your business with investor support. Showcase your milestones and progress.`,
        };

  const handleToggle = () => setIsLogin(!isLogin);

  const handleLogin = () => {
    if (isLogin) {
      // For now: allow login even without validation
      navigate('/sidebar');
    } else {
      console.log("SIGN UP click (not implemented yet)");
    }
  };

  return (
    <div className={`login-wrapper ${isLogin ? 'login-mode' : 'signup-mode'}`}>
      <div className="back-to-website" onClick={() => navigate('/')}>
        <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
        <span>Back to Website</span>
      </div>

      <div className="login-card">
        {/* Left Side */}
        <div className="login-left" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="login-overlay">
            <h2>{welcomeText.title}</h2>
            <p>{welcomeText.message}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <h2 className="login-heading">{isLogin ? 'LOG IN' : 'SIGN UP'}</h2>

          <div className="role-selection">
            <div
              className={`role-box ${role === 'investor' ? 'active' : ''}`}
              onClick={() => setRole('investor')}
            >
              <img src={investorImage} alt="Investor" />
              <p>INVESTOR</p>
            </div>
            <div
              className={`role-box ${role === 'owner' ? 'active' : ''}`}
              onClick={() => setRole('owner')}
            >
              <img src={ownerImage} alt="Business Owner" />
              <p>BUSINESS OWNER</p>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="input-box">
                <FontAwesomeIcon icon={faUser} className="icon" />
                <input type="text" placeholder="Enter your name" />
              </div>
              <div className="input-box">
                <FontAwesomeIcon icon={faPhone} className="icon" />
                <input type="text" placeholder="Enter your phone" />
              </div>
            </>
          )}

          <div className="input-box">
            <FontAwesomeIcon icon={faEnvelope} className="icon" />
            <input type="email" placeholder="Enter your email address" />
          </div>

          <div className="input-box">
            <FontAwesomeIcon icon={faLock} className="icon" />
            <input type="password" placeholder={isLogin ? 'Enter your password' : 'Enter your password'} />
          </div>

          {!isLogin && (
            <div className="input-box">
              <FontAwesomeIcon icon={faLock} className="icon" />
              <input type="password" placeholder="Confirm your password" />
            </div>
          )}

          <button className="login-btn" onClick={handleLogin}>
            {isLogin ? 'LOG IN' : 'SIGN UP'}
          </button>

          <p className="signup-link">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span onClick={handleToggle}>{isLogin ? 'SIGN UP' : 'LOG IN'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn_SignUp;
