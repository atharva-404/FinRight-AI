import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem("access_token", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  /**
   * Register a new user
   * @param {Object} data - { username, email, password, password_confirm }
   */
  register: async (data) => {
    try {
      const response = await apiClient.post("/auth/register/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Registration failed" };
    }
  },

  /**
   * Login user
   * @param {Object} data - { email, password }
   */
  login: async (data) => {
    try {
      const response = await apiClient.post("/auth/login/", data);
      const { access, refresh, user } = response.data;

      // Store tokens and user data
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_data", JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Login failed" };
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/me/");
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Failed to fetch profile" };
    }
  },

  /**
   * Update user profile
   * @param {Object} data - { first_name, last_name, income, etc. }
   */
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put("/auth/profile/update/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Profile update failed" };
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await apiClient.post("/auth/refresh/", {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem("access_token", access);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Token refresh failed" };
    }
  },

  /**
   * Request password reset
   * @param {String} email
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password/", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Password reset request failed" };
    }
  },

  /**
   * Reset password with token
   * @param {Object} data - { token, password, password_confirm }
   */
  resetPassword: async (data) => {
    try {
      const response = await apiClient.post("/auth/reset-password/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Password reset failed" };
    }
  },

  /**
   * Verify email with token
   * @param {String} token
   */
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post("/auth/verify-email/", { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Email verification failed" };
    }
  },

  /**
   * Resend verification email
   * @param {String} email
   */
  resendVerificationEmail: async (email) => {
    try {
      const response = await apiClient.post("/auth/send-verification-email/", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: "Resend verification failed" };
    }
  },

  /**
   * Get stored user data from localStorage
   */
  getStoredUser: () => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },
};

export default authService;
