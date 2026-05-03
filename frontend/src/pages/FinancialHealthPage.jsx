// frontend/src/pages/FinancialHealthPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { financialHealthService } from "../services/financialHealthService";
import "../styles/global.css";

export default function FinancialHealthPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [tab, setTab] = useState("health");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const mainRef = useRef(null);

    // State
    const [scoreData, setScoreData] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recalculating, setRecalculating] = useState(false);

    // Navigation functions
    function openDashboard() {
        setTab("overview");
        navigate("/dashboard");
    }
    function openWallet() {
        setTab("wallet");
        navigate("/wallet");
    }
    function openUpload() {
        setTab("upload");
        navigate("/upload");
    }
    function openFiles() {
        setTab("files");
        navigate("/files");
    }
    function openChatBot() {
        setTab("chatbot");
        navigate("/insights");
    }

    function backToTop() {
        if (!mainRef.current) return;
        mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Fetch data
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const [score, breakdownData, historyData] = await Promise.all([
                    financialHealthService.getCurrentScore(),
                    financialHealthService.getScoreBreakdown(),
                    financialHealthService.getScoreHistory(12),
                ]);

                setScoreData(score);
                setBreakdown(breakdownData);
                setHistory(historyData.history || []);
            } catch (err) {
                setError(err.error || "Failed to load financial health data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, navigate]);

    // Handle recalculate
    const handleRecalculate = async () => {
        setRecalculating(true);
        setError(null);

        try {
            const newScore = await financialHealthService.recalculateScore();
            setScoreData(newScore);

            // Refresh breakdown and history
            const [breakdownData, historyData] = await Promise.all([
                financialHealthService.getScoreBreakdown(),
                financialHealthService.getScoreHistory(12),
            ]);

            setBreakdown(breakdownData);
            setHistory(historyData.history || []);
        } catch (err) {
            setError(err.error || "Failed to recalculate score");
        } finally {
            setRecalculating(false);
        }
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score <= 40) return "#ef4444";
        if (score <= 60) return "#f97316";
        if (score <= 80) return "#eab308";
        return "#22c55e";
    };

    // Get factor icon
    const getFactorIcon = (factorName) => {
        const icons = {
            spending_discipline: "💳",
            savings_ratio: "💰",
            credit_utilization: "📊",
            loan_burden: "🏦",
            risk_exposure: "⚠️",
        };
        return icons[factorName] || "📈";
    };

    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    {sidebarOpen ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>

                <h3>FinRight</h3>

                <button className={`btn ${tab === "overview" ? "active" : ""}`} onClick={openDashboard}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="2" x2="12" y2="22"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>Dashboard</span>
                </button>

                <button className={`btn ${tab === "health" ? "active" : ""}`} onClick={() => setTab("health")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <span>FinRight Score</span>
                </button>

                <button className={`btn ${tab === "wallet" ? "active" : ""}`} onClick={openWallet}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span>Wallet</span>
                </button>

                <button className={`btn ${tab === "upload" ? "active" : ""}`} onClick={openUpload}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Upload</span>
                </button>

                <button className={`btn ${tab === "files" ? "active" : ""}`} onClick={openFiles}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <span>Files</span>
                </button>

                <button className={`btn ${tab === "chatbot" ? "active" : ""}`} onClick={openChatBot}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>ChatBot</span>
                </button>

                <div style={{ marginTop: "auto" }}>
                    <button onClick={backToTop} className="back-to-top-btn" title="Scroll to top">
                        ↑ Top
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main ref={mainRef} className={`main-with-sidebar ${sidebarOpen ? "" : "sidebar-closed"}`} style={{
                overflowY: "auto",
                height: "100vh"
            }}>
                <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                        <div>
                            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                                📊 FinRight Score
                            </h1>
                            <p style={{ color: "var(--text-secondary)", margin: "8px 0 0 0" }}>
                                Your Financial Health Index
                            </p>
                        </div>
                        {isAuthenticated && <UserMenu />}
                    </div>

                    {error && (
                        <div
                            style={{
                                background: "rgba(220, 38, 38, 0.1)",
                                border: "1px solid rgba(220, 38, 38, 0.3)",
                                color: "#dc2626",
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 24,
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: 64, color: "var(--text-secondary)" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                            <div>Calculating your financial health score...</div>
                        </div>
                    ) : (
                        <>
                            {/* Score Gauge */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                                <div
                                    style={{
                                        background: "var(--bg-primary)",
                                        borderRadius: 20,
                                        padding: 40,
                                        border: "1px solid var(--border-color)",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
                                        Your FinRight Score
                                    </div>
                                    <div
                                        style={{
                                            width: 200,
                                            height: 200,
                                            margin: "0 auto",
                                            borderRadius: "50%",
                                            background: `conic-gradient(${getScoreColor(scoreData?.score || 0)} ${(scoreData?.score || 0) * 3.6}deg, var(--bg-tertiary) 0deg)`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 160,
                                                height: 160,
                                                borderRadius: "50%",
                                                background: "var(--bg-primary)",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div style={{ fontSize: 56, fontWeight: 800, color: getScoreColor(scoreData?.score || 0) }}>
                                                {scoreData?.score || 0}
                                            </div>
                                            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>out of 100</div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 24,
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: getScoreColor(scoreData?.score || 0),
                                        }}
                                    >
                                        {scoreData?.category || "Unknown"}
                                    </div>
                                    <button
                                        onClick={handleRecalculate}
                                        disabled={recalculating}
                                        style={{
                                            marginTop: 16,
                                            padding: "10px 20px",
                                            background: "#667eea",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            cursor: recalculating ? "not-allowed" : "pointer",
                                            opacity: recalculating ? 0.6 : 1,
                                        }}
                                    >
                                        {recalculating ? "Recalculating..." : "🔄 Recalculate"}
                                    </button>
                                </div>

                                {/* Trend Chart Placeholder */}
                                <div
                                    style={{
                                        background: "var(--bg-primary)",
                                        borderRadius: 20,
                                        padding: 40,
                                        border: "1px solid var(--border-color)",
                                    }}
                                >
                                    <h3 style={{ margin: "0 0 24px 0", fontSize: 18, fontWeight: 700 }}>12-Month Trend</h3>
                                    {history.length > 0 ? (
                                        <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8 }}>
                                            {history.map((item, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        flex: 1,
                                                        height: `${(item.score / 100) * 200}px`,
                                                        background: getScoreColor(item.score),
                                                        borderRadius: "4px 4px 0 0",
                                                        position: "relative",
                                                        transition: "all 0.3s",
                                                    }}
                                                    title={`${new Date(item.month).toLocaleDateString('en-US', { month: 'short' })}: ${item.score}`}
                                                ></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                                            No history available yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Factor Breakdown */}
                            <div style={{ marginBottom: 32 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Factor Breakdown</h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                                    {breakdown?.factors?.map((factor, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: "var(--bg-primary)",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: 12,
                                                padding: 20,
                                            }}
                                        >
                                            <div style={{ fontSize: 32, marginBottom: 8 }}>{getFactorIcon(factor.name)}</div>
                                            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
                                                {factor.display_name}
                                            </div>
                                            <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(factor.percentage) }}>
                                                {factor.score}
                                                <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>/20</span>
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: 12,
                                                    height: 6,
                                                    background: "var(--bg-tertiary)",
                                                    borderRadius: 3,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${factor.percentage}%`,
                                                        height: "100%",
                                                        background: getScoreColor(factor.percentage),
                                                        transition: "width 0.5s",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {scoreData?.recommendations && scoreData.recommendations.length > 0 && (
                                <div
                                    style={{
                                        background: "var(--bg-primary)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 16,
                                        padding: 32,
                                    }}
                                >
                                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>💡 Recommendations</h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {scoreData.recommendations.map((rec, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: "var(--bg-tertiary)",
                                                    padding: 20,
                                                    borderRadius: 12,
                                                    borderLeft: `4px solid ${rec.priority === 'high' ? '#ef4444' : '#f97316'}`,
                                                }}
                                            >
                                                <div style={{ fontWeight: 700, marginBottom: 8 }}>{rec.title}</div>
                                                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{rec.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
