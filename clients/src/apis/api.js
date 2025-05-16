import axios from 'axios';

const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000';

const API = (token) => {
  const headers = token ? { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  } : {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  return axios.create({
    baseURL: url,
    headers,
    withCredentials: true,
    timeout: 10000, // 10 second timeout
    validateStatus: function (status) {
      return status >= 200 && status < 500; // Accept all status codes less than 500
    }
  });
};

export default API; 