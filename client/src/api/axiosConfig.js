import axios from 'axios';

// Get API URL from environment
// Development: VITE_API_URL is empty, so axios will use relative paths and Vite proxy handles it
// Production: VITE_API_URL is the full backend URL
const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with baseURL
const axiosInstance = axios.create({
    baseURL: API_URL || undefined, // Use Vite proxy in development (empty string -> undefined)
    withCredentials: true, // Include cookies if needed
});

// Optional: Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Handle unauthorized - clear tokens
            localStorage.removeItem('userToken');
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
