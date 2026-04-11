const resolveApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, '');
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        // Vite dev server proxies /api → Render (see admin/vite.config.js); avoids browser CORS.
        return '/api';
    }
    if (host.includes('exe201-budgetbites-1')) {
        return 'https://exe201-budgetbites.onrender.com/api';
    }
    return 'https://exe201-budgetbites.onrender.com/api';
};

const resolveCustomerAppUrl = () => {
    const raw = import.meta.env.VITE_CUSTOMER_APP_URL || '';
    if (raw) return raw.replace(/\/$/, '');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5173';
    }
    return 'https://exe201-budgetbites-1.onrender.com';
};

export const API_URL = resolveApiUrl();
export const CUSTOMER_APP_URL = resolveCustomerAppUrl();

export default {
    API_URL,
    CUSTOMER_APP_URL
};
