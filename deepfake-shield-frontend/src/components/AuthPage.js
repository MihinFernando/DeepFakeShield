// src/components/AuthPage.js
import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Container, Form, Button, Card, Navbar, Nav, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
      await setDoc(userDocRef, {
        email: user.email,
        role: 'user',
        createdAt: new Date(),
      });
      console.log("New user document created.");
    }
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
      
      await handleUserDoc(userCredential.user);
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
      await handleUserDoc(result.user);
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
          <Navbar.Brand as={Link} to="/" className="text-info fw-bold fs-3">
            DeepFakeShield
          </Navbar.Brand>
        </Container>
      </Navbar>
      
      <div 
        className="d-flex justify-content-center align-items-center position-relative overflow-hidden" 
        style={{ 
          minHeight: '85vh', 
          backgroundColor: '#1e1e2f',
          background: 'linear-gradient(135deg, #1e1e2f 0%, #2d2b42 100%)'
        }}
      >
        {/* Animated Background Elements */}
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
          <div className="position-absolute" style={{ top: '20%', left: '10%', width: '100px', height: '100px', background: 'radial-gradient(circle, #00bfa6 0%, transparent 70%)' }}></div>
          <div className="position-absolute" style={{ top: '60%', right: '15%', width: '150px', height: '150px', background: 'radial-gradient(circle, #7f5af0 0%, transparent 70%)' }}></div>
          <div className="position-absolute" style={{ bottom: '20%', left: '20%', width: '80px', height: '80px', background: 'radial-gradient(circle, #00bfa6 0%, transparent 70%)' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <Card 
            style={{ 
              backgroundColor: 'rgba(46, 46, 62, 0.95)', 
              border: 'none',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }} 
            className="shadow-lg p-4 position-relative overflow-hidden"
          >
            {/* Card Background Effect */}
            <div 
              className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
              style={{
                background: 'linear-gradient(45deg, transparent 0%, #00bfa6 50%, transparent 100%)',
                transform: 'translateX(100%)'
              }}
            ></div>

            <Card.Body className="position-relative">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-4">
                  <motion.h3 
                    className="fw-bold mb-2"
                    style={{ color: '#00bfa6' }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {isLogin ? 'Welcome Back' : 'Join DeepFakeShield'}
                  </motion.h3>
                  <p className="text-muted mb-0">
                    {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
                  </p>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      variant="danger" 
                      className="text-center border-0 mb-3"
                      style={{ 
                        backgroundColor: 'rgba(220, 53, 69, 0.1)', 
                        color: '#ff6b6b',
                        border: '1px solid rgba(220, 53, 69, 0.3)'
                      }}
                    >
                      {message}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ 
                        backgroundColor: '#1e1e2f', 
                        color: '#d6d6d6', 
                        border: '1px solid #444',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      className="focus-ring"
                    />
                  </Form.Group>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ 
                        backgroundColor: '#1e1e2f', 
                        color: '#d6d6d6', 
                        border: '1px solid #444',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      className="focus-ring"
                    />
                  </Form.Group>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="primary"
                    className="w-100 mb-3 fw-semibold py-2"
                    style={{ 
                      backgroundColor: '#7f5af0', 
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handleAuth}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#6a4fcf';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#7f5af0';
                      e.target.style.transform = 'translateY(0px)';
                    }}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px' }}></div>
                        Please wait...
                      </div>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-center mb-3 position-relative">
                    <hr style={{ borderColor: '#444', margin: '20px 0' }} />
                    <span 
                      className="px-3" 
                      style={{ 
                        backgroundColor: '#2e2e3e', 
                        color: '#888',
                        fontSize: '14px',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      OR CONTINUE WITH
                    </span>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline-light"
                    className="w-100 mb-3 fw-semibold py-2"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{ 
                      borderColor: '#444',
                      borderRadius: '8px',
                      color: '#d6d6d6',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateY(0px)';
                    }}
                  >
                    <i className="bi bi-google me-2"></i> 
                    {loading ? 'Connecting...' : 'Google'}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-center mt-4">
                    <span
                      style={{ 
                        cursor: 'pointer', 
                        color: '#00bfa6',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setMessage('');
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#00d9b8';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#00bfa6';
                      }}
                    >
                      {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </span>
                  </div>
                </motion.div>
              </Form>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 position-relative">
        <Container>
          <p className="text-center text-muted mb-0">
            &copy; {new Date().getFullYear()} DeepFakeShield. All rights reserved.
          </p>
        </Container>
      </footer>

      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />

      <style jsx>{`
        .focus-ring:focus {
          border-color: #00bfa6 !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 191, 166, 0.25) !important;
          background-color: #1a1a2e !important;
        }
      `}</style>
    </>
  );
};

export default AuthPage;
