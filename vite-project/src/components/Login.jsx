import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleLogin from './GoogleLogin';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for stored user on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify token is still valid
        axios.get('http://localhost:3001/api/current-user', {
          headers: { Authorization: parsedUser.token }
        })
        .then(() => {
          setUser(parsedUser);
        })
        .catch(() => {
          // Token expired or invalid, remove from storage
          localStorage.removeItem('user');
        });
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3001/auth/login', { username, password });
      const userData = {
        username,
        email: response.data.user.email,
        avatar: response.data.user.avatar,
        token: response.data.token
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
      
      <div className="relative flex items-center justify-center text-sm my-4">
        <span className="px-2 bg-white text-gray-500">or</span>
        <div className="absolute w-full border-t border-gray-300"></div>
      </div>
      
      <GoogleLogin setUser={setUser} />
    </div>
  );
}

export default Login;