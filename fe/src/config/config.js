const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Pick backend API URL based on where the FE is running.
// This prevents "login can't work" when VITE_API_URL points to the old Render backend.
const resolveApiUrl = () => {
    const host = window.location.hostname;

    // Local dev (frontend -> BE)
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8080/api';

    // Deployed FE domain
    if (host.includes('exe201-budgetbites-1')) return 'https://exe201-budgetbites-1.onrender.com/api';

    // Fallback to previous deployed backend
    return 'https://exe201-budgetbites.onrender.com/api';
};

const API_URL = resolveApiUrl();

export default {
    API_URL,
    GOOGLE_CLIENT_ID
};

