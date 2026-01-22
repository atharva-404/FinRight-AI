/**
 * Document API Service
 * Handles document-related API calls
 */

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const documentAPI = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
documentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
documentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const documentService = {
  /**
   * Upload and process a document
   * @param {FormData} formData - FormData containing file and other details
   * @returns {Promise} Response with document data
   */
  uploadDocument: async (formData) => {
    try {
      const response = await documentAPI.post(API_ENDPOINTS.DOCUMENTS.PROCESS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get list of all documents
   * @returns {Promise} Array of documents
   */
  getDocuments: async () => {
    try {
      const response = await documentAPI.get(API_ENDPOINTS.DOCUMENTS.LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get summary of a specific document
   * @param {string} docId - Document ID
   * @returns {Promise} Document summary data
   */
  getDocumentSummary: async (docId) => {
    try {
      const response = await documentAPI.get(API_ENDPOINTS.DOCUMENTS.SUMMARY(docId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get suggestions for a document
   * @param {string} mongoId - MongoDB document ID
   * @returns {Promise} Suggestions data
   */
  getSuggestions: async (mongoId) => {
    try {
      const response = await documentAPI.get(API_ENDPOINTS.DOCUMENTS.SUGGESTIONS(mongoId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a document
   * @param {string} docId - Document ID
   * @returns {Promise} Delete confirmation
   */
  deleteDocument: async (docId) => {
    try {
      const response = await documentAPI.delete(`/api/ai/documents/${docId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default documentService;
