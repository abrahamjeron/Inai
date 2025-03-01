import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import VideoPlayer from "../components/videoPlayer";
import SearchBox from '../components/searchBox';
import RoomMembers from "../components/Members";
import Sent from "../assets/Sent.svg"
const backend_url = import.meta.env.VITE_BACKEND_URL

function ChatRoom({ room, user, socket, leaveRoom, isPlaying }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const messagesEndRef = useRef(null);
  const backend_url = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    if (selectedVideoId && room.name) {
      // Making sure to emit with the correct room name
      socket.emit('set current video', {
        roomName: room.name,
        videoId: selectedVideoId,
      });
    }
  }, [selectedVideoId, room.name, socket]);

  useEffect(() => {
    fetchMessages();
    scrollToBottom();

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('message deleted', (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    socket.on('message reacted', ({ messageId, reactions }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    });

    // Ensuring we're specifically listening for the right event and setting the video ID 
    // regardless of which room it came from
    socket.on('current video changed', ({ videoId }) => {
      console.log('Video changed to:', videoId, 'in room:', room.name);
      setSelectedVideoId(videoId);
    });

    return () => {
      socket.off('chat message');
      socket.off('message deleted');
      socket.off('message reacted');
      socket.off('current video changed');
    };
  }, [socket, room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${backend_url}/messages/${room.name}`,
        {
          headers: { Authorization: user.token },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      const messageData = {
        room: room.name,
        user: user.username,
        text: message,
      };

      socket.emit('chat message', messageData);
      setMessage('');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${backend_url}/messages/${messageId}`, {
        headers: { Authorization: user.token },
      });
      socket.emit('delete message', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const reactToMessage = (messageId, reaction) => {
    socket.emit('react to message', {
      messageId,
      user: user.username,
      reaction,
    });
  };

  const handlePlay = () => {
    socket.emit('video play', { roomName: room.name });
  };

  const handlePause = () => {
    socket.emit('video pause', { roomName: room.name });
  };

  // Handle video selection from the search box
  const handleVideoSelect = (videoId) => {
    setSelectedVideoId(videoId);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex">
        <RoomMembers roomId={room._id} leaveRoom={leaveRoom} roomName={room.name} currentuserName={user.username } currentuserAvt={user.avatar} />

        <div className="flex flex-col w-full">
          <div className="flex">
            <VideoPlayer
              videoId={selectedVideoId}
              socket={socket}
              roomName={room.name}
            />
            <SearchBox onVideoSelect={handleVideoSelect} />
          </div>

          <div className="bg-[#F6F7F9] rounded-2xl w-[700px] ml-[15px] overflow-y-scroll h-[250px] mb-2 space-y-1 p-4">
            {messages
              .filter((msg) => msg.user !== 'System')
              .map((msg) => (
                <div
                  key={msg._id}
                  className={`group p-2 rounded flex flex-col ${
                    msg.user === user.username
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >
                  <span
                    className={`text-[0.9rem] ${
                      msg.user === user.username
                        ? 'text-right text-black'
                        : 'text-left text-gray-600'
                    }`}
                  >
                    {msg.user}:
                  </span>

                  <div
                    className={`inline-block max-w-[70%] py-2 px-3 rounded-2xl break-words ${
                      msg.user === user.username
                        ? 'bg-black text-white ml-auto text-right'
                        : 'bg-white text-black mr-auto text-left'
                    }`}
                  >
                    <p className="text-[1rem]">{msg.text}</p>
                  </div>

                  {msg.file && (
                    <a
                      href={`${backend_url}/uploads/${msg.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      Attached File
                    </a>
                  )}

                  <div className="flex space-x-2 mt-2 group-hover:flex">
                    <button
                      onClick={() => reactToMessage(msg._id, '👍')}
                      className="text-sm"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => reactToMessage(msg._id, '❤️')}
                      className="text-sm"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => reactToMessage(msg._id, '😂')}
                      className="text-sm"
                    >
                      😂
                    </button>
                    {msg.user === user.username && (
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="text-[0.9rem] text-red-500 mt-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {msg.reactions
                        .map((r) => `${r.user[0]}: ${r.reaction}`)
                        .join(', ')}
                    </div>
                  )}
                </div>
              ))}

            <div ref={messagesEndRef} />
            <form onSubmit={sendMessage} className="flex w-full mt-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3  border border-gray-300 bg-white rounded-3xl focus:outline-none focus:ring-1"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-black relative  p-4 rounded-4xl"
              >
                <img src={Sent} alt="" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;