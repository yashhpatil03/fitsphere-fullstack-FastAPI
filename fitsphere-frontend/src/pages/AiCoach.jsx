import { useState, useEffect, useRef } from "react";
import { askAI } from "../services/aiService";
import { getErrorMessage } from "../services/api";
import { getRecommendations } from "../services/fitnessService";
import Sidebar from "../components/Sidebar";

const QUICK_PROMPTS = [
  "Best workout for fat loss?",
  "How much protein do I need daily?",
  "Beginner gym routine for muscle gain",
  "How to improve running endurance?",
  "What to eat before a workout?",
  "Recovery tips after intense training",
];

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px", background: "var(--fs-surface-2)", border: "1px solid var(--fs-border)", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
      {[0, 1, 2].map(i => (
        <span key={`dot-${i}`} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--fs-text-tertiary)",
          animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

function AiCoach() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! I'm your FitSphere AI Coach. I can help with workout plans, nutrition advice, recovery tips, and anything fitness-related. What's on your mind?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Rule-based tips from GET /ai/recommendations/{user_id}
  useEffect(() => {
    getRecommendations()
      .then(r => setTips([...r.workout, ...r.diet]))
      .catch(() => setTips([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || message).trim();
    if (!msg) return;

    // Conversation history for the backend: the last 10 real exchanges
    // (skip the local greeting, which the server never produced)
    const history = messages
      .slice(1)
      .filter(m => !m.isError)
      .slice(-10)
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text.slice(0, 2000) }));

    setMessages(prev => [...prev, { sender: "user", text: msg }]);
    setMessage("");
    setLoading(true);

    try {
      const reply = await askAI(msg.slice(0, 2000), history);
      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
    } catch (error) {
      const status = error?.response?.status;
      const text =
        status === 503 ? "The AI coach is temporarily unavailable. Please try again in a moment."
        : status === 401 || status === 403 ? getErrorMessage(error)
        : error?.response ? getErrorMessage(error, "Sorry, I couldn't answer that. Please try again.")
        : "I couldn't connect right now. Please check your connection and try again.";
      setMessages(prev => [...prev, { sender: "bot", text, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="fs-layout">
      <Sidebar />
      <main className="fs-main fs-page" style={{ display: "flex", flexDirection: "column", padding: 0 }}>

        {/* HEADER */}
        <div style={{
          padding: "28px 32px 20px",
          borderBottom: "1px solid var(--fs-border)",
          background: "var(--fs-surface)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: 48, height: 48,
              background: "var(--fs-grad-primary)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.375rem",
              boxShadow: "var(--fs-shadow-electric)",
              flexShrink: 0,
              animation: "pulse-glow 3s ease-in-out infinite",
            }}>🤖</div>
            <div>
              <h1 className="fs-h2" style={{ marginBottom: 2 }}>AI Fitness Coach</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--fs-success)", display: "inline-block" }} />
                <span className="fs-caption" style={{ color: "var(--fs-success)" }}>Online · Powered by FitSphere AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* COACH TIPS (rule-based recommendations) */}
        {tips.length > 0 && (
          <div style={{ padding: "12px 32px", borderBottom: "1px solid var(--fs-border)", background: "var(--fs-surface)", flexShrink: 0 }}>
            <p className="fs-caption" style={{ marginBottom: 8 }}>Coach tips for you</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tips.map((t, i) => (
                <span key={`tip-${i}`} className="fs-badge fs-badge-electric" style={{ fontSize: "0.8125rem", padding: "6px 12px", whiteSpace: "normal" }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {messages.map((msg, i) => (
            <div
              key={`msg-${i}-${msg.sender}`}
              className="fs-fade-in"
              style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "10px" }}
            >
              {msg.sender === "bot" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--fs-grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", flexShrink: 0, marginBottom: 2 }}>🤖</div>
              )}
              <div
                className={`fs-chat-bubble ${msg.sender}`}
                style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--fs-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", flexShrink: 0, marginBottom: 2, border: "1px solid var(--fs-border)" }}>👤</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--fs-grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", flexShrink: 0 }}>🤖</div>
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* QUICK PROMPTS */}
        {messages.length <= 2 && (
          <div style={{ padding: "0 32px 16px", flexShrink: 0 }}>
            <p className="fs-caption" style={{ marginBottom: "10px" }}>Try asking:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="fs-badge fs-badge-electric"
                  style={{ cursor: "pointer", border: "none", padding: "6px 14px", fontSize: "0.8125rem", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT BAR */}
        <div style={{
          padding: "16px 32px calc(16px + env(safe-area-inset-bottom))",
          borderTop: "1px solid var(--fs-border)",
          background: "var(--fs-surface)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: "10px", maxWidth: 900 }}>
            <input
              ref={inputRef}
              type="text"
              className="fs-input"
              value={message}
              placeholder="Ask anything about fitness, nutrition, recovery…"
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              className="fs-btn fs-btn-primary fs-btn-md"
              style={{ flexShrink: 0, minWidth: 80 }}
            >
              {loading ? (
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              {!loading && <span style={{ marginLeft: 4 }}>Send</span>}
            </button>
          </div>
          <p className="fs-caption" style={{ marginTop: 8, textAlign: "center" }}>AI responses are for informational purposes. Consult a professional for medical advice.</p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse-glow { 0%,100%{box-shadow:0 4px 24px rgba(14,165,233,0.3)} 50%{box-shadow:0 4px 32px rgba(14,165,233,0.6)} }`}</style>
      </main>
    </div>
  );
}

export default AiCoach;
