import React, { useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { setShowProfile } from '../redux/profileSlice';
import { IoMdLogOut } from 'react-icons/io';
import InputEdit from './profile/InputEdit';
import { updateUser } from '../apis/auth';
import { toast } from 'react-toastify';
import { setUserNameAndBio, setProfilePic } from '../redux/activeUserSlice';

function Profile(props) {
  const dispatch = useDispatch();
  const { showProfile } = useSelector((state) => state.profile);
  const activeUser = useSelector((state) => state.activeUser);

  const [formData, setFormData] = useState({
    name: activeUser.name,
    bio: activeUser.bio,
    profilePic: activeUser.profilePic,
  });

  const logoutUser = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear local storage
      localStorage.removeItem('userToken');
      
      // Additional cleanup for any other tokens/state
      sessionStorage.clear(); // Clear any session storage
      
      toast.success('Logout Successful!');
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    dispatch(setUserNameAndBio(formData));
    await updateUser(activeUser.id, formData);
    toast.success('Updated!');
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setFormData((prev) => ({ ...prev, profilePic: base64 }));
      dispatch(setProfilePic(base64)); // ✅ Update Redux immediately
      await updateUser(activeUser.id, { ...formData, profilePic: base64 }); // ✅ Sync with backend
      toast.success('Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ transition: showProfile ? '0.3s ease-in-out' : '' }} className={`${props.className} overflow-y-auto`}>
      <div className="w-full">
        <div className="bg-[#166e48] pt-12 pb-3 px-4">
          <button onClick={() => dispatch(setShowProfile(false))} className="flex items-center">
            <IoArrowBack className="text-white w-6 h-5" />
            <h6 className="text-[16px] text-white font-semibold">Profile</h6>
          </button>
        </div>

        <div className="pt-5">
          <div className="flex flex-col items-center gap-2">
            <img className="w-[120px] h-[120px] rounded-full object-cover" src={formData.profilePic} alt="Profile Pic" />
            <label className="text-sm text-green-700 cursor-pointer font-medium">
              Change Photo
              <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
            </label>
          </div>

          <InputEdit type="name" handleChange={handleChange} input={formData.name} handleSubmit={submit} />

          <div className="py-5 px-4">
            <p className="text-[10px] tracking-wide text-[#3b4a54]">
              This is not your username or pin. This name will be visible to your contacts
            </p>
          </div>

          <InputEdit type="bio" handleChange={handleChange} input={formData.bio} handleSubmit={submit} />
        </div>

        <div onClick={logoutUser} className="flex items-center justify-center mt-5 cursor-pointer shadow-2xl">
          <IoMdLogOut className="text-[#e44d4d] w-[27px] h-[23px]" />
          <h6 className="text-[17px] text-[#e44d4d] font-semibold">Logout</h6>
        </div>
      </div>
    </div>
  );
}

export default Profile;

