
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'https://ugobueze-app.onrender.com';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  const fetchActivities = useCallback(async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view activities.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching activities from ${BASE_URL}/api/activities with token: ${token.substring(0, 20)}...`);
      const res = await fetch(`${BASE_URL}/api/activities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Fetch activities response:', data);
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(data?.error || `Failed to fetch activities: ${res.status}`);
      }

      const data = await res.json();
      const activityList = Array.isArray(data) ? data : (data.success && Array.isArray(data.data) ? data.data : []);
      if (!Array.isArray(activityList)) {
        throw new Error('Invalid activities data format');
      }
      setActivities(activityList);
      setError('');
    } catch (err) {
      console.error('Fetch activities error:', err.message);
      if (retryCount < 2) {
        console.log(`Retrying fetch activities (attempt ${retryCount + 2})...`);
        setTimeout(() => fetchActivities(retryCount + 1), 1000);
      } else {
        setError(`Could not load activities: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, refresh]);

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
          .custom-table {
            background: rgba(0, 0, 0, 0.3);
            color: #e9ecef;
          }
          .custom-table th {
            background: rgba(255, 255, 255, 0.05);
            color: #f8f9fa;
          }
          .custom-table td {
            border-color: rgba(255, 255, 255, 0.1);
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
      {loading ? (
        <div className="text-center text-white fade-in">
          <Spinner animation="border" variant="success" className="mb-2" />
          <p>Loading activities...</p>
        </div>
      ) : error ? (
        <div className="col-md-8 col-lg-6 mx-auto fade-in">
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
        <div className="col-md-10 col-lg-8 mx-auto custom-card p-5 fade-in">
          <h2 className="text-white text-center mb-4 fw-bold">User Activities</h2>
          <div className="d-flex justify-content-end mb-3">
            <Button
              variant="secondary"
              size="sm"
              className="custom-btn"
              onClick={() => setRefresh(prev => prev + 1)}
            >
              Refresh Activities
            </Button>
          </div>
          {activities.length === 0 ? (
            <p className="text-light text-center">No activities found.</p>
          ) : (
            <Table responsive className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => (
                  <tr key={activity._id}>
                    <td>{new Date(activity.createdAt).toLocaleString()}</td>
                    <td>{activity.type}</td>
                    <td>{activity.title}</td>
                    <td>{activity.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default Activities;
