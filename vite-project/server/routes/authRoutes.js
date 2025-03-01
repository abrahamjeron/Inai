import express from "express";
// import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import passport from '../middleware/passportConfig.js'
import dotenv from "dotenv";

dotenv.config();
const frontend_url = process.env.FRONT_END_LINK

const router = express.Router();

// Google Auth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ username: req.user.username }, 'your_jwt_secret');
    res.redirect(`${frontend_url}/auth-success?token=${token}&username=${req.user.username}&email=${req.user.email}&avatar=${req.user.avatar || ''}`);
  });

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ username: user.username }, 'your_jwt_secret');
    res.json({ token, user: { username: user.username, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

export default router;