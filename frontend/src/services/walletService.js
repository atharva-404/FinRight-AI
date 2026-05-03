/**
 * Wallet API Service
 * Handles all wallet-related API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const walletAPI = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests
walletAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
walletAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const walletService = {
    /**
     * Get user's wallet details
     * @returns {Promise} Wallet data
     */
    getWallet: async () => {
        try {
            const response = await walletAPI.get('/api/ai/wallet/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Add money to wallet
     * @param {number} amount - Amount to add
     * @param {string} description - Transaction description
     * @returns {Promise} Transaction response
     */
    addMoney: async (amount, description = 'Money added to wallet') => {
        try {
            const response = await walletAPI.post('/api/ai/wallet/add-money/', {
                amount,
                description,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Withdraw money from wallet
     * @param {number} amount - Amount to withdraw
     * @param {string} description - Transaction description
     * @returns {Promise} Transaction response
     */
    withdrawMoney: async (amount, description = 'Money withdrawn from wallet') => {
        try {
            const response = await walletAPI.post('/api/ai/wallet/withdraw/', {
                amount,
                description,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get transaction history
     * @param {number} page - Page number
     * @param {object} filters - Filter options (type, start_date, end_date)
     * @returns {Promise} Paginated transactions
     */
    getTransactions: async (page = 1, filters = {}) => {
        try {
            const params = { page, ...filters };
            const response = await walletAPI.get('/api/ai/wallet/transactions/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get timeline view of wallet activity
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise} Timeline data
     */
    getTimeline: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const response = await walletAPI.get('/api/ai/wallet/timeline/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default walletService;
