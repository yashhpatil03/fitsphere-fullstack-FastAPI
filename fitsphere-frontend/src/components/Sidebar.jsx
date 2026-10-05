import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const NAV_ICONS = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  workouts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3"/></svg>,
  diet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  progress: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  ai: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
  admin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/workouts", label: "Workouts", icon: "workouts" },
  { to: "/diet", label: "Nutrition", icon: "diet" },
  { to: "/progress", label: "Progress", icon: "progress" },
  { to: "/reports", label: "Reports", icon: "reports" },
  { to: "/ai-coach", label: "AI Coach", icon: "ai" },
];

const bottomNavItems = [
  { to: "/dashboard", label: "Home", icon: "dashboard" },
  { to: "/workouts", label: "Train", icon: "workouts" },
  { to: "/diet", label: "Fuel", icon: "diet" },
  { to: "/progress", label: "Progress", icon: "progress" },
  { to: "/ai-coach", label: "AI", icon: "ai" },
];

function Sidebar() {
  const location = useLocation();
  const { isAdmin, logout: signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("fs-theme") || "light");

  useEffect(() => {
    const onThemeChange = () => setTheme(localStorage.getItem("fs-theme") || "light");
    window.addEventListener("storage", onThemeChange);
    return () => window.removeEventListener("storage", onThemeChange);
  }, []);

  const toggleTheme = () => {
    if (window.__toggleTheme) window.__toggleTheme();
    setTheme(t => t === "dark" ? "light" : "dark");
  };

  const logout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="fs-sidebar">
        {/* Logo */}
        <div className="fs-sidebar-logo">
          <div className="fs-sidebar-logo-mark">⚡</div>
          <span className="fs-sidebar-logo-text">FitSphere</span>
        </div>

        {/* Nav */}
        <div className="fs-sidebar-section">
          <div className="fs-sidebar-label">Main Menu</div>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`fs-nav-item ${isActive(item.to) ? "active" : ""}`}
            >
              <span className="nav-icon">{NAV_ICONS[item.icon]}</span>
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="fs-sidebar-label">Admin</div>
              <Link to="/admin" className={`fs-nav-item ${isActive("/admin") ? "active" : ""}`}>
                <span className="nav-icon">{NAV_ICONS.admin}</span>
                Admin Panel
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="fs-sidebar-footer">
          {/* Dark mode toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", marginBottom: 4 }}>
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
              {theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}
            </span>
            <button className="fs-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" />
          </div>

          <button
            onClick={logout}
            className="fs-nav-item"
            style={{ width: "100%", background: "rgba(239,68,68,0.08)", color: "rgba(252,165,165,0.9)", border: "none", cursor: "pointer" }}
          >
            <span className="nav-icon">{NAV_ICONS.logout}</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fs-bottom-nav">
        {bottomNavItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`fs-bottom-nav-item ${isActive(item.to) ? "active" : ""}`}
          >
            {NAV_ICONS[item.icon]}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;
