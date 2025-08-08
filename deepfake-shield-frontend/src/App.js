// src/App.js
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ backgroundColor: '#1e1e2f', minHeight: '100vh' }}>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <AuthPage onAuth={() => {}} />
      )}
    </div>
  );
}

export default App;
