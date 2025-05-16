import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, trim: true },
  media: { type: String }, // ✅ Add this
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
}, { timestamps: true });

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
