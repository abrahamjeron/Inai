import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="text-[#bab5b5] p-4 flex justify-between items-center relative">
      {/* Logo */}
      <Link 
        to="/" 
        className="text-[2rem] ml-[35px] top-2 relative font-bold tracking-tight bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 text-transparent bg-clip-text z-10"
      >
        InaiVibe
      </Link>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block 
        absolute md:static 
        top-full left-0 w-full 
        bg-white md:bg-transparent 
        shadow-md md:shadow-none
        z-10
      `}>
        <div className="flex flex-col md:flex-row justify-end items-end md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 md:p-0">
          {user ? (
            <div className="flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="flex flex-col items-end md:items-center">
                <h4 className="font-bold text-black text-[1.3rem]">{user.username}</h4>
                <p className="text-[0.9rem] font-extralight text-[#98A1B8]">{user.email}</p>
              </div>

              <img
                src={user.avatar}
                alt='profile'
                className='h-10 w-10 rounded-full object-cover'
              />

              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  setUser(null);
                  window.location.href = '/login';
                }}
                className="bg-red-600 px-2 py-1 rounded w-full md:w-auto text-right md:text-left"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <Link 
                to="/login" 
                className="px-2 py-1 text-right md:text-left"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-2 py-1 text-right md:text-left"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;