import axios from 'axios';
import config from '../config/config';

const api = axios.create({
    baseURL: config.API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    googleLogin: (idToken) => api.post('/auth/google', { idToken }),
    getProfile: () => api.get('/users/me'),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};


export const packageService = {
    getAllPackages: () => api.get('/packages'),
    getPackageById: (id) => api.get(`/packages/${id}`)
};

export const partnerService = {
    getAllPartners: () => api.get('/admin/partners'),
    getPartnerById: (id) => api.get(`/admin/partners/${id}`)
};

export const menuService = {
    getAllMenus: () => api.get('/menus'),
    // New API: get menus for a specific partner
    getMenusByPartner: (partnerId) => api.get(`/menus/partners/${partnerId}`)
};

export const cartService = {
    getCart: () => api.get('/cart'),
    addToCart: (data) => api.post('/cart/items', data),
    addToCartBatch: (data) => api.post('/cart/items/batch', data),
    removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
    clearCart: () => api.delete('/cart/items'),
    checkout: (subscriptionId) => api.post(`/cart/orders?subscriptionId=${subscriptionId}`)
};

export const subscriptionService = {
    createSubscription: (data) => api.post('/subscriptions', data),
    getMySubscriptions: () => api.get('/subscriptions/my'),
    getSubscriptionById: (id) => api.get(`/subscriptions/${id}`)
};

export default api;
