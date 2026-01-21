// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import LoginPage from "./pages/LoginPage";
import FinancialForm from "./FinancialForm";

// ---- these imports are placeholders — replace with your actual paths ----
import HomeOverview from "./pages/HomeOverview";
import InsightsPage from "./pages/InsightsPage";
import HomeDashboardFrontend from "./HomeDashboardFrontend";
import UploadPage from "./pages/UploadPage";
import UploadedFilesPage from "./pages/UploadedFilesPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FloatingThemeToggle from "./components/FloatingThemeToggle";
import Splash from "./pages/Splash";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider } from "./AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import DocumentContentPage from "./pages/DocumentContentPage";
// ------------------------------------------------------------------------

/**
 * AppContent: the actual application content + routing.
 * Note: renamed from `App` to `AppContent` to avoid duplicate identifier.
 */
function AppContent() {
  const [advice, setAdvice] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSplash, setShowSplash] = useState(false); // keep a state for splash if you use it

  // Typing effect: run whenever apiResponse changes
  useEffect(() => {
    if (!apiResponse) return;

    setIsTyping(true);
    setAdvice(""); // Clear previous advice
    const fullText = apiResponse;
    let i = 0;

    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setAdvice((prevAdvice) => prevAdvice + fullText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30);

    // cleanup
    return () => clearInterval(typingInterval);
  }, [apiResponse]); // <- important: include apiResponse in deps

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeOverview />} />
        <Route path="/home" element={<HomeOverview />} />
        <Route path="/insights" element={<PrivateRoute element={<InsightsPage />} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<HomeDashboardFrontend />} />} />
        <Route path="/upload" element={<PrivateRoute element={<UploadPage />} />} />
        <Route path="/files" element={<PrivateRoute element={<UploadedFilesPage />} />} />
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/documents/:documentId" element={<DocumentContentPage />} />
      </Routes>

      {/* Floating Theme Toggle - visible on all pages */}
      <FloatingThemeToggle />

      {/* Splash overlay - shown above everything when showSplash true */}
      {showSplash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.95), rgba(238,242,255,0.95))",
          }}
        >
          <Splash />
        </div>
      )}
    </>
  );
}

/**
 * Root App component: wraps AuthProvider, ThemeProvider and Router around AppContent.
 * Export default remains `App`.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
