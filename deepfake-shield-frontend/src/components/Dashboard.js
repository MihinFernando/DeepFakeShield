// src/components/Dashboard.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Container, Button, Card, Spinner, Navbar, Nav, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import History from './History';
import DropzoneUpload from './DropzoneUpload';
import ReportModal from './ReportModal';
import '../App.css';

const Dashboard = ({ user }) => {
  const [image, setImage] = useState(null);      // File from uploader
  const [result, setResult] = useState(null);    // Scan result from backend
  const [loading, setLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false); // 👈 NEW
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!image) return alert('Please select an image');
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
      setHistoryRefresh((v) => v + 1);
    } catch (err) {
      alert('Failed to analyze image.');
      console.error('❌ Upload Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Watermark client-side (only when decision/label is "fake")
  const downloadWatermarked = async () => {
    if (!image) return;
    const buf = await image.arrayBuffer();
    const blob = new Blob([buf]);
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const text = 'AI GENERATED';
      const fontSize = Math.floor(Math.min(canvas.width, canvas.height) / 8);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 45, 117, 0.25)';
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = Math.max(6, Math.floor(fontSize / 12));

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.strokeText(text, 0, 0);

      const out = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = out;
      a.download = 'watermarked.png';
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // 👇 Updated to include "uncertain" + advanced details
  const renderResult = () => {
    if (!result) return null;

    const conf = Number(result.confidence ?? 0);
    const raw = (result.label || '').toLowerCase();
    const decision = (result.decision || raw || '').toLowerCase();
    const isFake = decision === 'fake';
    const isReal = decision === 'real';
    const isUncertain = decision === 'uncertain';

    if (isUncertain) {
      return (
        <div className="mt-4 text-center">
          <h5 className="fw-bold text-warning">Result: Uncertain</h5>
          <p className="text-light">
            We couldn’t reach a confident verdict. Please review manually or report.
          </p>
          <Button variant="outline-warning" onClick={() => setShowReport(true)}>
            Report this result
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-4 text-center">
        <h5 className="fw-bold text-light">Scan Result:</h5>

        <p className="mb-1">
          <span className="fw-bold" style={{ color: '#ff2d75' }}>Prediction:</span>{' '}
          <span style={{ color: '#ff2d75' }}>
            {isFake ? 'AI-generated' : 'Real Image'}
          </span>
        </p>

        <p className="mb-3">
          <span className="fw-bold text-info">Confidence:</span>{' '}
          <span className="text-light">{(conf * 100).toFixed(2)}%</span>
        </p>

        <div className="d-flex justify-content-center gap-2">
          {isFake && (
            <Button variant="outline-danger" onClick={downloadWatermarked}>
              Download Watermarked Image
            </Button>
          )}
          <Button variant="outline-warning" onClick={() => setShowReport(true)}>
            Report this result
          </Button>
          <Button
            variant="outline-info"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-controls="advanced-collapse"
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Details
          </Button>
        </div>

        <Collapse in={showAdvanced}>
          <div id="advanced-collapse" className="mt-3">
            <Card className="bg-dark text-light p-3">
              <h6 className="text-info">Advanced Signals</h6>
              <ul className="list-unstyled small text-start">
                <li>ELA Score: {result.signals?.ela?.toFixed?.(2) ?? '—'}</li>
                <li>TTA Std Dev: {result.signals?.tta_std?.toFixed?.(4) ?? '—'}</li>
                <li>Laplacian Var: {result.signals?.laplacian_var?.toFixed?.(0) ?? '—'}</li>
                <li>EXIF Present: {result.signals?.exif_has ? 'Yes' : 'No'}</li>
                <li>EXIF Software: {result.signals?.exif_software ?? '—'}</li>
                <li>API Second Opinion: {result.signals?.api_p_fake != null ? (result.signals.api_p_fake * 100).toFixed(1) + '%' : '—'}</li>
              </ul>
            </Card>
          </div>
        </Collapse>
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
            <Button 
              variant="outline-light" 
              className="me-2"
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button variant="outline-info" onClick={() => signOut(auth)}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="py-5 text-light d-flex flex-column align-items-center">
        <Card className="custom-card p-4">
          <h2 className="text-glow text-center mb-2">DeepFakeShield</h2>
          <p className="text-center text-glow">AI-Generated Image Detection & Harm Prevention</p>

          {/* Modern drag-and-drop uploader */}
          <DropzoneUpload
            file={image}
            onFileSelected={(f) => { setImage(f); setResult(null); }}
            disabled={loading}
          />

          <Button
            variant="primary"
            className="mt-3 scan-btn"
            onClick={handleUpload}
            disabled={loading || !image}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Scan Image'}
          </Button>

          {renderResult()}

          <div className="text-center mt-4">
            <Button variant="outline-info" onClick={() => signOut(auth)}>
              Logout
            </Button>
          </div>
        </Card>

        <div className="mt-5 w-100">
          <History user={user} refreshKey={historyRefresh} />
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
                <li><a href="#faq" className="text-light-muted">FAQ</a></li>
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

      {/* Report Modal instance */}
      <ReportModal
        show={showReport}
        onClose={() => setShowReport(false)}
        file={image}
        user={user}
        lastScan={{ ...result, filename: image?.name }}
      />
    </>
  );
};

export default Dashboard;
