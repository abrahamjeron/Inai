import express from "express";
import Message from "../models/Message.js";
import authenticateToken from "../middleware/authenticateToken.js";
import { io } from "../app.js"; 

const router = express.Router();

// Get Messages
router.get('/:room', authenticateToken, async (req, res) => {
  console.log("ehll")
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort('createdAt')
      .limit(100);
    res.json(messages);
  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Post Messages
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { room, user, text } = req.body;
    const message = new Message({ room, user, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.user !== req.user.username) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.id);
    io.to(message.room).emit('message deleted', req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Message deletion error:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
});

export default router;