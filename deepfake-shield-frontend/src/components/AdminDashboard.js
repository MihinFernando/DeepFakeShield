// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Table, Badge, Alert, Image, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const navigate = useNavigate();

  // Your Flask backend URL - CHANGE THIS IF YOUR BACKEND RUNS ON DIFFERENT PORT
  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setError('');
      
      // Get total reports count
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const totalReports = reportsSnapshot.size;
      
      // Get today's reports
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReports = reportsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.createdAt && new Date(data.createdAt) >= today;
      }).length;
      
      // Get user count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Get detection stats from reports
      const fakeReports = reportsSnapshot.docs.filter(doc => 
        doc.data().decision === 'fake'
      ).length;
      
      const realReports = totalReports - fakeReports;
      const detectionRate = totalReports > 0 ? (fakeReports / totalReports * 100) : 0;
      
      // Get recent reports with image URLs
      const recentReportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const recentReportsSnapshot = await getDocs(recentReportsQuery);
      const recentReportsData = recentReportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStats({
        totalReports,
        todayReports,
        totalUsers,
        fakeReports,
        realReports,
        detectionRate: Math.round(detectionRate)
      });
      
      setRecentReports(recentReportsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data. Please check your Firestore permissions.');
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

  const openImageModal = (imageUrl) => {
    // Fix: Convert relative URL to absolute backend URL
    let fullImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('/')) {
      fullImageUrl = `${BACKEND_URL}${imageUrl}`;
    }
    setSelectedImage(fullImageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {/* Light Mode Navbar */}
      <Navbar bg="light" variant="light" expand="lg" className="px-3 shadow-sm">
        <Navbar.Brand className="text-primary fw-bold">
          DeepFakeShield Admin
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar" />
        <Navbar.Collapse id="admin-navbar" className="justify-content-end">
          <Nav>
            <Button variant="outline-secondary" className="me-2" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="outline-primary" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        
        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} className="mb-3">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <div className="text-muted small mb-1">TOTAL REPORTS</div>
                <h2 className="text-primary fw-bold">{stats?.totalReports?.toLocaleString() || 0}</h2>
                <div className="text-success small">
                  <i className="bi bi-arrow-up"></i> Overall
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <div className="text-muted small mb-1">TODAY'S REPORTS</div>
                <h2 className="text-info fw-bold">{stats?.todayReports || 0}</h2>
                <div className="text-warning small">
                  <i className="bi bi-clock"></i> Today
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <div className="text-muted small mb-1">TOTAL USERS</div>
                <h2 className="text-warning fw-bold">{stats?.totalUsers || 0}</h2>
                <div className="text-muted small">
                  <i className="bi bi-people"></i> Registered
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <div className="text-muted small mb-1">DETECTION RATE</div>
                <h2 className="text-danger fw-bold">{stats?.detectionRate || 0}%</h2>
                <div className="text-danger small">
                  <i className="bi bi-shield-exclamation"></i> AI Content
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          {/* Detection Distribution */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <h6 className="text-primary mb-3 fw-bold">
                  <i className="bi bi-pie-chart me-2"></i>
                  Detection Distribution
                </h6>
                <div className="text-center">
                  <div className="d-flex justify-content-around mb-3">
                    <div>
                      <Badge bg="success" className="p-2 px-3">
                        <i className="bi bi-check-circle me-1"></i>
                        Real: {stats?.realReports || 0}
                      </Badge>
                    </div>
                    <div>
                      <Badge bg="danger" className="p-2 px-3">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        AI-Generated: {stats?.fakeReports || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="progress" style={{ height: '30px', borderRadius: '15px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ 
                        width: `${stats?.realReports && stats?.totalReports ? (stats.realReports / stats.totalReports * 100) : 50}%`,
                        borderRadius: stats.realReports === stats.totalReports ? '15px' : '15px 0 0 15px'
                      }}
                    >
                      {stats?.realReports && stats?.totalReports ? Math.round(stats.realReports / stats.totalReports * 100) : 50}%
                    </div>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ 
                        width: `${stats?.fakeReports && stats?.totalReports ? (stats.fakeReports / stats.totalReports * 100) : 50}%`,
                        borderRadius: stats.fakeReports === stats.totalReports ? '15px' : '0 15px 15px 0'
                      }}
                    >
                      {stats?.fakeReports && stats?.totalReports ? Math.round(stats.fakeReports / stats.totalReports * 100) : 50}%
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Recent Reports */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-primary fw-bold mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Recent Reports
                  </h6>
                  <Badge bg="primary" pill>{recentReports.length}</Badge>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {recentReports.length > 0 ? (
                    <Table striped bordered hover size="sm" className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Image</th>
                          <th>Result</th>
                          <th>Confidence</th>
                          <th>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReports.map(report => (
                          <tr key={report.id}>
                            <td className="text-truncate" style={{ maxWidth: '120px' }} title={report.filename}>
                              {report.filename || 'Unknown'}
                            </td>
                            <td>
                              <Badge bg={report.decision === 'fake' ? 'danger' : 'success'}>
                                {report.decision}
                              </Badge>
                            </td>
                            <td>
                              {report.confidence ? `${(report.confidence * 100).toFixed(1)}%` : 'N/A'}
                            </td>
                            <td>
                              {report.imageUrl && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openImageModal(report.imageUrl)}
                                >
                                  <i className="bi bi-eye"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-inbox display-4 d-block mb-2"></i>
                      No reports found
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* System Information */}
        <Row>
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h6 className="text-primary mb-3 fw-bold">
                  <i className="bi bi-info-circle me-2"></i>
                  System Information
                </h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Admin User:</strong> {user.email}
                    </div>
                    <div className="mb-2">
                      <strong>User ID:</strong> 
                      <span className="text-muted small ms-1">{user.uid}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Total Reports:</strong> {stats?.totalReports || 0}
                    </div>
                    <div className="mb-2">
                      <strong>Server Status:</strong> <Badge bg="success">Online</Badge>
                    </div>
                    <div className="mb-2">
                      <strong>Backend:</strong> <Badge bg={BACKEND_URL ? 'success' : 'danger'}>
                        {BACKEND_URL ? 'Connected' : 'Offline'}
                      </Badge>
                    </div>
                  </Col>
                </Row>
                <div className="text-center mt-3">
                  <Button variant="primary" onClick={fetchAdminData}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Data
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={closeImageModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reported Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image 
            src={selectedImage} 
            fluid 
            style={{ maxHeight: '60vh', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" />
    </>
  );
};

export default AdminDashboard;