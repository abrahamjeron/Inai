import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Search } from "lucide-react";
import ChatRoom from "../components/ChatRoom";
import { useNavigate } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import landingimg from "../assets/landingimg.svg";

// Initialize socket connection
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("WebSocket connection error:", err);
});

function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState("");
  const [showRooms, setShowRooms] = useState(false);
  const backend_url = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    // Only fetch rooms when user is logged in
    if (user) {
      fetchRooms();
    }
  }, [user]);

  useEffect(() => {
    // Socket event listeners
    socket.on('room deleted', ({ roomName }) => {
      // Remove the deleted room from the rooms list
      setRooms(prevRooms => prevRooms.filter(room => room.name !== roomName));
      
      // If the current room was deleted, leave it
      if (currentRoom?.name === roomName) {
        leaveRoom();
      }
    });

    return () => {
      socket.off('room deleted');
    };
  }, [currentRoom]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${backend_url}/rooms`, {
        headers: { Authorization: user?.token },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createRoom = async (roomName, isPrivate, password) => {
    try {
      if (!roomName.trim()) {
        setError("Room name cannot be empty");
        return;
      }
      
      if (isPrivate && !password?.trim()) {
        setError("Private rooms require a password");
        return;
      }

      // Check if room with same name exists
      const existingRoom = rooms.find(room => room.name.toLowerCase() === roomName.toLowerCase());
      if (existingRoom) {
        setError("A room with this name already exists");
        return;
      }

      // Create room
      const response = await axios.post(
        `${backend_url}/rooms`,
        { name: roomName, isPrivate, password },
        { headers: { Authorization: user.token } }
      );
      
      const newRoom = response.data;
      
      // Update state first
      setCurrentRoom(newRoom);
      setShowRooms(true);
      setRooms(prev => [...prev, newRoom]);
      
      // Then store room data and navigate
      localStorage.setItem('currentRoom', JSON.stringify(newRoom));
      navigate('/room', { state: { currentRoom: newRoom } });
      
    } catch (error) {
      setError(error.response?.data?.error || "Error creating room");
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async (room) => {
    if (room.isPrivate) {
      console.log("private room clicked")
      setShowPasswordModal(true);
      setSelectedRoom(room);   
    } else {
      joinRoom(room);
    }
  };

  const joinRoom = async (room, password = "") => {
    try {
      if (room.isPrivate) {
        await axios.post(
          `${backend_url}/rooms/${room._id}/join`,
          { password },
          { headers: { Authorization: user.token } }
        );
      }

      // Update state first
      setCurrentRoom(room);
      setShowRooms(true);
      
      // Then store room data and navigate
      localStorage.setItem('currentRoom', JSON.stringify(room));
      navigate('/room', { state: { currentRoom: room } });
      
    } catch (error) {
      setError(error.response?.data?.error || "Error joining room");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    joinRoom(selectedRoom, roomPassword);
  };

  const leaveRoom = () => {
    if (currentRoom) {
      socket.emit("leave room", {roomName:currentRoom.name, userName:user.username });
      setCurrentRoom(null);
      localStorage.removeItem('currentRoom');
    }
    setShowRooms(false);
  };

  if (showRooms || currentRoom) {
    return (
      <div className="w-full">
        <div className="">
          {currentRoom ? (
            <div className="ml-2 md:ml-[30px]">
              <ChatRoom
                room={currentRoom}
                user={user}
                socket={socket}
                leaveRoom={leaveRoom}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a room to start chatting</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 md:px-0">
      {/* Password Modal - Mobile Responsive */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Enter Room Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Password"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setRoomPassword("");
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content - Mobile Responsive */}
      <div className="flex justify-center">
        <div className="bg-black rounded-2xl w-full md:w-[93%] mt-6 h-auto">
          <div className="flex mt-10 items-center justify-center">
            <h1 className="text-4xl md:text-[6rem] font-bold tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-400 text-transparent bg-clip-text">
              InaiVibe
            </h1>
          </div>
          <div className="flex flex-col md:flex-row mt-4 px-4 md:px-0">
            <div className="w-full md:w-1/2">
              <div className="md:ml-28 text-center md:text-left">
                <h1 className="text-white text-2xl md:text-[3rem] font-light md:w-[520px]">
                Watch videos with your friends seamlessly
                </h1>
                <h3 className="text-[#BDBDBD] text-sm md:text-[1rem] mt-3 font-light md:w-[520px]">
                Watch videos seamlessly with your friends in <br /> perfect sync, no matter where they are. Enjoy <br />
                 shared viewing experiences with interactive <br /> controls and real-time reactions.
                </h3>
                <div className="flex mt-[30px] space-x-4 justify-center md:justify-start">
                  <button
                    className="text-black bg-white text-sm md:text-[1.2rem] p-2 px-5 rounded-3xl"
                    onClick={() => {
                      const name = prompt("Room name:");
                      const password = prompt("Room password:");
                      if (name) createRoom(name, true, password);
                    }}
                  >
                    Create Private Room
                  </button>

                  <button
                    className="text-white relative top-2 text-sm md:text-[1.2rem]"
                    onClick={() => {
                      const name = prompt("Room name:");
                      if (name) createRoom(name, false);
                    }}
                  >
                    Create Public Room
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-[10px] mb-[80px]">
              <img src={landingimg} className="h-[250px] md:h-[400px]" alt="Landing" />
            </div>
          </div>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Join the Available Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full max-w-[350px] mx-auto mb-[20px]">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pr-10 rounded-3xl border"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-[50px]">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="group p-2 bg-white hover:bg-black w-full max-w-[350px] h-[70px] rounded-3xl shadow hover:shadow-md transition-shadow mx-auto"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col ml-4">
                    <span className="font-bold text-[1.2rem] group-hover:text-white">{room.name}</span>
                    <span>
                      {room.isPrivate ? 
                        <span className="text-gray-400 text-[0.8rem]">Private</span> : 
                        <span className="text-gray-400 text-[0.8rem]">Public</span>
                      }
                    </span>
                  </div>
                  {currentRoom?._id !== room._id && (
                    <button
                      onClick={() => handleJoinRoom(room)}
                      className="px-3 py-1 bg-black mr-3 text-white rounded-full hover:bg-[#F6F7F9] group-hover:text-black group-hover:bg-[#ffff]"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;