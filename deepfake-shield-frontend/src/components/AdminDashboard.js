// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Get total scans count
      const scansSnapshot = await getDocs(collection(db, 'scans'));
      const totalScans = scansSnapshot.size;
      
      // Get today's scans
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayQuery = query(
        collection(db, 'scans'),
        where('timestamp', '>=', today)
      );
      const todaySnapshot = await getDocs(todayQuery);
      const todayScans = todaySnapshot.size;
      
      // Get user count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Get detection stats
      const fakeScansQuery = query(
        collection(db, 'scans'),
        where('label', '==', 'fake')
      );
      const fakeScansSnapshot = await getDocs(fakeScansQuery);
      const fakeScans = fakeScansSnapshot.size;
      
      const realScans = totalScans - fakeScans;
      const detectionRate = totalScans > 0 ? (fakeScans / totalScans * 100) : 0;
      
      // Get recent scans
      const recentScansQuery = query(
        collection(db, 'scans'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const recentScansSnapshot = await getDocs(recentScansQuery);
      const recentScansData = recentScansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStats({
        totalScans,
        todayScans,
        totalUsers,
        fakeScans,
        realScans,
        detectionRate: Math.round(detectionRate)
      });
      
      setRecentScans(recentScansData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand className="text-glow">
          DeepFakeShield Admin
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar" />
        <Navbar.Collapse id="admin-navbar" className="justify-content-end">
          <Nav>
            <Button variant="outline-light" className="me-2" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="outline-info" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col xl={3} lg={6} className="mb-3">
            <Card className="custom-card text-center">
              <Card.Body>
                <h6 className="text-muted">Total Scans</h6>
                <h3 className="text-glow">{stats?.totalScans?.toLocaleString() || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <Card className="custom-card text-center">
              <Card.Body>
                <h6 className="text-muted">Today's Scans</h6>
                <h3 className="text-info">{stats?.todayScans || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <Card className="custom-card text-center">
              <Card.Body>
                <h6 className="text-muted">Total Users</h6>
                <h3 className="text-warning">{stats?.totalUsers || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <Card className="custom-card text-center">
              <Card.Body>
                <h6 className="text-muted">Detection Rate</h6>
                <h3 className="text-danger">{stats?.detectionRate || 0}%</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={6} className="mb-4">
            <Card className="custom-card">
              <Card.Body>
                <h6 className="text-glow mb-3">Detection Distribution</h6>
                <div className="text-center">
                  <div className="d-flex justify-content-around mb-3">
                    <div>
                      <Badge bg="success" className="p-2">Real: {stats?.realScans || 0}</Badge>
                    </div>
                    <div>
                      <Badge bg="danger" className="p-2">AI-Generated: {stats?.fakeScans || 0}</Badge>
                    </div>
                  </div>
                  <div className="progress" style={{ height: '30px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${stats?.realScans && stats?.totalScans ? (stats.realScans / stats.totalScans * 100) : 50}%` }}
                    >
                      {stats?.realScans && stats?.totalScans ? Math.round(stats.realScans / stats.totalScans * 100) : 50}%
                    </div>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${stats?.fakeScans && stats?.totalScans ? (stats.fakeScans / stats.totalScans * 100) : 50}%` }}
                    >
                      {stats?.fakeScans && stats?.totalScans ? Math.round(stats.fakeScans / stats.totalScans * 100) : 50}%
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6} className="mb-4">
            <Card className="custom-card">
              <Card.Body>
                <h6 className="text-glow mb-3">Recent Scans</h6>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table striped bordered hover variant="dark" size="sm">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Result</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentScans.map(scan => (
                        <tr key={scan.id}>
                          <td className="text-truncate" style={{ maxWidth: '100px' }}>
                            {scan.filename}
                          </td>
                          <td>
                            <Badge bg={scan.label === 'fake' ? 'danger' : 'success'}>
                              {scan.label}
                            </Badge>
                          </td>
                          <td>
                            {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="custom-card">
              <Card.Body>
                <h6 className="text-glow mb-3">System Information</h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Admin User:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.uid}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Total Storage:</strong> Calculating...</p>
                    <p><strong>Server Status:</strong> <Badge bg="success">Online</Badge></p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;