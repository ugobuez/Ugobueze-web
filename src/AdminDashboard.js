import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BASE_URL } from './config';
import AdminGiftCardManagement from './AdminRedeem';

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
        `${BASE_URL}/api/admin/redemptions/${redemptionId}/${action}`, // Fixed endpoint typo
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
    <div className="container mt-5">
      <h2>Admin Dashboard - Redemptions</h2>
      {error && <p className="text-danger">{error}</p>}
      {isLoading && <p>Loading redemptions...</p>}

      <table className="table table-bordered table-hover">
        <thead className="table-light">
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
              <td colSpan="9">No redemptions found.</td>
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
                  <a href={r.imageUrl} target="_blank" rel="noopener noreferrer">
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
                  <>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleStatusChange(r._id, 'approve')}
                    >
                      Accept
                    </button>
                    <div className="input-group mb-1" style={{ maxWidth: '250px' }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Rejection reason"
                        value={reasonMap[r._id] || ''}
                        onChange={(e) => handleReasonChange(r._id, e.target.value)}
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={!reasonMap[r._id]?.trim()}
                        onClick={() => handleStatusChange(r._id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AdminGiftCardManagement/>
    </div>
  );
};

export default AdminDashboard;