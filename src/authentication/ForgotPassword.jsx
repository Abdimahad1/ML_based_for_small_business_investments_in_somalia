import React, { useState, useEffect, useRef } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faSpinner, faLock, faRedo } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const otpInputs = useRef([]);
  const navigate = useNavigate();

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/password-reset`;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
    
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/send-otp`, { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only take last character
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputs.current[index - 1]) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      setOtp(['', '', '', '', '', '']); // Clear existing OTP
      const res = await axios.post(`${API_BASE_URL}/send-otp`, { email });
      toast.success('New OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp: otpCode });
      toast.success(res.data.message);
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!resetToken) {
      toast.error('Reset token not found. Please verify OTP again.');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/reset-password`, {
        resetToken,
        newPassword,
        confirmPassword
      });

      toast.success(res.data.message);
      setResetToken('');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="forgot-password-wrapper">
        <div className="forgot-back-to-login" onClick={() => navigate('/auth')}>
          <FontAwesomeIcon icon={faArrowLeft} className="forgot-back-icon" />
          <span>Back to Login</span>
        </div>

        <div className="forgot-password-card">
          {/* Left */}
          <div className="forgot-password-left">
            <div className="forgot-password-overlay">
              <h2 className="animated-text">Forgot your Password?</h2>
              <p className="animated-subtext">No worries, we've got you covered!</p>
              
              {step === 1 && (
                <div className="step-indicator">
                  <div className="step active">1</div>
                  <div className="step-line"></div>
                  <div className="step">2</div>
                  <div className="step-line"></div>
                  <div className="step">3</div>
                </div>
              )}
              
              {step === 2 && (
                <div className="step-indicator">
                  <div className="step completed">✓</div>
                  <div className="step-line active"></div>
                  <div className="step active">2</div>
                  <div className="step-line"></div>
                  <div className="step">3</div>
                </div>
              )}
              
              {step === 3 && (
                <div className="step-indicator">
                  <div className="step completed">✓</div>
                  <div className="step-line active"></div>
                  <div className="step completed">✓</div>
                  <div className="step-line active"></div>
                  <div className="step active">3</div>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="forgot-password-right">
            {step === 1 && (
              <>
                <h2 className="forgot-password-heading slide-in">Reset Password</h2>
                <p className="forgot-password-subtext fade-in">Enter your email to receive a verification code</p>

                <div className="forgot-password-input-box">
                  <FontAwesomeIcon icon={faEnvelope} className="forgot-password-icon" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-animation"
                  />
                </div>

                <button 
                  className="forgot-password-btn pulse-on-hover" 
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    'SEND OTP'
                  )}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="forgot-password-heading slide-in">Enter OTP</h2>
                <p className="forgot-password-subtext fade-in">We sent a 6-digit code to {email}</p>

                <div className="otp-container">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(ref) => (otpInputs.current[index] = ref)}
                      className="otp-input"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button 
                  className="forgot-password-btn pulse-on-hover" 
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some(num => num === '')}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'VERIFY OTP'
                  )}
                </button>

                <div className="resend-otp">
                  <p>Didn't receive code?</p>
                  <button 
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="resend-btn"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRedo} className="mr-2" />
                        Resend OTP
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="forgot-password-heading slide-in">New Password</h2>
                <p className="forgot-password-subtext fade-in">Create a new secure password (minimum 6 characters)</p>

                <div className="forgot-password-input-box">
                  <FontAwesomeIcon icon={faLock} className="forgot-password-icon" />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input-animation"
                  />
                </div>

                <div className="forgot-password-input-box">
                  <FontAwesomeIcon icon={faLock} className="forgot-password-icon" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-animation"
                  />
                </div>

                <button 
                  className="forgot-password-btn pulse-on-hover" 
                  onClick={handlePasswordChange}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'CHANGE PASSWORD'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Please wait...</p>
          </div>
        </div>
      )}

      <ToastContainer 
        position="top-center" 
        autoClose={2000} 
        toastClassName="custom-toast"
        progressClassName="custom-progress"
      />
    </>
  );
};

export default ForgotPassword;