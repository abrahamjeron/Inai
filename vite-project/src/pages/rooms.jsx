// // src/pages/Room.js
// import React, { useState } from "react";
// import ChatRoom from "../components/ChatRoom";

// const Room = ({ user, socket }) => {
//   const [currentRoom, setCurrentRoom] = useState(null);
//   const [roomPassword, setRoomPassword] = useState("");
//   const [showPasswordModal, setShowPasswordModal] = useState(false);

//   const handlePasswordSubmit = (e) => {
//     e.preventDefault();
//     // Add joinRoom logic here if required
//   };

//   const leaveRoom = () => {
//     if (currentRoom) {
//       socket.emit("leave room", currentRoom.name);
//       setCurrentRoom(null);
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       <div className="w-3/4 p-4">
//         {currentRoom ? (
//           <ChatRoom
//             room={currentRoom}
//             user={user}
//             socket={socket}
//             leaveRoom={leaveRoom}
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-gray-500 text-lg">Select a room to start chatting</p>
//           </div>
//         )}
//       </div>
//       {showPasswordModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-lg w-80">
//             <h3 className="text-lg font-bold mb-4">Enter Room Password</h3>
//             <form onSubmit={handlePasswordSubmit}>
//               <input
//                 type="password"
//                 value={roomPassword}
//                 onChange={(e) => setRoomPassword(e.target.value)}
//                 className="w-full p-2 border rounded mb-4"
//                 placeholder="Password"
//               />
//               <div className="flex justify-end space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowPasswordModal(false);
//                     setRoomPassword("");
//                   }}
//                   className="px-4 py-2 bg-gray-300 rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded"
//                 >
//                   Join
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Room;


import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';


function Room({ user, socket, leaveRoom }) {
  const location = useLocation();
  const currentRoom = location.state?.currentRoom;

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <ChatRoom
        room={currentRoom}
        user={user}
        socket={socket}
        leaveRoom={leaveRoom}
      />
    </div>
  );
}

export default Room;