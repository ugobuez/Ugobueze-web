
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

  return (
    <div
      className="min-vh-100 d-flex align-items-start justify-content-center py-3"
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
            padding: 1.5rem;
            margin: 0 0.5rem;
          }
          .custom-table {
            background: rgba(0, 0, 0, 0.3);
            color: #e9ecef;
            font-size: 0.9rem;
          }
          .custom-table th {
            background: rgba(40, 167, 69, 0.2);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.1);
            white-space: nowrap;
          }
          .custom-table td {
            border-color: rgba(255, 255, 255, 0.1);
            vertical-align: middle;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 120px;
          }
          .custom-btn {
            transition: all 0.3s ease;
            background: #28a745;
            border: none;
            font-size: 0.85rem;
            padding: 0.4rem 0.8rem;
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
          .custom-input {
            background: #212529 !important;
            color: #e9ecef !important;
            border: none !important;
            font-size: 0.85rem;
          }
          .custom-input:focus {
            border-color: #28a745 !important;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
          }
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          @media (max-width: 768px) {
            .custom-card {
              padding: 1rem;
              margin: 0 0.25rem;
            }
            .custom-table {
              font-size: 0.8rem;
            }
            .custom-table th, .custom-table td {
              padding: 0.5rem;
              max-width: 100px;
            }
            .custom-btn {
              font-size: 0.75rem;
              padding: 0.3rem 0.6rem;
            }
            h2 {
              font-size: 1.5rem;
            }
            h4, h5 {
              font-size: 1.25rem;
            }
            .table-responsive {
              border-radius: 8px;
            }
          }
          @media (max-width: 576px) {
            .custom-table th, .custom-table td {
              max-width: 80px;
              font-size: 0.75rem;
            }
            .custom-btn {
              font-size: 0.7rem;
              padding: 0.25rem 0.5rem;
            }
            .custom-input {
              font-size: 0.75rem;
            }
            h2 {
              font-size: 1.25rem;
            }
            h4, h5 {
              font-size: 1rem;
            }
          }
        `}
      </style>
      <div className="col-12 col-md-10 col-lg-8 custom-card fade-in">
        <h2 className="text-white text-center mb-4 fw-bold">Admin Dashboard - Redemptions and Withdrawals</h2>

        {loading && !withdrawals.length && !redemptions.length ? (
          <div className="text-center text-white mb-4">
            <Spinner animation="border" variant="success" className="mb-2" />
            <p>Loading...</p>
          </div>
        ) : fetchError ? (
          <Alert variant="danger" className="d-flex align-items-center mb-4">
            <svg
              className="bi flex-shrink-0 me-2"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <div>{fetchError}</div>
          </Alert>
        ) : (
          <>
            {/* Redemptions Table */}
            <div className="mb-4">
              <h4 className="text-white mb-3">Redemptions</h4>
              <div className="table-responsive">
                <Table responsive className="custom-table">
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
                    {redemptions.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center text-light">
                          No redemption requests found.
                        </td>
                      </tr>
                    )}
                    {redemptions.map(redemption => (
                      <tr key={redemption._id}>
                        <td>{redemption.giftCardId?.name || 'N/A'}</td>
                        <td>{redemption.brand || 'N/A'}</td>
                        <td>{redemption.userId?.name || 'N/A'}</td>
                        <td>{redemption.userId?.email || 'N/A'}</td>
                        <td>{redemption.amount}</td>
                        <td>
                          <a
                            href={redemption.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success"
                          >
                            View Image
                          </a>
                        </td>
                        <td>{redemption.status}</td>
                        <td>{redemption.reason || 'N/A'}</td>
                        <td>
                          <Button
                            className="custom-btn btn-sm"
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
              </div>
            </div>

            {/* Withdrawals Table */}
            <div className="mb-4">
              <h4 className="text-white mb-3">Approve/Reject Withdrawals</h4>
              <div className="table-responsive">
                <Table responsive className="custom-table">
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
                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan="11" className="text-center text-light">
                          No withdrawal requests found.
                        </td>
                      </tr>
                    )}
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
                            className="custom-btn btn-sm"
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
              </div>
            </div>

            {/* Update Form */}
            {(selectedWithdrawalId || selectedRedemptionId) && (
              <div className="custom-card p-3 mb-4">
                <Form onSubmit={selectedWithdrawalId ? handleWithdrawalSubmit : handleRedemptionSubmit}>
                  <h5 className="text-white mb-3">
                    Update {selectedWithdrawalId ? 'Withdrawal' : 'Redemption'} (ID: {selectedWithdrawalId || selectedRedemptionId})
                  </h5>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Status:</Form.Label>
                    <Form.Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={loading}
                      className="custom-input"
                    >
                      <option value="">Select Status</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </Form.Select>
                  </Form.Group>
                  {status === 'rejected' && !selectedWithdrawalId && (
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Rejection Reason:</Form.Label>
                      <Form.Control
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason for rejection"
                        disabled={loading}
                        className="custom-input"
                      />
                    </Form.Group>
                  )}
                  <Button type="submit" className="custom-btn" disabled={loading}>
                    {loading ? 'Processing...' : 'Update'}
                  </Button>
                </Form>
              </div>
            )}

            {message && (
              <Alert
                className="mt-3"
                variant={message.includes('success') ? 'success' : 'danger'}
              >
                {message}
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRedeem;
