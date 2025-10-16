// src/App.js
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import FAQ from './components/FAQ';
import Blog from './components/Blog';
import Tutorials from './components/Tutorial';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Assume default role is 'user' until proven otherwise
        let determinedRole = 'user'; 
        
        // Check user role in Firestore
        try {
          // NOTE: We rely on the Firestore library instances (db) being stable
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Safety check: ensure role is a string and valid
            if (typeof data.role === 'string') {
              determinedRole = data.role;
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
        
        setUser(currentUser);
        setUserRole(determinedRole);
      } else {
        setUser(null);
        setUserRole('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: '#1e1e2f', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1e1e2f', minHeight: '100vh' }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} userRole={userRole} />} />
          <Route 
            path="/auth" 
            // If user exists, navigate to dashboard
            element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? (
              // This is the role-based routing check
              userRole === 'admin' 
              // ⚠️ Passing userRole to AdminDashboard for strict pre-fetch check
              ? <AdminDashboard user={user} userRole={userRole} /> 
              : <Dashboard user={user} />
            ) : <Navigate to="/auth" />} 
          />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
