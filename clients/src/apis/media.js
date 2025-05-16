import API from './api';

export const uploadMedia = async (formData) => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('Please login again');
    }

    const response = await API(token).post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    throw error;
  }
}; 