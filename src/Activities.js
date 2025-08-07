import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'https://ugobueze-web.vercel.app';

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

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" /> Loading activities...
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
      <div className="card p-3 my-4">
        <h5>User Activities</h5>
        <Button
          variant="secondary"
          size="sm"
          className="mb-3"
          onClick={() => setRefresh(prev => prev + 1)}
        >
          Refresh Activities
        </Button>
        {activities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          <Table striped bordered hover responsive>
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
    </div>
  );
};

export default Activities;