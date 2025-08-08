// src/components/Dashboard.js

import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Container, Button, Form, Card, Spinner, Image } from 'react-bootstrap';
import History from './History';
import '../App.css'; // Your custom neon styles

const Dashboard = ({ user }) => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null);
  };

  // Upload image and get prediction
  const handleUpload = async () => {
    if (!image) return alert("Please select an image");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);
    if (user) formData.append('userId', user.uid); // Send userId for history

    try {
      const res = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Failed to analyze image.");
      console.error("❌ Upload Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 text-light d-flex flex-column align-items-center">
      <Card className="custom-card p-4">
        <h2 className="text-glow text-center mb-2">DeepFakeShield</h2>
        <p className="text-center text-muted">AI-Generated Image Detection & Harm Prevention</p>

        <Form.Group controlId="formFile" className="mb-3 mt-4">
          <Form.Control type="file" onChange={handleImageChange} />
        </Form.Group>

        <Button
          variant="primary"
          className="mb-3 scan-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Scan Image'}
        </Button>

        {/* Show selected image preview */}
        {image && (
          <div className="mb-3 text-center">
            <Image
              src={URL.createObjectURL(image)}
              alt="preview"
              fluid
              style={{ maxHeight: '300px', borderRadius: '8px' }}
            />
          </div>
        )}

        {/* Show prediction result */}
        {result && (
          <div className="mt-4 text-center">
            <h5 className="fw-bold text-light">Scan Result:</h5>
            <p className="mb-1">
              <span className="fw-bold" style={{ color: '#ff2d75' }}>
                Prediction:
              </span>{' '}
              <span style={{ color: '#ff2d75' }}>
                {result.label === 'fake' ? 'AI-generated' : 'Real Image'}
              </span>
            </p>
            <p className="mb-1">
              <span className="fw-bold text-info">Confidence:</span>{' '}
              <span className="text-light">
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        )}

        {/* Logout Button */}
        <div className="text-center mt-4">
          <Button variant="outline-info" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </div>
      </Card>

      {/* History Component */}
      <div className="mt-5 w-100">
        <History user={user} />
      </div>
    </Container>
  );
};

export default Dashboard;
