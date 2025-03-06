import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import ChatMessages from './ChatMessages';
import MusicPlayer from './MusicPlayer';
import MemberList from './MemberList';

export function RoomPage() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }

    // Join room and request initial data
    socket.emit('join room', { roomName, userName: username });

    // Handle initial room data
    socket.on('room joined', (data) => {
      setRoomData(data.room);
      setMessages(data.messages);
      setPlaylist(data.playlist);
      setMembers(data.members);
      setIsLoading(false);
    });

    // Handle new messages
    socket.on('chat message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle message deletion
    socket.on('message deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    // Handle playlist updates
    socket.on('current video changed', ({ videoId, timestamp }) => {
      setPlaylist(prev => ({
        ...prev,
        currentVideoId: videoId,
        currentSong: {
          ...prev?.currentSong,
          videoId,
          startedAt: timestamp
        }
      }));
    });

    // Handle member updates
    socket.on('member joined', ({ userName, memberCount }) => {
      setMembers(prev => [...prev, userName]);
    });

    socket.on('member left', ({ userName }) => {
      setMembers(prev => prev.filter(member => member !== userName));
    });

    // Handle room deletion
    socket.on('room deleted', ({ roomName: deletedRoom }) => {
      if (deletedRoom === roomName) {
        navigate('/rooms');
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave room', { roomName, userName: username });
      socket.off('room joined');
      socket.off('chat message');
      socket.off('message deleted');
      socket.off('current video changed');
      socket.off('member joined');
      socket.off('member left');
      socket.off('room deleted');
    };
  }, [socket, roomName, navigate]);

  if (isLoading) {
    return <div>Loading room...</div>;
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <h1>{roomData?.name}</h1>
      </div>
      
      <div className="room-content">
        <div className="music-player">
          <MusicPlayer
            roomName={roomName}
            playlist={playlist}
            isAdmin={roomData?.admins.includes(localStorage.getItem('username'))}
          />
        </div>

        <div className="chat-section">
          <ChatMessages
            messages={messages}
            roomName={roomName}
            onSendMessage={(text) => {
              socket.emit('chat message', {
                room: roomName,
                user: localStorage.getItem('username'),
                text
              });
            }}
          />
        </div>

        <div className="members-section">
          <MemberList
            members={members}
            admins={roomData?.admins}
            djs={roomData?.djs}
          />
        </div>
      </div>
    </div>
  );
} 