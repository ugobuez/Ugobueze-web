// AdminGiftCardManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert, Table } from 'react-bootstrap';

const AdminGiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    value: '',
    currency: 'USD',
    image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://ugobueze-app.onrender.com/api/giftcards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGiftCards(response.data);
    } catch (err) {
      setError('Failed to fetch gift cards');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('https://ugobueze-app.onrender.com/api/giftcards', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowModal(false);
      fetchGiftCards();
      setFormData({ name: '', brand: '', value: '', currency: 'USD', image: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create gift card');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gift card?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`https://ugobueze-app.onrender.com/api/giftcards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGiftCards();
      } catch (err) {
        setError('Failed to delete gift card');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center  mb-4">
        <h2 className='mx-5'>Gift Card Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New Gift Card
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

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
                <img 
                  src={card.image} 
                  alt={card.name} 
                  style={{ width: '50px', height: '30px', objectFit: 'contain' }}
                />
              </td>
              <td>{card.name}</td>
              <td>{card.brand}</td>
              <td>{card.value}</td>
              <td>{card.currency}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(card._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Gift Card'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminGiftCardManagement;