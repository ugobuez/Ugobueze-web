import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Table, Badge, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'boxicons/css/boxicons.min.css';
import { BASE_URL } from './config';

const Referrals = () => {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Authentication token missing. Please log in.');
      setLoading(false);
      return;
    }

    const fetchUserStats = async () => {
      try {
        const resUser = await fetch(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resUser.ok) {
          const errorData = await resUser.json();
          throw new Error(errorData?.error || `Failed to fetch user data: ${resUser.status}`);
        }

        const userData = await resUser.json();

        if (!userData.referralCode) {
          throw new Error('Referral code not found for user.');
        }

        const resStats = await fetch(`${BASE_URL}/api/referrals/stats/${userData.referralCode}`);
        if (!resStats.ok) {
          const errorData = await resStats.json();
          throw new Error(errorData?.error || `Failed to fetch referral stats: ${resStats.status}`);
        }

        const stats = await resStats.json();

        setUser({
          name: userData.name || 'Unknown User',
          referralCode: userData.referralCode,
          referralCount: stats.referralCount || 0,
          referralEarnings: stats.referralEarnings || 0,
        });
      } catch (err) {
        console.error('Error fetching user/stats:', err);
        setError(err.message || 'Unable to load referral data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/referrals/leaderboard`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || 'Failed to fetch leaderboard');
        }
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError((prev) => prev || 'Failed to load leaderboard.');
      }
    };

    fetchUserStats();
    fetchLeaderboard();
  }, []);

  const handleCopy = () => {
    if (!user?.referralCode) return;
    const link = `https://ugobueze-web.vercel.app/signup?code=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center mt-5">Loading referral data...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <Container className="mt-5">
      <h1 className="text-center fw-bold text-primary mt-5 pt-5">Refer & Earn 💸</h1>
      <p className="text-center">Earn $3 when friends redeem a gift card using your link!</p>

      <div className="d-flex justify-content-center mb-4">
        <Image
          src="https://i.ibb.co/99dKsGT0/IMG-2188.jpg"
          fluid
          style={{ maxWidth: '400px', borderRadius: '10px' }}
        />
      </div>

      <Card className="p-4 shadow mb-5">
        <Row>
          <Col md={6}>
            <h5><strong>Name:</strong> {user.name}</h5>
            <h6><strong>Your Referral Code:</strong> <Badge bg="success">{user.referralCode}</Badge></h6>
            <p className="mt-2">
              <strong>Your Referral Link:</strong><br />
              <code>{`https://ugobueze-web.vercel.app/signup?code=${user.referralCode}`}</code>
            </p>
            <Button onClick={handleCopy} variant="outline-primary" className="me-2">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Col>
          <Col md={6}>
            <h5 className="mb-3">Your Stats</h5>
            <p><strong>Referrals Made:</strong> {user.referralCount}</p>
            <p><strong>Total Earned:</strong> ${user.referralEarnings}</p>
          </Col>
        </Row>
      </Card>

      <Alert variant="warning" className="text-center fw-bold">
        🎯 Contest Leaderboard: <Badge bg="warning" text="dark">Live</Badge><br />
        Number of Referrals: <strong>{user.referralCount}</strong><br />
        Cash Earned: <strong>${user.referralEarnings}</strong>
      </Alert>

      <h4 className="mb-3">Referral Leaderboard</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Referrals</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.referralCount}</td>
              <td>${item.referralEarnings}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Referrals;
