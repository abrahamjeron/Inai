import express from "express";
import User from "../models/User.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// Get User by Username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

export default router;
