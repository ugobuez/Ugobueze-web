import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Centralize API base URL
const API_BASE_URL = 'https://ugobueze-web.vercel.app/api';

const AdminGiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    value: '',
    currency: 'USD',
    image: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchGiftCards = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in as an admin');
        navigate('/login');
        return;
      }
      console.log('Using token:', token);
      const response = await axios.get(`${API_BASE_URL}/giftcards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGiftCards(Array.isArray(response.data.data) ? response.data.data : response.data);
    } catch (err) {
      console.error('Error fetching gift cards:', err);
      if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Gift card endpoint not found. Please contact support.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch gift cards');
      }
      setGiftCards([]);
    }
  }, [navigate]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file (e.g., .jpg, .png)');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Image file size must be less than 5MB');
          return;
        }
      }
      setFormData({ ...formData, image: file || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in as an admin');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('value', formData.value);
      formDataToSend.append('currency', formData.currency);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.post(`${API_BASE_URL}/giftcards`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowModal(false);
      fetchGiftCards();
      setFormData({ name: '', brand: '', value: '', currency: 'USD', image: null });
      setError('');
    } catch (err) {
      console.error('Error creating gift card:', err);
      if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to create gift card');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gift card?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in as an admin');
          navigate('/login');
          return;
        }
        await axios.delete(`${API_BASE_URL}/giftcards/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchGiftCards();
        setError('');
      } catch (err) {
        console.error('Error deleting gift card:', err);
        if (err.response?.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || 'Failed to delete gift card');
        }
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mx-5">Gift Card Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New Gift Card
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" /> Loading gift cards...
        </div>
      ) : giftCards.length === 0 ? (
        <p>No gift cards available.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Value</th>
              <th>Currency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {giftCards.map((card) => (
              <tr key={card._id}>
                <td>
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name || 'Gift Card'}
                      style={{ width: '50px', height: '30px', objectFit: 'contain' }}
                      onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{card.name || 'N/A'}</td>
                <td>{card.brand || 'N/A'}</td>
                <td>{card.value || 'N/A'}</td>
                <td>{card.currency || 'N/A'}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(card._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Gift Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Value</Form.Label>
              <Form.Control
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading || !formData.image}>
              {loading ? 'Creating...' : 'Create Gift Card'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// Error Boundary Component
class GiftCardErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in GiftCardManagement:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-4">
          <Alert variant="danger">
            <h4>Something went wrong</h4>
            <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}

const WrappedAdminGiftCardManagement = () => (
  <GiftCardErrorBoundary>
    <AdminGiftCardManagement />
  </GiftCardErrorBoundary>
);

export default WrappedAdminGiftCardManagement;