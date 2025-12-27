import axios from 'axios';

// Create a centralized Axios instance
// VITE_API_BASE_URL should be set in environment variables (e.g., in Vercel)
// Defaults to localhost for local development
const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/v1';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
