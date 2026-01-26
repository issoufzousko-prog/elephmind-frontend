/**
 * Centralized API Configuration
 * Ensures robust handling of the backend URL across all environments (Dev/Prod).
 */

// Priority:
// 1. Environment Variable (VITE_API_URL) - Set in Vercel/Netlify
// 2. Default Localhost - Only for local development
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8022';

/**
 * Helper to get auth headers securely
 * @returns {Object} Headers object with Authorization token if present
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
};

/**
 * Handle API errors consistently
 * @param {Response} response 
 * @returns {Promise<any>}
 */
export const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Auto-logout or redirection could be handled here
            console.warn('Unauthorized access - Token might be expired');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Erreur ${response.status}`);
    }
    return response.json();
};
