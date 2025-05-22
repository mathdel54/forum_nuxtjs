// services/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api', // Base URL for all API requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Define API functions
export const getTopics = async (forumId) => {
  const response = await api.get(`/forums/${forumId}/topics`);
  return response.data;
};

export const getTopic = async (topicId) => {
  const response = await api.get(`/topics/${topicId}`);
  return response.data;
};

export const postMessage = async (topicId, content) => {
  const response = await api.post('/messages', { topic_id: topicId, content });
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

export const deleteTopic = async (topicId) => {
  const response = await api.delete(`/topics/${topicId}`);
  return response.data;
};


// Export the API instance for custom requests if needed
export default api;