import Message from '../models/messageModel.js';
import user from '../models/userModel.js';
import Chat from '../models/chatModel.js';

export const sendMessage = async (req, res) => {
  const { chatId, message } = req.body;
  
  if (!chatId || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create the message
    let msg = await Message.create({
      sender: req.rootUserId,
      message,
      chatId
    });

    // Populate sender details
    msg = await msg.populate('sender', 'name profilePic email');

    // Populate chat details
    msg = await msg.populate({
      path: 'chatId',
      select: 'chatName isGroup users',
      model: 'Chat',
      populate: {
        path: 'users',
        select: 'name email profilePic',
        model: 'User'
      }
    });

    // Update chat's latest message
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: msg
    });

    res.status(200).json(msg);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  
  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required' });
  }

  try {
    const messages = await Message.find({ chatId })
      .populate('sender', 'name profilePic email')
      .populate({
        path: 'chatId',
        model: 'Chat',
        populate: {
          path: 'users',
          select: 'name email profilePic',
          model: 'User'
        }
      })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};
