import React, { useState } from 'react';
import './logIn_SignUp.css';
import investorImage from '../assets/investor.png';
import ownerImage from '../assets/business-owner.png';
import bgImage from '../assets/login-bg.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faLock, faUser, faPhone, faArrowLeft, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LogIn_SignUp = () => {
  const [role, setRole] = useState('Investor'); // still used for SIGN UP only
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setForm({
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const validateForm = () => {
    const { name, phone, email, password, confirmPassword } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9}$/;

    if (!email || !password) return 'Email and Password are required.';
    if (!emailRegex.test(email)) return 'Invalid email format.';
    if (!isLogin) {
      if (!name || !phone || !confirmPassword) return 'All fields are required.';
      if (!phoneRegex.test(phone)) return 'Phone number must be 9 digits (e.g. 613797852)';
      if (password.length < 6) return 'Password must be at least 6 characters.';
      if (password !== confirmPassword) return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: form.email,
          password: form.password,
          role
        });

        // ✅ Store real role from backend response
        const userRole = res.data.user.role;

        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', userRole);

        toast.success('Login successful!');
        setTimeout(() => {
          if (userRole === 'Investor') {
            navigate('/investor/dashboard');
          } else if (userRole === 'BusinessOwner') {
            navigate('/dashboard');
          } else {
            toast.error('Unauthorized role.');
          }
        }, 1500);
      } else {
        await axios.post('http://localhost:5000/api/auth/signup', {
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role // ✅ Used only for signup
        });

        toast.success('Account created! Please log in.');
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <>
      <div className={`login-wrapper ${isLogin ? 'login-mode' : 'signup-mode'}`}>
        <div className="back-to-website" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
          <span>Back to Website</span>
        </div>

        <div className="login-card">
          {/* Left */}
          <div className="login-left" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="login-overlay">
              <h2>{role === 'Investor' ? 'WELCOME INVESTOR' : 'WELCOME BUSINESS OWNER'}</h2>
              <p>
                {role === 'Investor'
                  ? 'Join us in empowering businesses. Track your investments and make smart decisions.'
                  : 'Grow your business with investor support. Showcase your milestones and progress.'}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="login-right">
            <h2 className="login-heading">{isLogin ? 'LOG IN' : 'SIGN UP'}</h2>

            <div className="role-selection">
              <div className={`role-box ${role === 'Investor' ? 'active' : ''}`} onClick={() => setRole('Investor')}>
                <img src={investorImage} alt="Investor" />
                <p>INVESTOR</p>
              </div>
              <div className={`role-box ${role === 'BusinessOwner' ? 'active' : ''}`} onClick={() => setRole('BusinessOwner')}>
                <img src={ownerImage} alt="Owner" />
                <p>BUSINESS OWNER</p>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="input-box">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-box">
                  <FontAwesomeIcon icon={faPhone} className="icon" />
                  <input
                    type="text"
                    placeholder="Your phone (e.g. 613797852)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <div className="input-box">
              <FontAwesomeIcon icon={faEnvelope} className="icon" />
              <input
                type="email"
                placeholder="Your email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="input-box">
              <FontAwesomeIcon icon={faLock} className="icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <FontAwesomeIcon 
                icon={showPassword ? faEye : faEyeSlash}
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {!isLogin && (
              <div className="input-box">
                <FontAwesomeIcon icon={faLock} className="icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <FontAwesomeIcon 
                  icon={showPassword ? faEye : faEyeSlash}
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            )}

            <button className="login-btn" onClick={handleSubmit}>
              {isLogin ? 'LOG IN' : 'SIGN UP'}
            </button>

            <p className="signup-link">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <span onClick={handleToggle}>{isLogin ? 'SIGN UP' : 'LOG IN'}</span>
            </p>

            {isLogin && (
              <p className="forgot-password-link" onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </p>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default LogIn_SignUp;
