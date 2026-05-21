import axios from 'axios';

export const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const axiosInstance = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance; //
