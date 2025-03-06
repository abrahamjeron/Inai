import { useEffect, useState } from 'react';
import { socket } from '../socket';

function ChatMessages({ roomName }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for new messages
    socket.on('chat message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for message deletions
    socket.on('message deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    // Listen for message reactions
    socket.on('message reacted', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          return { ...msg, reactions };
        }
        return msg;
      }));
    });

    return () => {
      socket.off('chat message');
      socket.off('message deleted');
      socket.off('message reacted');
    };
  }, []);

  // ... rest of your component code
}

export default ChatMessages; 