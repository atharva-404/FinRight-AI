// frontend/src/pages/WalletPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { walletService } from "../services/walletService";
import "../styles/global.css";

export default function WalletPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [tab, setTab] = useState("wallet");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const mainRef = useRef(null);

    // Wallet state
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [processing, setProcessing] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // View mode
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'timeline'

    // Navigation functions
    function openDashboard() {
        setTab("overview");
        navigate("/dashboard");
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

    // Fetch wallet data
    const fetchWallet = async () => {
        try {
            const data = await walletService.getWallet();
            setWallet(data);
        } catch (err) {
            setError("Failed to load wallet. Please try again.");
        }
    };

    // Fetch transactions
    const fetchTransactions = async (page = 1) => {
        try {
            const data = await walletService.getTransactions(page);
            setTransactions(data.results || []);
            setTotalPages(Math.ceil((data.count || 0) / 20));
            setCurrentPage(page);
        } catch (err) {
            setError("Failed to load transactions.");
        }
    };

    // Initial load
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchWallet(), fetchTransactions()]);
            setLoading(false);
        };

        loadData();
    }, [isAuthenticated, navigate]);

    // Handle add money
    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            await walletService.addMoney(parseFloat(amount), description || "Money added");
            setSuccess(`Successfully added ₹${amount} to your wallet!`);
            setShowAddModal(false);
            setAmount("");
            setDescription("");
            await Promise.all([fetchWallet(), fetchTransactions()]);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.error || "Failed to add money. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    // Handle withdraw money
    const handleWithdrawMoney = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            await walletService.withdrawMoney(parseFloat(amount), description || "Money withdrawn");
            setSuccess(`Successfully withdrew ₹${amount} from your wallet!`);
            setShowWithdrawModal(false);
            setAmount("");
            setDescription("");
            await Promise.all([fetchWallet(), fetchTransactions()]);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.error || "Failed to withdraw money. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // Get transaction type badge color
    const getTypeColor = (type) => {
        switch (type) {
            case "ADD":
                return "#22c55e";
            case "WITHDRAW":
                return "#ef4444";
            case "TRANSFER":
                return "#3b82f6";
            case "REFUND":
                return "#f59e0b";
            default:
                return "#6b7280";
        }
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

                <button className="btn" onClick={() => navigate("/financial-health")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <span>FinRight Score</span>
                </button>

                <button className={`btn ${tab === "wallet" ? "active" : ""}`} onClick={() => setTab("wallet")}>
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
                                💰 Digital Wallet
                            </h1>
                            <p style={{ color: "var(--text-secondary)", margin: "8px 0 0 0" }}>
                                Manage your virtual money and track transactions
                            </p>
                        </div>
                        {isAuthenticated && <UserMenu />}
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div
                            style={{
                                background: "rgba(34, 197, 94, 0.1)",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                color: "#22c55e",
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 24,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <span style={{ fontSize: 20 }}>✓</span>
                            <span>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                background: "rgba(220, 38, 38, 0.1)",
                                border: "1px solid rgba(220, 38, 38, 0.3)",
                                color: "#dc2626",
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 24,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <span style={{ fontSize: 20 }}>⚠️</span>
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                style={{
                                    marginLeft: "auto",
                                    background: "none",
                                    border: "none",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    fontSize: 20,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: 64, color: "var(--text-secondary)" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                            <div>Loading wallet...</div>
                        </div>
                    ) : (
                        <>
                            {/* Balance Card */}
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    borderRadius: 20,
                                    padding: 40,
                                    marginBottom: 32,
                                    color: "white",
                                    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                                }}
                            >
                                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Current Balance</div>
                                <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 24 }}>
                                    ₹{wallet?.balance || "0.00"}
                                    <span style={{ fontSize: 24, opacity: 0.8, marginLeft: 8 }}>{wallet?.currency || "INR"}</span>
                                </div>
                                <div style={{ display: "flex", gap: 16 }}>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        style={{
                                            padding: "12px 24px",
                                            background: "rgba(255, 255, 255, 0.2)",
                                            border: "1px solid rgba(255, 255, 255, 0.3)",
                                            borderRadius: 12,
                                            color: "white",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            backdropFilter: "blur(10px)",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseOver={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
                                        onMouseOut={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
                                    >
                                        + Add Money
                                    </button>
                                    <button
                                        onClick={() => setShowWithdrawModal(true)}
                                        style={{
                                            padding: "12px 24px",
                                            background: "rgba(255, 255, 255, 0.2)",
                                            border: "1px solid rgba(255, 255, 255, 0.3)",
                                            borderRadius: 12,
                                            color: "white",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            backdropFilter: "blur(10px)",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseOver={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
                                        onMouseOut={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
                                    >
                                        - Withdraw
                                    </button>
                                </div>
                            </div>

                            {/* Transaction History */}
                            <div
                                style={{
                                    background: "var(--bg-primary)",
                                    borderRadius: 16,
                                    padding: 32,
                                    border: "1px solid var(--border-color)",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Transaction History</h2>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            onClick={() => setViewMode("table")}
                                            style={{
                                                padding: "8px 16px",
                                                background: viewMode === "table" ? "#667eea" : "var(--bg-tertiary)",
                                                color: viewMode === "table" ? "white" : "var(--text-primary)",
                                                border: "none",
                                                borderRadius: 8,
                                                cursor: "pointer",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Table
                                        </button>
                                        <button
                                            onClick={() => setViewMode("timeline")}
                                            style={{
                                                padding: "8px 16px",
                                                background: viewMode === "timeline" ? "#667eea" : "var(--bg-tertiary)",
                                                color: viewMode === "timeline" ? "white" : "var(--text-primary)",
                                                border: "none",
                                                borderRadius: 8,
                                                cursor: "pointer",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Timeline
                                        </button>
                                    </div>
                                </div>

                                {transactions.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>
                                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                                        <div>No transactions yet. Add money to get started!</div>
                                    </div>
                                ) : (
                                    <div style={{
                                        overflowX: "auto",
                                        overflowY: "auto",
                                        maxHeight: "500px",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8
                                    }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ background: "var(--bg-tertiary)", borderRadius: 8 }}>
                                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>Date</th>
                                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>Type</th>
                                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>Amount</th>
                                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>
                                                        Description
                                                    </th>
                                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((txn, index) => (
                                                    <tr
                                                        key={txn.id}
                                                        style={{
                                                            borderBottom: "1px solid var(--border-color)",
                                                            transition: "background 0.2s",
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                    >
                                                        <td style={{ padding: "16px", fontSize: 14 }}>{formatDate(txn.timestamp)}</td>
                                                        <td style={{ padding: "16px" }}>
                                                            <span
                                                                style={{
                                                                    padding: "4px 12px",
                                                                    background: `${getTypeColor(txn.type)}20`,
                                                                    color: getTypeColor(txn.type),
                                                                    borderRadius: 6,
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {txn.type}
                                                            </span>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "16px",
                                                                fontWeight: 700,
                                                                color: txn.type === "ADD" ? "#22c55e" : "#ef4444",
                                                            }}
                                                        >
                                                            {txn.type === "ADD" ? "+" : "-"}₹{txn.amount}
                                                        </td>
                                                        <td style={{ padding: "16px", fontSize: 14, color: "var(--text-secondary)" }}>
                                                            {txn.description || "-"}
                                                        </td>
                                                        <td style={{ padding: "16px", fontSize: 14 }}>{txn.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Add Money Modal */}
            {showAddModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        style={{
                            background: "var(--bg-primary)",
                            borderRadius: 16,
                            padding: 32,
                            maxWidth: 500,
                            width: "90%",
                            border: "1px solid var(--border-color)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Add Money</h2>
                        <form onSubmit={handleAddMoney}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: 12,
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8,
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-primary)",
                                        fontSize: 16,
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Description (optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., Monthly deposit"
                                    style={{
                                        width: "100%",
                                        padding: 12,
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8,
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-primary)",
                                        fontSize: 16,
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        background: "#667eea",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: processing ? "not-allowed" : "pointer",
                                        opacity: processing ? 0.6 : 1,
                                    }}
                                >
                                    {processing ? "Processing..." : "Add Money"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-primary)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Withdraw Money Modal */}
            {showWithdrawModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowWithdrawModal(false)}
                >
                    <div
                        style={{
                            background: "var(--bg-primary)",
                            borderRadius: 16,
                            padding: 32,
                            maxWidth: 500,
                            width: "90%",
                            border: "1px solid var(--border-color)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Withdraw Money</h2>
                        <form onSubmit={handleWithdrawMoney}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={wallet?.balance || 0}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: 12,
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8,
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-primary)",
                                        fontSize: 16,
                                    }}
                                />
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                                    Available: ₹{wallet?.balance || "0.00"}
                                </div>
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Description (optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., Bill payment"
                                    style={{
                                        width: "100%",
                                        padding: 12,
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8,
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-primary)",
                                        fontSize: 16,
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        background: "#ef4444",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: processing ? "not-allowed" : "pointer",
                                        opacity: processing ? 0.6 : 1,
                                    }}
                                >
                                    {processing ? "Processing..." : "Withdraw"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-primary)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
