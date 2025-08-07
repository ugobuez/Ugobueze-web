
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'https://ugobueze-app.onrender.com';

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view balance.');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching balance (attempt 1)...');
        const res = await fetch(`${BASE_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          if (res.status === 401) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error(data?.error || `Failed to fetch balance: ${res.status}`);
        }

        const data = await res.json();
        setBalance(data.balance);
        setError('');
      } catch (err) {
        console.error('Fetch balance error:', err.message);
        setError(`Could not load balance: ${err.message}`);
      }
    };

    fetchBalance();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !accountNumber || !bankName || !accountName) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setMessage('Amount must be greater than zero.');
      return;
    }

    if (balance !== null && parseFloat(amount) > balance) {
      setMessage('Insufficient balance.');
      return;
    }

    try {
      setLoading(true);
      console.log(`Submitting withdrawal to ${BASE_URL}/api/admin/withdrawals`);
      const res = await fetch(`${BASE_URL}/api/admin/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          accountNumber,
          bankName,
          accountName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to submit withdrawal: ${res.status}`);
      }

      setMessage(`Withdrawal request for $${amount} submitted successfully. Remaining balance: $${data.remainingBalance}`);
      setAmount('');
      setAccountNumber('');
      setBankName('');
      setAccountName('');
      setBalance(data.remainingBalance);
      setError('');
    } catch (err) {
      console.error('Withdrawal submission error:', err.message);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
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
          .custom-input:focus {
            border-color: #28a745;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
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
        `}
      </style>
      {loading && balance === null ? (
        <div className="text-center text-white fade-in">
          <Spinner animation="border" variant="success" className="mb-2" />
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="col-md-6 col-lg-5 mx-auto fade-in">
          <Alert variant="danger" className="d-flex align-items-center">
            <svg
              className="bi flex-shrink-0 me-2"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <div>{error}</div>
          </Alert>
        </div>
      ) : (
        <div className="col-md-6 col-lg-5 mx-auto custom-card p-5 fade-in">
          <h2 className="text-white text-center mb-4 fw-bold">Withdraw Funds</h2>
          <div className="bg-dark bg-opacity-50 p-3 rounded mb-4 text-center">
            <p className="text-light mb-0">
              Available Balance:{' '}
              <span className="fw-semibold text-success">
                ${balance !== null ? balance.toFixed(2) : 'Loading...'}
              </span>
            </p>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Amount ($)</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
                step="0.01"
                min="0"
                className="custom-input bg-dark text-light border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Account Number</Form.Label>
              <Form.Control
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                disabled={loading}
                className="custom-input bg-dark text-light border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Bank Name</Form.Label>
              <Form.Control
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                disabled={loading}
                className="custom-input bg-dark text-light border-0"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-light">Account Name</Form.Label>
              <Form.Control
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
                disabled={loading}
                className="custom-input bg-dark text-light border-0"
              />
            </Form.Group>
            <Button
              type="submit"
              disabled={loading}
              className="w-100 custom-btn"
            >
              {loading ? 'Submitting...' : 'Submit Withdrawal'}
            </Button>
          </Form>
          {message && (
            <Alert
              variant={message.includes('success') ? 'success' : 'danger'}
              className="mt-4"
            >
              {message}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;
