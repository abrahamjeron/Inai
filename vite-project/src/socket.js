import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
});

// Add global error handling
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Add reconnection handling
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected to server after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', () => {
  console.log('Attempting to reconnect...');
});

export default socket; 