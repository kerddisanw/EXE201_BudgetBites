import axios from 'axios';
import config from '../config/config';

const api = axios.create({
    baseURL: config.API_URL,
    // Prevent "loading forever" when backend/network is unreachable.
    timeout: 20000,
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
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';

        // For protected APIs: if token is invalid/expired, force logout
        if (status === 401 && !requestUrl.includes('/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // For login (and other) errors, let the caller handle the message
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
    getMySubscriptions: () => api.get('/subscriptions/me'),
    getSubscriptionById: (id) => api.get(`/subscriptions/${id}`),
    cancelSubscription: (id) => api.post(`/subscriptions/${id}/cancel`)
};

export const orderService = {
    getOrdersBySubscription: (subscriptionId) =>
        api.get(`/orders/subscriptions/${subscriptionId}`),
    getOrderById: (orderId) => api.get(`/orders/${orderId}`)
};

export const paymentService = {
    createPayOSCheckout: (subscriptionId) =>
        api.post(`/payments/payos/checkout?subscriptionId=${subscriptionId}`),
    createCartPayOSCheckout: (discountCode) => {
        const q =
            discountCode && String(discountCode).trim()
                ? `?discountCode=${encodeURIComponent(String(discountCode).trim())}`
                : '';
        return api.post(`/payments/payos/checkout-cart${q}`);
    }
};

/** Mã giảm giá — GET /discounts/preview/{code} returns details when valid */
export const discountService = {
    previewDiscount: (code) => api.get(`/discounts/preview/${encodeURIComponent(String(code).trim())}`)
};

export const feedbackService = {
    getFeedbacksByPartner: (partnerId) => api.get(`/feedbacks/partners/${partnerId}`),
    getMyEligibilityForPartner: (partnerId) =>
        api.get(`/feedbacks/partners/${partnerId}/eligibility`),
    createFeedback: (data) => api.post('/feedbacks', data)
};

/** AI Meal Assistant — POST body: { message: string } */
export const chatbotService = {
    sendMessage: (message) =>
        api.post('/chatbot', { message }, { timeout: 60000 })
};

export default api;
