// src/components/AuthSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthSuccess() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    const email = params.get('email');
    const avatar = params.get('avatar');

    if (token && username) {
      const userData = { username, email, avatar, token };
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Successful</h2>
        <p>Redirecting you...</p>
      </div>
    </div>
  );
}

export default AuthSuccess;