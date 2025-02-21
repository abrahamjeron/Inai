import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user details from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        My App
      </Link>
      <nav className="space-x-4">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <span>Hello, {user.username}</span>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/login';
              }}
              className="bg-red-600 px-2 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
