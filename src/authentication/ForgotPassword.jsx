import React, { useState, useEffect, useRef } from 'react';
import './ForgotPassword_.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faSpinner, faLock, faRedo } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword_ = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const otpInputs_ = useRef([]);
  const navigate = useNavigate();

  const API_BASE_URL_ = `${import.meta.env.VITE_API_BASE_URL}/api/password-reset`;

  const validateEmail_ = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendOtp_ = async () => {
    if (!validateEmail_(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL_}/send-otp`, { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange_ = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    if (value && index < 5 && otpInputs_.current[index + 1]) {
      otpInputs_.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown_ = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputs_.current[index - 1]) {
      otpInputs_.current[index - 1].focus();
    }
  };

  const handleResendOtp_ = async () => {
    if (!validateEmail_(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      setOtp(['', '', '', '', '', '']);
      const res = await axios.post(`${API_BASE_URL_}/send-otp`, { email });
      toast.success('New OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp_ = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL_}/verify-otp`, { email, otp: otpCode });
      toast.success(res.data.message);
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange_ = async () => {
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
      const res = await axios.post(`${API_BASE_URL_}/reset-password`, {
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
      <div className="forgot-password-wrapper_">
        <div className="forgot-back-to-login_" onClick={() => navigate('/auth')}>
          <FontAwesomeIcon icon={faArrowLeft} className="forgot-back-icon_" />
          <span>Back to Login</span>
        </div>

        <div className="forgot-password-card_">
          {/* Left */}
          <div className="forgot-password-left_">
            <div className="forgot-password-overlay_">
              <h2 className="animated-text_">Forgot your Password?</h2>
              <p className="animated-subtext_">No worries, we've got you covered!</p>
              
              {step === 1 && (
                <div className="step-indicator_">
                  <div className="step_ active_">1</div>
                  <div className="step-line_"></div>
                  <div className="step_">2</div>
                  <div className="step-line_"></div>
                  <div className="step_">3</div>
                </div>
              )}
              
              {step === 2 && (
                <div className="step-indicator_">
                  <div className="step_ completed_">✓</div>
                  <div className="step-line_ active_"></div>
                  <div className="step_ active_">2</div>
                  <div className="step-line_"></div>
                  <div className="step_">3</div>
                </div>
              )}
              
              {step === 3 && (
                <div className="step-indicator_">
                  <div className="step_ completed_">✓</div>
                  <div className="step-line_ active_"></div>
                  <div className="step_ completed_">✓</div>
                  <div className="step-line_ active_"></div>
                  <div className="step_ active_">3</div>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="forgot-password-right_">
            {step === 1 && (
              <>
                <h2 className="forgot-password-heading_ slide-in_">Reset Password</h2>
                <p className="forgot-password-subtext_ fade-in_">Enter your email to receive a verification code</p>

                <div className="forgot-password-input-box_">
                  <FontAwesomeIcon icon={faEnvelope} className="forgot-password-icon_" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-animation_"
                  />
                </div>

                <button 
                  className="forgot-password-btn_ pulse-on-hover_" 
                  onClick={handleSendOtp_}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2_" />
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
                <h2 className="forgot-password-heading_ slide-in_">Enter OTP</h2>
                <p className="forgot-password-subtext_ fade-in_">We sent a 6-digit code to {email}</p>

                <div className="otp-container_">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange_(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown_(e, index)}
                      ref={(ref) => (otpInputs_.current[index] = ref)}
                      className="otp-input_"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button 
                  className="forgot-password-btn_ pulse-on-hover_" 
                  onClick={handleVerifyOtp_}
                  disabled={loading || otp.some(num => num === '')}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2_" />
                      Verifying...
                    </>
                  ) : (
                    'VERIFY OTP'
                  )}
                </button>

                <div className="resend-otp_">
                  <p>Didn't receive code?</p>
                  <button 
                    onClick={handleResendOtp_}
                    disabled={loading}
                    className="resend-btn_"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRedo} className="mr-2_" />
                        Resend OTP
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="forgot-password-heading_ slide-in_">New Password</h2>
                <p className="forgot-password-subtext_ fade-in_">Create a new secure password (minimum 6 characters)</p>

                <div className="forgot-password-input-box_">
                  <FontAwesomeIcon icon={faLock} className="forgot-password-icon_" />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input-animation_"
                  />
                </div>

                <div className="forgot-password-input-box_">
                  <FontAwesomeIcon icon={faLock} className="forgot-password-icon_" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-animation_"
                  />
                </div>

                <button 
                  className="forgot-password-btn_ pulse-on-hover_" 
                  onClick={handlePasswordChange_}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2_" />
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
        <div className="loading-overlay_">
          <div className="loading-spinner_">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Please wait...</p>
          </div>
        </div>
      )}

      <ToastContainer 
        position="top-center" 
        autoClose={2000} 
        toastClassName="custom-toast_"
        progressClassName="custom-progress_"
      />
    </>
  );
};

export default ForgotPassword_;