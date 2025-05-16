// Home.jsx (Final Corrected)
import { socket } from '../utils/socket';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, validUser } from '../apis/auth';
import { setActiveUser } from '../redux/activeUserSlice';
import { RiNotificationBadgeFill } from 'react-icons/ri';
import { BsSearch } from 'react-icons/bs';
import { BiNotification } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';
import { setShowNotifications, setShowProfile } from '../redux/profileSlice';
import Chat from './Chat';
import Profile from '../components/Profile';
import { acessCreate } from '../apis/chat';
import './home.css';
import { fetchChats, setNotifications } from '../redux/chatsSlice';
import { getSender } from '../utils/logics';
import { setActiveChat } from '../redux/chatsSlice';
import Group from '../components/Group';
import Contacts from '../components/Contacts';
import Search from '../components/group/Search';
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';

function Home() {
  const dispatch = useDispatch();
  const { showProfile, showNotifications } = useSelector((state) => state.profile);
  const { notifications } = useSelector((state) => state.chats);
  const { activeUser } = useSelector((state) => state);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const data = await validUser();
      if (!data?.user) return (window.location.href = '/login');

      const user = {
        id: data.user._id,
        email: data.user.email,
        profilePic: data.user.profilePic,
        bio: data.user.bio,
        name: data.user.name,
      };
      dispatch(setActiveUser(user));
    };
    checkUser();
  }, [dispatch]);

  useEffect(() => {
    if (!activeUser?.id) return;

    socket.emit('setup', activeUser);
    socket.on('connected', () => console.log('✅ Socket Connected'));

    return () => {
      socket.off('connected');
    };
  }, [activeUser]);

  const handleSearch = (e) => setSearch(e.target.value);

  useEffect(() => {
    const fetchResults = async () => {
      if (!search) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await searchUsers(search);
        setSearchResults(response || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [search]);

  const handleClick = async (e) => {
    try {
      await acessCreate({ userId: e._id });
      dispatch(fetchChats());
      setSearch('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="bg-[#282C35!] scrollbar-hide z-10 h-[100vh] lg:w-[90%] lg:mx-auto overflow-y-hidden shadow-2xl">
      <div className="flex flex-col md:flex-row h-full">
        {!showProfile ? (
          <div className="w-full md:w-[360px] h-[100vh] bg-[#ffff] relative flex-shrink-0">
            {/* Top header */}
            <div className="h-[61px] px-4 flex justify-between items-center">
              <a className="flex items-center relative top-1" href="/">
                <h3 className="text-[20px] text-[#1f2228] font-extrabold tracking-wider">Messages</h3>
              </a>
              <div className="flex items-center gap-x-3">
                <button onClick={() => dispatch(setShowNotifications(!showNotifications))}>
                  <NotificationBadge count={notifications.length} effect={Effect.SCALE} style={{ width: '15px', height: '15px', fontSize: '9px' }} />
                  {showNotifications ? <RiNotificationBadgeFill className="w-6 h-6 text-green-600" /> : <BiNotification className="text-green-600 w-6 h-6" />}
                </button>
                <div onClick={() => dispatch(setShowProfile(true))} className="cursor-pointer flex items-center gap-1">
                  <img className="w-7 h-7 rounded-full" src={activeUser?.profilePic} alt="profile" />
                  <IoIosArrowDown className="text-gray-500 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="px-4 relative">
              <form onSubmit={(e) => e.preventDefault()}>
                <input value={search} onChange={handleSearch} className="w-full bg-[#f6f6f6] text-[#111b21] pl-9 py-2 rounded-lg" placeholder="Search" />
                <BsSearch className="absolute top-4 left-8 text-gray-400" />
              </form>
            </div>

            {/* Search Results */}
            {search && (
              <div className="absolute top-[70px] w-full bg-white z-10 p-3">
                <Search searchResults={searchResults} isLoading={isLoading} handleClick={handleClick} search={search} />
              </div>
            )}

            <Group />
            <Contacts />
          </div>
        ) : (
          <Profile className="w-full md:w-[360px] h-[100vh] bg-[#fafafa]" />
        )}

        <div className="flex-1 h-full">
          <Chat className="chat-page relative w-full h-full bg-[#fafafa]" />
        </div>
      </div>
    </div>
  );
}

export default Home;
