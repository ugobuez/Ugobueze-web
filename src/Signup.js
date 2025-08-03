import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import { BASE_URL } from './config'; // Adjust path if in src/

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referredBy: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('code');
    if (referralCode) {
      setFormData((prev) => ({ ...prev, referredBy: referralCode }));
    }
  }, [location]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Signup failed');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('referralCode', data.referralCode || '');
      console.log('✅ Stored userToken:', data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card p-4 shadow"
        style={{ width: '400px', background: 'rgba(255, 255, 255, 0.9)' }}
      >
        <h1 className="text-center">👑</h1>
        <small className="mx-5 fs-6">
          <i className="bx bx-check-shield fs-6 mx-1"></i>
          Never resell your gift cards to third parties！
        </small>
        <div className="rounded bg-dark text-white fast text-center w-50 p-1 my-1 mx-auto">
          <small>Fast, Safety, Top Rates</small>
        </div>
        <h4 className="text-center fs-2">SIGN UP</h4>
        <small className="my-3 text-muted text-center d-block">
          Create an account and start trading to make money right away
        </small>

        <form onSubmit={handleSignup}>
          {error && <div className="alert alert-danger text-center">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Name*</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email*</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password*</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Referral Code (Optional)</label>
            <input
              type="text"
              name="referredBy"
              className="form-control"
              placeholder="Enter referral code"
              value={formData.referredBy}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;