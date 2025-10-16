// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
// Removed 'orderBy' as it was unused
import { collection, getDocs, query, limit } from 'firebase/firestore'; 
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Table, Badge, Alert, Image, Modal } from 'react-bootstrap';
// Removed unused 'useNavigate' import

const REPORTS_COLLECTION = 'reports'; 

const AdminDashboard = ({ user, userRole }) => { 
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  // Removed 'const navigate = useNavigate();' as it was unused

  // Your Flask backend URL - CHANGE THIS IF YOUR BACKEND RUNS ON DIFFERENT PORT
  const BACKEND_URL = 'http://localhost:5000';

  // Wrapping fetchAdminData in useCallback to fix the useEffect dependency warning
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // ⚠️ IMPORTANT: Perform a quick check to see if the user is available and logged in
      if (!auth.currentUser || !user?.uid) {
         throw new Error("User not authenticated or UID missing when fetchAdminData ran.");
      }

      setError('');
      
      // Get total reports count 
      const reportsCollectionRef = collection(db, REPORTS_COLLECTION);
      const reportsSnapshot = await getDocs(reportsCollectionRef);
      const totalReports = reportsSnapshot.size;
      
      // Get recent reports (limit to 10) - The query variable is still needed
      const q = query(reportsCollectionRef, limit(10));
      // Removed 'const recentReportsSnapshot = ...' as it was unused. The call is still needed 
      // here to ensure the rules allow it, but the data processing uses 'reportsSnapshot'.
      await getDocs(q); 
      
      // --- Processing Logic remains the same ---
      let todayReports = 0;
      let totalFakeReports = 0;
      let totalRealReports = 0;
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const allReports = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          const timestampField = data.createdAt; 
          
          let timestamp;
          if (timestampField && typeof timestampField.toDate === 'function') {
             timestamp = timestampField.toDate(); 
          } else if (timestampField instanceof Date) {
             timestamp = timestampField;
          } else if (timestampField) {
             timestamp = new Date(timestampField);
          } else {
             timestamp = new Date(0); 
          }
          
          if (timestamp >= todayStart) {
              todayReports++;
          }
          if (data.result === 'FAKE') {
              totalFakeReports++;
          } else if (data.result === 'REAL') {
              totalRealReports++;
          }
          
          return { id: doc.id, ...data, timestamp: timestamp };
      });
      
      setStats({
        totalReports: totalReports,
        todayReports: todayReports,
        totalFakeReports: totalFakeReports,
        totalRealReports: totalRealReports,
        backendStatus: BACKEND_URL ? 'Connected' : 'Offline'
      });
      
      // Sort recent reports by timestamp descending in memory
      const sortedReports = allReports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Take the top 10 recent reports for display
      setRecentReports(sortedReports.slice(0, 10));

    } catch (err) {
      console.error('--- CRITICAL FIRESTORE ERROR IN ADMIN DASHBOARD ---');
      console.error('Check your Firebase Security Rules! The rule is denying the request to read from a collection.');
      console.error('Full Error Object:', err); 
      
      setError('Failed to fetch data. Permissions denied by Firebase Rules. Check console for details.');
      
      setStats({
        totalReports: 0,
        todayReports: 0,
        totalFakeReports: 0,
        totalRealReports: 0,
        backendStatus: BACKEND_URL ? 'Connected' : 'Offline'
      });
    } finally {
      setLoading(false);
    }
  }, [user, userRole]); // Dependencies for useCallback

  useEffect(() => {
    // CRITICAL FIX: Ensures fetchAdminData only runs when the role is confirmed 'admin'
    if (user && user.uid && userRole === 'admin') { 
      fetchAdminData();
    } else if (user && userRole !== 'admin') {
      console.warn("Attempted to load Admin Dashboard with non-admin role:", userRole);
      setError("Access Denied: You do not have administrator privileges.");
      setLoading(false);
    }
  }, [user, userRole, fetchAdminData]); // fetchAdminData included now that it's memoized

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  const dashboardContent = (
    <Container fluid className="py-4">
      <h2 className="text-info mb-4">Admin Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={12}>
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        </Col>
      </Row>
      
      {/* Stats Cards */}
      {stats && (
        <Row className="g-4 mb-5">
          {/* Card 1: Total Reports */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-bar-graph fs-3 text-info me-3"></i>
                  <div>
                    <Card.Title className="text-info mb-0">Total Reports</Card.Title>
                    <Card.Text className="fs-2 fw-bold text-light">{stats.totalReports}</Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Card 2: Reports Today */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-calendar-check fs-3 text-success me-3"></i>
                  <div>
                    <Card.Title className="text-success mb-0">Reports Today</Card.Title>
                    <Card.Text className="fs-2 fw-bold text-light">{stats.todayReports}</Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card 3: Fake Reports */}
          <Col lg={3} md={6}>
            <Card className="shadow-lg h-100" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <i className="bi bi-x-octagon-fill fs-3 text-warning me-3"></i>
                  <div>
                    <Card.Title className="text-warning mb-0">Fake Reports</Card.Title>
                    <Card.Text className="fs-2 fw-bold text-light">{stats.totalFakeReports}</Card.Text>
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
                    <Badge bg={report.result === 'FAKE' ? 'danger' : 'success'}>
                      {report.result}
                    </Badge>
                  </td>
                  <td>{report.sourceType || 'N/A'}</td>
                  <td>{report.userId ? report.userId.substring(0, 8) + '...' : 'Anonymous'}</td>
                  <td>{report.timestamp.toLocaleString()}</td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => openImageModal(report.scanUrl)}
                      disabled={!report.scanUrl}
                    >
                      View Image
                    </Button>
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
          <Image 
            src={selectedImage} 
            fluid 
            style={{ maxHeight: '60vh', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x300/2e2e3e/d6d6d6?text=Image+Not+Found';
            }}
          />
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
