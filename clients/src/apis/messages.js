import axios from 'axios';

const API = (token) =>
  axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL || 'http://localhost:8000',
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendMessage = async (body) => {
  try {
    if (!body || !body.chatId || !body.message) {
      throw new Error('Invalid message body');
    }
    
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await API(token).post('/api/message/', body);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error) {
    console.error('Error in sendMessage API:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to send message');
    }
    throw error;
  }
};

export const fetchMessages = async (id) => {
  try {
    if (!id) {
      throw new Error('No chat ID provided');
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const { data } = await API(token).get(`/api/message/${id}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchMessages API:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return [];
  }
};
