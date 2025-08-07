import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Alert, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const GiftCardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [giftCard, setGiftCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGiftCard = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view gift card details.');
        navigate('/login');
        return;
      }

      console.log(`Fetching gift card ${id} from https://ugobueze-web.vercel.app/api/giftcards/${id} with token: ${token.substring(0, 20)}...`);
      const response = await axios.get(`https://ugobueze-web.vercel.app/api/giftcards/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setGiftCard(response.data.data);
      setError('');
    } catch (err) {
      console.error('Fetch gift card error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access this gift card.');
      } else if (err.response?.status === 404) {
        setError('Gift card not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch gift card.');
      }
      setGiftCard(null);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchGiftCard();
  }, [fetchGiftCard]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (e.g., .jpg, .png).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
    }
    setImage(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!amount || !image) {
      setError('Please provide amount and image.');
      setLoading(false);
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please provide a valid positive amount.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to submit redemption.');
      navigate('/login');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('image', image);

    try {
      const headers = { 
        Authorization: `Bearer ${token}`,
        // Content-Type is set automatically by FormData
      };
      console.log(`Submitting redemption to https://ugobueze-web.vercel.app/api/giftcards/${id}/redeem`);
      const response = await axios.post(`https://ugobueze-web.vercel.app/api/giftcards/${id}/redeem`, formData, {
        headers,
      });

      setMessage(response.data.message || 'Gift card submitted for review.');
      setAmount('');
      setImage(null);
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to redeem this gift card.');
      } else {
        setError(err.response?.data?.message || 'An error occurred during submission.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !giftCard) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  if (error && !giftCard) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!giftCard) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg mx-auto" style={{ maxWidth: '400px' }}>
        <h3 className="text-center my-5">{giftCard.name || 'Gift Card'}</h3>
        <img
          src={giftCard.image}
          alt={giftCard.name || 'Gift Card'}
          className="img-fluid rounded mx-auto d-block"
          style={{ maxWidth: '200px' }}
          onError={(e) => (e.target.src = '/placeholder-image.jpg')}
        />

        <Form onSubmit={handleSubmit} className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Amount:</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Image:</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">Max file size: 5MB</Form.Text>
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                style={{ width: '100px', height: '60px', objectFit: 'contain', marginTop: '10px' }}
              />
            )}
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Redemption'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default GiftCardDetails;