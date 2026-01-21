/**
 * AI/Insights API Service
 * Handles AI and insights-related API calls
 */

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const aiAPI = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
aiAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiService = {
  /**
   * Get AI insights for a question and optional file
   * @param {string} question - The user's question
   * @param {File} file - Optional file to upload
   * @returns {Promise} Response with advice
   */
  getInsights: async (question, file = null) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('question', question);

      const response = await aiAPI.post(API_ENDPOINTS.AI.INSIGHTS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default aiService;
