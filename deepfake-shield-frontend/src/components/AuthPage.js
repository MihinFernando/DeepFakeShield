// src/components/AuthPage.js
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Container, Form, Button, Card } from 'react-bootstrap';

const AuthPage = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuth();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onAuth();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1e1e2f' }} className="d-flex justify-content-center align-items-center text-light">
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
  );
};

export default AuthPage;
