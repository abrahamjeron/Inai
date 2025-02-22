import express from "express";
import Room from "../models/Room.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// Create Room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const room = new Room({ ...req.body, creator: req.user.username });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Error creating room' });
  }
});

// Get Rooms
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching rooms' });
  }
});

router.get('/:id', async (req, res) => {
  const roomId = req.params.id;
  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json(room);
});

// router.post('/:roomId/join', authenticateToken, async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.roomId);
    
//     if (!room) {
//       return res.status(404).json({ error: 'Room not found' });
//     }

//     if (room.isPrivate) {
//       const { password } = req.body;
      
//       if (!password) {
//         return res.status(400).json({ error: 'Password required for private room' });
//       }

//       // For simplicity, we're comparing plain text passwords
//       // In production, you should use proper password hashing
//       if (password !== room.password) {
//         return res.status(403).json({ error: 'Incorrect password' });
//       }
//     }

//     // You could add additional logic here, such as:
//     // - Tracking room members
//     // - Checking room capacity
//     // - Adding user to room's member list

//     res.json({ message: 'Joined room successfully' });
//   } catch (error) {
//     console.error('Room join error:', error);
//     res.status(500).json({ error: 'Error joining room' });
//   }
// });

router.post('/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.isPrivate) {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'Password required for private room' });
      }

      if (password !== room.password) {
        return res.status(403).json({ error: 'Incorrect password' });
      }
    }

    // Check if user is already a member
    if (!room.members.includes(req.user.id)) {
      room.members.push(req.user.id);
      await room.save();
    } else {
      return res.status(400).json({ error: 'User is already a member' });
    }

    res.json({ message: 'Joined room successfully', room });
  } catch (error) {
    console.error('Room join error:', error);
    res.status(500).json({ error: 'Error joining room' });
  }
});


export default router;