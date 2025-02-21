// import express from "express"; 
// import http from "http";
// import { Server } from "socket.io";
// import mongoose from "mongoose";
// import cors from "cors";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import session from 'express-session';

// const GOOGLE_CLIENT_ID = "94490572892-vnb75eeprlnokfied1t3pjaneotj32lg.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";
// const CALLBACK_URL = "http://localhost:3001";

// // Get __dirname in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Initialize Express app and server
// const app = express();
// const server = http.createServer(app);


// // Configure passport
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: CALLBACK_URL,
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // Check if user already exists in our database
//       let user = await User.findOne({ email: profile.emails[0].value });
      
//       if (user) {
//         // User exists, update with Google info if necessary
//         if (!user.googleId) {
//           user.googleId = profile.id;
//           await user.save();
//         }
//         return done(null, user);
//       }
      
//       // Create new user if not exists
//       const newUser = new User({
//         username: profile.displayName.replace(/\s/g, "") + Math.floor(Math.random() * 1000),
//         email: profile.emails[0].value,
//         googleId: profile.id,
//         avatar: profile.photos[0].value,
//         password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10) // Random password
//       });
      
//       await newUser.save();
//       return done(null, newUser);
//     } catch (error) {
//       return done(error, null);
//     }
//   }
// ));
// // Global CORS Middleware for Express
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

// // Enable CORS for Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", 
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   transports: ["websocket"],
// });

// // Middleware
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// // Connect to MongoDB with error handling
// mongoose.connect('mongodb+srv://naveen:Naveen123@room.mezil.mongodb.net/?retryWrites=true&w=majority&appName=room')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // User Model
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   avatar: String,
//   googleId: String,
// }, {
//   timestamps: true
// });
// const User = mongoose.model('User', userSchema);

// // Room Model
// const roomSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   isPrivate: { type: Boolean, default: false },
//   password: String,
//   creator: { type: String, required: true },
//   members: [String],
//   admins: [String],
//   djs: [String],
//   musicEnabled: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now }
// });

// const Room = mongoose.model('Room', roomSchema);

// const playlistSchema = new mongoose.Schema({
//   room: { type: String, required: true },
//   roomId: { type: String, required: true }, // Add this line
//   songs: [{
//     videoId: { type: String, required: true },
//     title: { type: String, required: true },
//     thumbnail: String,
//     addedBy: { type: String, required: true },
//     addedAt: { type: Date, default: Date.now }
//   }],
//   currentSong: {
//     videoId: String,
//     startedAt: Date,
//     position: Number,
//     isPlaying: { type: Boolean, default: false }
//   }
// });

// const Playlist = mongoose.model('Playlist', playlistSchema);

// // Message Model
// const messageSchema = new mongoose.Schema({
//   room: { type: String, required: true },
//   user: { type: String, required: true },
//   text: { type: String, required: true },
//   reactions: [{
//     user: { type: String },
//     reaction: { type: String }
//   }]
// }, {
//   timestamps: true
// });

// const Message = mongoose.model('Message', messageSchema);

// // Authentication Middleware
// const authenticateToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, 'your_jwt_secret', (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };
// app.use(session({
//   secret: 'your_session_secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));



// // Unified message handling function with retry mechanism
// const createMessage = async (messageData) => {
//   try {
//     // Check for recent duplicate messages
//     const recentMessage = await Message.findOne({
//       room: messageData.room,
//       user: messageData.user,
//       text: messageData.text,
//       createdAt: { $gte: new Date(Date.now() - 2000) }
//     });

//     if (recentMessage) {
//       return recentMessage;
//     }

//     // Create new message with new ObjectId
//     const message = new Message({
//       ...messageData,
//       _id: new mongoose.Types.ObjectId(),
//       reactions: []
//     });

//     const savedMessage = await message.save();
//     return savedMessage;
//   } catch (error) {
//     console.error('Error creating message:', error);
//     throw error;
//   }
// };
// // Initialize passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Google Auth routes
// app.get('/auth/google', 
//   passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     // Generate JWT token for the authenticated user
//     const token = jwt.sign({ username: req.user.username }, 'your_jwt_secret');
    
//     // Redirect to frontend with token
//     res.redirect(`http://localhost:5173/auth-success?token=${token}&username=${req.user.username}&email=${req.user.email}&avatar=${req.user.avatar || ''}`);
//   });

// // Check if user is authenticated
// app.get('/api/current-user', authenticateToken, (req, res) => {
//   res.json({
//     username: req.user.username,
//     email: req.user.email,
//     avatar: req.user.avatar
//   });
// });

// // Logout route
// app.get('/auth/logout', (req, res) => {
//   req.logout(function(err) {
//     if (err) { return next(err); }
//     res.redirect('http://localhost:5173');
//   });
// });
// // Register User
// app.post('/register', async (req, res) => {
//   console.log(req.body);
  
//   try {
//     const { username, password, email } = req.body;
    
//     // Validate required fields
//     if (!username || !password || !email) {
//       return res.status(400).json({ 
//         error: 'Missing required fields',
//         details: {
//           username: !username ? 'Username is required' : null,
//           password: !password ? 'Password is required' : null,
//           email: !email ? 'Email is required' : null
//         }
//       });
//     }
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [
//         { username: username },
//         { email: email }
//       ]
//     });
    
//     if (existingUser) {
//       return res.status(400).json({ 
//         error: 'User already exists',
//         details: existingUser.username === username ? 
//           'Username is taken' : 'Email is already registered'
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({
//       username,
//       password: hashedPassword,
//       email,
//     });
    
//     await user.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ 
//       error: 'Error registering user',
//       details: error.message 
//     });
//   }
// });

// // Login User
// app.post('/login', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (!user) {
//       return res.status(400).json({ error: 'User not found' });
//     }

//     const validPassword = await bcrypt.compare(req.body.password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: 'Invalid password' });
//     }

//     const token = jwt.sign({ username: user.username }, 'your_jwt_secret');
//     res.json({
//       token,
//       user: {
//         username: user.username,
//         email: user.email,
//         avatar: user.avatar
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Error during login' });
//   }
// });
// app.post('/rooms/:roomId/playlist/init', authenticateToken, async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const { roomName } = req.body;

//     // Check if room exists
//     const room = await Room.findById(roomId);
//     if (!room) {
//       return res.status(404).json({ error: 'Room not found' });
//     }

//     // Check if playlist already exists
//     const existingPlaylist = await Playlist.findOne({ roomId });
//     if (existingPlaylist) {
//       return res.status(409).json({ message: 'Playlist already exists' });
//     }

//     // Create new playlist
//     const playlist = new Playlist({
//       room: roomName,
//       roomId,
//       songs: [],
//       currentSong: null
//     });

//     await playlist.save();
//     res.status(201).json(playlist);
//   } catch (error) {
//     console.error('Error initializing playlist:', error);
//     res.status(500).json({ error: 'Error initializing playlist' });
//   }
// });

// // Modify the existing get playlist endpoint
// app.get('/rooms/:roomId/playlist', authenticateToken, async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const { roomName } = req.query;

//     // First try finding by roomId
//     let playlist = await Playlist.findOne({ roomId });
    
//     // If not found, try finding by room name as fallback
//     if (!playlist && roomName) {
//       playlist = await Playlist.findOne({ room: roomName });
      
//       // If found by room name, update it with roomId
//       if (playlist) {
//         playlist.roomId = roomId;
//         await playlist.save();
//       }
//     }

//     // If still not found, return empty playlist structure
//     if (!playlist) {
//       return res.json({
//         room: roomName,
//         roomId,
//         songs: [],
//         currentSong: null
//       });
//     }

//     res.json(playlist);
//   } catch (error) {
//     console.error('Error fetching playlist:', error);
//     res.status(500).json({ error: 'Error fetching playlist' });
//   }
// });

// // Modify the add song endpoint
// app.post('/rooms/:roomId/playlist', authenticateToken, async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const { videoId, title, thumbnail } = req.body;

//     let playlist = await Playlist.findOne({ roomId });
//     if (!playlist) {
//       return res.status(404).json({ error: 'Playlist not found' });
//     }

//     playlist.songs.push({
//       videoId,
//       title,
//       thumbnail,
//       addedBy: req.user.username
//     });

//     await playlist.save();
//     io.to(playlist.room).emit('playlist updated', playlist);
//     res.json(playlist);
//   } catch (error) {
//     console.error('Error adding song:', error);
//     res.status(500).json({ error: 'Error adding song to playlist' });
//   }
// });

// // Modify the remove song endpoint
// app.delete('/rooms/:roomId/playlist/:songId', authenticateToken, async (req, res) => {
//   try {
//     const { roomId, songId } = req.params;

//     const playlist = await Playlist.findOne({ roomId });
//     if (!playlist) {
//       return res.status(404).json({ error: 'Playlist not found' });
//     }

//     playlist.songs = playlist.songs.filter(song => song._id.toString() !== songId);
//     await playlist.save();
    
//     io.to(playlist.room).emit('playlist updated', playlist);
//     res.json(playlist);
//   } catch (error) {
//     console.error('Error removing song:', error);
//     res.status(500).json({ error: 'Error removing song from playlist' });
//   }
// });

// // Create Room
// app.post('/rooms', authenticateToken, async (req, res) => {
//   try {
//     const room = new Room({
//       ...req.body,
//       creator: req.user.username
//     });
//     await room.save();
//     res.status(201).json(room);
//   } catch (error) {
//     console.error('Room creation error:', error);
//     res.status(500).json({ error: 'Error creating room' });
//   }
// });

// // Get Rooms
// app.get('/rooms', authenticateToken, async (req, res) => {
//   try {
//     const rooms = await Room.find({});
//     res.json(rooms);
//   } catch (error) {
//     console.error('Room fetch error:', error);
//     res.status(500).json({ error: 'Error fetching rooms' });
//   }
// });

// // Get Messages
// app.get('/messages/:room', authenticateToken, async (req, res) => {
//   try {
//     const messages = await Message.find({ room: req.params.room })
//       .sort('createdAt')
//       .limit(100);
//     res.json(messages);
//   } catch (error) {
//     console.error('Message fetch error:', error);
//     res.status(500).json({ error: 'Error fetching messages' });
//   }
// });

// // Post Messages
// app.post('/messages', authenticateToken, async (req, res) => {
//   try {
//     const { room, user, text } = req.body;
//     let retries = 3;
//     let message;

//     while (retries > 0) {
//       try {
//         message = await createMessage({ room, user, text });
//         break;
//       } catch (error) {
//         if (error.code === 11000 && retries > 1) {
//           retries--;
//           continue;
//         }
//         throw error;
//       }
//     }

//     if (message) {
//       io.to(room).emit('chat message', message);
//       res.status(201).json(message);
//     } else {
//       throw new Error('Failed to create message after retries');
//     }
//   } catch (error) {
//     console.error('Message save error:', error);
//     res.status(500).json({
//       error: 'Error sending message',
//       details: error.message
//     });
//   }
// });

// // Delete Message
// app.delete('/messages/:id', authenticateToken, async (req, res) => {
//   try {
//     const message = await Message.findById(req.params.id);
//     if (!message) {
//       return res.status(404).json({ error: 'Message not found' });
//     }

//     if (message.user !== req.user.username) {
//       return res.status(403).json({ error: 'Not authorized to delete this message' });
//     }

//     await Message.findByIdAndDelete(req.params.id);
//     io.to(message.room).emit('message deleted', req.params.id);
//     res.json({ message: 'Message deleted successfully' });
//   } catch (error) {
//     console.error('Message deletion error:', error);
//     res.status(500).json({ error: 'Error deleting message' });
//   }
// });
// // Add these new endpoints to your existing server code

// // Join Room endpoint
// app.post('/rooms/:roomId/join', authenticateToken, async (req, res) => {
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

// // Modify the existing create room endpoint to include validation
// app.post('/rooms', authenticateToken, async (req, res) => {
//   try {
//     const { name, isPrivate, password } = req.body;

//     // Validate room name
//     if (!name || !name.trim()) {
//       return res.status(400).json({ error: 'Room name is required' });
//     }

//     // Check for duplicate room names
//     const existingRoom = await Room.findOne({ name: name.trim() });
//     if (existingRoom) {
//       return res.status(400).json({ error: 'Room name already exists' });
//     }

//     // Validate private room requirements
//     if (isPrivate && !password) {
//       return res.status(400).json({ error: 'Password is required for private rooms' });
//     }

//     const room = new Room({
//       name: name.trim(),
//       isPrivate,
//       password,
//       creator: req.user.username,
//       members: [req.user.username], // Initialize with creator as first member
//     });

//     await room.save();
    
//     // Don't send password in response
//     const roomResponse = room.toObject();
//     delete roomResponse.password;
    
//     res.status(201).json(roomResponse);
//   } catch (error) {
//     console.error('Room creation error:', error);
//     res.status(500).json({ error: 'Error creating room' });
//   }
// });

// // Update the GET rooms endpoint to include more information
// app.get('/rooms', authenticateToken, async (req, res) => {
//   try {
//     const rooms = await Room.find({})
//       .select('-password') // Exclude password from response
//       .sort('-createdAt'); // Sort by newest first
    
//     const roomsWithMemberCount = rooms.map(room => ({
//       ...room.toObject(),
//       memberCount: room.members?.length || 1,
//       isCreator: room.creator === req.user.username
//     }));

//     res.json(roomsWithMemberCount);
//   } catch (error) {
//     console.error('Room fetch error:', error);
//     res.status(500).json({ error: 'Error fetching rooms' });
//   }
// });

// // Socket.IO Connection
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join room', (roomName) => {
//     socket.join(roomName);
//     console.log(`User joined room: ${roomName}`);
//   });

//   socket.on('leave room', (roomName) => {
//     socket.leave(roomName);
//     console.log(`User left room: ${roomName}`);
//   });

//   socket.on('chat message', async (msg) => {
//     try {
//       let retries = 3;
//       let message;
      
//       while (retries > 0) {
//         try {
//           message = await createMessage(msg);
//           break;
//         } catch (error) {
//           if (error.code === 11000 && retries > 1) {
//             retries--;
//             continue;
//           }
//           throw error;
//         }
//       }

//       if (message) {
//         io.to(msg.room).emit('chat message', message);
//       }
//     } catch (error) {
//       socket.emit('message error', {
//         error: 'Failed to send message',
//         details: error.message
//       });
//     }
//   });
//   socket.on('delete message', async ({ messageId, user }) => {
//     try {
//       const message = await Message.findById(messageId);
//       if (!message) {
//         socket.emit('message error', { error: 'Message not found' });
//         return;
//       }
      
//       if (message.user !== user) {
//         socket.emit('message error', { error: 'Not authorized to delete this message' });
//         return;
//       }

//       await Message.findByIdAndDelete(messageId);
//       io.to(message.room).emit('message deleted', messageId);
//     } catch (error) {
//       socket.emit('message error', {
//         error: 'Failed to delete message',
//         details: error.message
//       });
//     }
//   });

//   socket.on('react to message', async ({ messageId, user, reaction }) => {
//     try {
//       const message = await Message.findById(messageId);
//       if (!message) {
//         socket.emit('message error', { error: 'Message not found' });
//         return;
//       }

//       const existingReactionIndex = message.reactions.findIndex(r => r.user === user);
//       if (existingReactionIndex !== -1) {
//         message.reactions[existingReactionIndex].reaction = reaction;
//       } else {
//         message.reactions.push({ user, reaction });
//       }

//       await message.save();
//       io.to(message.room).emit('message reacted', {
//         messageId,
//         reactions: message.reactions
//       });
//     } catch (error) {
//       socket.emit('message error', {
//         error: 'Failed to add reaction',
//         details: error.message
//       });
//     }
//   }); socket.on('play music', async ({ roomName, videoId, position }) => {
//     try {
//       const room = await Room.findOne({ name: roomName });
//       if (!room) return;

//       const playlist = await Playlist.findOne({ room: roomName });
//       if (!playlist) return;

//       playlist.currentSong = {
//         videoId,
//         startedAt: new Date(),
//         position: position || 0,
//         isPlaying: true
//       };

//       await playlist.save();
      
//       io.to(roomName).emit('music state changed', {
//         videoId,
//         position: position || 0,
//         isPlaying: true,
//         timestamp: new Date()
//       });

//       // Create system message about music playing
//       const message = await createMessage({
//         room: roomName,
//         user: 'System',
//         text: `🎵 Now playing: ${playlist.songs.find(s => s.videoId === videoId)?.title || 'Unknown song'}`
//       });
      
//       io.to(roomName).emit('chat message', message);
//     } catch (error) {
//       console.error('Error playing music:', error);
//     }
//   });
//   socket.on('skip music', async ({ roomName }) => {
//     try {
//       const playlist = await Playlist.findOne({ room: roomName });
//       if (!playlist || !playlist.currentSong) return;
  
//       const currentIndex = playlist.songs.findIndex(
//         song => song.videoId === playlist.currentSong.videoId
//       );
  
//       if (currentIndex !== -1 && currentIndex < playlist.songs.length - 1) {
//         const nextSong = playlist.songs[currentIndex + 1];
        
//         playlist.currentSong = {
//           videoId: nextSong.videoId,
//           startedAt: new Date(),
//           position: 0,
//           isPlaying: true
//         };
  
//         await playlist.save();
  
//         io.to(roomName).emit('music state changed', {
//           videoId: nextSong.videoId,
//           position: 0,
//           isPlaying: true,
//           timestamp: new Date()
//         });
  
//         // Create system message about skipped song
//         const message = await createMessage({
//           room: roomName,
//           user: 'System',
//           text: `⏭️ Skipped to: ${nextSong.title}`
//         });
        
//         io.to(roomName).emit('chat message', message);
//       }
//     } catch (error) {
//       console.error('Error skipping music:', error);
//     }
//   });
  
//   // Modify the existing play music handler to include more details
//   socket.on('play music', async ({ roomName, videoId, position }) => {
//     try {
//       const room = await Room.findOne({ name: roomName });
//       if (!room) return;
  
//       const playlist = await Playlist.findOne({ room: roomName });
//       if (!playlist) return;
  
//       const song = playlist.songs.find(s => s.videoId === videoId);
//       if (!song) return;
  
//       playlist.currentSong = {
//         videoId,
//         startedAt: new Date(),
//         position: position || 0,
//         isPlaying: true
//       };
  
//       await playlist.save();
      
//       io.to(roomName).emit('music state changed', {
//         videoId,
//         position: position || 0,
//         isPlaying: true,
//         timestamp: new Date()
//       });
  
//       const message = await createMessage({
//         room: roomName,
//         user: 'System',
//         text: `🎵 Now playing: ${song.title}`
//       });
      
//       io.to(roomName).emit('chat message', message);
//     } catch (error) {
//       console.error('Error playing music:', error);
//     }
//   });
//   socket.on('pause music', async ({ roomName, position }) => {
//     try {
//       const playlist = await Playlist.findOne({ room: roomName });
//       if (!playlist || !playlist.currentSong) return;

//       playlist.currentSong.isPlaying = false;
//       playlist.currentSong.position = position;
//       await playlist.save();

//       io.to(roomName).emit('music state changed', {
//         videoId: playlist.currentSong.videoId,
//         position,
//         isPlaying: false,
//         timestamp: new Date()
//       });

//       // Create system message about music being paused
//       const message = await createMessage({
//         room: roomName,
//         user: 'System',
//         text: '⏸️ Music paused'
//       });
      
//       io.to(roomName).emit('chat message', message);
//     } catch (error) {
//       console.error('Error pausing music:', error);
//     }
//   });

//   socket.on('seek music', async ({ roomName, position }) => {
//     try {
//       const playlist = await Playlist.findOne({ room: roomName });
//       if (!playlist || !playlist.currentSong) return;

//       playlist.currentSong.position = position;
//       playlist.currentSong.startedAt = new Date();
//       await playlist.save();

//       io.to(roomName).emit('music state changed', {
//         videoId: playlist.currentSong.videoId,
//         position,
//         isPlaying: playlist.currentSong.isPlaying,
//         timestamp: new Date()
//       });
//     } catch (error) {
//       console.error('Error seeking music:', error);
//     }
//   });

//   // Admin management events
//   socket.on('add admin', async ({ roomName, username }) => {
//     try {
//       const room = await Room.findOne({ name: roomName });
//       if (!room) return;

//       if (!room.admins.includes(username)) {
//         room.admins.push(username);
//         await room.save();
//         io.to(roomName).emit('admin added', { username });
//       }
//     } catch (error) {
//       console.error('Error adding admin:', error);
//     }
//   });

//   socket.on('add dj', async ({ roomName, username }) => {
//     try {
//       const room = await Room.findOne({ name: roomName });
//       if (!room) return;

//       if (!room.djs.includes(username)) {
//         room.djs.push(username);
//         await room.save();
//         io.to(roomName).emit('dj added', { username });
//       }
//     } catch (error) {
//       console.error('Error adding DJ:', error);
//     }
//   });
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// // Start Server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));