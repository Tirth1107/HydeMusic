const getApiBaseUrl = () => {
    // If we're on Vercel or a production domain, use the current origin with /api
    if (typeof window !== 'undefined') {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return '/api';
        }
    }
    // Local development fallback
    return 'http://127.0.0.1:5001';
};

export const API_BASE_URL = getApiBaseUrl();
