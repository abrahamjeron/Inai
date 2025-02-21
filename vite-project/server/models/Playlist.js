import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  room: { type: String, required: true },
  roomId: { type: String, required: true },
  songs: [{
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: String,
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  currentSong: {
    videoId: String,
    startedAt: Date,
    position: Number,
    isPlaying: { type: Boolean, default: false }
  }
});

export default mongoose.model('Playlist', playlistSchema);