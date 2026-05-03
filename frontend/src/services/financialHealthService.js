/**
 * Financial Health Score API Service
 * Handles all FinRight Score API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const healthAPI = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests
healthAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
healthAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const financialHealthService = {
    /**
     * Get current financial health score
     * @returns {Promise} Current score data
     */
    getCurrentScore: async () => {
        try {
            const response = await healthAPI.get('/api/ai/financial-health/score/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get score history
     * @param {number} months - Number of months to retrieve (default: 12)
     * @returns {Promise} Score history data
     */
    getScoreHistory: async (months = 12) => {
        try {
            const response = await healthAPI.get('/api/ai/financial-health/history/', {
                params: { months },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get detailed score breakdown
     * @returns {Promise} Detailed breakdown with factor scores
     */
    getScoreBreakdown: async () => {
        try {
            const response = await healthAPI.get('/api/ai/financial-health/breakdown/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Recalculate financial health score
     * @param {string} month - Optional month (YYYY-MM-DD format)
     * @returns {Promise} Recalculated score data
     */
    recalculateScore: async (month = null) => {
        try {
            const response = await healthAPI.post('/api/ai/financial-health/recalculate/', {
                month,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get personalized recommendations
     * @returns {Promise} Recommendations data
     */
    getRecommendations: async () => {
        try {
            const response = await healthAPI.get('/api/ai/financial-health/recommendations/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default financialHealthService;
