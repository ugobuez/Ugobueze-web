import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import "./Crown.css";
import GiftCard from "./Giftcard";

const BASE_URL = "https://ugobueze-app.onrender.com";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserData = useCallback(async (attempt = 1, maxAttempts = 3) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Please log in to view your balance");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching balance (attempt ${attempt})...`);
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || `HTTP error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setBalance(data.balance || 0);
      setReferralCode(data.referralCode || "");
      setReferralCount(data.referredCount || 0);
    } catch (err) {
      console.error(`Fetch attempt ${attempt} failed:`, err.message);
      if (attempt < maxAttempts) {
        setTimeout(() => fetchUserData(attempt + 1, maxAttempts), 1000);
      } else {
        setError(err.message || "Failed to load user data after multiple attempts.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
            <h3>₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</h3>
            {referralCode && (
              <>
                <p><strong>Referral Code:</strong> <code>{referralCode}</code></p>
                <p><strong>Total Referrals:</strong> {referralCount}</p>
              </>
            )}
            {loading && <p>Loading balance...</p>}
            {error && <p className="text-danger">{error}</p>}
            <button
              className="btn btn-secondary btn-sm mt-2"
              onClick={() => fetchUserData(1)}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Balance"}
            </button>
          </div>
        </div>

        <Link to="/Hot">
          <button className="sell-gift-card-btn">Sell Gift Card</button>
        </Link>

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