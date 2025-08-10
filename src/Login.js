import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://ugobueze-app.onrender.com/api/auth/loginNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // Save normal token for all logged-in users
      localStorage.setItem('token', data.token);
      localStorage.setItem('userToken', data.token);

      // Check if user is admin (works with either flag or role)
      const isAdmin = data.user?.isAdmin === true || data.user?.role === 'admin';

      if (isAdmin) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card p-4 shadow"
        style={{ width: '400px', background: 'rgba(255, 255, 255, 0.95)' }}
      >
        <h1 className="text-center">👑</h1>
        <small className="mx-5 fs-6 text-muted">
          <i className="bx bx-check-shield fs-6 mx-1"></i>
          Never resell your gift cards to third parties！
        </small>

        <div className="rounded bg-dark text-white text-center w-50 p-1 my-2 mx-auto">
          <small>Fast, Safe, Top Rates</small>
        </div>

        <h4 className="text-center fs-2">LOGIN</h4>
        <small className="my-3 text-muted text-center d-block">
          Sign in and start trading to make money right away
        </small>

        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger text-center">{error}</div>}

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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-right mt-2">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </p>

        <p className="text-center mt-3">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
