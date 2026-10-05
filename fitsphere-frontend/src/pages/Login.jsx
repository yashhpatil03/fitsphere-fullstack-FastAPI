import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import banner from "../assets/login-banner.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      // 401 = wrong credentials; anything else (server down, CORS...) gets its real reason
      setError(
        error?.response?.status === 401
          ? "Invalid email or password. Please try again."
          : getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fs-auth-layout">
      {/* Left Panel */}
      <div className="fs-auth-left">
        <img src={banner} alt="" />
        <div className="fs-auth-left-overlay" />
        <div className="fs-auth-left-content">
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div style={{ width: 36, height: 36, background: "var(--fs-grad-primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
              <span style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>FitSphere</span>
            </div>
            <h1 style={{ fontFamily: "var(--fs-font-display)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "12px" }}>
              Your fitness journey continues here.
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.65)", maxWidth: 380 }}>
              Track workouts, nutrition, and progress. Built for athletes who mean business.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { icon: "🔥", value: "94%", label: "User retention" },
              { icon: "💪", value: "2M+", label: "Workouts tracked" },
              { icon: "⚡", value: "4.9★", label: "App rating" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff" }}>{s.value} {s.icon}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="fs-auth-right" style={{ background: "var(--fs-bg)" }}>
        <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
            <div style={{ width: 36, height: 36, background: "var(--fs-grad-primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.25rem", fontWeight: 700, color: "var(--fs-text-primary)" }}>FitSphere</span>
          </div>

          <h2 className="fs-h1" style={{ marginBottom: "6px" }}>Welcome back</h2>
          <p className="fs-body" style={{ marginBottom: "32px" }}>Sign in to continue your journey</p>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--fs-error-bg)", border: "1px solid var(--fs-error)", borderRadius: "var(--fs-radius-lg)", marginBottom: "20px", fontSize: "0.875rem", color: "var(--fs-error)" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="fs-input-group">
              <label className="fs-input-label">Email address</label>
              <div className="fs-input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" className="fs-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>

            <div className="fs-input-group">
              <label className="fs-input-label">Password</label>
              <div className="fs-input-with-icon" style={{ position: "relative" }}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPass ? "text" : "password"} className="fs-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--fs-text-tertiary)", padding: 0 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="fs-btn fs-btn-primary fs-btn-lg" style={{ width: "100%", marginTop: "6px" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--fs-text-secondary)" }}>
            New to FitSphere?{" "}
            <Link to="/register" style={{ color: "var(--fs-electric)", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Login;
