import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://ugobueze-app.onrender.com/api/users/reset-password", // ✅ Production URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.text(); // backend returns plain text
      if (!res.ok) throw new Error(data || "Password reset failed");

      setSuccess(data || "Password reset successful");
      setFormData({ email: "", password: "" });

      // ✅ Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", background: "rgba(255, 255, 255, 0.95)" }}
      >
        <h1 className="text-center">🔑</h1>
        <small className="mx-5 fs-6 text-muted">
          <i className="bx bx-check-shield fs-6 mx-1"></i>
          Securely reset your password
        </small>

        <div className="rounded bg-dark text-white text-center w-50 p-1 my-2 mx-auto">
          <small>Fast, Safe, Secure</small>
        </div>

        <h4 className="text-center fs-2">RESET PASSWORD</h4>
        <small className="my-3 text-muted text-center d-block">
          Enter your email and a new password
        </small>

        <form onSubmit={handleReset}>
          {error && <div className="alert alert-danger text-center">{error}</div>}
          {success && <div className="alert alert-success text-center">{success}</div>}

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
            <label className="form-label">New Password*</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter new password"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center mt-3">
          Remembered your password?{" "}
          <Link to="/login" className="text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
