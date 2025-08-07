import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Form, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'https://ugobueze-app.onrender.com';

const AdminRedeem = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState('');
  const [selectedRedemptionId, setSelectedRedemptionId] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Fetch withdrawals and redemptions
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setFetchError('Authentication token is required. Please log in.');
        return;
      }

      try {
        setLoading(true);

        // Fetch withdrawals
        console.log(`Fetching withdrawals from ${BASE_URL}/api/admin/withdrawals/all`);
        const withdrawalRes = await fetch(`${BASE_URL}/api/admin/withdrawals/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!withdrawalRes.ok) {
          const data = await withdrawalRes.json();
          throw new Error(data?.error || `Failed to fetch withdrawals: ${withdrawalRes.status}`);
        }
        const withdrawalData = await withdrawalRes.json();
        const withdrawalList = withdrawalData.flatMap(user =>
          user.withdrawals.map(withdrawal => ({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            withdrawalId: withdrawal._id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            date: new Date(withdrawal.date).toLocaleString(),
            accountNumber: withdrawal.accountNumber || 'N/A',
            bankName: withdrawal.bankName || 'N/A',
            accountName: withdrawal.accountName || 'N/A',
          }))
        );
        setWithdrawals(withdrawalList);

        // Fetch redemptions
        console.log(`Fetching redemptions from ${BASE_URL}/api/admin/redemptions`);
        const redemptionRes = await fetch(`${BASE_URL}/api/admin/redemptions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!redemptionRes.ok) {
          const data = await redemptionRes.json();
          throw new Error(data?.error || `Failed to fetch redemptions: ${redemptionRes.status}`);
        }
        const redemptionData = await redemptionRes.json();
        setRedemptions(redemptionData);
        setFetchError('');
      } catch (err) {
        console.error('Fetch error:', err.message);
        setFetchError(`Could not load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle withdrawal approval/rejection
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWithdrawalId || !status) {
      setMessage('Please select a withdrawal and status.');
      return;
    }

    try {
      setLoading(true);
      console.log(`Sending PATCH to ${BASE_URL}/api/admin/withdrawals/${selectedWithdrawalId}`);
      const res = await fetch(`${BASE_URL}/api/admin/withdrawals/${selectedWithdrawalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to update withdrawal: ${res.status}`);
      }

      setMessage(`Withdrawal ${status} successfully`);
      setStatus('');
      setSelectedWithdrawalId('');

      // Refresh withdrawals
      const updatedRes = await fetch(`${BASE_URL}/api/admin/withdrawals/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        const withdrawalList = updatedData.flatMap(user =>
          user.withdrawals.map(withdrawal => ({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            withdrawalId: withdrawal._id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            date: new Date(withdrawal.date).toLocaleString(),
            accountNumber: withdrawal.accountNumber || 'N/A',
            bankName: withdrawal.bankName || 'N/A',
            accountName: withdrawal.accountName || 'N/A',
          }))
        );
        setWithdrawals(withdrawalList);
      }
    } catch (err) {
      console.error('Update withdrawal error:', err.message);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle redemption approval/rejection
  const handleRedemptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRedemptionId || !status) {
      setMessage('Please select a redemption and status.');
      return;
    }

    try {
      setLoading(true);
      const endpoint = status === 'approved' 
        ? `${BASE_URL}/api/admin/redemptions/${selectedRedemptionId}/approve`
        : `${BASE_URL}/api/admin/redemptions/${selectedRedemptionId}/reject`;
      console.log(`Sending POST to ${endpoint}`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: status === 'rejected' ? JSON.stringify({ reason }) : undefined,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to update redemption: ${res.status}`);
      }

      setMessage(`Redemption ${status} successfully`);
      setStatus('');
      setSelectedRedemptionId('');
      setReason('');

      // Refresh redemptions
      const updatedRes = await fetch(`${BASE_URL}/api/admin/redemptions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (updatedRes.ok) {
        setRedemptions(await updatedRes.json());
      }
    } catch (err) {
      console.error('Update redemption error:', err.message);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !withdrawals.length && !redemptions.length) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{fetchError}</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h4>Admin Dashboard - Redemptions and Withdrawals</h4>

      {/* Redemptions Table */}
      <div className="card p-3 my-4">
        <h5>Redemptions</h5>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Gift Card</th>
              <th>Brand</th>
              <th>User</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Image</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map(redemption => (
              <tr key={redemption._id}>
                <td>{redemption.giftCardId?.name || 'N/A'}</td>
                <td>{redemption.brand || 'N/A'}</td>
                <td>{redemption.userId?.name || 'N/A'}</td>
                <td>{redemption.userId?.email || 'N/A'}</td>
                <td>{redemption.amount}</td>
                <td>
                  <a href={redemption.image} target="_blank" rel="noopener noreferrer">View Image</a>
                </td>
                <td>{redemption.status}</td>
                <td>{redemption.reason || 'N/A'}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedRedemptionId(redemption._id)}
                    disabled={redemption.status !== 'pending' || loading}
                  >
                    Select
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {redemptions.length === 0 && <p>No redemption requests found.</p>}
      </div>

      {/* Withdrawals Table */}
      <div className="card p-3 my-4">
        <h5>Approve/Reject Withdrawals</h5>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Withdrawal ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Account Number</th>
              <th>Bank Name</th>
              <th>Account Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(withdrawal => (
              <tr key={withdrawal.withdrawalId}>
                <td>{withdrawal.userId}</td>
                <td>{withdrawal.userName}</td>
                <td>{withdrawal.userEmail}</td>
                <td>{withdrawal.withdrawalId}</td>
                <td>${withdrawal.amount}</td>
                <td>{withdrawal.status}</td>
                <td>{withdrawal.date}</td>
                <td>{withdrawal.accountNumber}</td>
                <td>{withdrawal.bankName}</td>
                <td>{withdrawal.accountName}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedWithdrawalId(withdrawal.withdrawalId)}
                    disabled={withdrawal.status !== 'pending' || loading}
                  >
                    Select
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {withdrawals.length === 0 && <p>No withdrawal requests found.</p>}
      </div>

      {/* Update Form */}
      {(selectedWithdrawalId || selectedRedemptionId) && (
        <div className="card p-3 my-4">
          <Form onSubmit={selectedWithdrawalId ? handleWithdrawalSubmit : handleRedemptionSubmit}>
            <h6>Update {selectedWithdrawalId ? 'Withdrawal' : 'Redemption'} (ID: {selectedWithdrawalId || selectedRedemptionId})</h6>
            <Form.Group className="mb-3">
              <Form.Label>Status:</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Status</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </Form.Select>
            </Form.Group>
            {status === 'rejected' && !selectedWithdrawalId && (
              <Form.Group className="mb-3">
                <Form.Label>Rejection Reason:</Form.Label>
                <Form.Control
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  disabled={loading}
                />
              </Form.Group>
            )}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Processing...' : 'Update'}
            </Button>
          </Form>
        </div>
      )}

      {message && (
        <Alert className="mt-3" variant={message.includes('success') ? 'success' : 'danger'}>
          {message}
        </Alert>
      )}
    </div>
  );
};

export default AdminRedeem;