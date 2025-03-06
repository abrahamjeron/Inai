import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';


function Room({ user, socket, leaveRoom }) {
  const location = useLocation();
  const currentRoom = location.state?.currentRoom;

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