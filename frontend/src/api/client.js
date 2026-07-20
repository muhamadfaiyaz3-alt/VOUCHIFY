import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://smart-voucher-exchange-platform-1.onrender.com/api'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
client.interceptors.request.use(
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

// Add a response interceptor to handle 401 errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if needed
            // But avoid infinite loops if already on login
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('auth:unauthorized'));
                // window.location.href = '/login'; // Optional: force redirect
            }
        }
        return Promise.reject(error);
    }
);

export default client;
