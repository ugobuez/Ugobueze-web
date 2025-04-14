import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import "./Crown.css";
import GiftCard from "./Giftcard";

const Dashboard = () => {
  
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserData = async (retryCount = 3) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Please log in to view your balance");
      setLoading(false);
      console.error("No userToken found in localStorage");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`Fetching balance (attempt ${attempt})...`);
        const res = await fetch("http://localhost:3500/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Fetch response:", data);
        setBalance(data.balance || 0);
        setLoading(false);
        return;
      } catch (err) {
        console.error(`Fetch attempt ${attempt} failed:`, err.message);
        if (attempt === retryCount) {
          setError("Unable to load balance. Please try again or re-login.");
          setLoading(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    // no need to add fetchUserData to deps since it's defined inside the component and doesn't depend on external variables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 position-relative">
            Ugobu<span className="crown-2">👑</span>eze
          </Navbar.Brand>
          <div className="congratulations-banner">
            <p>🎉 Congratulations 🎉</p>
            <p>200,000 $ Single-day transaction</p>
            <p>50,000 Number of members</p>
          </div>
        </div>

        <div className="balance-section">
          <p>📢 Minimum withdrawal amount will be improved</p>
          <div className="balance-card">
          
            <p>Naira Balance</p>
            <h3> $ {balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</h3>
            {loading && <p>Loading balance...</p>}
            {error && <p className="text-danger">{error}</p>}
            <button
              className="btn btn-secondary btn-sm mt-2"
              onClick={() => fetchUserData()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Balance"}
            </button>
          </div>
        </div>

        <button className="sell-gift-card-btn">Sell Gift Card</button>

        <div className="features-section">
          <div className="feature-item">💰 Referral program</div>
          <div className="feature-item">🎟️ Coupon</div>
          <div className="feature-item">👑 VIP Center</div>
          <div className="feature-item">👤 Customer Service</div>
        </div>

        <div className="recent-transactions">
          <p>✅ X220******0025 sold 400 USD (fast card) iTunes/Apple gift card earned 457200₦</p>
        </div>

        <div className="hot-cards">
          <h4>Hot Cards</h4>
          <GiftCard />
        </div>
      </div>

      <nav className="bottom-nav">
        <Link to="/home">🏠 Home</Link>
        <Link to="/wallet">💼 Wallet</Link>
        <Link to="/transactions">📄 Transactions</Link>
      </nav>
    </div>
  );
};

export default Dashboard;
