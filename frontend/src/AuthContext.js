import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMsg =
        err.detail || err.email?.[0] || err.password?.[0] || "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, password_confirm) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({
        username,
        email,
        password,
        password_confirm,
      });
      return data;
    } catch (err) {
      const errorMsg =
        err.detail ||
        err.email?.[0] ||
        err.username?.[0] ||
        err.password?.[0] ||
        "Registration failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.updateProfile(profileData);
      setUser(data);
      localStorage.setItem("user_data", JSON.stringify(data));
      return data;
    } catch (err) {
      const errorMsg = err.detail || "Profile update failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      const errorMsg = err.detail || "Password reset request failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password, password_confirm) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.resetPassword({
        token,
        password,
        password_confirm,
      });
      return data;
    } catch (err) {
      const errorMsg = err.detail || "Password reset failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    isAuthenticated: authService.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
