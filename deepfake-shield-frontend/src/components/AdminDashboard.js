// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, collectionGroup } from 'firebase/firestore'; 
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Table, Badge, Alert, Image, Modal } from 'react-bootstrap';

const SCAN_HISTORY_COLLECTION = 'scans'; 
const REPORTS_COLLECTION = 'reports';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  const fetchAdminData = useCallback(async () => {
    setLoading(true); 
    try {
      setError('');
      
      // =======================================================================
      // STEP 1: Collection Group Query for Total Scans
      // =======================================================================
      const scansSnapshot = await getDocs(query(collectionGroup(db, SCAN_HISTORY_COLLECTION)));
      const totalScans = scansSnapshot.size;
      
      // STEP 2: Get total reports count
      const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
      const totalReports = reportsSnapshot.size;
      
      // Get today's reports
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      let todayReports = 0;
      
      reportsSnapshot.docs.forEach(doc => {
        const reportData = doc.data();
        if (reportData.createdAt) {
          const createdAtDate = new Date(reportData.createdAt);
          if (createdAtDate >= today) {
            todayReports++;
          }
        }
      });

      // Set stats 
      setStats({
        totalScans: totalScans, 
        totalReports: totalReports, 
        todayReports: todayReports,
      });

      // FIX: Get recent reports with proper ordering by createdAt
      const recentReportsQuery = query(
        collection(db, REPORTS_COLLECTION), 
        orderBy('createdAt', 'desc'), // Add this line to order by creation date
        limit(10)
      );
      const recentReportsSnapshot = await getDocs(recentReportsQuery);
      
      // FIX: Map the data properly without reversing
      const recentReportsData = recentReportsSnapshot.docs.map(reportDoc => ({ 
        id: reportDoc.id,
        ...reportDoc.data(),
        // Format timestamp for display
        createdAt: reportDoc.data().createdAt ? new Date(reportDoc.data().createdAt).toLocaleString() : 'N/A'
      }));

      // FIX: Remove the reverse() - they're already ordered by createdAt desc
      setRecentReports(recentReportsData);

    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(`Failed to fetch administrative data: ${err.message}. Please check your Firebase Security Rules and Collection Group Index for '${SCAN_HISTORY_COLLECTION}'.`);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]); 

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImage('');
    setShowImageModal(false);
  };
  
  const dashboardContent = (
    <Container className="my-5">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {/* Stats Card Row */}
      <Row className="g-4 mb-5">
        
        {/* Total Scans Card */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-primary mb-1">Total Scans</Card.Title>
              <Card.Text className="fs-3 fw-bold">{stats?.totalScans?.toLocaleString() || '...'}</Card.Text>
              <small className="text-muted">Total number of scans performed by all users.</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Reports Card */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-success mb-1">Total Reports</Card.Title>
              <Card.Text className="fs-3 fw-bold">{stats?.totalReports?.toLocaleString() || '...'}</Card.Text>
              <small className="text-muted">Total number of manual reports submitted.</small>
            </Card.Body>
          </Card>
        </Col>
        
        {/* System Status Card */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-info mb-3">System Status</Card.Title>
              <Row>
                <Col xs={6}>
                  <div className="fw-bold">Database:</div>
                </Col>
                <Col xs={6} className="text-end">
                  <Badge bg="success">Connected</Badge>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col xs={6}>
                  <div className="fw-bold">Backend:</div>
                </Col>
                <Col xs={6} className="text-end">
                  <Badge bg={BACKEND_URL ? 'success' : 'danger'}>
                    {BACKEND_URL ? 'Connected' : 'Offline'}
                  </Badge>
                </Col>
              </Row>
              <div className="text-center mt-3">
                <Button variant="primary" size="sm" onClick={fetchAdminData}>
                  Refresh Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Reports Table */}
        <Col xs={12}>
          <Card className="shadow-lg h-100 border-0">
            <Card.Header className="text-primary fw-bold">Recent User Reports</Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table striped bordered hover className="mb-0"> 
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Filename</th>
                      <th>Decision</th>
                      <th>Confidence</th>
                      <th>Status</th>
                      <th>Submitted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.length > 0 ? (
                      recentReports.map(report => (
                        <tr key={report.id}>
                          <td><small>{report.id.substring(0, 8)}...</small></td>
                          <td>{report.filename || 'N/A'}</td>
                          <td>
                            <Badge bg={report.decision === 'fake' ? 'danger' : 'success'}>
                              {report.decision || 'N/A'}
                            </Badge>
                          </td>
                          <td>{(report.confidence * 100)?.toFixed(1) + '%' || 'N/A'}</td>
                          <td>
                            <Badge bg={report.status?.toLowerCase() === 'open' ? 'warning' : 'success'}>
                              {report.status || 'Unknown'}
                            </Badge>
                          </td>
                          <td>{report.createdAt}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              {report.imageUrl && (
                                <Button 
                                  variant="outline-info" 
                                  size="sm" 
                                  onClick={() => openImageModal(report.imageUrl)}
                                >
                                  View Image
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">No recent reports found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      
      {/* Navigation Bar */}
      <Navbar bg="light" variant="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-dark">DeepFakeShield Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={handleSignOut} className="text-danger">
                Sign Out
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {loading && !stats ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <Spinner animation="border" variant="primary" role="status" className="me-2" />
          <span>Loading admin data...</span>
        </div>
      ) : (
        dashboardContent
      )}

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Reported Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image 
            src={selectedImage} 
            fluid 
            style={{ maxHeight: '60vh', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x300/e9ecef/212529?text=Image+Not+Found';
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer className="bg-light text-muted py-3 mt-5 border-top">
        <Container>
          <p className="text-center text-muted mb-0">
            &copy; {new Date().getFullYear()} DeepFakeShield. Admin Portal.
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default AdminDashboard;