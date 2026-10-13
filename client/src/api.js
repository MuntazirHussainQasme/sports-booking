import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorText = (err) => err.response?.data?.message || 'Could not reach the server';

// Dates are "YYYY-MM-DD" strings and times "HH:00", matching the API.
export const today = () => new Date().toLocaleDateString('en-CA');
export const money = (n) => `Rs ${Number(n).toLocaleString('en-PK')}`;
export const hourOf = (t) => parseInt(t, 10);
export const fmtHour = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? ' AM' : ' PM'}`;
export const fmtTime = (t) => fmtHour(hourOf(t));
export const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export default api;
