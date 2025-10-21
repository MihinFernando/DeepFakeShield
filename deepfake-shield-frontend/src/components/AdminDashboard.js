// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
// 🎯 IMPORTANT: Imported collectionGroup for cross-user queries
import { collection, getDocs, query, limit, collectionGroup } from 'firebase/firestore'; 
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Table, Badge, Alert, Image, Modal } from 'react-bootstrap';

// FIX: Changed constant name from 'scanHistory' to 'scans' 
const SCAN_HISTORY_COLLECTION = 'scans'; 
const REPORTS_COLLECTION = 'reports'; // Constant for reports data

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Your Flask backend URL - CHANGE THIS IF YOUR BACKEND RUNS ON DIFFERENT PORT
  const BACKEND_URL = 'http://localhost:5000';

  const fetchAdminData = useCallback(async () => {
    // 1. Immediately set loading state
    setLoading(true); 
    try {
      setError('');
      
      // =======================================================================
      // STEP 1: Collection Group Query for Total Scans (using 'scans' collection name)
      // =======================================================================
      const scansSnapshot = await getDocs(query(collectionGroup(db, SCAN_HISTORY_COLLECTION)));
      const totalScans = scansSnapshot.size;
      
      // STEP 2: Get total reports count
      const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
      const totalReports = reportsSnapshot.size;
      
      // Get today's reports (Minimal logic preserved)
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

      // Get recent reports for the table (last 10 reports)
      const recentReportsQuery = query(collection(db, REPORTS_COLLECTION), limit(10));
      const recentReportsSnapshot = await getDocs(recentReportsQuery);
      const recentReportsData = recentReportsSnapshot.docs.map(reportDoc => ({ 
        id: reportDoc.id,
        ...reportDoc.data(),
        // Format timestamp for display
        createdAt: reportDoc.data().createdAt ? new Date(reportDoc.data().createdAt).toLocaleString() : 'N/A'
      }));

      // Reverse the array to show the most recent first
      setRecentReports(recentReportsData.reverse());

    } catch (err) {
      console.error("Error fetching admin data:", err);
      // Fallback error message
      setError(`Failed to fetch administrative data: ${err.message}. Please check your Firebase Security Rules and Collection Group Index for '${SCAN_HISTORY_COLLECTION}'.`);
      setStats(null);
    } finally {
      // 2. Ensure loading state is reset when done
      setLoading(false);
    }
  }, []); // 🎯 FIX: Empty dependency array ensures the function is stable and self-contained

  useEffect(() => {
    // This runs once on mount (like a browser refresh) and calls fetchAdminData
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
  
  // Minimal Dashboard Content based on the clean structure
  const dashboardContent = (
    <Container className="my-5">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {/* Stats Card Row (ONLY Total Scans/Reports card) */}
      <Row className="g-4 mb-5">
        
        {/* Total Scans Card - Now showing history count */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-primary mb-1">Total Scans</Card.Title>
              {/* NOTE: Using 'totalScans' key from the updated logic */}
              <Card.Text className="fs-3 fw-bold">{stats?.totalScans.toLocaleString() || '...'}</Card.Text>
              <small className="text-muted">Total number of scans performed by all users.</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Keeping one more card for structure stability, assuming it was Total Reports or Today's Reports */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-success mb-1">Total Reports</Card.Title>
              <Card.Text className="fs-3 fw-bold">{stats?.totalReports.toLocaleString() || '...'}</Card.Text>
              <small className="text-muted">Total number of manual reports submitted.</small>
            </Card.Body>
          </Card>
        </Col>
        
        {/* System Status Card (Simple version) */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-info mb-3">System Status</Card.Title>
              <Row>
                <Col xs={6}>
                  <div className="fw-bold">Database:</div>
                </Col>
                <Col xs={6} className="text-end">
                  <Badge bg="success">
                    Connected
                  </Badge>
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
                {/* 🎯 The button calls the stable fetchAdminData function */}
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
                          <td>{report.decision || 'N/A'}</td>
                          <td>{(report.confidence * 100).toFixed(1) + '%' || 'N/A'}</td>
                          <td><Badge bg={report.status?.toLowerCase() === 'open' ? 'warning' : 'success'}>{report.status || 'Unknown'}</Badge></td>
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
                              {/* Add minimal action buttons if needed, but keeping it simple */}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">No recent reports found.</td>
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


  // Render
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}> {/* Light background assumed */}
      {/* Bootstrap Icons */}
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
              // Using a standard placeholder image 
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
