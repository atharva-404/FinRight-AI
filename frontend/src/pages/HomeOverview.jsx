// src/pages/HomeOverview.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../services/documentService";
import "../styles/global.css";

export default function HomeOverview() {
  const navigate = useNavigate();
  const [lastDocument, setLastDocument] = useState(null);
  const [documentSummary, setDocumentSummary] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lightBg = "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)";

  // Fetch documents and their details
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const docs = await documentService.getDocuments();

        if (docs && docs.length > 0) {
          // Get last document
          const lastDoc = Array.isArray(docs) ? docs[0] : docs;
          setLastDocument(lastDoc);

          // Fetch summary if document has ID
          if (lastDoc.id) {
            try {
              const summary = await documentService.getDocumentSummary(lastDoc.id);
              setDocumentSummary(summary);
            } catch (err) {
              // Summary fetch failed, continue without it
            }
          }

          // Fetch suggestions if document has mongo_id
          if (lastDoc.mongo_id) {
            try {
              const sugg = await documentService.getSuggestions(lastDoc.mongo_id);
              setSuggestions(sugg);
            } catch (err) {
              // Suggestions fetch failed, continue without them
            }
          }
        }
      } catch (err) {
        setError('Could not load document data. Please upload a file first.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, []);

  return (
    <div style={{ background: lightBg, minHeight: "100vh", padding: 0 }}>
      {/* Header/Navigation Bar */}
      <header style={{
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-color)",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 800,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "#667eea"
        }}>
          FinRight
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            transition: "all 0.3s"
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          Get Started →
        </button>
      </header>

      <div className="container" style={{ maxWidth: 1200, marginTop: 0 }}>
        {/* Hero Section */}
        <div style={{
          paddingTop: 60,
          paddingBottom: 60,
          textAlign: "center"
        }}>
          <div style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: 20,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
            color: "#667eea"
          }}>
            ✨ Welcome to FinRight
          </div>

          <h1 style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 20,
            color: "var(--text-primary)"
          }}>
            Master Your Money
            <br />
            <span style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              With AI Intelligence
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            maxWidth: 600,
            margin: "0 auto 32px",
            lineHeight: 1.6
          }}>
            Upload your bank statements, ask natural questions, and get actionable financial insights powered by advanced AI technology.
          </p>

          <div style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginBottom: 60
          }}>
            <button
              onClick={() => navigate("/upload")}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16,
                transition: "all 0.3s",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-4px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              📁 Upload File
            </button>
            <button
              onClick={() => navigate("/insights")}
              style={{
                padding: "14px 32px",
                background: "var(--bg-primary)",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16,
                transition: "all 0.3s"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(102, 126, 234, 0.08)";
                e.target.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "var(--bg-primary)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              💬 Ask AI
            </button>
          </div>

          {/* Hero Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            maxWidth: 600,
            margin: "0 auto"
          }}>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#667eea" }}>100%</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Secure & Private</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#764ba2" }}>AI-Powered</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Smart Analysis</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#667eea" }}>Instant</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Real-time Results</div>
            </div>
          </div>
        </div>

        {/* Document Summary and Suggestions Section */}
        {!loading && (lastDocument || documentSummary || suggestions) && (
          <div style={{
            paddingTop: 40,
            paddingBottom: 40
          }}>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 24,
              color: "var(--text-primary)"
            }}>
              📊 Latest Document Analysis
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20
            }}>
              {/* Document Info Card */}
              {lastDocument && (
                <div style={{
                  background: "var(--bg-primary)",
                  borderRadius: 12,
                  padding: 24,
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}>
                  <div style={{ fontSize: 12, color: "#667eea", fontWeight: 700, marginBottom: 8 }}>
                    UPLOADED DOCUMENT
                  </div>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12
                  }}>
                    {lastDocument.name || "Document"}
                  </h3>
                  <div style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6
                  }}>
                    <div>📄 Uploaded: {lastDocument.addedAt ? new Date(lastDocument.addedAt).toLocaleDateString() : 'Unknown'}</div>
                    {lastDocument.type && <div>🏷️ Type: {lastDocument.type}</div>}
                  </div>
                  <button
                    onClick={() => navigate("/files")}
                    style={{
                      marginTop: 16,
                      padding: "8px 16px",
                      background: "rgba(102, 126, 234, 0.1)",
                      border: "1px solid #667eea",
                      color: "#667eea",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#667eea";
                      e.target.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "rgba(102, 126, 234, 0.1)";
                      e.target.style.color = "#667eea";
                    }}
                  >
                    View All Files →
                  </button>
                </div>
              )}

              {/* Summary Card */}
              {documentSummary && (
                <div style={{
                  background: "var(--bg-primary)",
                  borderRadius: 12,
                  padding: 24,
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}>
                  <div style={{ fontSize: 12, color: "#764ba2", fontWeight: 700, marginBottom: 8 }}>
                    SUMMARY
                  </div>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12
                  }}>
                    Document Insights
                  </h3>
                  <div style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.8,
                    maxHeight: 200,
                    overflow: "auto"
                  }}>
                    {typeof documentSummary === 'string' ? documentSummary : JSON.stringify(documentSummary)}
                  </div>
                </div>
              )}

              {/* Suggestions Card */}
              {suggestions && (
                <div style={{
                  background: "var(--bg-primary)",
                  borderRadius: 12,
                  padding: 24,
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}>
                  <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>
                    AI SUGGESTIONS
                  </div>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12
                  }}>
                    Recommendations
                  </h3>
                  <div style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.8,
                    maxHeight: 200,
                    overflow: "auto"
                  }}>
                    {typeof suggestions === 'string' ? suggestions : JSON.stringify(suggestions)}
                  </div>
                  <button
                    onClick={() => navigate("/insights")}
                    style={{
                      marginTop: 16,
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      color: "#fff",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                  >
                    Ask AI More →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error or Empty State */}
        {!loading && !lastDocument && !error && (
          <div style={{
            paddingTop: 40,
            paddingBottom: 40,
            textAlign: "center"
          }}>
            <p style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              marginBottom: 20
            }}>
              No documents uploaded yet. Upload a file to see AI-powered insights.
            </p>
            <button
              onClick={() => navigate("/upload")}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              📁 Upload First Document
            </button>
          </div>
        )}

        <div style={{
          paddingTop: 40,
          paddingBottom: 60
        }}>
          <h2 style={{
            fontSize: 36,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 12,
            color: "var(--text-primary)"
          }}>
            How FinRight Works
          </h2>
          <p style={{
            fontSize: 16,
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: 40
          }}>
            Three simple steps to financial clarity
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginTop: 32
          }}>
            {[
              {
                num: "01",
                icon: "📤",
                title: "Upload",
                desc: "Securely upload your CSV or PDF bank statements in seconds."
              },
              {
                num: "02",
                icon: "🧠",
                title: "Analyze",
                desc: "Our AI extracts spending patterns and financial trends automatically."
              },
              {
                num: "03",
                icon: "💡",
                title: "Get Insights",
                desc: "Receive personalized recommendations to save more and spend smarter."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg-primary)",
                  borderRadius: 12,
                  padding: 32,
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border-color)",
                  transition: "all 0.3s",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
              >
                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#667eea",
                  marginBottom: 12
                }}>
                  {item.num}
                </div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 8
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 16,
          padding: 48,
          color: "#fff",
          marginBottom: 60,
          textAlign: "center"
        }}>
          <h2 style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16
          }}>
            Why Choose FinRight?
          </h2>
          <p style={{
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "0 auto 32px",
            opacity: 0.95
          }}>
            We combine cutting-edge AI technology with financial expertise to help you make smarter money decisions.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
            marginTop: 24
          }}>
            {[
              "🔒 Bank-grade encryption",
              "⚡ Lightning-fast processing",
              "🎯 Personalized advice",
              "📱 Works on any device"
            ].map((benefit, idx) => (
              <div key={idx} style={{ fontSize: 14, fontWeight: 600 }}>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: "center",
          paddingBottom: 60
        }}>
          <h2 style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 16,
            color: "var(--text-primary)"
          }}>
            Ready to Transform Your Finances?
          </h2>
          <button
            onClick={() => navigate("/upload")}
            style={{
              padding: "16px 40px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 16,
              transition: "all 0.3s",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-4px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            Start Uploading Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        padding: "32px",
        textAlign: "center",
        fontSize: 13,
        marginTop: 40
      }}>
        <div style={{ marginBottom: 12 }}>
          © 2024 FinRight. Your intelligent financial assistant.
        </div>
        <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.9)" }}>
          Upload files securely, analyze spending patterns, and get AI-powered insights.
        </div>
      </footer>
    </div>
  );
}
