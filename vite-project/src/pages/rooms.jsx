import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';
import io from 'socket.io-client';

const backend_url = import.meta.env.VITE_BACKEND_URL;

function Room({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeSocket = useCallback(() => {
    const newSocket = io(backend_url, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 500,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setLoading(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to server');
      setLoading(false);
    });

    return newSocket;
  }, []);

  useEffect(() => {
    // Get room data from location state or localStorage
    const roomData = location.state?.currentRoom || JSON.parse(localStorage.getItem('currentRoom'));
    
    if (roomData) {
      setCurrentRoom(roomData);
      const newSocket = initializeSocket();
      setSocket(newSocket);

      // Join room immediately
      newSocket.emit('join room', {
        roomName: roomData.name,
        userName: user.username
      });

      // Set a shorter timeout for loading state
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 3000); // 3 second timeout

      return () => {
        clearTimeout(timeoutId);
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } else {
      // Only redirect to home if we're not in a page reload
      if (!window.performance.navigation.type === 1) {
        navigate('/');
      }
      setLoading(false);
    }
  }, [user, location.state, navigate, loading, initializeSocket]);

  const leaveRoom = useCallback(() => {
    if (socket && currentRoom) {
      socket.emit('leave room', {
        roomName: currentRoom.name,
        userName: user.username
      });
    }
    localStorage.removeItem('currentRoom');
    navigate('/');
  }, [socket, currentRoom, user.username, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <ChatRoom
        room={currentRoom}
        user={user}
        socket={socket}
        leaveRoom={leaveRoom}
      />
    </div>
  );
}

export default Room;