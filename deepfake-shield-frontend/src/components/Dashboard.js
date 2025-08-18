// src/components/Dashboard.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Container, Button, Card, Spinner } from 'react-bootstrap';
import History from './History';
import DropzoneUpload from './DropzoneUpload';
import '../App.css';

const Dashboard = ({ user }) => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0); // 👈 NEW

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
      setHistoryRefresh((v) => v + 1); // 👈 tell History to refetch
    } catch (err) {
      alert('Failed to analyze image.');
      console.error('❌ Upload Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Watermark client-side (shown only when decision/label is "fake")
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

  const renderResult = () => {
    if (!result) return null;

    const conf = Number(result.confidence ?? 0); // 0..1
    const raw = (result.label || '').toLowerCase(); // 'fake' | 'real'
    const decision = (result.decision || raw || '').toLowerCase();
    const isFake = decision === 'fake';

    return (
      <div className="mt-4 text-center">
        <h5 className="fw-bold text-light">Scan Result:</h5>

        <p className="mb-1">
          <span className="fw-bold" style={{ color: '#ff2d75' }}>Prediction:</span>{' '}
          <span style={{ color: '#ff2d75' }}>
            {isFake ? 'AI-generated' : 'Real Image'}
          </span>
        </p>

        <p className="mb-1">
          <span className="fw-bold text-info">Confidence:</span>{' '}
          <span className="text-light">{(conf * 100).toFixed(2)}%</span>
        </p>

        {isFake && (
          <div className="mt-3">
            <Button variant="outline-danger" onClick={downloadWatermarked}>
              Download Watermarked Image
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Container className="py-5 text-light d-flex flex-column align-items-center">
      <Card className="custom-card p-4">
        <h2 className="text-glow text-center mb-2">DeepFakeShield</h2>
        <p className="text-center text-muted">AI-Generated Image Detection & Harm Prevention</p>

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
        <History user={user} refreshKey={historyRefresh} /> {/* 👈 pass refreshKey */}
      </div>
    </Container>
  );
};

export default Dashboard;
