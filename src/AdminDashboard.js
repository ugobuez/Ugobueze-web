
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Table, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BASE_URL } from './config';
import AdminGiftCardManagement from './AdminRedeem';
import AdminWithdrawalApproval from './ApproveWithdrawal';

const AdminDashboard = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [error, setError] = useState('');
  const [reasonMap, setReasonMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleError = useCallback((err) => {
    console.error('Error:', err.response?.data || err.message);
    if (err.response?.status === 401 || err.response?.status === 403) {
      setError('Access denied or session expired. Please re-login.');
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRedemptions = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in as an admin');
        setIsLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/admin/redemptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRedemptions(response.data);
        setError('');
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedemptions();
  }, [navigate, handleError]);

  const handleStatusChange = async (redemptionId, action) => {
    const token = localStorage.getItem('token');
    const reason = reasonMap[redemptionId] || '';

    if (!token) {
      setError('Please log in as an admin');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/admin/redemptions/${redemptionId}/${action}`,
        action === 'reject' ? { reason } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRedemptions((prev) =>
        prev.map((r) =>
          r._id === redemptionId
            ? {
                ...r,
                status: action === 'approve' ? 'approved' : 'rejected',
                reason: action === 'reject' ? reason : undefined,
              }
            : r
        )
      );
      setReasonMap((prev) => ({ ...prev, [redemptionId]: '' }));
      alert(`Redemption ${action}ed successfully`);
      setError('');
    } catch (err) {
      handleError(err);
    }
  };

  const handleReasonChange = (redemptionId, value) => {
    setReasonMap((prev) => ({ ...prev, [redemptionId]: value }));
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
            max-width: 150px;
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
            .input-group {
              flex-direction: column;
              gap: 0.5rem;
            }
            .input-group .form-control {
              width: 100%;
            }
            h2 {
              font-size: 1.5rem;
            }
            .table-responsive {
              border-radius: 8px;
              overflow-x: auto;
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
            .input-group {
              max-width: 100% !important;
            }
            .custom-input {
              font-size: 0.75rem;
            }
          }
        `}
      </style>
      <div className="col-12 col-md-10 col-lg-8 custom-card fade-in">
        <h2 className="text-white text-center mb-4 fw-bold">Admin Dashboard - Redemptions</h2>
        {isLoading && (
          <div className="text-center text-white mb-4">
            <Spinner animation="border" variant="success" className="mb-2" />
            <p>Loading redemptions...</p>
          </div>
        )}
        {error && (
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
            <div>{error}</div>
          </Alert>
        )}
        <div className="table-responsive">
          <Table responsive className="custom-table mb-4">
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
              {redemptions.length === 0 && !isLoading && !error && (
                <tr>
                  <td colSpan="9" className="text-center text-light">
                    No redemptions found.
                  </td>
                </tr>
              )}
              {redemptions.map((r) => (
                <tr key={r._id}>
                  <td>{r.giftCardId?.name || 'N/A'}</td>
                  <td>{r.giftCardId?.brand || 'N/A'}</td>
                  <td>{r.userId?.name || 'N/A'}</td>
                  <td>{r.userId?.email || 'N/A'}</td>
                  <td>{r.amount}</td>
                  <td>
                    {r.imageUrl ? (
                      <a
                        href={r.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success"
                      >
                        View Image
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{r.status}</td>
                  <td>{r.reason || 'N/A'}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="d-flex flex-column gap-2">
                        <Button
                          className="custom-btn btn-sm"
                          onClick={() => handleStatusChange(r._id, 'approve')}
                        >
                          Accept
                        </Button>
                        <div className="input-group" style={{ maxWidth: '250px' }}>
                          <Form.Control
                            type="text"
                            placeholder="Rejection reason"
                            value={reasonMap[r._id] || ''}
                            onChange={(e) => handleReasonChange(r._id, e.target.value)}
                            className="custom-input"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={!reasonMap[r._id]?.trim()}
                            onClick={() => handleStatusChange(r._id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <AdminGiftCardManagement />
        <AdminWithdrawalApproval />
      </div>
    </div>
  );
};

export default AdminDashboard;