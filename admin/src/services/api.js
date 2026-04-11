import axios from 'axios';
import { API_URL } from '../config/config';

const api = axios.create({
    baseURL: API_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (cfg) => {
        const token = localStorage.getItem('token');
        if (token) {
            cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';
        if (status === 401 && !requestUrl.includes('/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export default api;
