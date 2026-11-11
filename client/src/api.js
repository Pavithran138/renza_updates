import axios from 'axios';

// This automatically detects if you are testing on your computer or on the live website
const isLocal = window.location.hostname === "localhost";

const API_URL = isLocal 
  ? 'http://localhost:5000/api' 
  : 'https://renza-updates.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;