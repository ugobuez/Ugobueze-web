import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'https://ugobueze-app.onrender.com';

const Withdraw = () => {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Fetch user balance
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

  // Handle withdrawal submission
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

  if (loading && balance === null) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h4>Withdraw Funds</h4>
      <div className="card p-3 my-4">
        <p>Available Balance: ${balance !== null ? balance.toFixed(2) : 'Loading...'}</p>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
              step="0.01"
              min="0"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <Form.Control
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Bank Name</Form.Label>
            <Form.Control
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Enter bank name"
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Account Name</Form.Label>
            <Form.Control
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter account name"
              disabled={loading}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Withdrawal'}
          </Button>
        </Form>
        {message && (
          <Alert className="mt-3" variant={message.includes('success') ? 'success' : 'danger'}>
            {message}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Withdraw;