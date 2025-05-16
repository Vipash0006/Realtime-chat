import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../context/ChatProvider';
import { sendMessage as sendMessageAPI } from '../apis/message';
import { uploadMedia } from '../apis/media';
import { toast } from 'react-toastify';

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { selectedChat, user, socket, setMessages, messages } = useChat();
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4) are allowed.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadMedia(formData);
      
      if (response?.url) {
        // Send message with media URL
        const messageResponse = await sendMessageAPI({
          content: response.url,
          chatId: selectedChat._id,
          isMedia: true,
          mediaType: file.type.startsWith('image/') ? 'image' : 'video'
        });

        if (messageResponse) {
          setMessages([...messages, messageResponse]);
          socket.current.emit('new message', messageResponse);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await sendMessageAPI({
        content: newMessage,
        chatId: selectedChat._id
      });

      if (response) {
        setMessages([...messages, response]);
        setNewMessage('');
        socket.current.emit('new message', response);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="input-wrapper">
          <button 
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width="300px"
                height="400px"
              />
            </div>
          )}
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/gif,video/mp4"
            style={{ display: 'none' }}
          />
          <button 
            type="button"
            className="media-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? '📤' : '📎'}
          </button>
          <button type="submit" disabled={isUploading}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 