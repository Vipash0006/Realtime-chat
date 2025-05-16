import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatProvider = ({ children }) => {
  const socket = useRef(null);
  const [user, setUser] = React.useState(null);
  const [selectedChat, setSelectedChat] = React.useState(null);
  const [chats, setChats] = React.useState([]);
  const [socketConnected, setSocketConnected] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  useEffect(() => {
    if (user) {
      socket.current = io(ENDPOINT);
      socket.current.emit('setup', user);
      socket.current.on('connected', () => setSocketConnected(true));
      socket.current.on('typing', () => setIsTyping(true));
      socket.current.on('stop typing', () => setIsTyping(false));

      // Listen for profile updates
      socket.current.on('profile updated', (data) => {
        if (data.userId === user._id) {
          // Update local user data
          setUser(data.updatedData);
        }
        // Update user in selected chat if it exists
        if (selectedChat && selectedChat.users) {
          const updatedUsers = selectedChat.users.map(u => 
            u._id === data.userId ? data.updatedData : u
          );
          setSelectedChat({ ...selectedChat, users: updatedUsers });
        }
        // Update user in chats list
        setChats(prevChats => 
          prevChats.map(chat => ({
            ...chat,
            users: chat.users.map(u => 
              u._id === data.userId ? data.updatedData : u
            )
          }))
        );
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off('connected');
        socket.current.off('typing');
        socket.current.off('stop typing');
        socket.current.off('profile updated');
      }
    };
  }, [user]);

  return (
    <div>
      {/* Rest of the component content */}
    </div>
  );
};

export default ChatProvider; 