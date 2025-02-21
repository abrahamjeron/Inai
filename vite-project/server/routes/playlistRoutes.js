import express from "express";
import Playlist from "../models/Playlist.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// Initialize Playlist
router.post('/rooms/:roomId/playlist/init', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { roomName } = req.body;
    const playlist = new Playlist({ room: roomName, roomId, songs: [], currentSong: null });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Error initializing playlist' });
  }
});

// Get Playlist
router.get('/rooms/:roomId/playlist', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const playlist = await Playlist.findOne({ roomId });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching playlist' });
  }
});

export default router;