const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/** Spring Boot API on Render (different service from static FE `…-1…`). */
const DEFAULT_RENDER_API = 'https://exe201-budgetbites.onrender.com/api';

function isStaticCustomerHost(hostname) {
    return (hostname || '').toLowerCase().includes('exe201-budgetbites-1');
}

/**
 * When the customer app is served from the static Render URL, relative `/api` or
 * same-host `https://…-1…/api` hits the static site (no Spring) → 403. Force the real API host.
 */
const resolveApiUrl = () => {
    const pageHost = typeof window !== 'undefined' ? window.location.hostname : '';
    const pageHostLower = (pageHost || '').toLowerCase();

    const fromEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

    if (pageHostLower === 'localhost' || pageHostLower === '127.0.0.1') {
        const local = (import.meta.env.VITE_DEV_API_URL || '').trim().replace(/\/$/, '');
        return local || DEFAULT_RENDER_API;
    }

    if (isStaticCustomerHost(pageHost)) {
        if (
            fromEnv &&
            fromEnv.includes('exe201-budgetbites.onrender.com') &&
            !fromEnv.toLowerCase().includes('budgetbites-1')
        ) {
            return fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
        }
        return DEFAULT_RENDER_API;
    }

    if (fromEnv) {
        if (fromEnv.startsWith('http://') || fromEnv.startsWith('https://')) return fromEnv;
        return `https://${fromEnv}`;
    }

    return DEFAULT_RENDER_API;
};

const API_URL = resolveApiUrl();

export default {
    API_URL,
    GOOGLE_CLIENT_ID
};
