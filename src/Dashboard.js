
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Spinner, Alert, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
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
    const token = localStorage.getItem("token");
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
    <div
      className="min-vh-100 d-flex align-items-start justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #1a202c 100%)',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          .custom-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          .custom-btn {
            transition: all 0.3s ease;
            background: #28a745;
            border: none;
          }
          .custom-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            background: #218838;
          }
          .custom-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
          }
          .balance-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 1.5rem;
          }
          .feature-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 0.75rem;
            text-align: center;
            transition: all 0.3s ease;
          }
          .feature-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
          }
          .bottom-nav a {
            color: #e9ecef;
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .bottom-nav a:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #28a745;
          }
          .congratulations-banner {
            background: linear-gradient(90deg, #28a745, #218838);
            border-radius: 10px;
            padding: 1rem;
            color: #fff;
            text-align: center;
          }
        `}
      </style>
      <div className="col-md-10 col-lg-8 mx-auto custom-card p-5 mt-5 fade-in">
        <div className="dashboard-header mb-4">
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-white position-relative">
            Ugobu<span style={{ color: '#28a745' }}>👑</span>eze
          </Navbar.Brand>
          <div className="congratulations-banner mt-3">
            <p className="mb-1 fw-bold">🎉 Congratulations 🎉</p>
            <p className="mb-1">$200,000 Single-day transaction</p>
            <p className="mb-0">50,000 Number of members</p>
          </div>
        </div>

        <div className="balance-section mb-4">
          <p className="text-light mb-2">📢 Minimum withdrawal amount will be improved</p>
          <div className="balance-card">
            <p className="text-light mb-1">Dollar Balance</p>
            <h3 className="text-success fw-bold">
              ${balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </h3>
            {referralCode && (
              <>
                <p className="text-light">
                  <strong>Referral Code:</strong> <code className="text-white">{referralCode}</code>
                </p>
                <p className="text-light">
                  <strong>Total Referrals:</strong> {referralCount}
                </p>
              </>
            )}
            {loading && (
              <div className="text-center text-white mt-2">
                <Spinner animation="border" variant="success" size="sm" /> Loading balance...
              </div>
            )}
            {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
            <Button
              variant="success"
              size="sm"
              className="mt-2 custom-btn"
              onClick={() => fetchUserData(1)}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Balance"}
            </Button>
          </div>
        </div>

        <Link to="/Hot">
          <Button className="w-100 mb-4 custom-btn">Sell Gift Card</Button>
        </Link>

        <div className="features-section d-flex flex-wrap gap-3 mb-4">
          <div className="feature-item flex-grow-1">💰 Referral program</div>
          <div className="feature-item flex-grow-1">🎟️ Coupon</div>
          <div className="feature-item flex-grow-1">👑 VIP Center</div>
          <div className="feature-item flex-grow-1">👤 Customer Service</div>
        </div>

        <div className="recent-transactions mb-4">
          <p className="text-light">
            ✅ X220******0025 sold 400 USD (fast card) iTunes/Apple gift card earned 457,200₦
          </p>
        </div>

        <div className="hot-cards">
          <h4 className="text-white mb-3">Hot Cards</h4>
          <GiftCard />
        </div>

        <nav className="bottom-nav d-flex justify-content-around mt-4">
          <Link to="/">🏠 Home</Link>
          <Link to="/wallet">💼 Wallet</Link>
          <Link to="/transactions">📄 Transactions</Link>
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
