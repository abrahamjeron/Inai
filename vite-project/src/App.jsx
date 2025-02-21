import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/homes';
import AuthSuccess from './components/AuthSuccess';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored user on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Home user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <div className="flex h-screen">
                <div className="w-1/2 p-8">
                  <Login setUser={setUser} />
                </div>
                <div className="w-1/2 p-8">
                  <Register />
                </div>
              </div>
            )
          } 
        />
        <Route path="/auth-success" element={<AuthSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;