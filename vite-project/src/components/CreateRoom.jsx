import { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

export function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: roomName,
          isPrivate,
          password: isPrivate ? password : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to create room');
      
      // Socket event will handle the UI update
      setRoomName('');
      setPassword('');
      setIsPrivate(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
        required
      />
      <label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
        Private Room
      </label>
      {isPrivate && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Room Password"
          required
        />
      )}
      <button type="submit">Create Room</button>
    </form>
  );
} 