import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import session from "express-session";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import { setupSocketHandlers } from "./socket/socketHandlers.js";
import passport from "./middleware/passportConfig.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://inai-1.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// Export io to use in other routes
export { io };

// Middleware
app.use(cors({ origin: "https://inai-1.onrender.com", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/playlist", playlistRoutes);
app.use("/messages", messageRoutes);
app.use("/users",userRoutes)

// Database Connection
connectDB();

// Setup Socket.io handlers
setupSocketHandlers(io);

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
