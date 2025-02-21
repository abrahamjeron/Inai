import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  password: String,
  creator: { type: String, required: true },
  members: [String],
  admins: [String],
  djs: [String],
  musicEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Room', roomSchema);