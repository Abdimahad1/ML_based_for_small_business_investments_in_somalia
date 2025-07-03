import React, { useState } from 'react';
import './adminLogin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    // clear any previous session
    sessionStorage.clear();

    if (!form.email || !form.password) {
      toast.error('Email and Password are required.');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/admin-login`,
        form
      );

      const userRole = res.data.user.role;

      if (userRole !== 'Admin') {
        toast.error('Unauthorized role.');
        return;
      }

      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('role', userRole);

      toast.success('Admin login successful!');
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Back arrow to user auth */}
      <div className="admin-back-to-auth" onClick={() => navigate('/auth')}>
        <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
        <span>Back to User Login</span>
      </div>

      <div className="admin-login-card">
        <div className="admin-login-header">
          <FontAwesomeIcon icon={faUserShield} className="admin-icon" />
          <h2>Admin Panel Login</h2>
          <p>Authorized personnel only</p>
        </div>

        <div className="admin-login-form">
          <div className="admin-input-box">
            <FontAwesomeIcon icon={faEnvelope} className="icon" />
            <input
              type="email"
              placeholder="Admin email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="admin-input-box">
            <FontAwesomeIcon icon={faLock} className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Admin password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button className="admin-login-btn" onClick={handleSubmit}>
            Log In
          </button>

          <p
            className="admin-forgot-link"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </p>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default AdminLogin;
