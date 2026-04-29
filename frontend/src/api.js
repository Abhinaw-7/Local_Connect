import axios from 'axios';

const API = axios.create({
  baseURL: 'https://local-connect-4.onrender.com/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor for easier debugging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
