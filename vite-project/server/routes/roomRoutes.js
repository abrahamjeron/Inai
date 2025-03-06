import express from "express";
import Room from "../models/Room.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// Create Room
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('=== Room Creation Start ===');
    console.log('Creating room with data:', {
      ...req.body,
      creator: req.user.username,
      admins: [req.user.username],
      members: [req.user.username]
    });

    const room = new Room({ 
      ...req.body, 
      creator: req.user.username,
      admins: [req.user.username], // Add creator as admin
      members: [req.user.username] // Add creator as member
    });
    
    await room.save();
    console.log('Room created successfully:', room);
    console.log('=== Room Creation Complete ===');
    
    res.status(201).json(room);
  } catch (error) {
    console.error('Room creation error:', error);
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
    res.json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Room join error:', error);
    res.status(500).json({ error: 'Error joining room' });
  }
});

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
    if (!room.members.includes(req.user.username)) {
      room.members.push(req.user.username);
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

// Delete Room
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete room request:', {
      roomId: req.params.id,
      requestingUser: req.user.username
    });

    const room = await Room.findById(req.params.id);
    if (!room) {
      console.log('Room not found');
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is admin or creator
    const isAdmin = room.admins.includes(req.user.username);
    const isCreator = room.creator === req.user.username;
    
    console.log('Permission check:', {
      isAdmin,
      isCreator,
      requestingUser: req.user.username
    });

    if (!isAdmin && !isCreator) {
      console.log('Permission denied');
      return res.status(403).json({ error: 'Only admins or room creator can delete the room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    console.log('Room deleted successfully');
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Error deleting room' });
  }
});

export default router;