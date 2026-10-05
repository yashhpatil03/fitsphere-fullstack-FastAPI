import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { getErrorMessage } from "../services/api";
import banner from "../assets/login-banner.jpg";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setError(
        error?.response?.status === 409
          ? "This email is already registered. Try signing in instead."
          : getErrorMessage(error, "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fs-auth-layout">
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
              Built for athletes who push limits.
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.65)", maxWidth: 380 }}>
              Join thousands of athletes transforming their bodies and minds with FitSphere.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 380 }}>
            {[
              { icon: "🏋️", text: "Smart workout tracking" },
              { icon: "🥗", text: "Macro & calorie goals" },
              { icon: "📈", text: "Visual progress charts" },
              { icon: "🤖", text: "AI coaching 24/7" },
            ].map((f) => (
              <div key={f.text} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fs-auth-right" style={{ background: "var(--fs-bg)" }}>
        <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
            <div style={{ width: 36, height: 36, background: "var(--fs-grad-primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.25rem", fontWeight: 700, color: "var(--fs-text-primary)" }}>FitSphere</span>
          </div>

          <h2 className="fs-h1" style={{ marginBottom: "6px" }}>Create your account</h2>
          <p className="fs-body" style={{ marginBottom: "32px" }}>Start your transformation today — it's free.</p>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--fs-error-bg)", border: "1px solid var(--fs-error)", borderRadius: "var(--fs-radius-lg)", marginBottom: "20px", fontSize: "0.875rem", color: "var(--fs-error)" }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--fs-success-bg)", borderRadius: "var(--fs-radius-lg)", marginBottom: "20px", fontSize: "0.875rem", color: "var(--fs-success)" }}>
              ✅ Account created! Redirecting to sign in…
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="fs-input-group">
              <label className="fs-input-label">Full name</label>
              <div className="fs-input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <input type="text" className="fs-input" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" required />
              </div>
            </div>
            <div className="fs-input-group">
              <label className="fs-input-label">Email address</label>
              <div className="fs-input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" className="fs-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>
            <div className="fs-input-group">
              <label className="fs-input-label">Password</label>
              <div className="fs-input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" className="fs-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" required minLength={6} />
              </div>
            </div>
            <button type="submit" disabled={loading || success} className="fs-btn fs-btn-primary fs-btn-lg" style={{ width: "100%", marginTop: "6px" }}>
              {loading ? "Creating account…" : "Get Started — Free"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--fs-text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--fs-electric)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
