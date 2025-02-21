import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
  reactions: [{
    user: { type: String },
    reaction: { type: String }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Message', messageSchema);