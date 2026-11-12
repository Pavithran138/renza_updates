import axios from 'axios';

// This automatically checks if you are on your local computer
const isLocal = window.location.hostname === "localhost";

const api = axios.create({
  // If local, talk to local backend. If live on Vercel, talk to live Render.
  baseURL: isLocal ? 'http://localhost:5000/api' : 'https://renza-updates.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;