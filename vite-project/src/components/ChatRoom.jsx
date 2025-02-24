import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import VideoPlayer from "../components/videoPlayer";
import SearchBox from '../components/searchBox';

function ChatRoom({ room, user, socket, leaveRoom, isPlaying }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedVideoId) {
      socket.emit('set current video', {
        roomName: room.name,
        videoId: selectedVideoId,
      });
    }
  }, [selectedVideoId, socket, room.name]);

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

    socket.on('current video changed', ({ videoId }) => {
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
        `http://localhost:3001/messages/${room.name}`,
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
      await axios.delete(`http://localhost:3001/messages/${messageId}`, {
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{room.name}</h2>
        <button onClick={leaveRoom} className="bg-red-500 text-white p-2 rounded">
          Leave Room
        </button>
      </div>

      <div className="flex">
      <VideoPlayer
        videoId={selectedVideoId}
        socket={socket}  
        roomName={room.name}
      />
        <SearchBox onVideoSelect={setSelectedVideoId} />
      </div>

      <div className="flex-grow overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded ${
              msg.user === user.username
                ? 'bg-blue-100 text-right'
                : 'bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-bold">{msg.user}: </span>
              {msg.user === user.username && (
                <button
                  onClick={() => deleteMessage(msg._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              )}
            </div>
            <p>{msg.text}</p>
            {msg.file && (
              <a
                href={`http://localhost:3001/uploads/${msg.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Attached File
              </a>
            )}
            <div className="flex space-x-2 mt-2">
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
            </div>
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="text-sm text-gray-500">
                Reactions:{' '}
                {msg.reactions
                  .map((r) => `${r.user}: ${r.reaction}`)
                  .join(', ')}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 border rounded-l"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;