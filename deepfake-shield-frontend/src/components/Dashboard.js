import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Container, Button, Form, Card, Spinner, Image } from 'react-bootstrap';

const Dashboard = ({ user }) => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null); // Reset previous result
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image); // Must match backend key

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
    <Container className="py-5 text-light">
      <Card style={{ backgroundColor: '#2e2e3e', border: 'none' }} className="p-4">
        <h3 className="mb-4 text-center">
          Welcome, {user.displayName || user.email}
        </h3>

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Select an image to analyze</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} />
        </Form.Group>

        <Button
          variant="success"
          className="mb-3"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Analyze Image"}
        </Button>

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

        {result && (
          <div className="mt-4 text-center">
            <h5>Detection Result:</h5>
          <p>{result.label === 'fake' ? '🧠 AI-Generated' : '📷 Real Image'}</p>

<p>Confidence: <strong>{(result.confidence * 100).toFixed(2)}%</strong></p>

          </div>
        )}

        <div className="text-center mt-4">
          <Button variant="outline-light" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default Dashboard;
