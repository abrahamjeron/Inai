import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  const [user, setUser] = useState(null);
//   

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
    <header className="text-[#bab5b5] p-4 flex justify-between items-center">
      <Link to="/" className="text-[2rem] relative ml-[35px] top-2 font-bold tracking-tight bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 text-transparent bg-clip-text"
>
        InaiVibe
      </Link>
      <nav className="space-x-4">
        {user ? (
          <>
             <div className="flex space-x-4 relative right-[30px] top-2">
                <div>
                  <h4 className="font-bold text-black text-[1.3rem]  " >{user.username}</h4>
                  <p className="text-[0.9rem] font-extralight text-[#98A1B8] " >{user.email}</p>
                </div>

                <img
                  src={user.avatar}
                  alt='profile'
                  className='h-10 w-10 top-2 relative rounded-full object-cover '
                />
              </div>
            {/* <button
              onClick={() => {
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/login';
              }}
              className="bg-red-600 px-2 py-1 rounded"
            >
              Logout
            </button> */}
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
