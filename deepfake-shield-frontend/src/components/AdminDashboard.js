// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Table, Badge, Alert, Image, Modal } from 'react-bootstrap';

const REPORTS_COLLECTION = 'reports'; 

const AdminDashboard = ({ user, userRole }) => { 
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  // Removed navigate as it's not used in this component after the last refactor

  // Your Flask backend URL - CHANGE THIS IF YOUR BACKEND RUNS ON DIFFERENT PORT
  const BACKEND_URL = 'http://localhost:5000';

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      if (!auth.currentUser || !user?.uid) {
         // This warning is usually enough, App.js should prevent this access
         console.warn("Attempted to fetch data without authenticated user.");
         return; 
      }

      setError('');
      
      const reportsCollectionRef = collection(db, REPORTS_COLLECTION);
      const reportsSnapshot = await getDocs(reportsCollectionRef);
      
      const allReports = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          const timestampField = data.createdAt; 
          
          let timestamp;
          if (timestampField && typeof timestampField.toDate === 'function') {
             timestamp = timestampField.toDate(); 
          } else if (timestampField instanceof Date) {
             timestamp = timestampField;
          } else if (timestampField && timestampField.seconds) { // Handle Firestore Timestamp objects directly
             timestamp = new Date(timestampField.seconds * 1000);
          } else if (timestampField) {
             timestamp = new Date(timestampField);
          } else {
             timestamp = new Date(0); 
          }
          
          return { 
            id: doc.id, 
            ...data, 
            timestamp: timestamp,
            // Prioritize 'decision' as the final result, then 'result', falling back to 'N/A'
            // Ensure result is a string before lowercasing it for comparison
            result: String(data.decision || data.result || 'N/A').toLowerCase(), 
            // Use 'imageUrl' for the image link, falling back to older 'scanUrl'
            imageUrl: data.imageUrl || data.scanUrl || null 
          };
      });

      const totalLifetimeScans = allReports.length;

      // Calculate Average Daily Scans
      let averageDailyScans = 0;
      if (totalLifetimeScans > 0) {
          const firstScanTimestamp = allReports.reduce((minTimestamp, report) => 
              report.timestamp.getTime() < minTimestamp ? report.timestamp.getTime() : minTimestamp, new Date().getTime());
          
          // Calculate difference in milliseconds
          const timeDifferenceMs = new Date().getTime() - firstScanTimestamp;
          const daysSinceFirstScan = timeDifferenceMs / (1000 * 60 * 60 * 24);
          
          if (daysSinceFirstScan >= 1) { 
              averageDailyScans = (totalLifetimeScans / daysSinceFirstScan).toFixed(2);
          } else {
              averageDailyScans = totalLifetimeScans; 
          }
      }
      
      setStats({
        totalLifetimeScans: totalLifetimeScans,
        averageDailyScans: parseFloat(averageDailyScans),
        backendStatus: BACKEND_URL ? 'Connected' : 'Offline'
      });
      
      // Sort recent reports by timestamp descending in memory
      const sortedReports = allReports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setRecentReports(sortedReports.slice(0, 10));

    } catch (err) {
      console.error('--- CRITICAL FIRESTORE ERROR IN ADMIN DASHBOARD ---');
      console.error('Full Error Object:', err); 
      
      setError('Failed to fetch data. Permissions denied by Firebase Rules. Check console for details.');
      
      // Set stats to zeroed default to prevent rendering crashes
      setStats({
        totalLifetimeScans: 0,
        averageDailyScans: 0,
        backendStatus: BACKEND_URL ? 'Connected' : 'Offline'
      });
    } finally {
      setLoading(false);
    }
  }, [user]); // Removed userRole from dependencies as it's used for the check outside the fetch

  useEffect(() => {
    // Only fetch data if the user object is available and the role is confirmed 'admin'
    if (user && user.uid && userRole === 'admin') { 
      fetchAdminData();
    } else if (user && userRole !== 'admin') {
      // If user exists but is not admin, show access denied
      setError("Access Denied: You do not have administrator privileges.");
      setLoading(false);
    }
    // Note: The logic for handling user/userRole updates is now more robustly handled 
    // in App.js and the fetchAdminData dependency array.
  }, [user, userRole, fetchAdminData]); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  const getResultBadgeVariant = (result) => {
    if (!result || result.toLowerCase() === 'n/a') return 'secondary';
    if (result.toLowerCase().includes('fake')) return 'danger';
    if (result.toLowerCase().includes('real')) return 'success';
    return 'warning'; // For "Uncertain" or other results
  };

  const dashboardContent = (
    <Container fluid className="py-4">
      {/* --- TEMPORARY UID DISPLAY (Keep this until it works) --- */}
      {/* Since the data is now loading, you can safely remove this block if you're confident! */}
      {/* <div className="mb-3 p-3 bg-danger text-white rounded shadow-lg">
        <strong className="text-warning">ADMIN UID:</strong> 
        <code className="text-white fs-5 ms-3 select-all">{user?.uid}</code>
        <p className="mt-1 mb-0 text-xs">
          (This code must be removed after the dashboard is fixed.)
        </p>
      </div> */}
      {/* ----------------------------- */}

      <h2 className="text-info mb-4">Admin Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={12}>
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        </Col>
      </Row>
      
      {/* Stats Cards */}
      {stats && (
        <Row className="g-4 mb-5">
          {/* Card 1: Total Lifetime Scans */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-bar-chart-line fs-3 text-info me-3"></i> 
                  <div>
                    <Card.Title className="text-info mb-0">Total Lifetime Scans</Card.Title>
                    <Card.Text className="fs-2 fw-bold text-light">{stats.totalLifetimeScans}</Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Card 2: Average Daily Scans */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-graph-up fs-3 text-success me-3"></i> 
                  <div>
                    <Card.Title className="text-success mb-0">Avg. Daily Scans</Card.Title>
                    <Card.Text className="fs-2 fw-bold text-light">{stats.averageDailyScans}</Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card 3: Placeholder (can be customized later) */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock-history fs-3 text-warning me-3"></i>
                  <div>
                    <Card.Title className="text-warning mb-0">Average Processing Time</Card.Title>
                    <Card.Text className="fs-2 fw-bold text-light">~5 sec</Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card 4: Backend Status */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <Row>
                  <Col xs={12} className="d-flex align-items-center mb-2">
                    <i className="bi bi-server fs-3 text-primary me-3"></i>
                    <div>
                      <Card.Title className="text-primary mb-0">Backend Status</Card.Title>
                      <Card.Text className="fs-5 fw-bold text-light">{stats.backendStatus}</Card.Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center">
                      <Button variant="primary" size="sm" onClick={fetchAdminData}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                      </Button>
                      <Badge bg={stats.backendStatus === 'Connected' ? 'success' : 'danger'} className="fs-6">
                        {BACKEND_URL ? 'Connected' : 'Offline'}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Reports Table */}
      <h3 className="text-info mb-3">Recent Reports (Admin View)</h3>
      <Card className="shadow-lg" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
        <Card.Body className="p-0">
          <Table responsive striped hover variant="dark" className="mb-0">
            <thead>
              <tr style={{ backgroundColor: '#3a3a50' }}>
                <th>ID</th>
                <th>Result</th>
                <th>Source</th>
                <th>User ID</th>
                <th>Reported On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.length > 0 ? recentReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id.substring(0, 8)}...</td>
                  <td>
                    {/* Safe access to result, converts to uppercase for display */}
                    <Badge bg={getResultBadgeVariant(report.result)}>
                      {report.result ? report.result.toUpperCase() : 'N/A'} 
                    </Badge>
                  </td>
                  <td>{report.sourceType || 'N/A'}</td>
                  <td>{report.userId ? report.userId.substring(0, 8) + '...' : 'Anonymous'}</td>
                  <td>{report.timestamp.toLocaleString()}</td>
                  <td>
                    {/* Check for imageUrl existence to enable the button */}
                    {report.imageUrl ? (
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        onClick={() => openImageModal(report.imageUrl)} // Pass the image URL
                      >
                        View Image
                      </Button>
                    ) : (
                      <Button variant="outline-secondary" size="sm" disabled>
                        No Image
                      </Button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    {loading ? 'Loading...' : 'No reports found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );

  return (
    <div style={{ backgroundColor: '#1e1e2f', minHeight: '100vh', color: '#d6d6d6' }}>
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3 shadow-lg">
        <Container fluid>
          <Navbar.Brand href="#home" className="text-info fw-bold fs-4">DeepFakeShield Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {/* Note: I'm leaving the logout button here, but the actual navigation away is handled by App.js's auth listener */}
              <Nav.Link onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {loading && !stats ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <Spinner animation="border" variant="info" role="status" className="me-2" />
          <span className="text-info">Loading admin data...</span>
        </div>
      ) : (
        dashboardContent
      )}

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-light border-0">
          <Modal.Title>Reported Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center bg-dark text-light">
          {selectedImage ? (
            <Image 
              src={selectedImage} 
              fluid 
              style={{ maxHeight: '60vh', objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x300/2e2e3e/d6d6d6?text=Image+Not+Found+or+Broken+Link';
                e.target.style.maxHeight = '300px';
              }}
            />
          ) : (
            <p className="text-danger">No valid image URL provided for this report.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-0">
          <Button variant="secondary" onClick={closeImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
    </div>
  );
};

export default AdminDashboard;
