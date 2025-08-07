
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://ugobueze-app.onrender.com/api';

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
    <div className="col-12 col-md-10 col-lg-8 mx-auto custom-card p-4 mt-4 fade-in">
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
          .modal-content {
            background: rgba(33, 37, 41, 0.95);
            border-radius: 10px;
            border: none;
          }
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .header-container {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1rem;
          }
          @media (min-width: 768px) {
            .header-container {
              flex-direction: row;
              align-items: center !important;
            }
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
            .custom-table td img {
              width: 40px;
              height: 24px;
            }
            .custom-btn {
              font-size: 0.75rem;
              padding: 0.3rem 0.6rem;
            }
            h2 {
              font-size: 1.5rem;
            }
            .modal-content {
              margin: 0.5rem;
            }
            .modal-body {
              padding: 1rem;
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
          }
        `}
      </style>
      <div className="d-flex justify-content-between header-container mb-4">
        <h2 className="text-white fw-bold">Gift Card Management</h2>
        <Button className="custom-btn" onClick={() => setShowModal(true)}>
          Add New Gift Card
        </Button>
      </div>

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

      {loading ? (
        <div className="text-center text-white">
          <Spinner animation="border" variant="success" className="mb-2" />
          <p>Loading gift cards...</p>
        </div>
      ) : giftCards.length === 0 ? (
        <p className="text-light text-center">No gift cards available.</p>
      ) : (
        <div className="table-responsive">
          <Table responsive className="custom-table">
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
                    <Button
                      variant="danger"
                      size="sm"
                      className="custom-btn"
                      onClick={() => handleDelete(card._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} className="fade-in">
        <Modal.Header closeButton className="bg-dark text-light border-0">
          <Modal.Title>Add New Gift Card</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Brand</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Value</Form.Label>
              <Form.Control
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Currency</Form.Label>
              <Form.Select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                required
                className="custom-input"
              />
            </Form.Group>

            <Button
              className="custom-btn"
              type="submit"
              disabled={loading || !formData.image}
            >
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
        <div className="col-12 col-md-10 col-lg-8 mx-auto custom-card p-4 mt-4 fade-in">
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
            <div>
              <h4>Something went wrong</h4>
              <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
              <Button className="custom-btn" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
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