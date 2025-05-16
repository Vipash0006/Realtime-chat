import API from './api';
import { toast } from 'react-toastify';

const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000';

// Base axios instance
const APIInstance = (token) =>
  API.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Login User
export const loginUser = async (userData) => {
  try {
    const { data } = await API().post(`/auth/login`, userData);
    return data;
  } catch (error) {
    console.log('Error in loginUser API:', error);
    throw error;
  }
};

// Register User
export const registerUser = async (userData) => {
  try {
    const { data } = await API().post(`/auth/register`, userData);
    return data;
  } catch (error) {
    console.log('Error in registerUser API:', error);
    throw error;
  }
};

// Check Valid User
export const validUser = async () => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) return null;

    const { data } = await API(token).get(`/auth/valid`);
    return data;
  } catch (error) {
    console.log('Error in validUser API:', error);
    return null;
  }
};

// Google Auth
export const googleAuth = async (tokenId) => {
  try {
    const { data } = await API().post(`/auth/google`, { tokenId });
    return data;
  } catch (error) {
    console.log('Error in googleAuth API:', error);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) return null;

    const { data } = await API(token).get(`/auth/logout`);
    return data;
  } catch (error) {
    console.log('Error in logoutUser API:', error);
    throw error;
  }
};

// Search Users
export const searchUsers = async (searchQuery) => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) return [];

    const { data } = await API(token).get(`/user?search=${searchQuery}`);
    return data || [];
  } catch (error) {
    console.log('Error in searchUsers API:', error);
    return [];
  }
};

// Update User Info
export const updateUser = async (id, body) => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error('Please login again');
      return null;
    }

    const api = API(token);
    const response = await api.patch(`/users/update/${id}`, body);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in updateUser API:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      
      if (error.response.status === 403) {
        toast.error('You are not authorized to update this profile');
      } else if (error.response.status === 401) {
        toast.error('Please login again');
        // Optionally redirect to login
        window.location.href = '/login';
      } else {
        toast.error(error.response.data.message || 'Failed to update profile');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('Server not responding. Please try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      toast.error('Network error. Please try again.');
    }
    
    return null;
  }
};

// Check and Redirect
export const checkValid = async () => {
  const data = await validUser();
  if (!data?.user) {
    window.location.href = '/login';
  } else {
    window.location.href = '/chats';
  }
};
