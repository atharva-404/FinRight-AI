/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: `${BACKEND_URL}/auth/register/`,
    LOGIN: `${BACKEND_URL}/auth/login/`,
    LOGOUT: `${BACKEND_URL}/auth/logout/`,
    ME: `${BACKEND_URL}/auth/me/`,
    REFRESH: `${BACKEND_URL}/auth/refresh/`,
    PROFILE_UPDATE: `${BACKEND_URL}/auth/profile/update/`,
    FORGOT_PASSWORD: `${BACKEND_URL}/auth/forgot-password/`,
    RESET_PASSWORD: `${BACKEND_URL}/auth/reset-password/`,
    VERIFY_EMAIL: `${BACKEND_URL}/auth/verify-email/`,
    SEND_VERIFICATION_EMAIL: `${BACKEND_URL}/auth/send-verification-email/`,
  },

  // AI & Insights endpoints
  AI: {
    INSIGHTS: `${BACKEND_URL}/api/ai/`,
  },

  // Document endpoints
  DOCUMENTS: {
    PROCESS: `${BACKEND_URL}/api/ai/document/process/`,
    LIST: `${BACKEND_URL}/api/ai/documents/`,
    SUMMARY: (docId) => `${BACKEND_URL}/api/ai/expense-documents/${docId}/summary/`,
    SUGGESTIONS: (mongoId) => `${BACKEND_URL}/api/ai/expense-document/${mongoId}/suggestions/`,
  },

  // WebSocket endpoints
  WEBSOCKET: {
    CHAT: (mongoId) => `ws://localhost:8000/ws/ai/chat/${mongoId}/`,
  },
};

export default API_ENDPOINTS;
