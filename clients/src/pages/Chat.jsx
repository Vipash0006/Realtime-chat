import { socket } from '../utils/socket';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Model from '../components/Model';
import { BsEmojiSmile, BsFillEmojiSmileFill } from 'react-icons/bs';
import { fetchMessages, sendMessage } from '../apis/messages';
import MessageHistory from '../components/MessageHistory';
import Loading from '../components/ui/Loading';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { getChatName } from '../utils/logics';
import Typing from '../components/ui/Typing';
import { fetchChats, setNotifications } from '../redux/chatsSlice';
import { validUser } from '../apis/auth';
import axios from 'axios';
import './home.css';

let selectedChatCompare = null;

function Chat(props) {
  const { activeChat, notifications } = useSelector((state) => state.chats);
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const activeUser = useSelector((state) => state.activeUser);

  useEffect(() => {
    if (!activeUser) return;
    socket.emit('setup', activeUser);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
    socket.on('message received', (newMessage) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessage.chatId?._id) {
        if (!notifications.find((n) => n._id === newMessage._id)) {
          dispatch(setNotifications([newMessage, ...notifications]));
        }
      } else {
        setMessages((prev) => [...(prev || []), newMessage]);
      }
      dispatch(fetchChats());
    });

    return () => {
      socket.off('connected');
      socket.off('typing');
      socket.off('stop typing');
      socket.off('message received');
    };
  }, [dispatch, activeUser, notifications, selectedChatCompare]);

  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (!activeChat?._id) return;
      setLoading(true);
      const data = await fetchMessages(activeChat._id);
      setMessages(data || []);
      socket.emit('join room', activeChat._id);
      selectedChatCompare = activeChat;
      setLoading(false);
    };
    fetchMessagesFunc();
  }, [activeChat]);

  useEffect(() => {
    const isValid = async () => {
      const data = await validUser();
      if (!data?.user) window.location.href = '/login';
    };
    isValid();
  }, []);

  const keyDownFunction = async (e) => {
    try {
      if ((e.key === 'Enter' || e.type === 'click') && message.trim()) {
        e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        
        // Create a backup of the message before clearing input
        const messageToSend = message.trim();
        setMessage('');
        
        // Stop typing indicator
        socket.emit('stop typing', activeChat._id);
        
        // Send message to server
        const data = await sendMessage({ 
          chatId: activeChat._id, 
          message: messageToSend 
        });
        
        if (!data) {
          throw new Error('Failed to send message - server returned null/undefined');
        }
        
        // Emit socket event for real-time updates
        socket.emit('new message', data);
        
        // Update UI
        setMessages(prevMessages => [...(prevMessages || []), data]);
        dispatch(fetchChats());
      }
    } catch (error) {
      console.error('Error in keyDownFunction:', error);
      // Restore the message if sending failed
      if (message.trim()) {
        setMessage(message.trim());
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat?._id) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const { data } = await axios.post(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:8000'}/api/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data || !data.url) {
        console.error('Invalid response from media upload');
        return;
      }

      const msg = await sendMessage({
        chatId: activeChat._id,
        message: '',
        media: data.url, // Cloudinary URL
      });

      socket.emit('new message', msg);
      setMessages((prev = []) => [...prev, msg]);
      dispatch(fetchChats());
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  if (loading) return <div className={props.className}><Loading /></div>;

  return (
    <>
      {activeChat ? (
        <div className={`flex flex-col justify-between w-full h-full bg-white ${props.className}`}>
          {/* Header */}
          <div className='flex justify-between items-center px-4 py-2 shadow-md border-b'>
            <div className='flex items-center gap-x-2'>
              <div className='flex flex-col'>
                <h5 className='text-base font-semibold text-gray-800'>{getChatName(activeChat, activeUser)}</h5>
              </div>
            </div>
            <Model />
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-3 relative'>
            <MessageHistory typing={isTyping} messages={messages} />
            {isTyping && <div className='ml-4 absolute bottom-16'><Typing width='100' height='100' /></div>}
          </div>

          {/* Input */}
          <div className='w-full max-w-2xl mx-auto px-4 pb-5'>
            {showPicker && (
              <div className='mb-2'><Picker data={data} onEmojiSelect={(e) => setMessage((prev) => prev + e.native)} /></div>
            )}
            <div className='flex border rounded-lg overflow-hidden shadow-sm'>
              <div className='flex items-center px-3 bg-gray-100 gap-2'>
                <label className='cursor-pointer'>
                  📎
                  <input type='file' accept='image/*,video/*' className='hidden' onChange={handleFileUpload} />
                </label>
                <button type="button" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPicker(!showPicker);
                }} className='text-gray-600 hover:text-yellow-500'>
                  {showPicker ? <BsFillEmojiSmileFill className='w-5 h-5' /> : <BsEmojiSmile className='w-5 h-5' />}
                </button>
              </div>
              <form 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    keyDownFunction(e);
                    return false;
                  }
                }} 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }} 
                className='flex-1'
              >
                <input
                  type='text'
                  placeholder='Enter message'
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (!socketConnected || !activeChat?._id) return;
                    if (!typing) {
                      setTyping(true);
                      socket.emit('typing', activeChat._id);
                    }
                    let lastTypingTime = new Date().getTime();
                    setTimeout(() => {
                      const now = new Date().getTime();
                      const timeDiff = now - lastTypingTime;
                      if (timeDiff >= 3000 && typing) {
                        socket.emit('stop typing', activeChat._id);
                        setTyping(false);
                      }
                    }, 3000);
                  }}
                  className='w-full p-2 text-sm outline-none bg-white'
                />
              </form>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  keyDownFunction({ type: 'click' });
                }}
                className='bg-blue-500 text-white text-sm px-4 py-2 hover:bg-blue-600'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex justify-center items-center h-full ${props.className}`}>
          <div className='text-center'>
            <img className='w-16 h-16 mx-auto rounded-full mb-2' src={activeUser?.profilePic} alt='User' />
            <h3 className='text-lg font-medium text-gray-800'>Welcome <span className='text-green-600 font-bold'>{activeUser?.name}</span></h3>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;

