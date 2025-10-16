// src/components/AuthPage.js
import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import getDoc
import { Container, Form, Button, Card, Navbar, Nav, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Helper function to handle creating or updating the user document
  const handleUserDoc = async (user) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Document does NOT exist (new user or first social login), create it with default role.
      await setDoc(userDocRef, {
        email: user.email,
        role: 'user', // Default role for all new users
        createdAt: new Date(),
      });
      console.log("New user document created.");
    } 
    // If the document exists, we do nothing to preserve any custom role (like 'admin').
  };

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Ensure the user document exists and has a role set
      await handleUserDoc(userCredential.user);
      
      // Navigate is now handled by App.js's onAuthStateChanged listener
      // navigate('/dashboard'); 
    } catch (error) {
      console.error("Email/Password Auth Error:", error);
      setMessage(`Authentication failed: ${error.message.replace('Firebase:', '').trim()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // IMPORTANT: Handle user document creation or update securely
      await handleUserDoc(result.user);
      
      // Navigate is now handled by App.js's onAuthStateChanged listener
      // navigate('/dashboard'); 
    } catch (error) {
      console.error("Google Auth Error:", error);
      setMessage(`Google sign-in failed: ${error.message.replace('Firebase:', '').trim()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-3" style={{ borderBottom: '1px solid #444' }}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="text-info">
            DeepFakeShield
          </Navbar.Brand>
        </Container>
      </Navbar>
      
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ minHeight: '85vh', backgroundColor: '#1e1e2f' }}
      >
        <Card 
          style={{ width: '100%', maxWidth: '400px', backgroundColor: '#2e2e3e', border: 'none' }} 
          className="shadow-lg p-3"
        >
          <Card.Body>
            <h3 className="text-center mb-4" style={{ color: '#00bfa6' }}>
              {isLogin ? 'Welcome Back' : 'Join DeepFakeShield'}
            </h3>
            
            {message && <Alert variant="danger" className="text-center">{message}</Alert>}

            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ backgroundColor: '#1e1e2f', color: '#d6d6d6', borderColor: '#444' }}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicPassword">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ backgroundColor: '#1e1e2f', color: '#d6d6d6', borderColor: '#444' }}
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100 mb-3"
                style={{ backgroundColor: '#7f5af0', border: 'none' }}
                onClick={handleAuth}
                disabled={loading}
              >
                {loading && !message ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
              </Button>

              <div className="text-center mb-3">
                <span className="text-muted">OR</span>
              </div>
              
              <Button
                variant="outline-light"
                className="w-100 mb-2"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{ borderColor: '#444' }}
              >
                <i className="bi bi-google me-2"></i> Sign in with Google
              </Button>

              <div className="text-center mt-3">
                <span
                  style={{ cursor: 'pointer', color: '#00bfa6' }}
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage('');
                  }}
                >
                  {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </span>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-4">
        <Container>
          <p className="text-center text-muted mb-0">
            &copy; {new Date().getFullYear()} DeepFakeShield. All rights reserved.
          </p>
        </Container>
      </footer>
      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
    </>
  );
};

export default AuthPage;
