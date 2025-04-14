import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:3500/api/auth/loginnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("userToken", data.token);
      console.log("Stored userToken:", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
      console.error("Login error:", err);
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
        <div className="rounded bg-dark text-white fast text-center w-50 p-1 my-1">
          <small>Fast, Safety, Top Rates</small>
        </div>
        <h4 className="text-center fs-2">LOGIN</h4>

        <small className="my-3 text-muted">
          Sign in and start trading to make money right away
        </small>

        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Login
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
