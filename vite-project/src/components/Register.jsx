import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png'
// import Music1 from "../assets/Music1.svg"
import Music2 from '../assets/Music.png'
import Music3 from '../assets/Music3.svg'
import S1 from '../assets/S1.svg'
import GoogleLogin from './GoogleLogin';

function Register({setUser}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://inai-0og5.onrender.com/auth/register', { username, password, email });
      alert('User registered successfully');
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };
return(
  <div className="flex">
  <div className="aspect-square w-full max-w-full mx-auto relative">
    <div className="absolute top-0 left-0 w-full h-full flex z-10">
      {/* <img src={Music1} className="h-[200px] relative m-4 mt-[60px]" alt="" /> */}
      <img src={Music3} className="h-[500px] absolute top-[400px] right-[0px]" alt="" />
      <img src={S1} className="absolute left-[400px] top-[380px] h-[230px] w-auto" alt="" />
      <img src={S1} className="absolute left-[407px] top-[549px] h-[230px] w-auto scale-x-[-1]" alt="" />
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center w-full">
        <h1 className="text-[10rem] font-bold mt-[110px] tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-400 text-transparent bg-clip-text">
          InaiVibe
        </h1>
      </div>

      <div className="mt-[350px]">
        <div className="flex space-x-44">
          <div className=" rounded-2xl bg-gradient-to-b from-[#666666] to-black border-1 shadow-2xl w-[240px] p-5">
            <img className="px-2" src={Music2} alt="" />
            <h2 className="text-white mt-10 px-2 mb-2 text-[1.5rem] font-light">
              Share Whatever <br /> you want to share
            </h2>
          </div>

          <div className=" relative top-32 rounded-2xl bg-gradient-to-b from-[#666666] to-black border-1 w-[240px] shadow-2xl p-5">
            <img className="px-2" src={Music2} alt="" />
            <h2 className="text-white mt-10 px-2 mb-2 text-[1.5rem] font-light">
              Share Whatever <br /> you want to share
            </h2>
          </div>
        </div>
        <div className="flex relative top-24">
          <div className="rounded-2xl z-10 bg-gradient-to-b from-[#666666] to-black border-1 shadow-2xl w-[240px] p-5">
            <img className="px-2" src={Music2} alt="" />
            <h2 className="text-white mt-8 px-2 mb-2 text-[1.5rem] font-light">
              Share Whatever <br /> you want to share
            </h2>
          </div>
        </div>
      </div>
    </div>

    <div className="w-full h-full grid grid-cols-5 grid-rows-5 bg-gradient-to-tr from-[#3a3a3a] via-[#171717] to-[#000]">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="border-[0.1px] border-[#ffffff52]" />
      ))}
    </div>
  </div>
      

      <div className="flex mr-[40px] ml-[40px] justify-end">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="mb-[130px] w-[400px] space-y-8">
            <div className="text-center">
              <img src={Logo} alt="Logo" width={90} className="mx-auto mb-3" />
              <h1 className="text-3xl font-semibold">Register</h1>
              <p className="mt-2 text-[1.1rem] text-[#000]">Create your account</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4 mt-[60px]">
                <div className="space-y-1">
                  <label className="text-[1rem] font-medium">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-b border-[#000] pb-1 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[1rem] font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-[#000] pb-1 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[1rem] font-medium">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-[#000] pb-1 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex mt-5 justify-center">
                <button
                  type="submit"
                  className="w-[320px] rounded-full bg-[#000] py-2.5 text-white hover:bg-gray-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
            <GoogleLogin setUser={setUser} />

            <p className="text-center relative text-[1rem] top-[110px] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
