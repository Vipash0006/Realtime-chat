import React, { useState, useEffect } from 'react';
import { BsPlusLg } from 'react-icons/bs';
import { Modal, Box } from '@mui/material';
import { searchUsers } from '../apis/auth';
import { RxCross2 } from 'react-icons/rx';
import { createGroup } from '../apis/chat';
import { fetchChats } from '../redux/chatsSlice';
import { useDispatch } from 'react-redux';
import Search from './group/Search';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  maxHeight: '80vh',
  overflowY: 'auto'
};

function Group() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUsers] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearch('');
    setSearchResults([]);
    setSelectedUsers([]);
  };

  const handleFormSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  const handleClick = (e) => {
    if (selectedUser.some(user => user._id === e._id)) return;
    setSelectedUsers([...selectedUser, e]);
    setSearch('');
    setSearchResults([]);
  };

  const deleteSelected = (ele) => {
    setSelectedUsers(selectedUser.filter((e) => e._id !== ele._id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser.length >= 2) {
      try {
        await createGroup({
          chatName,
          users: JSON.stringify(selectedUser.map((e) => e._id)),
        });
        dispatch(fetchChats());
        handleClose();
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  useEffect(() => {
    const searchChange = async () => {
      if (!search) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await searchUsers(search);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchChange();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <>
      <div
        className="mt-1 cursor-pointer flex justify-start border-r-2 text-[11px] font-normal tracking-wide items-center gap-x-1 bg-[#f6f6f6] text-[#1f2228] py-1 -mb-7 mt-2 px-2 transition duration-150 ease-in-out"
        onClick={handleOpen}
      >
        New Group <BsPlusLg />
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h5 className="text-[18px] text-[#111b21] font-medium text-center">Create A Group</h5>

          <form onSubmit={handleSubmit} className="flex flex-col gap-y-3 mt-3">
            <input
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="border-[#c4ccd5] border-[1px] text-[13.5px] py-[4px] px-2 w-[100%]"
              type="text"
              name="chatName"
              placeholder="Group Name"
              required
            />
            <input
              value={search}
              onChange={handleFormSearch}
              className="border-[#c4ccd5] border-[1px] text-[13.5px] py-[4px] px-2 w-[100%]"
              type="text"
              name="users"
              placeholder="Add users"
            />

            <div className="flex -mt-2 flex-wrap gap-y-1">
              {selectedUser?.map((e) => (
                <div
                  key={e._id}
                  onClick={() => deleteSelected(e)}
                  className="flex items-center gap-x-1 bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-green-400 cursor-pointer"
                >
                  <span>{e.name}</span>
                  <RxCross2 />
                </div>
              ))}
            </div>

            <Search
              isLoading={isLoading}
              handleClick={handleClick}
              search={search}
              searchResults={searchResults}
            />

            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="bg-[#0086ea] text-[#fff] text-[15px] font-medium px-2 py-1 tracking-wide"
              >
                Create
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
}

export default Group;
