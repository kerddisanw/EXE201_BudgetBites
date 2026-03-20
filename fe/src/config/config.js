const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Pick backend API URL.
// 1) Prefer build-time `VITE_API_URL` if provided (most reliable).
// 2) Otherwise, infer from hostname so it works across environments.
const resolveApiUrl = () => {
    const host = window.location.hostname;

    // Local dev (frontend -> BE)
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8080/api';

    // Deployed FE domain
    if (host.includes('exe201-budgetbites-1')) return 'https://exe201-budgetbites-1.onrender.com/api';

    // Fallback to previous deployed backend
    return 'https://exe201-budgetbites.onrender.com/api';
};

const API_URL = import.meta.env.VITE_API_URL || resolveApiUrl();

export default {
    API_URL,
    GOOGLE_CLIENT_ID
};

