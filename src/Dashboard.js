
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Spinner, Alert, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import GiftCard from "./Giftcard";

const BASE_URL = process.env.REACT_APP_API_URL || "https://ugobueze-app.onrender.com";

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
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes glassShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          .liquid-glass-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .liquid-glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
          }
          .liquid-glass-btn {
            background: linear-gradient(90deg, rgba(40, 167, 69, 0.9), rgba(33, 136, 56, 0.9));
            border: none;
            border-radius: 12px;
            padding: 0.75rem 1.5rem;
            color: #fff;
            font-weight: 600;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          .liquid-glass-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
            background: linear-gradient(90deg, rgba(33, 136, 56, 1), rgba(40, 167, 69, 1));
          }
          .liquid-glass-btn:disabled {
            background: rgba(108, 117, 125, 0.6);
            cursor: not-allowed;
            box-shadow: none;
          }
          .liquid-glass-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 200%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.2),
              transparent
            );
            animation: glassShimmer 2s infinite;
          }
          .balance-card {
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(8px);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
          }
          .balance-card:hover {
            transform: scale(1.02);
          }
          .feature-item {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(6px);
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            color: #e9ecef;
            font-weight: 500;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .feature-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          }
          .bottom-nav {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 0.5rem;
            position: sticky;
            bottom: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
          }
          .bottom-nav a {
            color: #e9ecef;
            text-decoration: none;
            font-weight: 600;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;
          }
          .bottom-nav a:hover {
            background: rgba(40, 167, 69, 0.2);
            color: #28a745;
            transform: translateY(-2px);
          }
          .congratulations-banner {
            background: linear-gradient(90deg, rgba(40, 167, 69, 0.9), rgba(33, 136, 56, 0.9));
            backdrop-filter: blur(6px);
            border-radius: 16px;
            padding: 1.25rem;
            color: #fff;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
          }
          .congratulations-banner::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 200%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.15),
              transparent
            );
            animation: glassShimmer 3s infinite;
          }
          .text-glass {
            color: #fff;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .navbar-brand {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(90deg, #fff, #28a745);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          @media (max-width: 768px) {
            .liquid-glass-card {
              padding: 1.25rem;
              margin: 0.5rem;
              border-radius: 16px;
            }
            .liquid-glass-btn {
              padding: 0.6rem 1.2rem;
              font-size: 0.9rem;
            }
            .balance-card {
              padding: 1.25rem;
            }
            .feature-item {
              padding: 0.75rem;
              font-size: 0.9rem;
            }
            .bottom-nav {
              padding: 0.4rem;
            }
            .bottom-nav a {
              padding: 0.6rem 0.8rem;
              font-size: 0.9rem;
            }
            .congratulations-banner {
              padding: 1rem;
              font-size: 0.9rem;
            }
            .navbar-brand {
              font-size: 1.5rem;
            }
          }
          @media (max-width: 576px) {
            .liquid-glass-card {
              padding: 1rem;
              margin: 0.25rem;
              border-radius: 12px;
            }
            .liquid-glass-btn {
              padding: 0.5rem 1rem;
              font-size: 0.85rem;
            }
            .balance-card {
              padding: 1rem;
            }
            .feature-item {
              padding: 0.6rem;
              font-size: 0.85rem;
            }
            .bottom-nav {
              padding: 0.3rem;
            }
            .bottom-nav a {
              padding: 0.5rem 0.6rem;
              font-size: 0.85rem;
            }
            .congratulations-banner {
              padding: 0.75rem;
              font-size: 0.85rem;
            }
            .navbar-brand {
              font-size: 1.25rem;
            }
          }
        `}
      </style>
      <div className="col-md-10 col-lg-8 mx-auto liquid-glass-card p-5 mt-5 fade-in">
        <div className="dashboard-header mb-4">
          <Navbar.Brand as={Link} to="/" className="navbar-brand position-relative">
            Ugobu<span style={{ color: "#28a745" }}>👑</span>eze
          </Navbar.Brand>
          <div className="congratulations-banner mt-3">
            <p className="mb-1 fw-bold text-glass">🎉 Congratulations 🎉</p>
            <p className="mb-1 text-glass">$200,000 Single-day transaction</p>
            <p className="mb-0 text-glass">50,000 Number of members</p>
          </div>
        </div>

        <div className="balance-section mb-4">
          <p className="text-light mb-2">📢 Minimum withdrawal amount will be improved</p>
          <div className="balance-card">
            <p className="text-light mb-1">Dollar Balance</p>
            <h3 className="text-success fw-bold text-glass">
              ${balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </h3>
            {referralCode && (
              <>
                <p className="text-light">
                  <strong>Referral Code:</strong>{" "}
                  <code className="text-white">{referralCode}</code>
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
              className="mt-2 liquid-glass-btn"
              onClick={() => fetchUserData(1)}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Balance"}
            </Button>
          </div>
        </div>

        <Link to="/Hot">
          <Button className="w-100 mb-4 liquid-glass-btn">Sell Gift Card</Button>
        </Link>

        <div className="features-section d-flex flex-wrap gap-3 mb-4">
          <div className="feature-item flex-grow-1">💰 Referral program</div>
          <div className="feature-item flex-grow-1">🎟️ Coupon</div>
          <div className="feature-item flex-grow-1">👑 VIP Center</div>
          <div className="feature-item flex-grow-1">👤 Customer Service</div>
        </div>

        <div className="recent-transactions mb-4">
          <p className="text-success">
            ✅ X220******0025 sold 400 USD (fast card) iTunes/Apple gift card earned 457,200₦
          </p>
        </div>

        <div className="hot-cards">
          <h4 className="text-white mb-3 text-glass">Hot Cards</h4>
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
