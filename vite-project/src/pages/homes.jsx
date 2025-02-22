import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ChatRoom from "../components/ChatRoom";
import Header from '../components/header'
import RoomMembers from "../components/Members";

import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import landingimg from "../assets/landingimg.svg";

// Initialize socket connection
const socket = io("http://localhost:3001", {
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
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState("");
  const [showRooms, setShowRooms] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3001/rooms", {
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

      const response = await axios.post(
        "http://localhost:3001/rooms",
        { name: roomName, isPrivate, password },
        { headers: { Authorization: user.token } }
      );
      setRooms([...rooms, response.data]);
      setError("");
      setShowRooms(true);
    } catch (error) {
      setError(error.response?.data?.error || "Error creating room");
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async (room) => {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      joinRoom(room);
    }
  };

  const joinRoom = async (room, password = "") => {
    try {
      if (room.isPrivate) {
        await axios.post(
          `http://localhost:3001/rooms/${room._id}/join`,
          { password },
          { headers: { Authorization: user.token } }
        );
      }

      if (currentRoom) {
        socket.emit("leave room", currentRoom.name);
      }
      setCurrentRoom(room);
      socket.emit("join room", {
        roomName:room.name,
        userName:user.username
       });
      setShowPasswordModal(false);
      setRoomPassword("");
      setError("");
      setShowRooms(true);
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
    }
    setShowRooms(false);
  };

  if (showRooms || currentRoom) {
    return (
      <div className="flex h-screen">
        <div className="w-3/4 p-4">
          {currentRoom ? (
            <ChatRoom
              room={currentRoom}
              user={user}
              socket={socket}
              leaveRoom={leaveRoom}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a room to start chatting</p>
            </div>
          )}
        </div>
        <div className="w-1/4 p-4">
        {currentRoom && (
            <RoomMembers roomId={currentRoom._id} />
        )}
        </div>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-80">
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
      </div>
    );
  }

  return (

    <div>
        {/* <Header/> */}
      <div className="flex justify-center">
        <div className="bg-black rounded-2xl w-[93%] mt-6 h-auto">
          <div className="flex mt-10 items-center justify-center">
            <h1 className="text-[6rem] font-bold tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-400 text-transparent bg-clip-text">
              InaiVibe
            </h1>
          </div>
          <div className="flex mt-4">
            <div>
              <div className="ml-28">
                <h1 className="text-white text-[3rem] font-light w-[520px]">
                  Chat with your friends seamlessly
                </h1>
                <h3 className="text-[#BDBDBD] text-[1rem] mt-3 font-light w-[520px]">
                  Connect with friends in real-time chat rooms, <br />
                  create public or private spaces for discussions, <br />
                  and enjoy interactive conversations with <br />
                  real-time messaging and reactions.
                </h3>
                <div className="flex mt-[30px] space-x-4">
                    {/* room creation */}
                <button
              className="text-black bg-white text-[1.2rem] p-2 px-5 rounded-3xl"
              onClick={() => {
                const name = prompt("Room name:");
                const password = prompt("Room password:");
                if (name) createRoom(name, true, password);
              }}
            >
              Create Private Room
            </button>

            <button
              className="text-white relative top-2 text-[1.2rem]"
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
            <div className="mt-[10px] mb-[80px] mr-6 ml-12">
              <img src={landingimg} className="h-[400px]" alt="Landing" />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pr-10 rounded border"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
      <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <div
                    key={room._id}
                    className="p-3 bg-white rounded shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{room.name}</span>
                        <span className="ml-2">
                          {room.isPrivate ? 
                            <span className="text-red-500">🔒 Private</span> : 
                            <span className="text-green-500">🌐 Public</span>
                          }
                        </span>
                      </div>
                      {currentRoom?._id !== room._id && (
                        <button
                          onClick={() => handleJoinRoom(room)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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