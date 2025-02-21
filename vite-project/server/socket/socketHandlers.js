import Message from "../models/Message.js";
import Room from "../models/Room.js";
import Playlist from "../models/Playlist.js";

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join room', (roomName) => {
      socket.join(roomName);
      console.log(`User joined room: ${roomName}`);
    });

    // Leave a room
    socket.on('leave room', (roomName) => {
      socket.leave(roomName);
      console.log(`User left room: ${roomName}`);
    });

    // Handle chat messages
    socket.on('chat message', async (msg) => {
      try {
        const message = new Message(msg);
        await message.save();
        io.to(msg.room).emit('chat message', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Delete a message
    socket.on('delete message', async ({ messageId, user }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('message error', { error: 'Message not found' });
          return;
        }

        if (message.user !== user) {
          socket.emit('message error', { error: 'Not authorized to delete this message' });
          return;
        }

        await Message.findByIdAndDelete(messageId);
        io.to(message.room).emit('message deleted', messageId);
      } catch (error) {
        socket.emit('message error', { error: 'Failed to delete message', details: error.message });
      }
    });

    // React to a message
    socket.on('react to message', async ({ messageId, user, reaction }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('message error', { error: 'Message not found' });
          return;
        }

        const existingReactionIndex = message.reactions.findIndex(r => r.user === user);
        if (existingReactionIndex !== -1) {
          message.reactions[existingReactionIndex].reaction = reaction;
        } else {
          message.reactions.push({ user, reaction });
        }

        await message.save();
        io.to(message.room).emit('message reacted', {
          messageId,
          reactions: message.reactions
        });
      } catch (error) {
        socket.emit('message error', { error: 'Failed to add reaction', details: error.message });
      }
    });

    // Play music
    socket.on('play music', async ({ roomName, videoId, position }) => {
      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) return;

        const playlist = await Playlist.findOne({ room: roomName });
        if (!playlist) return;

        const song = playlist.songs.find(s => s.videoId === videoId);
        if (!song) return;

        playlist.currentSong = {
          videoId,
          startedAt: new Date(),
          position: position || 0,
          isPlaying: true
        };

        await playlist.save();

        io.to(roomName).emit('music state changed', {
          videoId,
          position: position || 0,
          isPlaying: true,
          timestamp: new Date()
        });

        const message = await Message.create({
          room: roomName,
          user: 'System',
          text: `🎵 Now playing: ${song.title}`
        });

        io.to(roomName).emit('chat message', message);
      } catch (error) {
        console.error('Error playing music:', error);
      }
    });

    // Pause music
    socket.on('pause music', async ({ roomName, position }) => {
      try {
        const playlist = await Playlist.findOne({ room: roomName });
        if (!playlist || !playlist.currentSong) return;

        playlist.currentSong.isPlaying = false;
        playlist.currentSong.position = position;
        await playlist.save();

        io.to(roomName).emit('music state changed', {
          videoId: playlist.currentSong.videoId,
          position,
          isPlaying: false,
          timestamp: new Date()
        });

        const message = await Message.create({
          room: roomName,
          user: 'System',
          text: '⏸️ Music paused'
        });

        io.to(roomName).emit('chat message', message);
      } catch (error) {
        console.error('Error pausing music:', error);
      }
    });

    // Skip music
    socket.on('skip music', async ({ roomName }) => {
      try {
        const playlist = await Playlist.findOne({ room: roomName });
        if (!playlist || !playlist.currentSong) return;

        const currentIndex = playlist.songs.findIndex(
          song => song.videoId === playlist.currentSong.videoId
        );

        if (currentIndex !== -1 && currentIndex < playlist.songs.length - 1) {
          const nextSong = playlist.songs[currentIndex + 1];

          playlist.currentSong = {
            videoId: nextSong.videoId,
            startedAt: new Date(),
            position: 0,
            isPlaying: true
          };

          await playlist.save();

          io.to(roomName).emit('music state changed', {
            videoId: nextSong.videoId,
            position: 0,
            isPlaying: true,
            timestamp: new Date()
          });

          const message = await Message.create({
            room: roomName,
            user: 'System',
            text: `⏭️ Skipped to: ${nextSong.title}`
          });

          io.to(roomName).emit('chat message', message);
        }
      } catch (error) {
        console.error('Error skipping music:', error);
      }
    });

    // Seek music
    socket.on('seek music', async ({ roomName, position }) => {
      try {
        const playlist = await Playlist.findOne({ room: roomName });
        if (!playlist || !playlist.currentSong) return;

        playlist.currentSong.position = position;
        playlist.currentSong.startedAt = new Date();
        await playlist.save();

        io.to(roomName).emit('music state changed', {
          videoId: playlist.currentSong.videoId,
          position,
          isPlaying: playlist.currentSong.isPlaying,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error seeking music:', error);
      }
    });

    // Add admin
    socket.on('add admin', async ({ roomName, username }) => {
      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) return;

        if (!room.admins.includes(username)) {
          room.admins.push(username);
          await room.save();
          io.to(roomName).emit('admin added', { username });
        }
      } catch (error) {
        console.error('Error adding admin:', error);
      }
    });

    // Add DJ
    socket.on('add dj', async ({ roomName, username }) => {
      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) return;

        if (!room.djs.includes(username)) {
          room.djs.push(username);
          await room.save();
          io.to(roomName).emit('dj added', { username });
        }
      } catch (error) {
        console.error('Error adding DJ:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};