// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Navbar, Nav } from 'react-bootstrap';
import DropzoneUpload from './DropzoneUpload';
import '../App.css';

const HomePage = ({ user }) => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scansLeft, setScansLeft] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    // Get remaining scans from localStorage
    const remainingScans = localStorage.getItem('anonymousScans');
    if (remainingScans) {
      setScansLeft(parseInt(remainingScans));
    } else {
      localStorage.setItem('anonymousScans', '3');
      setScansLeft(3);
    }
  }, []);

  const handleUpload = async () => {
    if (!image) return alert('Please select an image');
    if (scansLeft <= 0 && !user) {
      alert('You have used all your free scans. Please sign up to continue.');
      navigate('/auth');
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);
    if (user) formData.append('userId', user.uid);

    try {
      const res = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      
      const data = await res.json();
      setResult(data);
      
      // Decrement scan count for anonymous users
      if (!user) {
        const newScansLeft = scansLeft - 1;
        setScansLeft(newScansLeft);
        localStorage.setItem('anonymousScans', newScansLeft.toString());
      }
    } catch (err) {
      alert('Failed to analyze image.');
      console.error('❌ Upload Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const conf = Number(result.confidence ?? 0);
    const raw = (result.label || '').toLowerCase();
    const decision = (result.decision || raw || '').toLowerCase();
    const isFake = decision === 'fake';
    const confidencePercent = Math.round(conf * 100);

    return (
      <div className="mt-4 text-center">
        <h5 className="fw-bold text-light">Scan Result:</h5>
        <div className="result-card p-3 mt-3">
          <p className="mb-1">
            <span className="fw-bold" style={{ color: '#ff2d75' }}>Prediction:</span>{' '}
            <span style={{ color: isFake ? '#ff2d75' : '#2ecc71' }}>
              {isFake ? 'AI-generated' : 'Real Image'}
            </span>
          </p>

          <p className="mb-1">
            <span className="fw-bold text-info">Confidence:</span>{' '}
            <span className="text-light">{confidencePercent}%</span>
          </p>

          <div className="confidence-meter mt-3">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${confidencePercent}%`,
                backgroundColor: isFake ? '#ff2d75' : '#2ecc71'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand href="#home" className="text-glow">
          DeepFakeShield
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {user ? (
              <Button variant="outline-info" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <Button variant="outline-light" onClick={() => navigate('/auth')}>
                Login / Sign Up
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Main Content */}
      <Container className="py-5 text-light d-flex flex-column align-items-center">
        <Card className="custom-card p-4">
          <h2 className="text-glow text-center mb-2">DeepFakeShield</h2>
          <p className="text-center text-glow">AI-Generated Image Detection & Harm Prevention</p>
          
          {!user && (
            <div className="scans-counter text-center mb-3">
              <span className="badge bg-info">
                {scansLeft} Free Scan{scansLeft !== 1 ? 's' : ''} Left
              </span>
              <p className="small text-light mt-1">
                Sign up for unlimited scans and history tracking
              </p>
            </div>
          )}

          {/* Drag-and-drop uploader */}
          <DropzoneUpload
            file={image}
            onFileSelected={(f) => { setImage(f); setResult(null); }}
            disabled={loading || (!user && scansLeft <= 0)}
          />

          <Button
            variant="primary"
            className="mt-3 scan-btn"
            onClick={handleUpload}
            disabled={loading || !image || (!user && scansLeft <= 0)}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Scanning...
              </>
            ) : (
              'Scan Image'
            )}
          </Button>

          {renderResult()}
        </Card>

        {/* Features Section */}
        <div className="row mt-5 w-100">
          <div className="col-md-4 mb-4">
            <div className="feature-card text-center p-4">
              <div className="feature-icon mb-3">🔍</div>
              <h5>Advanced Detection</h5>
              <p className="text-light">Uses cutting-edge AI models to detect AI-generated images with high accuracy.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-card text-center p-4">
              <div className="feature-icon mb-3">📊</div>
              <h5>Detailed Analysis</h5>
              <p className="text-light">Get confidence scores and detailed insights about your image authenticity.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-card text-center p-4">
              <div className="feature-icon mb-3">💾</div>
              <h5>History Tracking</h5>
              <p className="text-light">Save your scan history and track detection trends over time (requires account).</p>
            </div>
          </div>
        </div>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <Container>
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5>DeepFakeShield</h5>
              <p className="text-light-muted">Protecting digital authenticity with advanced AI detection.</p>
            </div>
            <div className="col-md-2 mb-3">
              <h6>Resources</h6>
              <ul className="list-unstyled">
                <li><Link to="/faq" className="text-light-muted">FAQ</Link></li>
                <li><a href="#blog" className="text-light-muted">Blog</a></li>
                <li><a href="#tutorials" className="text-light-muted">Tutorials</a></li>
              </ul>
            </div>
            <div className="col-md-2 mb-3">
              <h6>Company</h6>
              <ul className="list-unstyled">
                <li><a href="#about" className="text-light-muted">About Us</a></li>
                <li><a href="#contact" className="text-light-muted">Contact</a></li>
                <li><a href="#privacy" className="text-light-muted">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h6>Subscribe to Our Newsletter</h6>
              <div className="d-flex gap-2">
                <input 
                  type="email" 
                  className="form-control form-control-sm" 
                  placeholder="Your email" 
                />
                <button className="btn btn-sm btn-outline-light">Subscribe</button>
              </div>
            </div>
          </div>
          <hr className="my-4" />
          <p className="text-center text-light-muted mb-0">
            &copy; {new Date().getFullYear()} DeepFakeShield. All rights reserved.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default HomePage;