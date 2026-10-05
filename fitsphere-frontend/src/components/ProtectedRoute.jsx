import { Navigate } from "react-router-dom";
import { session } from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * Guards a page. Verifies the stored token with the backend (GET /auth/me)
 * before showing anything, so an expired/forged token cannot open a page.
 * Pass `adminOnly` for admin pages. (The backend still enforces this on its own;
 * this only avoids showing pages the API would reject.)
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (!session.getToken()) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--fs-bg)" }}>
        <div className="fs-skeleton" style={{ width: 160, height: 16 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}

export default ProtectedRoute;
