import axios from 'axios';

// Get API URL from environment or use current origin as fallback
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Create axios instance with baseURL
const axiosInstance = axios.create({
    baseURL: API_URL,
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
