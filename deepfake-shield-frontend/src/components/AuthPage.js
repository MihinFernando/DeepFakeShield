// src/components/AuthPage.js
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Container, Form, Button, Card, Navbar, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand href="#home" className="text-glow">
          <img
            src="/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="DeepFakeShield Logo"
          />
          DeepFakeShield
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Link to="/" className="btn btn-outline-light me-2">
              Home
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div style={{ minHeight: '80vh', backgroundColor: '#1e1e2f' }} className="d-flex justify-content-center align-items-center text-light">
        <Card style={{ width: '100%', maxWidth: '400px', backgroundColor: '#2e2e3e', border: 'none' }}>
          <Card.Body>
            <h3 className="text-center mb-4" style={{ color: '#d6d6d6' }}>
              {isLogin ? 'Login to DeepFakeShield' : 'Create an Account'}
            </h3>
            <Form>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label style={{ color: '#d6d6d6' }}>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ backgroundColor: '#1e1e2f', color: '#d6d6d6', borderColor: '#444' }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label style={{ color: '#d6d6d6' }}>Password</Form.Label>
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
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>

              <Button
                variant="outline-light"
                className="w-100 mb-2"
                onClick={handleGoogleLogin}
              >
                Sign in with Google
              </Button>

              <div className="text-center mt-3">
                <span
                  style={{ cursor: 'pointer', color: '#00bfa6' }}
                  onClick={() => setIsLogin(!isLogin)}
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
    </>
  );
};

export default AuthPage;