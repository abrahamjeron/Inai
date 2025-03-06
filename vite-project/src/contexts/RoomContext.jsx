import { createContext, useContext, useReducer, useEffect } from 'react';
import { useSocket } from './SocketContext';

const RoomContext = createContext();

const roomReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room => 
          room._id === action.payload._id ? action.payload : room
        )
      };
    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room._id !== action.payload)
      };
    default:
      return state;
  }
};

export function RoomProvider({ children }) {
  const [state, dispatch] = useReducer(roomReducer, { rooms: [] });
  const { socket } = useSocket();

  useEffect(() => {
    // Fetch initial rooms
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const rooms = await response.json();
        dispatch({ type: 'SET_ROOMS', payload: rooms });
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();

    // Listen for room events
    socket.on('room created', (room) => {
      dispatch({ type: 'ADD_ROOM', payload: room });
    });

    socket.on('room updated', (room) => {
      dispatch({ type: 'UPDATE_ROOM', payload: room });
    });

    socket.on('room deleted', ({ roomId }) => {
      dispatch({ type: 'DELETE_ROOM', payload: roomId });
    });

    return () => {
      socket.off('room created');
      socket.off('room updated');
      socket.off('room deleted');
    };
  }, [socket]);

  return (
    <RoomContext.Provider value={{ state, dispatch }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRooms = () => useContext(RoomContext); 