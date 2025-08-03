import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import { BASE_URL } from './config'; // Correct import for src/components/

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/loginnow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      // ✅ Store token under both keys
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("token", data.token);

      if (data.user?.referralCode) {
        localStorage.setItem("referralCode", data.user.referralCode);
      }

      console.log("✅ Stored userToken:", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", background: "rgba(255, 255, 255, 0.9)" }}
      >
        <h1 className="text-center">👑</h1>
        <small className="mx-5 fs-6">
          <i className="bx bx-check-shield fs-6 mx-1"></i>
          Never resell your gift cards to third parties！
        </small>
        <div className="rounded bg-dark text-white fast text-center w-50 p-1 my-1 mx-auto">
          <small>Fast, Safety, Top Rates</small>
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
          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
