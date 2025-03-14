import { useEffect, useState } from 'react';
import { socket } from '../socket'; // Assuming you have a socket configuration file

function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Listen for room deletion
    socket.on('room deleted', ({ roomId }) => {
      setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
    });

    // Listen for admin updates
    socket.on('admin updated', ({ roomName, admins }) => {
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.name === roomName) {
          return { ...room, admins };
        }
        return room;
      }));
    });

    // Listen for DJ updates
    socket.on('dj updated', ({ roomName, djs }) => {
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.name === roomName) {
          return { ...room, djs };
        }
        return room;
      }));
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('room deleted');
      socket.off('admin updated');
      socket.off('dj updated');
    };
  }, []);


}

export default RoomList; 