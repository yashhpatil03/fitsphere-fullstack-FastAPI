import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { API_URL, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  fetchCurrentUser, updateProfile, uploadProfilePicture, deleteProfilePicture,
} from "../services/authService";

function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(user || { name: "", email: "", age: "", gender: "", height: "", weight: "", goal: "", profilePicture: null });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(u => { setProfile(u); setUser(u); })
      .catch(err => setError(getErrorMessage(err, "Could not load your profile.")));
  }, [setUser]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const saved = await updateProfile(profile);
      setProfile(saved);
      setUser(saved);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    try {
      const path = await uploadProfilePicture(file);
      const next = { ...profile, profilePicture: path };
      setProfile(next);
      setUser(next);
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload the photo."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    setError("");
    try {
      await deleteProfilePicture();
      const next = { ...profile, profilePicture: null };
      setProfile(next);
      setUser(next);
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove the photo."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const initials = profile.name ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  const goalLabels = { "Weight Loss": "🏃", "Muscle Gain": "💪", "Maintain Fitness": "⚡" };
  const goalIcon = goalLabels[profile.goal] || "🎯";

  return (
    <div className="fs-layout">
      <Sidebar />
      <main className="fs-main fs-page">

        {/* PROFILE HEADER */}
        <div style={{
          background: "var(--fs-grad-dark)",
          borderRadius: "var(--fs-radius-2xl)",
          padding: "40px",
          marginBottom: "var(--fs-space-8)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 50%, rgba(14,165,233,0.15) 0%, transparent 50%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80,
                background: profile.profilePicture ? `center / cover no-repeat url(${API_URL}${profile.profilePicture})` : "var(--fs-grad-primary)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--fs-font-display)", fontSize: "1.75rem", fontWeight: 700, color: "#fff",
                boxShadow: "var(--fs-shadow-electric)",
              }}>{profile.profilePicture ? "" : initials}</div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" disabled={photoBusy} onClick={() => fileRef.current?.click()} className="fs-btn fs-btn-secondary fs-btn-sm">
                  {photoBusy ? "…" : profile.profilePicture ? "Change" : "Add photo"}
                </button>
                {profile.profilePicture && (
                  <button type="button" disabled={photoBusy} onClick={removePhoto} className="fs-btn fs-btn-ghost fs-btn-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Remove</button>
                )}
              </div>
            </div>
            <div>
              <p className="fs-hero-eyebrow">Athlete Profile</p>
              <h1 className="fs-hero-title">{profile.name || "Your Name"}</h1>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                {profile.email && <span className="fs-badge" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>{profile.email}</span>}
                {profile.goal && <span className="fs-badge" style={{ background: "rgba(14,165,233,0.2)", color: "#7DD3FC" }}>{goalIcon} {profile.goal}</span>}
                {profile.height && profile.weight && <span className="fs-badge" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>{profile.height}cm · {profile.weight}kg</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "var(--fs-space-6)" }}>

          {/* PERSONAL INFO */}
          <div className="fs-card" style={{ padding: "28px" }}>
            <h2 className="fs-h2" style={{ marginBottom: "20px" }}>Personal Information</h2>

            {success && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--fs-success-bg)", borderRadius: "var(--fs-radius-lg)", marginBottom: "16px", fontSize: "0.875rem", color: "var(--fs-success)" }}>
                ✅ Profile updated successfully
              </div>
            )}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--fs-error-bg)", borderRadius: "var(--fs-radius-lg)", marginBottom: "16px", fontSize: "0.875rem", color: "var(--fs-error)" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="fs-input-group">
                  <label className="fs-input-label">Name</label>
                  <input className="fs-input" value={profile.name} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                </div>
                <div className="fs-input-group">
                  <label className="fs-input-label">Email</label>
                  <input className="fs-input" value={profile.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                </div>
                <div className="fs-input-group">
                  <label className="fs-input-label">Age</label>
                  <input type="number" name="age" className="fs-input" placeholder="28" value={profile.age || ""} onChange={handleChange} min="1" max="120" />
                </div>
                <div className="fs-input-group">
                  <label className="fs-input-label">Gender</label>
                  <select name="gender" className="fs-input fs-select" value={profile.gender || ""} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="fs-input-group">
                  <label className="fs-input-label">Height (cm)</label>
                  <input type="number" name="height" className="fs-input" placeholder="175" value={profile.height || ""} onChange={handleChange} />
                </div>
                <div className="fs-input-group">
                  <label className="fs-input-label">Weight (kg)</label>
                  <input type="number" name="weight" className="fs-input" placeholder="75" value={profile.weight || ""} onChange={handleChange} step="0.1" />
                </div>
              </div>
              <div className="fs-input-group">
                <label className="fs-input-label">Fitness Goal</label>
                <select name="goal" className="fs-input fs-select" value={profile.goal || ""} onChange={handleChange}>
                  <option value="">Select your goal…</option>
                  <option value="Weight Loss">🏃 Weight Loss</option>
                  <option value="Muscle Gain">💪 Muscle Gain</option>
                  <option value="Maintain Fitness">⚡ Maintain Fitness</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="fs-btn fs-btn-primary fs-btn-lg" style={{ marginTop: "4px" }}>
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* BODY METRICS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--fs-space-5)" }}>
            {/* Metrics */}
            <div className="fs-card" style={{ padding: "24px" }}>
              <h2 className="fs-h2" style={{ marginBottom: "16px" }}>Body Metrics</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Height", value: profile.height ? `${profile.height} cm` : "—", icon: "📏" },
                  { label: "Weight", value: profile.weight ? `${profile.weight} kg` : "—", icon: "⚖️" },
                  { label: "Age", value: profile.age ? `${profile.age} yrs` : "—", icon: "🎂" },
                  { label: "Gender", value: profile.gender || "—", icon: "👤" },
                ].map(m => (
                  <div key={m.label} style={{ background: "var(--fs-surface-2)", borderRadius: "var(--fs-radius-lg)", padding: "14px" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--fs-text-primary)" }}>{m.value}</div>
                    <div className="fs-caption">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal card */}
            <div style={{ background: "var(--fs-grad-primary)", borderRadius: "var(--fs-radius-xl)", padding: "24px", boxShadow: "var(--fs-shadow-electric)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{goalIcon}</div>
              <div style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {profile.goal || "Set Your Goal"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>
                {profile.goal ? "Your current fitness goal" : "Choose a goal in your profile"}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Profile;
